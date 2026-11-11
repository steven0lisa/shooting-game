# 02-render 模块解析（渲染管线 / 天空 / 软阴影补丁 / 后处理链）

- 源文件：`src/game/raw/02-render.raw.js`（55,655 字节）
- 格式化：`src/game/02-render.js`（75,244 字节，`node --check` 通过；与 raw 去空白后逐字节一致）
- esbuild 命名空间导出：`create` / `showcase`
- GLSL 提取：`shaders/` 共 22 个 `.glsl` 文件（清单见 §5）

## 1. 模块导出

```js
br(Vg, { create: () => Hg, showcase: () => sA });
```

| 导出 | 函数 | 职责 |
|---|---|---|
| `create` | `async function Hg(i)` | **主入口**。建 WebGLRenderer（#view canvas、MSAA 关、shadowMap 手动更新）→ 双相机（主相机 fov=`Pi.fov` near .08/far 900/layer `vf` + 视模相机 `Pi.viewFov` near .01/far 10/layer `zc`）→ 天空盒 mesh（SALTLINE_SKY）→ 平行光太阳（`Gy()` 拟合阴影相机）→ 软阴影 chunk 热补丁 → 6 盏点光池（枪口/爆炸闪光）→ 天空 PMREM 环境贴图 → HDR RT（HalfFloat + depthTexture + quality.msaa MSAA）→ `jy()` 后处理链（失败即回退前向渲染）→ 动态分辨率 / 质量档位 / thunder 事件 / 室内探针 PMREM → 自测（放一个测试立方体跑一帧，按 shader 错误标记回退）→ 返回控制 API `N` |
| `showcase` | `function sA(i)` | **展示/截图入口**。建 group `render-showcase`：2×7 材质球阵（roughness .06~.96、metalness 0/1 两排）、4 个具名材质盒（paint_orange/steel_worn/paint_teal/concrete）、木托盘、混凝土围墙+顶、两条 emissive 灯带；返回 `{cam, target, update}`，`update()` 按相机 y 取模 10 切换 post 状态（damage/lowHealth/ads/flash/fade）用于效果截图 |

`create` 返回的 API `N`（供其它模块/游戏逻辑使用）：

- `frame(dt)`：主循环入口——驱动天空 `uTime`、雷电包络 `uFlash`、pre-pass、`j()`（advanced）或 `G()`（前向回退）
- `resize()`：按 `quality.scale × 动态 scale × devicePixelRatio(≤2)` 定分辨率，超像素预算则按 √ 比例回压
- `setQuality(q)`：换阴影图尺寸、MSAA samples、`applyQuality()`（VOL_STEPS/AO_TAPS）、resize
- `renderWorld(cam, target)`：只渲世界层到任意 RT（供反射/截图等），完整保存恢复渲染器状态
- `addPrePass(fn)`：注册帧前回调（`H` 数组）
- `depthTexture`（getter）：置 `E=depthTextureIsLive` 并惰性建 `y.depthCopy`——其它模块要读深度时才多一次 depthcopy pass
- `onLevelReady()`：关卡就绪后 `compileAsync` 预编译 + `captureInteriorProbe()`
- `captureInteriorProbe()` / `interiorEnv`：室内立方体贴图→PMREM，按 `userData.interior===true` 分配给材质，相机进室内 box 时切换 `scene.environment`
- `stats()`：draw calls/tris/geos/tex/programs/res/scale/advanced/softShadows/adapt（截图模式读回 1×1 曝光）
- `tune` = 后处理 `TUNE` 对象（§3）、`post` 状态（damage/lowHealth/ads/flash/fade/saturation…）、`exposure`、`autoExposure` 开关

URL 参数（`i.params`）：`post=0` 关后处理、`ao=0`、`vol=0`、`bloom=0`、`mb=1` 强开运动模糊、`dynres=0` 关动态分辨率、`shot`/`show` 截图模式（关动态分辨率 + 曝光快速收敛）。

