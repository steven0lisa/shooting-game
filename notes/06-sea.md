# 06-sea 模块解析（海面 / 码头湿地 / 平面反射 / 雨）

- 源文件：`src/game/raw/06-sea.raw.js`（40,466 字节）
- 格式化：`src/game/06-sea.js`（52,218 字节，`node --check` 通过）
- esbuild 命名空间导出：`create` / `showcase`

## 1. 模块导出

```js
br(vv, { create: () => O1, showcase: () => BR });
```

| 导出 | 函数 | 作用 |
|---|---|---|
| `create` | `async function O1(i)` | **主入口**。烘焙湿地面 mask/detail/normal 贴图 + 地面标线 canvas 贴图 → 创建 `ground` 组：apron（湿停机坪/码头地面网格 + 材质）、sea（海面网格 + quaySkirt 码头裙边）、rain/splash 雨系统 → 挂 planar reflection 预通道 → 返回控制 API（`puddleDepth` / `isPuddle` / `wetnessAt` / `seaHeight` / `setRain` / `setReflections` / `update` 等），存到 `i.ground` |
| `showcase` | `async function BR(i)` | **展示/调试入口**。先移除场景中一个 width===80 的旧 PlaneGeometry 地面，调 `O1` 建好 ground，再摆一批展示道具（集装箱 paint_*、塑料/钢材质、emissive 灯柱）到新 group，返回镜头位姿 `{cam:[-9,1.65,5.6], target:[14,.4,5]}` |

`create` 返回的关键 API（供 player-fx / 游戏逻辑查询）：
- `puddleDepth(x,z)`：在码头右侧（`x > oi.quayX`）、室内 box、mask 区外返回 -.2，否则 `0.5 - maskR`（米）
- `isPuddle` / `wetnessAt`：湿度查询（室内 .12、区外 .6、码头 1、水洼 1）
- `seaHeight(x,z)`：CPU 端 Gerstner 波高度
- `update(dt)`：累加 `A` 时间，驱动 `uTime`/`uRain` 与雨系统

## 2. 字符串清单与用途

### 2.1 材质/网格/纹理命名（缓存键与调试名）

| 字符串 | 位置 | 用途推断 |
|---|---|---|
| `saltline-apron-3` | `Ib()` 的 `customProgramCacheKey` | 湿地面着色器程序缓存键（三号版本），防止与其它 onBeforeCompile 材质串 program |
| `saltline-sea-1` | `kb()` 的 `customProgramCacheKey` | 海面着色器程序缓存键 |
| `apron_wet` | `Ib()` 材质名 | 湿停机坪/码头 apron 材质（MeshStandardMaterial + onBeforeCompile 注入） |
| `apron` | apron mesh 名 | 190×320 地面网格（rotateX -π/2 后 translate(-65,0,0)） |
| `sea` | 材质名 + 网格名 | 海面材质与网格（Gerstner 位移 + 反射/霾着色） |
| `quaySkirt` | mesh 名 | 码头墙裙边：320×4.4 竖板 rotateY(π/2) 放在 x=29.88，遮住海面与码头交界缝 |
| `planarReflection` | `zb()` 的 `s.texture.name` | 平面反射 RenderTarget 纹理名 |
| `ground` | group 名 | 场景根组（apron + sea + skirt + rain + splash） |
| `rain` / `rainSplash` | mesh 名 | 雨丝实例网格 / 落地水花实例网格 |
| `thunder` | `i.events.emit("thunder", {intensity})` | 雷声事件总线名（每 22~47s 随机触发一次） |

### 2.2 贴图/材质引用（来自其它模块）

| 字符串 | 用途 |
|---|---|
| `i.mats.uniforms.wet` | 共享"全局湿度" uniform（`uWetG`，与 materials 模块共享） |
| `i.mats.get(...)` / `i.mats.emissive(...)` | showcase 里取材质表（paint_red/blue/teal/yellow/white/orange、plastic_blue、steel_rust、steel_galv、steel_dark、emissive 灯） |
| `e.mask` / `e.detail` / `e.detailN` / `e.marks` / `e.black` | 本模块烘焙出的 5 张纹理包 |

