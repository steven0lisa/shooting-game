/* ============================================================ 武器库 3D 展示引擎（08d-armory，2026-11-13）
   标题页「武器库」的引擎层：74 种武器（DGTypes 全注册表 = 内置 5 + GUNDATA 69）的
   3D 缩略图 + 大图旋转展示 + 光影 + 开火特效 + 参数数据源。
   UI（列表 DOM/参数面板）由 09 侧实现，本文件只暴露 DGArmory 契约：
     attach / mount / catalog / select / thumb / setAutoFire / shotFX / open / close / stats
   依赖（同 IIFE 作用域，构建顺序 08 → 本文件 → 09）：
     lt(three r180) / DGTypes / dgTargetLen / dgGlb / dgPlaceholder / dgDispose / Go(07 音频表) / window.__G
   原则：对 08 的 API 只读消费；展示层自行把加载 root 翻 castShadow（08 视模默认 !1，这里要地面影子）；
   03 材质库共享材质（userData.dgShared）一律不 dispose——由 08 的 dgDispose 内部保证。 */

var DGArmory = {};

(function() {
    /* ---------------- 内部状态 ---------------- */
    var S = {
        ctx: null,                    // attach 存入的 window.__G
        mounted: !1, opened: !1,
        listEl: null, viewEl: null, paramEl: null,
        renderer: null, canvas: null,
        scene: null, cam: null, thumbCam: null,
        hemi: null, dir: null, ground: null, pivot: null,
        flash: null, flashTex: null,
        rt: null,                     // 缩略图渲染目标（close 释放、open 重建）
        current: null,                // 当前展示的 kind
        pivotRoot: null,              // 挂在 pivot 上的 root（占位或真模）
        curInfo: null, curLen: .3, baseY: 0,
        rotY: 0, t: 0, last: 0,
        rec: 0, recZ: .03, recX: .04, // 后坐：rec 1→0 指数衰减，z 后推 recZ*rec、pitch 下跳 -recX*rec
        flashT: 0, flashDur: .06,
        autoFire: !1, nextAuto: 0,
        raf: 0, cw: 0, ch: 0,
        models: {},                   // kind → Promise<{root,info}>（真模或占位回退，永久缓存）
        modelHandles: {},             // kind → 已 resolve 的 {root,info}（仅真模）
        modelReady: {},               // kind → "ok" | "fail"（未标记 = 未加载/加载中）
        inflight: 0,                  // 正在加载的 GLB 数（加载窗口 ≤3，防 74 并发 fetch 挤爆）
        thumbCache: {},               // kind → 160×120 canvas（真图）
        thumbPh: {},                  // kind → 160×120 canvas（灰底占位图）
        thumbPend: {},                // kind → [resolve,...]（thumb() 等待真图的调用方）
        thumbQueue: [],               // 待渲缩略图 kind（每帧至多 2 个）
        thumbWait: {},                // kind → 入队时刻（超时先出占位，真图就绪后升级）
        batched: !1                   // open 时已把全目录排队
    };

    var _mv = null;                   // 共享 Vector3（火光定位）

    /* ---------------- 分组推断 ---------------- */
    var GROUP_RIFLE = "步枪", GROUP_PISTOL = "手枪", GROUP_SNIPER = "狙击",
        GROUP_SMG = "冲锋枪", GROUP_DMR = "精确射手", GROUP_SG = "霰弹枪", GROUP_CARBINE = "卡宾";

    var SHOTGUN_SLUGS = {
        rem870: 1, versamax: 1, saiga12: 1, vepr12: 1, ksg: 1, ksgf: 1,
        citori: 1, stevens311: 1, sawnoff: 1
    };

    /* 任务口径：内置 5 款显式 → 霰弹枪名单 → 精确射手名单（slug 含 dmr/sr25/mk11/svd）→
       bolt 且 oal>1 狙击 → semi+pistol 手枪（被 cat pistol 涵盖）→ cat pistol 手枪 →
       其余 long 按 oal>.86 分步枪/卡宾。 */
    function dgArmGroupOf(kind, T) {
        if (kind === "pac9") return GROUP_RIFLE;
        if (kind === "deagle") return GROUP_PISTOL;
        if (kind === "awp") return GROUP_SNIPER;
        if (kind === "mp5" || kind === "uzi") return GROUP_SMG;
        if (SHOTGUN_SLUGS[kind]) return GROUP_SG;
        if (kind.indexOf("dmr") >= 0 || kind.indexOf("sr25") >= 0 ||
            kind.indexOf("mk11") >= 0 || kind.indexOf("svd") >= 0) return GROUP_DMR;
        var oal = T.oal || 0;
        if (T.hold === "bolt" && oal > 1) return GROUP_SNIPER;
        if (T.cat === "pistol") return GROUP_PISTOL;
        return oal > .86 ? GROUP_RIFLE : GROUP_CARBINE;
    }

    var catalogCache = null;

    function catalogList() {
        if (catalogCache) return catalogCache;
        catalogCache = [];
        for (var kind in DGTypes) {
            var T = DGTypes[kind];
            if (!T) continue;
            catalogCache.push({ kind: kind, name: T.name || kind, group: dgArmGroupOf(kind, T) });
        }
        return catalogCache;
    }

    /* dgGlb 的质感管线只依赖 ctx.mats（03 材质库）；boot 未完成时传 null 走回退材质 */
    function dgArmMatCtx() {
        var c = S.ctx || (typeof window !== "undefined" ? window.__G : null);
        return c && c.mats ? c : null;
    }

    function dgArmIsPh(m) {
        return !!(m && m.info && m.info.names && String(m.info.names[0]).indexOf("placeholder:") === 0);
    }

    /* ---------------- 模型加载（真模缓存 + 并发窗口） ---------------- */
    function dgArmEnsureModel(kind) {
        var p = S.models[kind];
        if (p) return p;
        var T = DGTypes[kind];
        if (!T) return Promise.reject(new Error("[armory] unknown kind: " + kind));
        S.inflight++;
        p = S.models[kind] = new Promise(function(res, rej) {
            if (!T.model || typeof T.model !== "string") { res(dgPlaceholder(T)); return; }
            dgGlb(T.model, dgTargetLen(T), dgArmMatCtx()).then(function(t) {
                /* 展示层要地面影子：08 视模 mesh 默认 castShadow=!1，本 root 单独翻开 */
                t.root.traverse(function(o) { if (o.isMesh) o.castShadow = !0; });
                res(t);
            }).catch(function(e) {
                console.warn("[armory] glb load failed, keep placeholder: " + kind, e);
                res(dgPlaceholder(T));
            });
        });
        /* 统一状态回写：真模 → ok+handle 缓存；占位（pac9/失败）→ fail（缩略图走灰底） */
        p.then(function(m) {
            if (S.inflight > 0) S.inflight--;
            if (dgArmIsPh(m)) S.modelReady[kind] = "fail";
            else {
                S.modelHandles[kind] = m;
                S.modelReady[kind] = "ok";
                /* 升级：若该 kind 先前以占位应付过（pending 或旧占位缓存），补排一次真图 */
                if (S.thumbCache[kind] && S.thumbCache[kind]._dgArmPh) {
                    delete S.thumbCache[kind];
                    if (S.opened && S.thumbQueue.indexOf(kind) < 0) S.thumbQueue.push(kind);
                }
            }
        });
        return p;
    }

    /* 加载窗口补货：队列里未启动的 kind，按顺序起载直到 inflight=3 */
    function dgArmTopUpLoads() {
        for (var i = 0; i < S.thumbQueue.length && S.inflight < 3; i++) {
            var k = S.thumbQueue[i];
            if (!S.models[k]) dgArmEnsureModel(k).catch(function() {});
        }
    }

    /* ---------------- 占位/换装：把 root 挂 pivot 并居中 ---------------- */
    /* 展示专用材质：剥离游戏 shader 补丁（多上下文下编译差异会渲黑），换纯 PBR
       并调亮色阶——游戏内武器质感不受影响，展厅保证通透明亮 */
    function dgArmBrighten(root) {
        if (!root || root._dgArmBright) return;
        root._dgArmBright = !0;
        root.traverse(function(o) {
            if (!o.isMesh || !o.material) return;
            var m = o.material, c = m.color ? m.color.clone() : new lt.Color(0x3c434b);
            var hsl = { h: 0, s: 0, l: 0 };
            c.getHSL(hsl);
            hsl.l = Math.min(.55, Math.max(.22, hsl.l * 1.15 + .05));
            c.setHSL(hsl.h, hsl.s * .9, hsl.l);
            o.material = new lt.MeshStandardMaterial({
                color: c,
                metalness: .35,
                roughness: .5,
                emissive: c.clone().multiplyScalar(.12),
                envMapIntensity: 0
            });
            o.castShadow = !0; o.receiveShadow = !0; o.frustumCulled = !1;
        });
    }

    function dgArmSetPivotRoot(root, info, len, ephemeral) {
        dgArmBrighten(root);
        var prev = S.pivotRoot;
        if (prev && prev !== root) S.pivot.remove(prev);
        root.position.set(0, 0, 0);
        root.rotation.set(0, 0, 0);
        var c = new lt.Vector3(), size = new lt.Vector3();
        try {
            var bb = new lt.Box3().setFromObject(root);
            bb.getCenter(c); bb.getSize(size);
        } catch (e) { c.set(0, 0, 0); size.set(len, len * .16, len); }
        root.position.set(-c.x, -c.y, -c.z);
        root._dgArmEph = !!ephemeral;
        S.baseY = -c.y;
        S.pivot.add(root);
        S.pivotRoot = root;
        S.curInfo = info;
        S.curLen = len;
        S.rotY = 0; S.rec = 0; S.flashT = 0;
        if (S.ground) S.ground.position.y = -size.y * .5 - Math.max(.04, len * .1);
        if (S.flash) S.flash.visible = !1;
        if (S.cam) {
            var d = len * 2.3;                       // 任务口径 targetLen×2.3
            S.cam.position.set(0, d * .25, d);       // 略俯视（长枪档 ≈ y+0.35）
            S.cam.lookAt(0, 0, 0);
        }
        /* 上一根若是本次 select 现造的占位 → 回收几何（真模 root 在缓存留用，不动） */
        if (prev && prev !== root && prev._dgArmEph) {
            try { dgDispose(prev); } catch (e) {}
        }
    }

    /* ---------------- 场景/灯光/火光构建 ---------------- */
    function dgArmBuildScope() {
        var sc = new lt.Scene();
        var ctx = S.ctx || (typeof window !== "undefined" ? window.__G : null);
        /* 注意：不复用 ctx.scene.environment——PMREM 纹理绑定在游戏渲染器的 GL 上下文，
           跨上下文取样为黑（实证）；展厅用灯光+自发光体系即可 */
        sc.add(new lt.AmbientLight(0xffffff, .9));

        S.hemi = new lt.HemisphereLight(0xdfe8f0, 0x2e2820, .8);
        sc.add(S.hemi);

        S.dir = new lt.DirectionalLight(0xffe6c4, 1.9);
        S.dir.position.set(1.1, 2.0, 1.4);
        S.dir.castShadow = !0;
        S.dir.shadow.mapSize.width = S.dir.shadow.mapSize.height = 1024;
        S.dir.shadow.camera.left = -1.5; S.dir.shadow.camera.right = 1.5;
        S.dir.shadow.camera.top = 1.5; S.dir.shadow.camera.bottom = -1.5;
        S.dir.shadow.camera.near = .5; S.dir.shadow.camera.far = 8;
        S.dir.shadow.bias = -.0006;
        sc.add(S.dir); sc.add(S.dir.target);

        S.ground = new lt.Mesh(new lt.PlaneGeometry(4, 4), new lt.ShadowMaterial({ opacity: .18 }));
        S.ground.rotation.x = -Math.PI / 2;
        S.ground.position.y = -.18;
        S.ground.receiveShadow = !0;
        sc.add(S.ground);

        S.pivot = new lt.Group;
        sc.add(S.pivot);

        /* 枪口火光：64px 径向渐变（08 dgAssemble deagle 同款配色），加法混合、平摊朝 +z 相机 */
        var cv = document.createElement("canvas");
        cv.width = cv.height = 64;
        var g2 = cv.getContext("2d"),
            gr = g2.createRadialGradient(32, 32, 2, 32, 32, 30);
        gr.addColorStop(0, "rgba(255,240,190,1)");
        gr.addColorStop(.35, "rgba(255,170,60,.75)");
        gr.addColorStop(1, "rgba(255,120,20,0)");
        g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
        S.flashTex = new lt.CanvasTexture(cv);
        S.flash = new lt.Mesh(new lt.PlaneGeometry(1, 1), new lt.MeshBasicMaterial({
            map: S.flashTex, blending: lt.AdditiveBlending, depthWrite: !1, transparent: !0
        }));
        S.flash.renderOrder = 10;
        S.flash.visible = !1;
        S.flash.frustumCulled = !1;
        sc.add(S.flash);
        return sc;
    }

    /* ---------------- 每帧动画 ---------------- */
    function dgArmAnimate(dt) {
        S.t += dt;
        if (!S.pivotRoot) return;
        var root = S.pivotRoot;
        S.rotY += dt * .28;
        root.rotation.y = S.rotY;
        if (S.rec > 1e-4) {
            S.rec *= Math.exp(-dt * 18);
            if (S.rec < 1e-4) S.rec = 0;
        }
        root.position.y = S.baseY + Math.sin(S.t * .7) * .012;
        root.position.z = S.rec * S.recZ;
        root.rotation.x = -S.rec * S.recX;
        if (S.flashT > 0) {
            S.flashT -= dt;
            if (S.flashT <= 0) S.flash.visible = !1;
            else S.flash.rotation.z += dt * 11;
        }
    }

    function dgArmUpdateFlash() {
        if (!S.flash || !S.flash.visible || !S.curInfo || !S.pivotRoot) return;
        if (!_mv) _mv = new lt.Vector3();
        S.pivotRoot.updateMatrixWorld(!0);
        _mv.fromArray(S.curInfo.muzzle).applyMatrix4(S.pivotRoot.matrixWorld);
        S.flash.position.copy(_mv);
    }

    function dgArmResize() {
        if (!S.renderer || !S.viewEl) return;
        var w = S.viewEl.clientWidth | 0, h = S.viewEl.clientHeight | 0;
        S._dbg = S._dbg || { resizeTry: 0, setSize: 0, w: 0, h: 0 };
        S._dbg.resizeTry++; S._dbg.w = w; S._dbg.h = h;
        if (w < 8 || h < 8) return;
        if (w !== S.cw || h !== S.ch) {
            S.cw = w; S.ch = h;
            S.renderer.setSize(w, h, !1);
            S._dbg.setSize++;
            if (S.cam) { S.cam.aspect = w / h; S.cam.updateProjectionMatrix(); }
        }
    }

    function dgArmDrawScene() {
        S.renderer.setRenderTarget(null);
        dgArmResize();
        S.renderer.clear();
        dgArmUpdateFlash();
        S.renderer.render(S.scene, S.cam);
    }

    /* ---------------- 缩略图（RT 读回 + JS 端 ACES/sRGB，见 renderThumb 注释） ---------------- */
    function dgArmPlaceholderCanvas(kind) {
        var c = S.thumbPh[kind];
        if (c) return c;
        c = document.createElement("canvas");
        c.width = 160; c.height = 120;
        var g = c.getContext("2d");
        g.fillStyle = "#2a2e33"; g.fillRect(0, 0, 160, 120);
        g.fillStyle = "#8b939c";
        g.font = "bold 14px monospace";
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(String(kind).toUpperCase().slice(0, 9), 80, 60);
        c._dgArmPh = !0;
        S.thumbPh[kind] = c;
        return c;
    }

    function dgArmEnsureRT() {
        if (S.rt) return S.rt;
        if (S.floatOK) {
            /* FloatType：线性 HDR 读回无暗部量化，ACES/sRGB 在 JS 端补（RT 渲染不经 toneMapping） */
            S.rt = new lt.WebGLRenderTarget(160, 120, {
                minFilter: lt.LinearFilter, magFilter: lt.LinearFilter,
                type: lt.FloatType, depthBuffer: !0, stencilBuffer: !1
            });
        } else {
            /* 无 float 读回能力：退 8 位 RT，交给 three 在片元输出做 linear→sRGB（高光溢出按 1 截断） */
            S.rt = new lt.WebGLRenderTarget(160, 120, {
                minFilter: lt.LinearFilter, magFilter: lt.LinearFilter,
                depthBuffer: !0, stencilBuffer: !1
            });
            S.rt.texture.colorSpace = lt.SRGBColorSpace;
        }
        return S.rt;
    }

    /* linear→sRGB（与主画面 canvas 输出等价：JS 端补 ACES + 编码，因 three 渲染进 RT 时
       不套 toneMapping/outputColorSpace——两者只在输出到 canvas 时生效） */
    function dgArmSrgb(v) {
        return v <= .0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - .055;
    }
    function dgArmAces(x) {
        x = x < 0 ? 0 : x;
        return (x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14);
    }

    function dgArmResolvePend(kind, cv) {
        var p = S.thumbPend[kind];
        if (p) { for (var i = 0; i < p.length; i++) p[i](cv); delete S.thumbPend[kind]; }
    }

    /* 渲一张真图：借主 renderer + 主 scene，临时把该 kind 真模摆进 pivot、3/4 前视小相机渲进 RT，
       同步读回后立刻复原当前展示（单 renderer 串行，无竞态）。仅 modelReady==="ok" 时调用。 */
    function dgArmRenderThumb(kind) {
        var m = S.modelHandles[kind], T = DGTypes[kind];
        if (!m || !T) return;
        dgArmBrighten(m.root);
        var len = dgTargetLen(T), r2 = len * 2.1;
        var oldRoot = S.pivotRoot, oldGY = S.ground.position.y,
            oldFlashVis = S.flash.visible, tr = null;
        /* 存当前展示的位姿（含 thumb 的正是当前枪：m.root===oldRoot，摘挂后必须原样复原） */
        if (oldRoot) {
            tr = [oldRoot.position.x, oldRoot.position.y, oldRoot.position.z,
                  oldRoot.rotation.x, oldRoot.rotation.y, oldRoot.rotation.z];
            S.pivot.remove(oldRoot);
        }
        S.flash.visible = !1;
        try {
            m.root.position.set(0, 0, 0);
            m.root.rotation.set(0, -.62, 0);           // 3/4 前视
            var c3 = new lt.Vector3(), s3 = new lt.Vector3();
            try {
                var bb = new lt.Box3().setFromObject(m.root);
                bb.getCenter(c3); bb.getSize(s3);
            } catch (e) { c3.set(0, 0, 0); s3.set(len, len * .16, len); }
            m.root.position.set(-c3.x, -c3.y, -c3.z);
            S.pivot.add(m.root);
            S.thumbCam.position.set(r2 * .55, len * .6 + r2 * .22, r2 * .78);
            S.thumbCam.lookAt(0, 0, 0);
            S.ground.position.y = -s3.y * .5 - Math.max(.03, len * .08);

            var rt = dgArmEnsureRT();
            S.renderer.setRenderTarget(rt);
            S.renderer.clear();
            S.renderer.render(S.scene, S.thumbCam);
            if (S.floatOK) S.renderer.readRenderTargetPixels(rt, 0, 0, 160, 120, dgArmBufF);
            else S.renderer.readRenderTargetPixels(rt, 0, 0, 160, 120, dgArmBuf8);
            S.renderer.setRenderTarget(null);
        } finally {
            /* 缩略渲染期间可能发生 select 换装（S.pivotRoot 已指向新真模）——
               恢复现场绝不能把新选中的模型踢掉、把旧占位装回（"盒状枪/白模"根因） */
            if (S.pivotRoot === oldRoot) {
                S.pivot.remove(m.root);
                if (oldRoot) {
                    S.pivot.add(oldRoot);
                    if (tr) oldRoot.position.set(tr[0], tr[1], tr[2]),
                        oldRoot.rotation.set(tr[3], tr[4], tr[5]);
                }
                S.pivotRoot = oldRoot;
            } else if (m.root !== S.pivotRoot) {
                S.pivot.remove(m.root)
            }
            S.ground.position.y = oldGY;
            S.flash.visible = oldFlashVis;
        }

        var cv = document.createElement("canvas");
        cv.width = 160; cv.height = 120;
        var ctx2 = cv.getContext("2d"), img = ctx2.createImageData(160, 120), px = img.data;
        if (S.floatOK) {
            /* 线性 HDR float：JS 端补 ACES + sRGB（RT 渲染路径不过 toneMapping/outputColorSpace） */
            var buf = dgArmBufF;
            for (var y = 0; y < 120; y++) {
                var src = (119 - y) * 640, dst = y * 640;    // GL 行序下→上，翻转
                for (var x = 0; x < 640; x += 4) {
                    px[dst + x] = Math.round(255 * dgArmSrgb(dgArmAces(buf[src + x])));
                    px[dst + x + 1] = Math.round(255 * dgArmSrgb(dgArmAces(buf[src + x + 1])));
                    px[dst + x + 2] = Math.round(255 * dgArmSrgb(dgArmAces(buf[src + x + 2])));
                    px[dst + x + 3] = buf[src + x + 3] > .5 ? 255 : 0;
                }
            }
        } else {
            /* 8 位 RT（texture.colorSpace=sRGB）：three 已在片元输出编码 sRGB，直接搬运行序 */
            var b8 = dgArmBuf8;
            for (var y2 = 0; y2 < 120; y2++) {
                var src2 = (119 - y2) * 640, dst2 = y2 * 640;
                for (var x2 = 0; x2 < 640; x2++) px[dst2 + x2] = b8[src2 + x2];
            }
        }
        ctx2.putImageData(img, 0, 0);
        S.thumbCache[kind] = cv;
        dgArmResolvePend(kind, cv);
    }
    var dgArmBufF = new Float32Array(160 * 120 * 4),
        dgArmBuf8 = new Uint8Array(160 * 120 * 4);

    /* 每帧缩略图批产：至多 budget 张真图；未就绪项回队尾，超时 20s 先出占位图（真图就绪后升级） */
    function dgArmThumbStep(budget) {
        if (!S.thumbQueue.length) return;
        dgArmTopUpLoads();
        var guard = budget + S.thumbQueue.length + 4;
        while (budget > 0 && S.thumbQueue.length && guard-- > 0) {
            var kind = S.thumbQueue.shift();
            if (S.thumbCache[kind]) continue;
            var st = S.modelReady[kind];
            if (st === "fail") {
                dgArmResolvePend(kind, dgArmPlaceholderCanvas(kind));
                continue;
            }
            if (st !== "ok") {
                var w0 = S.thumbWait[kind] || (S.thumbWait[kind] = S.t);
                if (S.t - w0 > 20) {
                    /* 超时先出占位图（带 _dgArmPh 标记：模型就绪后 ensureModel 钩子会重排真图升级） */
                    var pc = dgArmPlaceholderCanvas(kind);
                    S.thumbCache[kind] = pc;
                    dgArmResolvePend(kind, pc);
                } else S.thumbQueue.push(kind);
                continue;
            }
            try { dgArmRenderThumb(kind); budget--; }
            catch (e) {
                console.warn("[armory] thumb render failed: " + kind, e);
                S.modelReady[kind] = "fail";
                dgArmResolvePend(kind, dgArmPlaceholderCanvas(kind));
            }
        }
    }

    /* ---------------- 主循环（open 才跑） ---------------- */
    function dgArmTick(now) {
        if (!S.opened) { S.raf = 0; return; }
        S.raf = setTimeout(() => dgArmTick(performance.now()), 33);
        var dt = Math.min(.1, Math.max(0, (now - S.last) / 1000)) || .016;
        S.last = now;
        dgArmAnimate(dt);
        if (S.thumbQueue.length) dgArmThumbStep(2);
        if (S.autoFire && S.t >= S.nextAuto) {
            DGArmory.shotFX();
            S.nextAuto = S.t + 3 + Math.random() * 3;
        }
        dgArmDrawScene();
    }

    /* ---------------- 对外契约 ---------------- */
    DGArmory.attach = function(ctx) {
        S.ctx = ctx || (typeof window !== "undefined" ? window.__G : null) || null;
        return DGArmory;
    };

    DGArmory.mount = function(listEl, viewEl, paramEl) {
        if (S.mounted) return DGArmory;
        S.listEl = listEl || null;
        S.viewEl = viewEl || null;
        S.paramEl = paramEl || null;
        if (!S.viewEl) return DGArmory;

        S.renderer = new lt.WebGLRenderer({ antialias: !0, alpha: !0 });
        S.canvas = S.renderer.domElement;
        S.canvas.style.cssText = "display:block;width:100%;height:100%;";
        S.viewEl.appendChild(S.canvas);
        S.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        S.renderer.setClearColor(0x000000, 0);
        S.renderer.toneMapping = lt.ACESFilmicToneMapping;
        S.renderer.outputColorSpace = lt.SRGBColorSpace;
        S.renderer.shadowMap.enabled = !0;
        S.renderer.shadowMap.type = lt.PCFSoftShadowMap;
        S.renderer.autoClear = !1;
        /* float RT 读回能力探测（WebGL2 下 float/half-float 颜色附件需扩展；缺则缩略图走 8 位 sRGB RT 回退） */
        try {
            var gl = S.renderer.getContext();
            S.floatOK = !!(gl && (gl.getExtension("EXT_color_buffer_float") ||
                gl.getExtension("EXT_color_buffer_half_float")));
        } catch (e) { S.floatOK = !1; }

        S.scene = dgArmBuildScope();
        S.cam = new lt.PerspectiveCamera(32, 1, .02, 20);
        S.thumbCam = new lt.PerspectiveCamera(32, 160 / 120, .02, 20);

        S.mounted = !0;
        var first = DGTypes.ak47 ? "ak47" : (catalogList()[0] || { kind: "pac9" }).kind;
        DGArmory.select(S.current || first);
        return DGArmory;
    };

    DGArmory.catalog = function() { return catalogList(); };

    /* 参数数据源（中文键值，供 09 直接渲染；09 侧按 Number 画条，故除任务指定的
       全长（"x.xxx m"）与开火方式（中文）外一律数值原样） */
    DGArmory._dbgInfo = function() { return S._dbg || null; };
    DGArmory.stats = function(kind) {
        var T = DGTypes[kind];
        if (!T) return null;
        return {
            "伤害": T.damage,
            "射速": T.rpm,
            "弹匣": T.mag,
            "备弹": T.reserve,
            "射程": T.range,
            "换弹": T.reloadT,
            "开火方式": T.hold === "bolt" ? "栓动" : T.hold === "semi" ? "半自动" : "全自动",
            "全长": T.oal ? T.oal + " m" : "—",
            "ADS": T.adsFov,
            "后坐": T.rc,
            "散布": T.bloom
        };
    };

    /* 大屏切枪：同步占位盒过渡 → 真模到位后原位替换（缓存复用） */
    DGArmory.select = function(kind) {
        var T = DGTypes[kind];
        if (!T) return;
        S.current = kind;
        if (!S.mounted) return;
        var len = dgTargetLen(T);
        var ph = dgPlaceholder(T);
        dgArmSetPivotRoot(ph.root, ph.info, len, !0);
        S.pivotRoot._dgArmEph = !0;
        dgArmEnsureModel(kind).then(function(m) {
            if (S.current !== kind) return;
            if (S.modelReady[kind] === "fail") return;   // 占位即终态
            if (S.pivotRoot === m.root) return;
            dgArmSetPivotRoot(m.root, m.info, len, !1);
        }).catch(function() {});
    };

    /* 缩略图：ready 即真图 canvas；未就绪先占位（open 状态才排队渲真图并在完成后兑现 promise） */
    DGArmory.thumb = function(kind) {
        if (S.thumbCache[kind]) return Promise.resolve(S.thumbCache[kind]);
        if (!S.mounted || !S.opened || S.modelReady[kind] === "fail" || !DGTypes[kind])
            return Promise.resolve(dgArmPlaceholderCanvas(kind));
        return new Promise(function(res) {
            (S.thumbPend[kind] || (S.thumbPend[kind] = [])).push(res);
            if (S.thumbQueue.indexOf(kind) < 0) {
                S.thumbWait[kind] = S.t;
                S.thumbQueue.push(kind);
            }
        });
    };

    DGArmory.setAutoFire = function(on) {
        S.autoFire = !!on;
        if (S.autoFire && S.nextAuto < S.t) S.nextAuto = S.t + 3 + Math.random() * 3;
    };

    /* 开火特效：火光（muzzle 世界位、尺寸 ∝ targetLen）+ 视模后坐（z 突后推 0.02~0.05 弹回、
       pitch 下跳）+ 音效 kind+"_shot"（Go 已注册名；未注册/无音频链一律静默） */
    DGArmory.shotFX = function() {
        if (!S.mounted || !S.pivotRoot || !S.curInfo) return;
        var T = DGTypes[S.current], rc = T && T.rc || 1;
        S.recZ = Math.min(.05, Math.max(.02, .022 * rc));
        S.recX = .03 + .02 * rc;
        S.rec = 1;
        if (S.flash) {
            if (!_mv) _mv = new lt.Vector3();
            S.pivotRoot.updateMatrixWorld(!0);
            _mv.fromArray(S.curInfo.muzzle).applyMatrix4(S.pivotRoot.matrixWorld);
            S.flash.position.copy(_mv);
            var k = .22 * (S.curLen / .3) * (.85 + Math.random() * .5);
            S.flash.scale.set(k, k, 1);
            S.flash.rotation.z = Math.random() * 6.283;
            S.flash.visible = !0;
            S.flashDur = .05 + Math.random() * .03;
            S.flashT = S.flashDur;
        }
        try {
            var c = S.ctx || (typeof window !== "undefined" ? window.__G : null),
                nm = S.current + "_shot";
            if (c && c.audio && c.audio.play) {
                if (!(typeof Go === "object" && Go && Go[nm]) && T && T.sfx && T.sfx.shot)
                    nm = T.sfx.shot;
                c.audio.play(nm, { gain: .55 });
            }
        } catch (e) {}
    };

    DGArmory.open = function() {
        if (!S.mounted || S.opened) return;
        S.opened = !0;
        /* 环境补挂（boot 可能晚于 mount 完成才产天空 PMREM） */
        var ctx = S.ctx || (typeof window !== "undefined" ? window.__G : null);
        if (S.rt) { S.rt.dispose(); S.rt = null; }     // close 释放过，重建
        dgArmResize();
        /* 全目录排队补齐缩略图（一次；缓存已有则不重跑） */
        if (!S.batched) {
            S.batched = !0;
            var cl = catalogList();
            for (var i = 0; i < cl.length; i++) {
                var k = cl[i].kind;
                if (!S.thumbCache[k] && S.thumbQueue.indexOf(k) < 0) {
                    S.thumbWait[k] = S.t;
                    S.thumbQueue.push(k);
                }
            }
        }
        S.last = performance.now();
        S.nextAuto = S.t + 3 + Math.random() * 3;
        S.raf = setTimeout(() => dgArmTick(performance.now()), 33);
    };

    DGArmory.close = function() {
        if (!S.opened) return;
        S.opened = !1;
        if (S.raf) { clearTimeout(S.raf); S.raf = 0; }
        /* 只释放渲染目标；已加载模型/共享材质/缩略图缓存保留，再开即用 */
        if (S.rt) { S.rt.dispose(); S.rt = null; }
        if (S.flash) { S.flash.visible = !1; S.flashT = 0; }
        /* 排队未跑完的 pending 调用方降级占位，不吊死 */
        for (var kind in S.thumbPend) dgArmResolvePend(kind, dgArmPlaceholderCanvas(kind));
        S.batched = !1;    // 再开时把 close 期间漏掉的 kind 重新排队
    };

    /* 便捷：等比后的视模长度（米），09 可用 */
    DGArmory.displayLen = function(kind) {
        var T = DGTypes[kind];
        return T ? +dgTargetLen(T).toFixed(3) : 0;
    };

    /* 09 侧按 window.DGArmory 取用（拼接 IIFE 里 var 不上 window，显式挂名） */
    if (typeof window !== "undefined") window.DGArmory = DGArmory;
})();
