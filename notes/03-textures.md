# 03-textures 模块解析

> 源：`src/game/raw/03-textures.raw.js`（200,707 字节）
> 格式化产物：`src/game/03-textures.js`（8,134 行，311,057 字节）
> 校验：`node --check` 通过；剥离全部空白后与 raw 的 SHA256 完全一致（`020b29ccc31a8d39…`），即**只动了空白，标识符/字符串/语义零改动**（已抽验 `几猫港区  B4-0271`、`制造日期 2019年03月`、`SL/PA-4207/19` 等含空格字符串原样保留）。

---

## 1. 模块导出

### 1.1 主命名空间 `qg`（任务指定的 textures 命名空间，文件第 1~6 行）

| 导出名 | 实际函数 | 行号 | 职责 |
|---|---|---|---|
| `applyPatch` | `h3(i, e)` | 1792 | 给一个 three.js `MeshStandardMaterial` 的 shader 打补丁：`Object.assign(i.uniforms, e)` 注入自定义 uniform，然后对 `vertexShader`/`fragmentShader` 做 7 处 `#include <...>` 字符串替换，插入 SALTLINE 自有的三平面映射 / 湿润 / 宏观噪声 / alpha-test 抗锯齿代码块（详见 §5） |
| `create` | `async function Gg(i)` | 1798 | 纹理工厂主入口。按需用 GLSL MRT 烘焙 PBR 贴图（albedo/ORM/normal），并据此创建、缓存 `MeshStandardMaterial`。返回 `{get, emissive, decal, label, number, names, decalNames, uniforms, update, prewarm, stats, tileOf}` |
| `showcase` | `wA(i)` | 2049 | 材质预览场景：把全部（或 `params.only` 指定的）材质铺成 立面+地面+球体 三件套网格，再砌一面"贴花墙"展示 22 种 decal + 若干 label，最后 `console.log("[mats] " + JSON.stringify(stats()))` |

### 1.2 同文件里的第二个命名空间 `$g`（**任务背景没提到，但确实存在**，第 2511~2517 行）

| 导出名 | 实际函数 | 职责 |
|---|---|---|
| `PROP_SIZES` | `Gi` | **36** 种 prop 的尺寸/默认材质/碰撞表面表 |
| `create` | `Yg(i)` | props 工厂：`{names, has, build(name, opts)}`，找不到 builder 时回退成一个贴默认材质的方块 + AABB 碰撞体 |
| `register` | `_i(name, fn)` | prop builder 注册表（`Xg[name] = fn`） |
| `showcase` | `AA(i)` | prop 预览：按 26m 一行自动换行排布所有 prop |

文件末尾 `J3(_i); eb(_i); sb(_i);` + 中段 14 条直接 `_i(...)` + 1 条 for 循环（3 个集装箱）+ `J3` 内 12 条 + `eb` 内 3 条 + `sb` 内 4 条，**共注册 36 个 builder，与 `Gi` 的 36 项一一对应**。
**结论：这个 raw chunk 实际打包了 2 个源模块（textures + props）**，拆分时按 esbuild chunk 边界切的，不是按单模块切的。

---

## 2. 程序化纹理合成管线

### 2.1 流程

```
c3[set] 配置 (fn/size/tile/bump/p/seed/hero)
   │
   ▼
① 建 MRT RenderTarget：WebGLRenderTarget(size,size,{count:3, 无深度, 无mipmap, Repeat})
   │  同尺寸的 RT 跨 set 复用（Map h）
   ▼
② ShaderMaterial = e3(公共噪声前缀) + Tn[fn](每材质 surf()) + t3(main)
   │  glslVersion = GLSL3，depthTest/Write = false，全屏 quad (Qy) 渲一次
   ▼
③ 一次 draw 写出 3 个 attachment：o0 / o1 / o2
   │
   ▼
④ 后处理两趟（同一全屏 quad 场景 c / 相机 l）：
   - copy(s3, uSq=1) → albedo RT（sRGB 标记的 colorSpace Vn）
   - copy(s3, uSq=0) → ORM RT（无色彩空间 hi）
   - normal(i3, 从 o2 解出高度做 Sobel) → normal RT
   │  法线强度 uK = bump*0.001*size/tile
   ▼
⑤ 三张纹理 repeat = 1/tile，name = "sl_<set>"，缓存进 Map p
   │
   ▼
⑥ w(matName, opts) 读 l1[matName] → 组 MeshStandardMaterial
      map/albedo, normalMap, roughnessMap=metalnessMap=aoMap=同一张 ORM
      + defines SL_TINT / SL_TRIPLANAR / SL_FX / SL_ACUT
      + userData.sl = uniforms → onBeforeCompile = K => h3(K, uniforms)
```

### 2.2 MRT 三个输出各是什么

`emit(color, alpha, height, ao, rough, metal)`（e3 第 55~59 行）：