### 2.3 canvas 标线文字（`Pb()` 画到 2048/1024 canvas）

| 字符串 | 用途推断 |
|---|---|
| `"PingFang SC"`（多处） | 中文字体，画地面汉字标线；create 前 `document.fonts.load('900 40px "PingFang SC"')` 带 350ms 超时竞速 |
| `减速慢行` | 地面限速标语（竖排，π/2 旋转） |
| `10` | 限速数字 + 圆圈（ellipse 描边） |
| `请勿靠近`（×2） | 危险区警示语（水洼/靠海侧） |
| `四号泊位`（×2） | 4 号泊位标字（x=23.5，两个朝向） |
| `String(400 + ...*5)` | 右侧一排编号：400/405/410/415/420/425/430（沿 z 每 9 米一个） |
| `"D0" / "C0" / "B0" / "A0"` | 泊车位编号（`y()` 画车位框 + 编号） |
| `rgba(0,0,255,...)` | 蓝色水道虚线/波浪线（46 条长波 + 12 条横向弯线 + 60 条短线） |
| `#ff0000` / `#00ff00` / `#000` | 红/绿/黑（红=边界与禁入线，绿=车道与泊位线） |
| `"lighter"` / `"source-over"` | canvas 合成模式（画字时切黑描边再切回 lighter） |
| `" I1"` | 字符白名单：这些字母不画中间黑竖条（字形装饰） |

### 2.4 three.js chunk include 锚点（onBeforeCompile 替换目标）

`#include <begin_vertex>`、`<common>`、`<map_fragment>`、`<roughnessmap_fragment>`、`<normal_fragment_maps>`、`<lights_physical_fragment>`、`<lights_fragment_maps>`、`<lights_fragment_end>`、`<opaque_fragment>` —— apron 与 sea 两个材质都靠替换这些锚点注入自定义 GLSL。

### 2.5 展示道具材质名（showcase）

`paint_red`、`paint_blue`、`paint_teal`、`paint_yellow`、`paint_white`、`paint_orange`、`plastic_blue`、`steel_rust`、`steel_galv`、`steel_dark` —— 均从 `i.mats.get()` 取（materials 模块提供）。

## 3. 嵌入 GLSL shader

共 8 段模板字符串 + 3 段代码生成器：

| 变量 | 类型 | 用途 |
|---|---|---|
| `TR` | fragment 头 | **apron 通用头**：uniform 声明 + 辅助函数 `gHash3/gH1/gVN/gBicubic/gRipple`，全局中间量 `gRough gNxz gPuddle gWet gFilm gSoak` |
| `AR` | `map_fragment` 替换体 | **apron 主体着色**（最大段，~110 行）：mask 双三次采样 → 板缝/沥青龟裂/焦油填缝 → 底色（院区沥青 vs 码头混凝土）→ 标线磨损/剥落（世界空间噪声）→ 油渍 → 水（水洼/浸润带/潮湿/干斑四级连续梯度）→ roughness/normal 输出 |
| `RR` | `lights_fragment_maps` 后 | **平面反射采样**：`uReflMatrix` 投影 → 法线倾斜 uv → 按 roughness/puddle 分级 textureLod 三 tap（带垂直拉伸 st）→ 混进 radiance |
| `zR` | fragment 头 | **sea 通用头**：uniform + `gRough gNxz gOcc gSDist gSpark` |
| `DR` | `map_fragment` 替换体 | **海面着色**：Gerstner 斜率（PR/IR 注入）+ 三层流动 detailN → 岸边泡沫/浮渣（quay 墙 x=30 与船体矩形）→ 阵风波纹（cat's-paw）+ 涌浪着色 → albedo/roughness/occ/spark |
| `LR` | `opaque_fragment` 前插 | 距离霾：220~860 米混入 `uHazeA/uHazeB`（朝太阳方向偏 `uHazeB`） |
| `CR` / `PR` / `IR` | 代码生成 | 由波参数表 `B1`（涌浪）/`Db`（细节波）用 `fi()` 格式化数生成的 `sin/cos` 行，注入顶点位移（CR）与片元斜率（PR/IR） |
| `Ub` | 共享片段 | `wInside()` 4 个室内盒判据 + `wPhase()` HG 相位函数（g=0.72）供雨着色 |
| `kR` / `FR` | 雨 顶点/片元 | 实例雨丝：盒内循环包裹 + 室内/天窗剔除 + 屋檐滴水（aSeed.w<0 分支）+ 速度拉伸 billboard + 太阳相位高光 |
| `UR` / `NR` | 水花 顶点/片元 | 实例水花：地面吸附 4m 网格 + mask 判水洼加密 + 冠状 crown/dome/水滴三点 alpha 图案 |