## 2. 管线结构

### 2.1 渲染流程（advanced 路径）

```
主相机 render(scene) ──► HDR RT m（HalfFloat, MSAA=quality.msaa, depthTexture b）
      │  若他模块在读 depth：depthcopy 把 b 拷进 y.depthCopy
      ▼
视模相机 render（layer zc, depthRange(0,.05)，matrixWorld 跟随主相机；室内时切 interiorEnv）
      ▼
jy().run() 后处理链（见 2.2）──► 最终 pass 写 null（屏幕）
```

- 前向回退路径 `G()`：renderer 内置 tone mapping + `0.6 × exposure × (1-fade)`，无任何后处理
- 后处理任一帧抛异常 → `_ = !1` 永久回退前向并 resize
- 天空 mesh `renderOrder = -1000`、`depthWrite=false`；太阳 `shadowMap.autoUpdate=false`，advanced 路径下**隔帧**更新阴影（`ultra`/截图/无阴影图时每帧）

### 2.2 后处理 pass 顺序表

pass 名来自材质名 `post-<name>`，构建时把 `// SALTLINE_POST <name>` 拼进 fragment 头（`fragmentShader = \`// SALTLINE_POST ${name}\n<source>\``）——`onShaderError` 靠它定位失败的 pass。RT 池 `y`：scene/motion/ldr 全分辨率，depthHalf/aoA/aoB/volA/volB 半分辨率，down[0..5]+up[0..4] 金字塔，streakA/B，adapt[0..1] 各 1×1，dirt 512×288。

| # | pass 名 | 作用 | 关键 uniform / define |
|---|---|---|---|
| 0 | `dirt` | 程序化镜头污渍贴图（70 个随机圆盘+fbm 污迹+竖向条纹），只烘一次 | `tNoise`, `uAspect=16/9` |
| 1 | `depthcopy` | 把 MSAA resolve 后的深度拷到 `y.depthCopy`（仅他模块读 `depthTexture` 时跑） | `tDepth` |
| 2 | `depthhalf` | 深度线性化到半分辨率（`texelFetch`×2 精确取样防 AO 条带） | `tDepth`, `uNear`, `uFar`（相机 .08/900）；阈值 `0.05` |
| 3 | `ao` | 半分辨率 SSAO：深度差分重建法线、Vogel 螺旋采样、距离衰减、70~140m 淡出 | `tDepthHalf`, `uRadius/uIntensity/uAspect`, `AO_TAPS`(8/12/16) |
| 4 | `blur-ao` ×2 | 深度加权可分离模糊（H→V），容差紧 | `uDir`, `BLUR_TOL=0.04` |
| 5 | `vol` | 半分辨率体积光 raymarch：HG 双叶相函数、shadow-map `sunVis()` 遮挡、室内 box 尘埃增厚、远处解析续算到地平线色 | `tShadow/uShadowMatrix/uHasShadow`, `uSunRad/uAmb`, `uSigma/uMaxDist/uFarHaze/uBoxDust/uBoxMin/uBoxMax`, `VOL_STEPS`(6~16) |
| 6 | `blur-vol` ×2 | 同 blur 容差松（条带容忍高） | `BLUR_TOL=0.30` |
| 7 | `composite` | 全分辨率合入：AO+体积光 4-tap 双边上采样；AO 只压暗非受光像素（避免亮部脏边）、轻微冷调；体积光 `col = col*T + L` | `tColor/tDepth/tAO/tVol`, `uAoOn/uVolOn/uAoStrength`, `slExposure()` |
| 8 | `motion` | 重投影运动模糊（上一帧 VP 矩阵），亚像素跳过、深度权重剔除背景 | `uInvViewProj/uPrevViewProj`, `uShutter=min(.5, 1/190/dt)`, `uRes` |
| 9 | `down` ×6 | bloom 降采样金字塔，首级 Karis 平均压萤火虫 | `tSrc/uTexel/uFirst` |
| 10 | `up` ×5 | tent 升采样 + 与高层 mix | `tLow/tHigh/uMix=0.62` |
| 11 | `streak` ×2 | 各向异性水平长条辉光（下采样第 2 级），首趟按曝光相对阈值 2.2 取亮部，次趟 0 半径×5 再糊 | `uDir/uThreshold`, `slExposure()` |
| 12 | `adapt` | 1×1 ping-pong 自动曝光：7×5 中心加权对数平均亮度 + 太阳 12 点可见度测试 | `tPrev/tLum/tDepth`, `uRate=1-e^(-dt/1.5)`, `uVisRate`（τ=.12s）, `uSunUv/uSunOn` |
| 13 | `grade` | 主调色：色差(含受伤加重)→ADS 边缘软化→bloom mix+污渍+长条→太阳耀斑/鬼影(遮挡测试)→曝光→闪电加光→mix(ACES, AgX, .25)→分调/S 曲线/黑位提升/饱和度/暗角/受伤红边/fade→sRGB | `tScene/tBloom/tBlur/tStreak/tDirt/tAdapt`, `uBloom .065 uDirt .1 uStreak .03 uFlare .16 uCA .0013 uVignette .3 uAgxMix .25`, `uDamage/uLowHealth/uAds/uFlash/uFade/uSaturation`, `LOOK_POWER/LOOK_SAT` |
| 14 | `final` | FXAA（用 alpha 通道存的 luma）+ 轻 unsharp（强边让位 FXAA）+ 亮度加权动态胶片颗粒 + 抖动去色带 → 屏幕 | `tSrc=ldr`, `uGrain .02 uSharpen .3 uFxaa 1` |