| location | 变量 | 内容 | 说明 |
|---|---|---|---|
| 0 | `o0` | `vec4(sqrt(albedoRGB), alpha)` | **albedo + 透明度**。`sqrt` ≈ linear→sRGB 编码；随后 copy pass 用 `t.rgb*t.rgb` 解回 linear，写进标记为 sRGB 的 RT（three 会再做 linear→sRGB 输出编码），采样时解码一次即得正确线性色 |
| 1 | `o1` | `vec4(ao, roughness, metalness, 1)` | **ORM 打包**（AO=R / Rough=G / Metal=B），三张通道共用一张纹理喂给 aoMap/roughnessMap/metalnessMap |
| 2 | `o2` | `vec4(floor(h*255)/255, fract(h*255), 0, 1)` | **高度图 16bit 拆包**（整数 8bit 在 r、小数 8bit 在 g），只用来烘法线，不参与材质采样 |

> 注意：不是 albedo/normal/roughness 三张，而是 **albedo / ORM / height**；normal 是第三步从 height 用 `i3` 现算出来的。

### 2.3 纹理集表（`c3`，29 套；`Tn` 里 27 个 `surf()` 函数，`anodized` 复用 `gunmetal`、`glass_dirty` 复用 `glass`）

`size` = 分辨率系数（实际 px = `min(tex,1024) * size`，`hero && tex>=2048` 时强制 2048）；`tile` = 一个 UV 单位对应的世界尺寸（决定 `texture.repeat`）；`bump` = 法线强度。

| set | surf fn | size | tile | bump | 其它 | 关联材质 / 用途 |
|---|---|---|---|---|---|---|
| asphalt | asphalt | 1 | 2 | 1.6 | **hero** | `asphalt` 沥青路面/堆场 |
| concrete | concrete | 1 | 3 | 2.5 | | `concrete` / `concrete_dirty` / `concrete_painted` 码头地坪与墙 |
| brick | brick | .5 | 1.8 | 6 | | `brick` |
| epoxy | epoxy | .5 | 4 | 3 | | `floor_epoxy` 车间环氧地坪（含轮胎痕/车道磨白） |
| paint | paint | 1 | 2.5 | 2.5 | `p=[.5]` | 8 色 `paint_*` 涂装（红蓝绿黄橙白灰青），`uP.x`=锈蚀量 |
| hull | hull | .5 | 4 | 12 | | `hull_paint` / `hull_red` 船体外板（焊缝、锈流、盐渍） |
| galv | galv | .5 | 1 | .8 | | `steel_galv` 镀锌板（锌花 voronoi） |
| metal | metal | .5 | 1 | .5 | `p=[1]` | `steel_dark` / `steel_worn`，也是 `fA` 回退材质 |
| brushed | brushed | .5 | .5 | .4 | | `steel_bare` / `aluminium` / `brass` 拉丝金属 |
| rust | rust | .5 | 1.2 | 3 | | `steel_rust` |
| diamond | diamond | .5 | .5 | 2 | | `diamond_plate` 花纹板（楼梯/猫道/平台） |
| corrugated | corrugated | .5 | `[.762, 2.286]` | 19 | 非等比 tile | `corrugated_roof` 波纹钢板屋顶 |
| chainlink | chainlink | .5 | .5 | 5 | | `chainlink` 铁丝网围栏（alphaCut + 双面） |
| hazard | hazard | .5 | 1 | 2.5 | | `hazard_stripes` 黄黑警示条（道闸等） |
| gunmetal | gunmetal | .5 | .25 | .3 | `p=[.6]` | `gunmetal` |
| anodized | **gunmetal** | .5 | .25 | .25 | `p=[.2]`, `seed=11` | `anodized_black` 阳极氧化（同 fn 换 seed/参数） |
| polymer | polymer | .25 | .1 | .4 | | `polymer_black` / `polymer_tan` / `rubber` |
| carbon | carbon | .25 | .05 | .5 | | `carbon` 碳纤维 |
| fabric | fabric | .25 | .05 | .4 | | `glove_fabric` 手套织物 |
| armor | armor | .5 | .5 | .8 | | `armor_white` / `armor_orange` 护甲 |
| wood | wood | .5 | 1.2 | 2.6 | | `wood_pallet` / `wood_dark` |
| plastic | plastic | .5 | 1 | 1 | | `plastic_blue/red/grey` |
| tarp | tarp | .5 | 1.5 | 20 | | `tarp` 防水篷布 |
| cardboard | cardboard | .5 | 1 | .8 | | `cardboard` 纸箱 |
| rope | rope | .25 | .1 | 4 | | `rope` |
| tire | tire | .5 | `[.5,.3]` | 7 | 非等比 tile | `tire` 轮胎 |
| glass | glass | .5 | 1.5 | 1.5 | `p=[.3]` | `glass`（tint 3 + transparent） |
| glass_dirty | **glass** | .5 | 1.5 | 1.5 | `p=[1]`, `seed=40` | `glass_dirty`（同 fn 换脏参数） |
| water | water | .25 | 4 | 30 | | `water_dark` |

材质表 `l1` 共 **48 条**，由 `Nt(set, opts)` 工厂生成（默认 `tint:0, color:0xffffff, rough:1, metal:1, nrm:1, wet:cA, macro:hA`），`Xa(color)` 是 `paint` set 的便捷工厂。

### 2.4 GLSL 噪声 / 层叠技法概述

公共前缀 `e3`（第 10~96 行）提供：