### 3.1 关键 shader 全文

**`TR` —— apron 头（含双三次/雨圈辅助函数）：**

```glsl
uniform float uTime, uRain, uWetG, uReflOn, uReflLod, uMarkRes, uMaskRes;
uniform sampler2D uMask, uMarks, uDetail, uDetailN, uRefl;
uniform vec3 uMaskRect; uniform vec4 uMarkRect; uniform mat4 uReflMatrix; uniform vec2 uReflScale;
varying vec3 vGWorld;
float gRough; vec2 gNxz; float gPuddle; float gWet; float gFilm; float gSoak;
vec3 gHash3(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yzx + 33.33); return fract((q.xxy + q.yzz) * q.zyx); }
float gH1(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float gVN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(gH1(i), gH1(i + vec2(1.0, 0.0)), f.x), mix(gH1(i + vec2(0.0, 1.0)), gH1(i + vec2(1.0, 1.0)), f.x), f.y); }
// 4-tap B-spline bicubic of the base level: no texel edge of a data map can ever show, however close the camera is
vec4 gBicubic(sampler2D t, vec2 uv, float res){
  vec2 p = uv * res - 0.5; vec2 i = floor(p); vec2 f = p - i; vec2 f2 = f * f, f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0, w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0, w3 = f3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3;
  vec2 h0 = (i + w1 / g0 - 0.5) / res, h1 = (i + w3 / g1 + 1.5) / res;
  return (textureLod(t, vec2(h0.x, h0.y), 0.0) * g0.x + textureLod(t, vec2(h1.x, h0.y), 0.0) * g1.x) * g0.y
       + (textureLod(t, vec2(h0.x, h1.y), 0.0) * g0.x + textureLod(t, vec2(h1.x, h1.y), 0.0) * g1.x) * g1.y;
}
// one sparse layer of rain rings: every cell gets a new drop (position, size, strength) each cycle, thin soft crest
// that fades as it expands. Returns a slope (xz) contribution.
vec2 gRipple(vec2 p, float t, float cell, float seed){
  vec2 q = p / cell + seed * 17.3; vec2 id = floor(q); vec2 f = fract(q);
  vec3 h0 = gHash3(id + seed);
  float tt = t * (0.5 + 0.55 * h0.x) + h0.y * 9.0;
  float cyc = floor(tt), life = fract(tt);
  vec3 h = gHash3(id + seed + cyc * 7.31);
  vec3 hc = gHash3(id.yx + cyc * 3.71 + seed * 5.0);
  float on = step(h.z, 0.16 + 0.5 * uRain);
  float rmax = mix(0.1, 0.36, h.x * h.x);
  vec2 c = mix(vec2(rmax + 0.05), vec2(0.95 - rmax), hc.xy);
  vec2 dv = (f - c) * cell; float d = length(dv);
  float r = life * rmax * cell;
  float w = 0.005 + 0.02 * life;
  float x = (d - r) / w;
  float ring = x * exp(-x * x) * 2.3;
  float amp = 1.0 - life; amp = amp * amp * on * mix(0.3, 1.0, h.y) * smoothstep(0.0, 0.06, life);
  return (dv / max(d, 1e-4)) * ring * amp;
}
```

**`RR` —— 平面反射采样：**