帧序：dirt(一次性) → depthhalf → ao+blur → vol+blur → composite → motion → bloom 金字塔+streak → adapt(ping-pong 翻转) → grade → final。

## 3. TUNE 参数表（`g`，`post.TUNE`，运行期可被上层改）

| 参数 | 默认值 | 推测作用 |
|---|---|---|
| `volSunScale` | .85 | 体积光里太阳辐射亮度缩放（平行光 intensity × 此值） |
| `volAmbient` | .2 | 环境光散射基数（雾色 × 此值，雷电时 ×(1+1.5·thunder)） |
| `volSigma` | .0034 | 消光系数（空气密度基线） |
| `volMaxDist` | 170 | raymarch 最大距离（m）；更远走解析续算；天空只 march 55% |
| `volFarHaze` | .42 | 超出 maxDist 后的远景色霾密度缩放（船/吊车/天际线融入地平线色） |
| `volInteriorDust` | 6 | 室内 box 内尘埃浓度倍率（门缝/天窗光柱变实、环境光衰减到 0.22） |
| `aoRadius` | .9 | SSAO 采样半径（m），随深度 0.6→1.0 放大 |
| `aoIntensity` | 1.6 | AO 强度系数 |
| `aoStrength` | .95 | composite 阶段 AO 应用强度（再按亮度 ×(1-0.8·lit) 淡出亮部） |
| `bloom` | .065 | bloom 能量守恒 mix 比例（`mix(col, bloom, uBloom)`） |
| `bloomMix` | .62 | 上采样每级 `mix(高层, tent(低层), uMix)` |
| `dirt` | .1 | 镜头污渍叠加强度（`bloom × dirt贴图`） |
| `streak` | .03 | 各向异性长条辉光强度（冷蓝 tint 0.45/0.62/1.0） |
| `streakThreshold` | 2.2 | 长条辉光亮度阈值（除以当前曝光后生效，防暗场起条） |
| `flare` | .16 | 太阳 glare+鬼影+光环强度（受可见度 × 遮挡测试） |
| `key` | .12 | 自动曝光目标亮度（`key/lum` 的 key） |
| `minExposure` | .6 | 自动曝光下限 |
| `maxExposure` | 2 | 自动曝光上限 |
| `adaptTau` | 1.5 | 曝光适应时间常数（s，`rate=1-e^(-dt/τ)`） |
| `agxMix` | .25 | ACES↔AgX 混合比（.25=偏 ACES 冲击力，向 AgX 高光滚白拉一点） |
| `ca` | .0013 | 径向色差强度（受伤时 +.006） |
| `vignette` | .3 | 暗角基线（+低血 .55 +ADS .22） |
| `grain` | .02 | 胶片颗粒幅度（亮部衰减到 0.3、暗部衰减） |
| `sharpen` | .3 | unsharp mask 强度（contrast>0.04 的强边自动回退） |
| `lookPower` | 1.18 | AgX 后处理对比度指数（`LOOK_POWER` define，punchy look） |
| `lookSat` | 1.22 | AgX 后处理饱和度增益（`LOOK_SAT` define） |