| 符号 | 技法 |
|---|---|
| `pcg3(uvec3)` | LCG 整数哈希（`1664525/1013904223` + 交叉混洗），零查表 |
| `h3(cell, per, seed)` | 把整数格点 + 周期 `per` 喂给 pcg3 → 每格一个确定性随机 vec3（可平铺） |
| `gn(p, per, seed)` | 2D **梯度噪声**（改进 Perlin：`u = f³(f(6f−15)+10)` 五次缓动） |
| `fbm(uv, f, oct, seed)` | **分形叠加**，半倍频衰减，输出归一到 ~0.5±0.18 |
| `vor(p, per, seed)` | 3×3 邻域 **Voronoi**，返回 `(F1, F2, cellRand, cellRand2)`，用于石子/锌花/孔洞/砖块 |
| `scr(uv, f, s, w, ang, spread, dens)` | 按格点撒**直划痕**：每格一条随机角度/长度/半宽的线段，`smoothstep` 出抗锯齿边 |
| `rustMask(uv, f, th, s)` | 大尺度 fbm 阈值 × 细粒度 fbm 扰动 → **斑驳锈斑蒙版** |
| `chipsF` / `paintDmg` | **共享油漆损伤模型**：voronoi 碎片（纵向拉伸两档）+ 磨穿阈值 + 两组交叉划痕 → `chip`（0 完好→1 见底材）、`stain`（氧化晕）、`run`（向下锈流，向 −V 方向 4 次回溯） |
| `OV(color, k)` 宏 | `nt = mix(nt, color, k); ta = mix(ta, 0, k)` —— **"底色 + 覆盖层"累加器**：`nt` 是覆盖色、`ta` 是残留基底权重，用于 paint/metal/hull 等"材质色由 JS 侧 `diffuse` 给出、贴图只提供损伤"的着色模式 |
| `L(r,g,b)` | `pow(vec3, 2.2)` 手动 sRGB→linear（源码里颜色按美术直觉写 sRGB） |

`n3`（196~224 行）是**可被模板插值进多个 surf 的共享"油漆老化"片段**（`${n3}` 出现在 `Tn.paint` / `Tn.hazard` 中）：细/中/粗三层 fbm + 粉化 chalk + 灰尘膜 + 三档竖向雨痕 vs1/vs3 + `chip` 分层（面漆→底漆 primer→裸钢 steel）+ 新鲜划痕 fresh，最后输出 `nt/ta/h/r/m/ao`。

其余 25 个 `surf()` 都是同一套路的参数化变体：**多八度 fbm 分层（大形/中斑/细粒）→ voronoi 结构（石子/孔/砖/锌花）→ 划痕/裂纹/接缝 → 污渍/锈/油 → `emit()` 一次写三通道**。

---

## 3. 标牌 / 铭牌清单

### 3.1 字体、颜色、做旧（canvas 侧通用）

- 字体栈：`o3` = stencil 风（`PingFang SC` ×3 + `Impact`）、`r3` = sans（`PingFang SC` + Arial）、`oA` = mono（Menlo/Consolas）。
- `qa()` 画字时，非 sans/mono 且 `bridges !== false` 会对每个字**在字心挖一条竖缝**（`destination-out`），做出模板喷漆（stencil）断笔效果；`rA = {I,1,空格,-,.,/, :,,,, ',!,·}` 这些字形不挖。
- 颜色表 `Ut`：white `[226,223,213]`、black `[24,24,26]`、yellow `[222,172,30]`、red `[168,36,28]`、navy `[24,38,58]`、orange `[206,100,30]`。
- `Ks(canvas, w, h, amount, rng)` = **做旧**：`destination-out` 打不规则缺口 + 随机细划线 + 亮点 + 径向污渍；`distress` 参数（0.1~0.55）控制强度。
- `l3` 的 `label(text, opts)` 会 `toUpperCase()`，画布高度基准 100px、字距 6%，宽度超 2000px 自动缩放；按 `text|color|font|distress` 做 Map 缓存。`document.fonts.load` 完成后 120ms 防抖重绘一次（保证中文字体就位）。
- `Mi(ctx, text, opts)` / `Jn(ctx, decalKey)` 是 props 侧的 **WeakMap 缓存包装**，取不到时降级成 `paint_white` 方块。

### 3.2 内置贴花图集（`l3` 内 `c` 对象，22 项，全部 canvas 绘制）