```glsl
{
  vec3 gV = normalize(cameraPosition - vGWorld);
  vec4 rc = uReflMatrix * vec4(vGWorld.x, 0.0, vGWorld.z, 1.0);
  vec2 ruv = rc.xy / max(rc.w, 1e-4);
  vec2 gf = normalize(-gV.xz + vec2(1e-5)); vec2 gs = vec2(-gf.y, gf.x);
  float sinE = clamp(gV.y, 0.03, 1.0);
  float dk = (gPuddle + gFilm * 0.15 + 0.03) / (1.0 + length(cameraPosition - vGWorld) * 0.07);
  vec2 tilt = vec2(dot(gNxz, gs) * sinE, dot(gNxz, gf)) * dk;
  tilt = clamp(tilt, vec2(-0.12), vec2(0.12));
  ruv += tilt * uReflScale;
  float r = material.roughness;
  // puddles: sharp mirror. Damp asphalt: only a heavily blurred, vertically stretched reflection that tightens a
  // little at grazing angles (so it reads as a sheen, not as a second mirror)
  float graz = pow(1.0 - clamp(gV.y, 0.0, 1.0), 5.0);
  float lodP = clamp(r * 9.5 - 0.45, 0.0, 6.5) + 0.9;      // puddles: a touch soft, never razor sharp
  float lodD = clamp(3.0 + r * 6.5 - 3.4 * graz, 2.0, 7.5);
  float lod = mix(mix(lodD, min(lodD, 2.6 + r * 5.0), gSoak), lodP, gPuddle) + uReflLod;
  vec2 st = vec2(0.0, r * 0.11 + (1.0 - gPuddle) * 0.05);
  vec2 lo = vec2(0.002), hi = vec2(0.998);
  vec3 pr = textureLod(uRefl, clamp(ruv, lo, hi), lod).rgb * 0.5
          + textureLod(uRefl, clamp(ruv + st, lo, hi), lod + 0.6).rgb * 0.25
          + textureLod(uRefl, clamp(ruv - st * 0.6, lo, hi), lod + 0.6).rgb * 0.25;
  pr = min(pr, vec3(48.0));
  float pw = mix(1.0 - smoothstep(0.55, 0.9, r), 1.0, max(gPuddle, gSoak)) * uReflOn;
  radiance = mix(radiance, pr, pw);
}
```

**`LR` —— 海面距离霾：**

```glsl
{
  vec3 sdir = normalize(vGWorld - cameraPosition);
  float toSun = pow(max(dot(normalize(sdir.xz + vec2(1e-5)), normalize(uSunDirW.xz)), 0.0), 3.0);
  vec3 hz = mix(uHazeA, uHazeB, toSun);
  outgoingLight = mix(outgoingLight, hz, smoothstep(220.0, 860.0, gSDist) * 0.8);
}
```

其余大段（`AR` 约 110 行、`DR` 约 40 行、`kR`/`UR` 雨与水花）全文见 `src/game/06-sea.js` 对应行：
- `TR`/`AR`/`RR`：约 L287–469
- sea 生成器 `CR`/`PR`/`IR`：约 L633–638；`zR`/`DR`/`LR`：约 L639–689
- 雨 `Ub`/`kR`/`FR`：约 L797–852；水花 `UR`/`NR`：约 L853–898

## 4. 关键函数 / 机制推测

### 4.1 程序化噪声与烘焙（纯 JS）