其它固定常量：深度阈值 `0.05`（n1/Zy）、近/远平面 .08/900、AO 淡出 70→140m、体积光近端权重 2.3→0.55（4→85m）、Karis 首级权重、运动模糊 1/190 快门、环境光强 `Jy=2`（室外）/`Ky=1`（室内与视模）。

## 4. 质量系统与两个"一句话"

### 4.1 质量档位

- 档位名：`test / low / medium / high / ultra`（预设对象 `Pr` 来自其它模块，本模块只消费字段）：`name`、`shadow`（阴影图边长，默认 2048，clamp 到 maxTextureSize）、`msaa`、`ao`(bool)、`volSteps`、`bloom`(bool)、`motionBlur`(bool)、`scale`
- 派生：`AO_TAPS` = test/low → 8，ultra → 16，其余 12；`VOL_STEPS` = max(6, quality.volSteps)；软阴影 taps = low→10 否则 16（searchTaps 恒 8）
- **动态分辨率策略**：开销窗口累计（≥45 帧或 ≥900ms，启动后先 settle 3.5s）→ 平均帧时 >21.5ms 降 scale（步长 .1，>30ms 步长 .2，>45ms 直接 .6，地板 .6，升档等待期指数退避 4s→60s）；<17.4ms 且等待期过 → +.1 回升；**卡在地板 .6 且 >26ms 连续 2 次 → 自动降档**（ultra→high→medium→low，`setQuality` + `events.emit("quality:auto")`）
- **像素预算**（dpr≤2 后的总像素上限，超出按 √ 回压 scale）：low 1.0M / medium 1.5M / high 2.3M / ultra 3.7M
- 阴影图更新策略：默认隔帧（`T&1`），`ultra`/截图模式/阴影图未建时每帧

### 4.2 一句话机制

- **软阴影补丁**：monkey-patch Three 的 `ShaderChunk.shadowmap_pars_fragment`，把 `getShadow()` 换成 PCSS 风格实现——receiver-plane 深度偏置 + IGN 抖动的 Vogel 盘 blocker search 求遮挡者平均深度 → 按距离算半影半径 → 变半径 Vogel 盘 PCF（frustum 米数/深度范围按阴影相机实测插成 `const`，地图边缘 2% 淡出），驱动拒绝该 chunk 时 `Xy()` 还原原实现回退 stock PCF。
- **闪电/曝光自适应**：雷电走事件总线 `thunder` → `uFlash` 在 0.9s 内指数衰减 × 双频正弦闪烁，驱动天空 shader 的定向片状闪电（`uFlashDir` 随机方位）并给体积光环境项 ×(1+1.5·thunder)；曝光是 1×1 ping-pong RT 上的中心加权对数平均亮度（取 bloom 最小 mip）按 τ=1.5s 指数平滑，`exposure = clamp((key/lum)^0.85, min, max)`，同时平滑太阳可见度（Vogel 12 点深度探测）供耀斑遮挡剔除。

### 4.3 自测与回退