| key | 像素尺寸 | 内容 / 中文文字 | 样式线索 | 出现位置 |
|---|---|---|---|---|
| `hazard_flammable` | 256×256 | 红菱形 + 白火焰 + 字符 **"3"** | 红底白边，distress .3 | 气瓶、LPG 罐、油桶 |
| `hazard_voltage` | 256×256 | 黄三角 + 黄底黑**闪电** | 黄底黑，distress .3 | 电气设备（relay_node、guard booth 等） |
| `hazard_general` | 256×256 | 黄三角 + **感叹号** | 黄底黑，distress .3 | sign_post 方牌、气瓶 |
| `arrow` | 384×192 | 白色导向**箭头**（带两条镂空断口） | 白，distress .5 | 地面导向 |
| `no_entry` | 256×256 | 红圈白横杠**禁止驶入** | 红白，distress .3 | guard booth、sign_post |
| `logo_a` | 640×192 | **几猫北航** / **北极 · 大西洋 · 支线运输** | 白，图形=缺口圆环+三角箭头，weight 900 | 集装箱侧壁 |
| `logo_b` | 640×192 | **几猫远洋** / **集装箱运输** | 橙色文字，图形=双波浪 | 集装箱侧壁 |
| `logo_c` | 640×192 | **几猫太平洋** / **远洋 · 冷链 · 散货** | navy 底/文字，图形=扇形+横条 | 集装箱侧壁 |
| `logo_d` | 640×192 | **几猫联运** / **多式联运** | 黄色文字，图形=井字/集装箱剪影 | 集装箱侧壁 |
| `berth4` | 640×224 | **四号泊位** | 黄色 12px 边框（被两条竖镂空打断），weight 900，distress .55 | sign_post 方牌、guard booth |
| `caution_stripes` | 512×128 | 黄黑 **45° 斜纹警示带** | 黑底黄纹，distress .5 | 40hc 集装箱端部 |
| `grime_streak` | 128×256 | 竖向污渍流（无文字） | rough .85，也是**未知 decal 的回退项** | 通用脏迹 |
| `rust_run` | 128×256 | 锈水流挂 + 锈斑 | rough .9 | 金属立面 |
| `oil_stain` | 256×256 | 油污 | rough .12（很滑） | 地面 |
| `leak_stain` | 192×256 | 浅色渗漏渍 | rough .8 | 设备下方 |
| `bullet_metal` | 128×128 | 金属弹孔 | rough .4, metal .8 | 金属被击中处 |
| `bullet_concrete` | 128×128 | 混凝土弹坑 + 裂纹 | rough .95 | 混凝土被击中处 |
| `scorch` | 256×256 | 爆灼黑斑 + 放射划线 | rough .95 | 爆炸点 |
| `crack` | 256×256 | 递归分叉裂纹 | rough .95 | 墙/地面 |
| `graffiti_tag` | 384×256 | 涂鸦（4 组曲线字 + 滴淌） | 灰白 `rgba(206,214,208)`，distress .25 | 墙面 |
| `csc_plate` | 288×200 | **安全检验铭牌**（见 3.3） | 金属渐变底 + 四铆钉 + 细线分隔，rough .45 / metal .75 | 集装箱端面 |
| `numbers_0_9` | 640×128 | 0~9 十个白色数字（每格 64px，weight 900） | 白，distress .3；`number(n)` 用 `repeat=.1/offset` 裁切复用 | 编号牌 |

`sign_post` 的方牌图案从 `Jg = ["hazard_general","no_entry","hazard_voltage","berth4","arrow","hazard_flammable"]` 按 seed 轮选，下方条牌文字从 `E3` 轮选（见 3.4）。

### 3.3 铭牌正文（`csc_plate` 内嵌，第 1076~1089 行）

标题（sans 600 / 19px / 居中 / 字距 1.5）：**安全检验铭牌**
下面 7 行（mono 500 / 11px / 行距 16.5 / 每行下有 1px 分隔线，每行下方 `maxW = 288-60`）：

1. `检验编号 SL/PA-4207/19`
2. `制造日期 2019年03月`
3. `设备编号 SLTU 402719 6`
4. `最大总重 30 480 千克`
5. `堆码载荷 192 000 千克`
6. `横向试验 150 千牛`
7. `下次检验 2027年09月`

再叠 30 个随机锈点（`rgba(60,40,24,.25)`）。

### 3.4 场景标牌 / 铭牌总表（中文文字 ↔ 物件 ↔ 尺寸样式）

> 尺寸单位是**世界米**（`decal(mat, h, x, y, z, rot, w)` 的第 2 参 = 高度；`label(text, opts, h, maxW, {p,r})` 实际高 = `min(h, maxW×aspect)`）。