| 函数 | 一句话 |
|---|---|
| `F1(x,y,z)` | 整数 hash（Math.imul 混合，Murmer 风格），输出 [0,1) 浮点 |
| `Ab(x,y,z,n)` | 2D value noise：`F1` 四角采样 + smoothstep 插值，`n` 为平铺周期（可环绕） |
| `fs(x,y,z,oct,per)` | fbm 分形噪声，默认 4 octave、每次频率×2 振幅×0.5 |
| `So` / `fl` | clamp01 / smoothstep 标量工具 |
| `SR(x,z)` | **地面高度场**：fbm 起伏 + 26 个椭圆凹坑（`Sb` 表：x,z,rx,rz,深，高斯衰减）+ 码头两侧两条长水渠（z≈4.9/7.1、15.4/17.2 双沟）+ 东侧抬升 `0.25*fl(28.6,29.8,i)` |
| `Rb(n)` | **烘 mask 贴图** n×n RGBA：R=相对水线 `wR=.385` 的水深（×2.5 映射）、G=潮湿度、B=磨损/抛光条带、A=另一层噪声（油渍/粗糙输入） |
| `U1(buf,n,x,z,ch)` | 对 mask 做双线性采样（世界坐标 → uv，clamp 边界），返回 0..1 |
| `Cb(n)` | **烘 detail + normal 贴图**：det RGBA = 沥青颗粒/龟裂/浮雕/噪声；第二张 nrm 用中心差分算 xz 斜率打包成 RGBA（×2.2 / ×9 两组） |
| `N1(data,n,{repeat,aniso})` | DataTexture 工厂：wrap/mip/aniso/colorSpace 标准配置 |
| `Pb(size,aniso)` | **地面标线 canvas 烘焙**（矩形 `fa={x0:-40,z0:-30,w:70,h:60}`）：车道线、泊位框、汉字标语、蓝色水道波浪线，输出 CanvasTexture（flipY=false） |

### 4.2 apron 湿地面（`Ib`）

- `MeshStandardMaterial(white, rough 1, metal 0)` + `onBeforeCompile` 注入 TR/AR/RR；`customProgramCacheKey = "saltline-apron-3"`
- AR 输出全局量 `gRough/gNxz/gPuddle/gWet/gFilm/gSoak`，后续 chunk 分别用它们替换 roughness、normal、specularColor
- `lights_physical_fragment` 后把 specularColor 提到 vec3(0.075)（水的 F0）；`lights_fragment_end` 后 directSpecular 钳到 40（防 firefly）
- 几何：`PlaneGeometry(190,320)` rotateX(-π/2) translate(-65,0,0)，`matrixAutoUpdate=false` 静态

### 4.3 平面反射（`zb(i, e, hideList)`）

- 建 `WebGLRenderTarget`（16×16 起步，按 `quality.planar` 比例缩放，宽 16 对齐、高 8 对齐）+ 独立 `PerspectiveCamera`
- **镜像相机**：位置 y 取负、up.y 取反、lookAt 目标 y 取负；再做 **oblique near-plane clipping**（`f` 是 [0.5,0.5,0.5] 的纹理矩阵，修改 projectionMatrix 的 M[2]/M[6]/M[10]/M[14] 实现斜切近裁面，水面以上才渲染）
- `uReflMatrix = biasMatrix * proj * viewInverse`；`uReflScale` 取主相机投影对角（0.5*P[0], 0.5*P[5]）；`uReflLod = log2(height/270)` 让 LOD 随反射分辨率补偿
- 摄像机在水下（`pos.y < .03`）或 quality.planar<=0 时关掉（`uReflOn=0`）
- 渲染前把 hideList（apron/sea/rain/splash）逐个 `visible=false`，`try/finally` 恢复——反射里不画被反射物本身
- 通过 `i.render.addPrePass(d.pass)` 挂为前置通道

### 4.4 海面波浪（`B1`/`Db`/`Lb`/`kb`/`CR`/`PR`/`IR`）

- `B1` = 4 个主涌浪、`Db` = 7 个细节波，每条 `[dirX, dirZ, 波长(m), 振幅(m)]`；预处理归一化方向并算 `i[4]=ω=2π/T`（按波长）、`i[5]=sqrt(9.81·k)`（深水频散关系）
- `Lb(x,z,t)`：CPU 端 4 波叠加，距 (30,0) 50~220 米 smoothstep 衰减，返回 `oi.seaY + s`
- `CR`（顶点）：`sdisp.y += A*sin(ph)`、`sdisp.xz += dir*(0.6A*cos(ph))` —— **Gerstner 式水平收缩**；`vSAmp` 按离岸距离衰减（近岸 1 → 远岸 0）
- `PR`/`IR`（片元）：对 cos 求导得到斜率场，IR 部分带 `nearB`（25~110m 内才生效）
- `gv(start,end,step,grow,max)`：**非均匀距离网格**生成器——近岸 0.75m 步长，按 1.075 倍增长直到 120m 封顶
- `kb(i, detail)`：海面几何 = 径向网格（x 27.5→880、z ±48→±880）+ 三块远海平面补丁，总包围球半径 1300、`frustumCulled=false`；硬编码 `boundingSphere` 与 y=seaY