`create` 里放一个测试立方体跑一帧，`onShaderError` 按 shader 源里的标记归因（`SALTLINE_POST <pass>` / `SALTLINE_SKY` / `SALTLINE_SHADOW`）：后处理编译失败→抛错禁用 advanced；天空失败→报错；阴影 chunk 被驱动拒→`Xy()` 还原 + `shadowMap.type` 换 stock PCF + radius 2 再测；测试立方体始终在自测后移除。

## 5. shaders/ 提取清单

> 全部来自 `src/game/02-render.js` 的模板字符串；静态 include（`Ug/Ng/Js/Og`）与字符串常量 `0.05`（n1/Zy）已就地内联，运行期 JS 插值标为 `{{...}}`。post 材质运行时会在头部拼 `// SALTLINE_POST <pass>`，未写入文件。

| 文件 | 来源变量 | 用途 |
|---|---|---|
| `shaders/noise.glsl` | `Ug` | 共享块：`n2/fbm5/fbm3` 值噪声（采样 256² tNoise） |
| `shaders/sky-horizon.glsl` | `Ng` | 共享块：`skyToSun/horizonColor` 地平线渐变（天空与体积光共用） |
| `shaders/sky.glsl` | `H6` | SALTLINE_SKY 片元：全程序化天空（云甲板/太阳盘/霞光/片状闪电/PMREM 克制） |
| `shaders/sky-vert.glsl` | `V6` | 天空顶点：`vDir=position`，`gl_Position=p.xyww` 永远贴远平面 |
| `shaders/shadow-patch.glsl` | `l`（`qy()` 内，标记 `Wy`） | SALTLINE_SHADOW：替换 `getShadow()` 的 PCSS 软阴影 chunk；`{{SL_FRUSTUM/SL_DEPTH/SEARCH_TAPS/TAPS}}` 为运行期插值 |
| `shaders/post-vertex.glsl` | `G6` | 后处理全屏三角顶点（双引号字符串，非模板） |
| `shaders/post-common.glsl` | `Js` | 后处理共享块：`ign/hash12/luma` |
| `shaders/post-exposure.glsl` | `Og` | 后处理共享块：`slExposure()` 自动曝光查表 |
| `shaders/post-depthcopy.glsl` | `q6` | pass depthcopy |
| `shaders/post-depthhalf.glsl` | `X6` | pass depthhalf（线性化） |
| `shaders/post-ao.glsl` | `Y6` | pass ao（SSAO） |
| `shaders/post-volumetric.glsl` | `$6` | pass vol（体积光 raymarch，含 `Ng` 地平线色） |
| `shaders/post-blur.glsl` | `$y` | pass blur-ao / blur-vol（同一 shader，不同 `BLUR_TOL`） |
| `shaders/post-composite.glsl` | `Z6` | pass composite（AO+体积光合入 HDR） |
| `shaders/post-motion.glsl` | `j6` | pass motion（运动模糊） |
| `shaders/post-downsample.glsl` | `J6` | pass down（bloom 降采样） |
| `shaders/post-upsample.glsl` | `K6` | pass up（bloom 升采样） |
| `shaders/post-streak.glsl` | `Q6` | pass streak（各向异性长条辉光） |
| `shaders/post-adapt.glsl` | `eA` | pass adapt（自动曝光+太阳可见度） |
| `shaders/post-dirt.glsl` | `tA` | pass dirt（程序化镜头污渍） |
| `shaders/post-grade.glsl` | `nA` | pass grade（AgX/ACES 调色主 pass，含 flare 函数） |
| `shaders/post-final.glsl` | `iA` | pass final（FXAA+锐化+颗粒+抖动） |

说明：本模块 shader 基本都是模板字符串整块存放，没有发现 ES5 字符串拼接逐行生成的片元代码；唯一的"拼接"是后处理材质头部 `// SALTLINE_POST <pass>` 的运行时注入（见 §2.2）。雷电包络、`uThunder`（grade）与 `uFlicker`（vol）两个 uniform 声明了但 shader 体和 JS 每帧赋值均未使用，属死代码。