| # | 文字 | 所在物件 / builder | 尺寸(高×限宽) | 样式（color / font / distress） |
|---|---|---|---|---|
| 1 | **几猫北航** + **北极 · 大西洋 · 支线运输** | 集装箱侧壁 `logo_a` | 图集 640×192，贴图高 **0.20** | 白 / stencil / .35 |
| 2 | **几猫远洋** + **集装箱运输** | 集装箱侧壁 `logo_b` | 同上 0.20 | 橙 / stencil / .35 |
| 3 | **几猫太平洋** + **远洋 · 冷链 · 散货** | 集装箱侧壁 `logo_c` | 同上 0.20 | navy / stencil / .35 |
| 4 | **几猫联运** + **多式联运** | 集装箱侧壁 `logo_d` | 同上 0.20 | 黄 / stencil / .35 |
| 5 | **四号泊位** | 集装箱 `berth4` 图集；sign_post 方牌；guard_booth | 图集 640×224；sign_post 贴高 **0.5**；booth **0.34** | 黄 / stencil 900 / .55 |
| 6 | **安全检验铭牌**（+7 行参数） | 集装箱端面 `csc_plate` | 288×200，贴高 **0.17**，限宽 .36 | 金属底黑字 / sans+mono / 无 distress（自带锈点） |
| 7 | `SLTU 482915 7` 等 6 个箱号（`v1` 表） | 集装箱侧壁 | 贴高 **0.115** | 白 / stencil / .3 |
| 8 | `22G1` / `42G1` / `45G1`（箱型，`_3` 表） | 集装箱侧壁 | 贴高 **0.10** | 白 / stencil / .3 |
| 9 | **最大总重 30,480 千克**（等 3 行，按箱型取 gross/tare/net/cu） | 集装箱侧壁铭牌行 | **0.052 / 0.045 / 0.045** | 白 / sans / .2 |
| 10 | **几猫港区  B4-0271** | `showcase` 贴花墙 | **0.30** | 白 / stencil |
| 11 | **最大总重 30480 千克** | `showcase` 贴花墙 | **0.22** | 黄 / stencil / .6 |
| 12 | **危险** | `showcase` 贴花墙；generator 机身 | **0.30**；generator **0.22**×限宽 .05 | 红 / stencil / .2（墙）.3（发电机） |
| 13 | **请勿靠近** | `showcase` 贴花墙 | **0.25** | 黑 / **sans** |
| 14 | **仅限授权人员** / **禁止行人通行** / **请穿反光服并佩戴安全帽** / **自动作业车辆** / **请勿靠近** | `sign_post` 下条牌，`E3[seed%5]` 轮选 | 贴高 **0.07**，限宽 .52 | 黑 / **sans** / .15 |
| 15 | **门禁控制** | `guard_booth` 岗亭读卡器（旁边有自发光 `emissive(16767398)` 灯条 0.17×0.05） | **0.10** × 限宽 .9 | 黑 / stencil / .2 |
| 16 | **批次 1000~9999**（`"批次 " + 1000+rand*8999`） | `shelf_rack` 托盘"wrapped"缠膜货 | **0.06** × 限宽 .3 | 黑 / **sans** / .1 |
| 17 | **货位 A-10 ~ F-49**（`"货位 " + A+n%6 + "-" + (10+n%40)`） | `shelf_rack` 立柱横梁 | **0.07** × 限宽 .34 | 黑 / sans / .1 |
| 18 | **每层限重2000千克** | `shelf_rack` 横梁 | **0.045** × 限宽 .5 | 黑 / sans / .1 |
| 19 | **几猫船用制冷** | `reefer_unit` 冷藏机组面板 | **0.05** × 限宽 1.2 | 黑 / sans / .2 |
| 20 | **中继 N**（`"中继 " + s`） | `relay_node` 设备铭牌上行 | **0.12** × 限宽 `O-.1` | **黄** / stencil / .15 |
| 21 | **港区主控上行链路** | `relay_node` 铭牌下行 | **0.034** × 限宽 `O-.1` | 白 / sans / .15 |
| 22 | **接线图 SLT-R4** | `relay_node` 侧接线盒盖（0.2×0.03 条） | 高 **0.03** | 白 / sans / .1 |
| 23 | **检修前请断电** | `relay_node` 接线盒下方 | **0.03** × 限宽 `O-.1` | 白 / sans / .15 |
| 24 | **易碎物品** / **此面向上** / **保持干燥** / **机械零件**（`E1` 默认/seed 轮选，另有默认 code `B4-117`） | `crate_wood` / `crate_stack` 木箱侧面 | 随箱尺寸（约 0.35~1.1 高） | 按调用参数，`E1` 内部 `label` 默认 |
| 25 | **重物** + 箱号 **几猫040/几猫041** | `crate_stack` 顶层箱 | 同上 | 默认 |
| 26 | **储液箱 1000 升** | `ibc_tote` 吨桶框架 | **0.36** × 限宽 .06 | 黑 / sans / .2 |
| 27 | **NYY-J 4x95 mm2  500 m**（电缆滚筒有字面时）/ **几猫港区**（另一面） | `cable_reel` 侧板 | **0.70** × 限宽 .085 | 白 / **stencil** / .45 |
| 28 | **乙炔** / **氧气** / **氩气** / **丙烷**（`[(seed+u)%4]` 轮选） | `gas_cylinders` 气瓶瓶身 | **0.20**（`cdecal`，高 .2 宽 .1） | 白 / stencil / .4 |
| 29 | **易碎物品** / **保持干燥** | `cardboard_boxes` 纸箱 | 箱面 | 默认（`nR` 内联） |
| 30 | **几猫**（品牌 logo 字） | `forklift` 叉车车身 | **0.42** × 限宽 .085 | 黑 / sans / .3 |
| 31 | **液化气** | `forklift` 尾部 LPG 气瓶（旁边贴 `hazard_flammable`） | **0.157**×.16（`cdecal`） | **红** / stencil / .3 |
| 32 | **最大载重2500千克** | `forklift` 门架/铭牌 | **0.50** × 限宽 .05 | **黄** / stencil / .3 |
| 33 | **危险** | `generator` 柴油发电机组机身 | **0.22** × 限宽 .05 | 红 / stencil / .3 |
| 34 | **柴油** | `generator` 油箱口 | **0.20** × 限宽 .05 | 白 / stencil / .4 |
| 35 | **四号泊位废物 11 / 12**（`seed%2` 轮选） | `dumpster` 垃圾箱 | **0.36** × 限宽 .09 | 白 / stencil / .5 |
| 36 | **检修 1 / 2**（`seed%2` 轮选，可被 `opts.label` 覆盖） | `toolbox_cart` 工具车 | **0.30** × 限宽 .07 | 白 / stencil / .4 |