### 4.5 雨系统（`Fb`/`Nb`）

- `Fb(rainN, dripN, rng)`：实例化 quad 几何 + `aSeed` vec4 随机；drip 实例 `aSeed.w = -1` 走屋檐滴水分支
- `Nb(i, detail)`：雨实例数 `9000 * quality.rain`、水花 `900 * quality.rain`；共享 uniform（uTime/uRain/uSunDir/uSunCol/uAmb/uBoxMin/Max[4]）
- **室内剔除**：`uBoxMin/Max[4]` 来自 `i.level.interiorBoxes`（±0.15/±0.3 膨胀）；`uSky[8]` 天窗开口（x,z,半宽,半深）——雨只从天窗落进棚内
- **屋檐滴水**：aSeed.w<0 时固定在 y=7 自由落体（`7 - 4.9t²`），x ∈ [-16,12]，z=-10.72，受 `uDrip` 开关
- 雨丝 billboard：沿速度方向拉伸，宽度按 `dist * uPix` 保证屏幕像素恒定；`kill` 时输出屏幕外 `vec4(2,2,2,1)`
- **水花**：吸附 4m 网格（`floor(cam.xz/4)*4`）+ mask 判水洼内加密放大；crown/dome 图案，11~15m 距离淡出
- `setRain(w)` 目标值插值 `b += (m-b)*min(1,dt*0.8)`；雷声每 30+rand*30s（初始化 22+rand*25）emit 一次

### 4.6 create 主流程（`O1`）

1. 按 `quality.tex` 决定分辨率：mask 1024/512、detail 512/256、标线 canvas 2048/1024
2. `Rb` 烘 mask → `Cb` 烘 detail/normal → 等字体加载（350ms 竞速）→ `Pb` 烘标线 → 1×1 黑纹理（反射占位）
3. 建 `ground` group：`Ib` apron + `kb` sea/skirt + `Nb` rain/splash
4. `zb` 反射通道，`addPrePass` 挂上
5. 返回控制 API 对象 `_`（含 `puddleDepth/isPuddle/wetnessAt/seaHeight/setRain/setReflections/update`）

## 5. 依赖的外部符号（来自其它模块，混淆名）

- 纹理/常量类：`ui`(DataTexture) `xs`(CanvasTexture) `_n`(RGBAFormat) `yi`(UnsignedByteType) `Is`/`Bi`(Repeat/ClampWrapping) `Zt`/`Ln`(LinearFilter) `hi`(SRGBColorSpace) `Er`(NoColorSpace)
- 几何/对象：`nt`(BufferGeometry) `et`(BufferAttribute) `ea`(InstancedBufferGeometry) `zs`(InstancedBufferAttribute) `Dn`(Sphere) `rn`(PlaneGeometry) `un`(BoxGeometry) `Ys`(CylinderGeometry) `Qe`(Mesh) `wt`(Group) `si`(WebGLRenderTarget) `Wn`(PerspectiveCamera) `go`(Plane) `zn`(ShaderMaterial) `Qt`(MeshStandardMaterial)
- 数学：`W`(Vector3) `Dt`(Vector4) `Ae`(Vector2) `Ye`(Matrix4)
- 常量/环境：`oi.seaY`/`oi.quayX`、`bs.smoothstep`、`en.horizon`/`en.horizonAway`/`en.fog`、`Mn.dir`/`Mn.color`、`hr`(AdditiveBlending) `Sn`(DoubleSide) `js`(UnsignedByteType)
- 上下文字段：`i.renderer` `i.scene` `i.camera` `i.quality` `i.render.resolution/addPrePass` `i.level.interiorBoxes/skylights` `i.events.emit` `i.mats.get/emissive/uniforms.wet` `i.rng.fork`