（`showcase` 里还额外用 `e.number(4)` / `e.number(7)` 展示数字贴花。）

---

## 4. 嵌入 GLSL shader 清单

### 4.1 烘焙侧（GLSL3，`glslVersion = Ac`）

| 变量 | 行号 | 类型 | 用途 |
|---|---|---|---|
| `Qy` | 7~9 | vertex | 全屏三角/四边形：`vUv = position.xy*.5+.5`，`gl_Position = vec4(position.xy,0,1)` |
| `e3` | 10~96 | fragment **前缀** | 所有 `surf()` 的公共库：uniform `uP/uSeed/uTexel`、`layout(location=0..2) out o0/o1/o2`、噪声库 + `emit` + `rustMask` + `chipsF/paintDmg`（见 §2.4） |
| `t3` | 97~98 | fragment **尾** | `void main(){ surf(vUv); }` |
| `Tn.*` | 100~574 | fragment **主体** | 27 个 `void surf(vec2 uv)`：`asphalt concrete brick epoxy paint hazard hull galv metal brushed rust diamond corrugated chainlink gunmetal polymer carbon fabric armor wood plastic tarp cardboard rope tire glass water` |
| `n3` | 196~224 | 可插值片段 | 共享"油漆老化"代码，被 `${n3}` 插进 `Tn.paint`、`Tn.hazard` |
| `i3` | 575~586 | fragment | **height → normal**：uniform `tH`(o2)、`uK`(x/y 强度)、`uTexel`；解 `r + g/255` 得高度，8 邻域 Sobel（中心差分 + 对角 1/4），`n = normalize(vec3(-gx*uK.x, -gy*uK.y, 1))` |
| `s3` | 587~590 | fragment | **copy**：`o = uSq>0.5 ? vec4(t.rgb*t.rgb, t.a) : t`（albedo 解码 / ORM 直通） |

### 4.2 运行时材质补丁（`applyPatch` 注入到 MeshStandardMaterial）

| 变量 | 行号 | 注入点 | 用途 |
|---|---|---|---|
| `dA` | 1627~1632 | `<common>` (vertex) | 声明 `vSlPos`；`SL_TRIPLANAR` 时另加 `vSlONrm/vSlAx/vSlAy` |
| `pA` | 1633~1651 | `<project_vertex>` (vertex) | 算世界/视图空间位置：三平面模式下把基向量过 `skinMatrix`/`instanceMatrix`/`modelViewMatrix`；否则 `vSlPos = modelMatrix * instanceMatrix * transformed` |
| `mA` | 1652~1667 | `<common>` (fragment) | uniform 声明 `uSlWet/uSlWetP/uSlMacro/uSlUv/uSlX` + 全局状态 `slORM/slUv/slWetK/slUp/slMac/slMac2/slBead` + 3D 哈希噪声 `slH`/`slN3` + 三平面采样 `slTri` |
| `gA` | 1668~1754 | `<map_fragment>` | **最大块**：三平面加权采样 albedo/ORM、宏观噪声（明度起伏 + 灰蒙）、**降雨湿润**（朝上更湿、竖面拉丝 streak、贴地溅湿带、水珠 slBead）、4 种 `SL_TINT` 着色模式、湿润去饱和、`SL_ACUT` 铁丝网 mip 级 alpha-test 抖动 |
| `vA` | 1755~1767 | `<roughnessmap_fragment>` | `roughness * slORM.g` + 宏观噪声偏移 + 湿润降粗糙 + 水珠降到 0.05 + 法线贴图长度补偿 + clamp(0.045,1) |
| `xA` | 1768~1770 | `<metalnessmap_fragment>` | `metalness * slORM.b` |
| `yA` | 1771~1789 | `<normal_fragment_maps>` | 三平面法线重建（按 `|n|^6` 权重混合三个切线空间法线再旋到世界基）；普通路径 `tbn * mapN`，湿润时法线强度 ×(1−0.45·wetK·up) |
| `bA` | 1790 | `<aomap_fragment>` | `It.aomap_fragment.replace("texture2D( aoMap, vAoMapUv ).r", "slORM.r")` —— **直接改 three.js 内置 chunk 字符串**，AO 改读 ORM 的 R 通道（这样只需一张 ORM 贴图） |

`SL_TINT` 4 种模式（`gA` 第 1728~1737 行）：

| 值 | 公式 | 语义 | 使用者 |
|---|---|---|---|
| 0 | `diffuseColor.rgb *= sampled.rgb` | 贴图即完整 albedo | concrete/asphalt/wood/plastic/… |
| 1 | `sampled.rgb + diffuse * sampled.a` | **损伤遮罩**：贴图给损伤色、alpha 给完好度，底色来自材质 `color` | `paint_*`、`steel_*`、`gunmetal`、`polymer_*`、`armor_*`、`hull_*`… |
| 2 | `mix(sampled.rgb, diffuse * 亮度匹配, sampled.a*.96)` | 保色相的染色（亮度归一到 ~0.19） | `concrete_painted` |
| 3 | `diffuseColor *= sampled` | 乘法调制（含 alpha） | `glass`、`glass_dirty`、`chainlink` |

### 4.3 全文（两个最大的）

**`gA` — `<map_fragment>` 补丁（第 1668~1754 行，运行时最重的一块）**

```glsl
#ifdef SL_TRIPLANAR
  { vec3 slOn = normalize(vSlONrm); vec3 slW3 = pow(abs(slOn), vec3(6.0)); slTw = slW3 / (slW3.x + slW3.y + slW3.z);
    vec3 slQ = vSlPos * uSlUv.z; slUx = slQ.zy; slUy = slQ.xz; slUz = slQ.xy; }
  vec4 sampledDiffuseColor = slTri(map);
  slORM = slTri(roughnessMap);
#else
  slUv = vMapUv * uSlUv.xy;
  vec4 sampledDiffuseColor = texture2D(map, slUv);
  slORM = texture2D(roughnessMap, slUv);
#endif
#ifdef SL_FX
  {
    #ifdef FLAT_SHADED
      vec3 slVN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
    #else
      vec3 slVN = normalize(vNormal);
      #ifdef DOUBLE_SIDED
        slVN *= gl_FrontFacing ? 1.0 : -1.0;
      #endif
    #endif
    vec3 slWN = inverseTransformDirection(slVN, viewMatrix);
    vec3 slMp = vSlPos * uSlMacro.z;
    slMac = slN3(slMp); slMac2 = slN3(slMp * 3.7 + 11.3);
    float slM = slMac * 0.65 + slMac2 * 0.35 - 0.5;
    sampledDiffuseColor.rgb *= 1.0 + uSlMacro.x * slM * 2.0;
    float slGr = smoothstep(0.5, 0.85, slMac * 0.6 + slMac2 * 0.4 + (1.0 - slORM.r) * 0.3) * uSlMacro.w;
    sampledDiffuseColor.rgb *= 1.0 - slGr * 0.35;
    #if SL_TINT == 1
      sampledDiffuseColor.a *= 1.0 - slGr * 0.2;
    #endif
    // rain wetness: strongest on up-facing faces, streaky on verticals, none underneath
    slUp = smoothstep(0.15, 0.85, slWN.y);
    float slExpo = smoothstep(-0.4, -0.05, slWN.y);
    float slStreak = 0.0;
    #ifndef SL_TRIPLANAR
      float slSc = vSlPos.x + vSlPos.z;
      slStreak = slN3(vec3(slSc * 9.0, vSlPos.y * 0.55, slSc * 0.7 + 3.0)) * slN3(vec3(slSc * 29.0, vSlPos.y * 1.1, 7.0));
      slStreak = smoothstep(0.12, 0.42, slStreak) * smoothstep(0.3, 0.7, slN3(vec3(slSc * 1.1, vSlPos.y * 0.25, 1.7)));
    #endif
    float slW = uSlWet * uSlX.x * slExpo;
    slWetK = slW * mix(uSlWetP.z * (0.55 + 0.9 * slStreak), 0.75 + 0.5 * slMac, slUp);
    #ifndef SL_TRIPLANAR
      { float slLow = smoothstep(0.5, 0.0, vSlPos.y) * (1.0 - slUp) * slExpo;        // damp, splashed band where things meet the ground
        slWetK += slW * slLow * 0.6;
        float slLg = 1.0 - slLow * min(uSlMacro.w, 0.5) * 0.45;
        sampledDiffuseColor.rgb *= slLg;
        #if SL_TINT == 1
          sampledDiffuseColor.a *= slLg;
        #endif
      }
    #endif
    slWetK = clamp(slWetK, 0.0, 1.0);
    float slBf = clamp(1.0 - length(fwidth(vSlPos)) * 120.0, 0.0, 1.0);
    if (uSlWetP.w > 0.0 && slBf > 0.0) {
      float slB = slN3(vSlPos * 170.0) * 0.6 + slN3(vSlPos * 410.0 + 5.0) * 0.4;
      slBead = smoothstep(0.6, 0.68, slB) * uSlWetP.w * slW * slBf * (0.4 + 0.6 * slUp + 0.5 * slStreak);
    }
  }
#endif
#if SL_TINT == 1
  diffuseColor.rgb = sampledDiffuseColor.rgb + diffuse * sampledDiffuseColor.a;
#elif SL_TINT == 2
  { float slL = clamp(dot(sampledDiffuseColor.rgb, vec3(0.3333)) / 0.19, 0.55, 1.35);
    diffuseColor.rgb = mix(sampledDiffuseColor.rgb, diffuse * slL, sampledDiffuseColor.a * 0.96); }
#elif SL_TINT == 3
  diffuseColor *= sampledDiffuseColor;
#else
  diffuseColor.rgb *= sampledDiffuseColor.rgb;
#endif
#ifdef SL_FX
  { float slLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
    diffuseColor.rgb = mix(vec3(slLum), diffuseColor.rgb, 1.0 + 0.25 * slWetK * uSlWetP.x * 2.0);
    diffuseColor.rgb *= 1.0 - uSlWetP.x * slWetK; }
#endif
#ifdef SL_ACUT
  // alpha-tested wire mesh that survives distance: wires stay ~1 px wide through the mips (lowered threshold),
  // then dissolve into a stable ~1/3-coverage dither veil once the diamonds themselves are sub-pixel.
  { vec2 slFw = fwidth(slUv) * 512.0; float slLod = log2(max(max(slFw.x, slFw.y), 1e-4));
    float slThC = 0.5 * exp2(-clamp(slLod - 1.0, 0.0, 4.0));
    float slIgn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float slTh = mix(slThC, 0.05 + slIgn * 0.80, smoothstep(3.5, 5.5, slLod));
    diffuseColor.a = sampledDiffuseColor.a > slTh ? 1.0 : 0.0;
    // sub-pixel wires: the surviving fragments stand in for a much thinner wire, so dim them (no white sheets in the sun)
    diffuseColor.rgb *= mix(1.0, 0.45, smoothstep(1.5, 4.5, slLod)); }
#endif
```

**`e3` — 烘焙公共前缀（第 10~96 行，本模块最大的 GLSL 块）**：完整内容即 §2.4 表中所有符号的实现，含 `emit`、`rustMask`、`chipsF`、`paintDmg` 四个共享函数，此处不再重复贴（见文件 `src/game/03-textures.js` 第 10~96 行）。

---

## 5. `applyPatch`（`h3`）的作用推测

```js
function h3(i, e) {
  Object.assign(i.uniforms, e),
  i.vertexShader   = i.vertexShader.replace("#include <common>",        `...` + dA)
                     .replace("#include <project_vertex>",             `...` + pA),
  i.fragmentShader = i.fragmentShader.replace("#include <common>",      `...` + mA)
                     .replace("#include <map_fragment>",               gA)
                     .replace("#include <roughnessmap_fragment>",      vA)
                     .replace("#include <metalnessmap_fragment>",      xA)
                     .replace("#include <normal_fragment_maps>",       yA)
                     .replace("#include <aomap_fragment>",             bA)
}
```

**推测结论**：它是本作自研的 **"PBR 材质增强补丁"**，等价于 three.js 官方 `onBeforeCompile` hook 的一套固定注入。它改的是一个 **shader 对象**（`{uniforms, vertexShader, fragmentShader}`，即 three 内部传给 `onBeforeCompile` 的 `shader` 参数），不是材质本身。注入后一个普通 `MeshStandardMaterial` 获得五项能力：

1. **自定义 UV 缩放**（`uSlUv`）—— 一套贴图按 `tile` 铺到不同尺寸物体上；
2. **三平面映射 `SL_TRIPLANAR`** —— 无 UV 的物体（球、树、集装箱顶）也能贴，按 `|normal|^6` 混合 XYZ 三面；
3. **雨天湿润系统 `SL_FX` + `uSlWet`** —— 朝上表面变湿变暗、竖面出现流水拉丝、贴地有溅湿带、`uSlWetP.w>0` 时按屏幕导数 `fwidth` 抗锯齿地长出水珠（`slBead`），并联动 roughness 降到 0.05、法线强度衰减、颜色去饱和；
4. **宏观噪声 `uSlMacro`** —— 世界坐标 3D 噪声做明度起伏 + AO 感的灰蒙，避免大面积同材质死板；
5. **`SL_TINT` 4 种贴图语义 / `SL_ACUT` 距离自适应 alpha-test**（铁丝网在远处从"逐像素镂空"平滑过渡到"1/3 覆盖率抖动纱网"并压暗，防止远处出现白色片状摩尔纹）。

配套的 uniform 由 `create()` 里 `w()` 组装并放进 `material.userData.sl`，**`uSlWet` 是全局共享的**（`mats.uniforms.wet.value` 可一次性把全场从干切到湿），`showcase` 就用 `params.wet` 演示这一点。

---

## 6. 其他值得注意的点

1. **一个 chunk 装了两个模块**：`qg`(textures) + `$g`(props)，见 §1.2。后续拆分/重命名时别只看头部的 `br(qg, …)`。
2. **死代码 `d3(i)`（第 2126~2508 行，约 380 行）**：一个带 A* 寻路 + 射线检测 + 碰撞盒管理的导航网格构建器，依赖从 04-level chunk 导入的 `oi`（`oi.groundY/oi.quayX/oi.min/oi.max`）。它**没有出现在任何导出里，全文件仅 1 处出现（定义本身）**，其他 raw chunk 也引用不到 —— 疑似从 level 模块迁移时留下的孤儿代码。
3. **缓存与生命周期**：`create()` 里有 4 层 Map（MRT RT 按尺寸、ShaderMaterial 按 `fn`、贴图集结果按 `set`、最终材质按 `name|flags`）；`update()` 在最后一次生成后 **4 秒**调用 `_()` 只释放 MRT RT 和烘焙用 ShaderMaterial（**生成好的贴图和材质保留**）；`stats()` 返回 `{sets, textureMB, genMs, decalMB}`。
4. **健壮性**：`w()` 对未知材质名 `console.warn` 并回退 `fA`（metal set）；对烘焙异常 `console.error` 并回退成纯色 `MeshStandardMaterial`；`l3` 对未知 decal 回退 `grime_streak`；`Mi/Jn` 对 label/decal 抛异常时回退 `paint_white` 方块 —— 全链路不会抛穿。
5. **`showcase` 支持 `?only=<材质名,逗号分隔>`** 和 `?wet=<0|1>`，是调试材质/湿润系统的入口；同时打印 `[mats] {"sets":…,"textureMB":…,"genMs":…,"decalMB":…}`。
