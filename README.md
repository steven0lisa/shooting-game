# 几猫3A大作 — 工程还原版

> 原始物：`refers/几猫国产3A大作_V1.html`（单文件 HTML，1.43 MB）。
> 本仓库把它拆分成可维护的工程并**浏览器实测可玩**（主菜单 → 第一人称游玩全流程无报错）。
> 拆分逐字节保真：raw 分片拼接 == 原文（1,390,067 字符），格式化源码剥离空白后与 raw 一致。

## 运行

```bash
bash scripts/build.sh          # 拼接构建 → dist/game.js
python3 -m http.server 8931    # 任意静态服务器
# 打开 http://127.0.0.1:8931/index.html
```

无需 npm install——three.js 已 vendored 在包内。启动约 10~20 s（全部资产程序化烘焙），boot 屏有进度。
免构建直接玩：Releases 页下载 `shooting-game-<版本>-web.zip` 解压后同样用静态服务器打开（CI 随 tag 自动发布）。

## 这是个什么游戏

**第一人称撤离射击**（extraction shooter），题材：黎明雨夜的集装箱港区突袭。
游戏内自称引擎 **Fable5.2**（主菜单页脚"自主研发"），内部代号 **SALTLINE**（shader 错误标记、材质名前缀 `saltline-*`）。

**玩法循环**：主菜单标题运镜 → intro 指挥中心播报 → **按住 E 2.4s 逐个切断三处中继**（甲号·堆场 / 乙号·仓库 / 丙号·码头；每次切断触发一波增援 3+1 / 3+2 / 4+3）→ 全切后进入**撤离阶段**（5 次追猎补怪 + 每 4s 全图警戒）→ 抵达码头"四号登船点"结算（用时/命中率/击杀/重试 → 6 档评级）。死亡走"信号中断"屏可无限重试。

| 敌人 | 行为 | 要点 |
|---|---|---|
| hound（四足猎犬） | 掩体选位评分（coverPoints、LOS、同伴重叠罚分）+ nav 寻路 + hitscan（8~18m）+ 3m 扑咬（伤 15） | 弱点=头部球（受伤冲量 ×1.6） |
| gull（四旋翼飞鸥） | 环绕飞行（半径 12~25、高 4~8）+ 3 连发提前量射击 | 32 实例 bolt 弹道池；坠毁 `explode(半径3/伤30)` 会误伤 |

防"齐射秒玩家"的核心设计是**开火令牌节流**：场上同时开火 ≤2（混战 ≤3）+ 全局 1.25s 间隔 + gull/hound 类型轮换；曝光值（看见 +0.1/s、丢失 −0.45/s）动态调散布。

## 操作：WASD 移动 / 鼠标视角 / 左键开火 / 右键瞄准 / R 换弹 / E 切断中继 / Space 跳跃 / Shift 冲刺 / C 蹲伏 / Esc 暂停 / **1/2 切枪**；触屏=左摇杆+右拇指转视角+屏幕按钮。输入三重降级链：pointer lock → 拖拽（屏幕边缘持续转向）→ touch；IJKL/方向键兜底转向。

## 武器系统（工程改造：五种武器 + 双槽位捡丢）

| 键 | 动作 |
|---|---|
| **1 / 2** | 装备槽 1（主）/ 槽 2（副） |
| **Q** | 快速切回上一把武器 |
| **F** | 捡起地面武器：按类别入槽（长枪→主槽、手枪→副槽），只替换同类槽位的武器，另一槽保留 |
| **G** | 丢弃当前武器（槽置空，自动切另一把） |

| 武器 | 槽位 | 弹匣/备弹 | 扛法 | 伤害/射程 | 特点 |
|---|---|---|---|---|---|
| 几猫九式突击步枪 | 主 | 30 / ∞ | 全自动 720 RPM | 26 / 300 | 均衡基准 |
| 沙漠之鹰 | 副 | 7 / ∞ | 半自动 210 RPM | 55 / 120 | .50 AE 重弹，爆头 2 枪死猎犬 |
| **AWP 狙击步枪** | 捡取 | 10 / ∞ | 栓动 45 RPM | **110** / 600 | 开镜 FOV 18° 狙击镜，爆头一枪秒杀猎犬 |
| **MP5 冲锋枪** | 捡取 | 30 / ∞ | 全自动 800 RPM | 22 / 180 | 低后坐泼水 |
| **Uzi 冲锋枪** | 捡取 | 25 / ∞ | 全自动 950 RPM | 17 / 120 | 射速最快、散布大、近战绞肉 |

- 地面刷枪点：AWP（堆场）/ MP5（仓库）/ Uzi（码头），带橙色光柱标记；拾取/丢弃的武器携带自身弹匣并持久留在场上。
- 备弹统一无限（∞）；弱点倍率 ×2.2 沿用（AWP 爆头 242 伤）。
- 新增三枪模型为 CC-BY 素材（署名见 [ASSETS.md](ASSETS.md)），音效为 CC0 真枪录音（FreeFirearmsSFXLibrary）。

## 渲染（14-pass 自研管线，three.js r180 之上）

- **后处理链**：dirt(一次性) → depthhalf → AO(+双向 blur) → 体积光(+双向 blur) → composite → motion blur（快门 1/190）→ bloom（6 级降采样+5 级升采样，无阈值能量守恒 mix 0.065）+ 各向异性 streak（阈值 2.2÷曝光）→ 1×1 ping-pong **自动曝光** → **AgX 调色** grade → final（FXAA+锐化+颗粒）。shader 头带 `// SALTLINE_POST <pass>` 标记，编译错误自动归因到具体 pass。
- **软阴影是 PCSS 风格 ShaderChunk 热补丁**（monkey-patch `shadowmap_pars_fragment`）：receiver-plane 偏置 + Vogel 盘 blocker search 求半影，frustum/深度范围按阴影相机实测插成常量；带自测-回退闭环（驱动拒绝即还原 stock PCF）。
- **动态分辨率 + 自动降档**：帧时 >21.5ms 降 render scale（地板 0.6）；卡地板且 >26ms 连续 2 次自动降质量档 ultra→high→medium→low 并发 `quality:auto` 事件；像素预算按档位 1.0M/1.5M/2.3M/3.7M 硬顶。
- **自定义天空**：全 GLSL 云层（ridged fbm + 太阳燃烧缺口 + 闪电内照 + 气溶胶辉光），环境贴图用同一天空 shader 烘 PMREM；室内另烘探针、环境强度降 1/2。
- 雨、海、湿润联动：海面 Gerstner 波（4 主涌 + 7 细节波，深水频散）+ **平面反射**（镜像相机 + oblique 斜切近裁面）；雨有室内物理剔除（interiorBoxes + 天窗开口 + 屋檐滴水分支）；每 30~60s 发 `thunder` 事件（天空闪光 + 音频）。

## 世界与资产：零外部文件，全程序化

单文件 1.43 MB 里没有一张图片、一个模型——全部运行时生成：

- **纹理**：29 套贴图集 GLSL MRT 烘焙——`o0` albedo(√存储)、`o1` ORM（AO/Rough/Metal 三通道共用一张图，连 three 的 `aomap_fragment` chunk 都被替换掉以支持 ORM 单图）、`o2` height(8+8bit)，法线由 height 8 邻域 Sobel 现算；27 个 `surf()` 材质着色器、48 条材质定义。
- **中文标牌 36 条** canvas 喷绘：安全检验铭牌（制造日期 2019年03月 / 最大总重 30 480 千克 …）、几猫港区 B4-0271、四号泊位系列、中继节点配电牌、气瓶/叉车/发电机标识等；PingFang SC + stencil 断笔做旧；`label` 类贴图统一打进 2048 图集（省 draw）。
- **道具 36 种**（集装箱 20/40/40hc、reefer、叉车、发电机、货架、气瓶、工具车…），碰撞=世界系 AABB（斜放 |sin2θ|>0.2 时切 1~10 段 + 内缩 7%）；围栏双层碰撞（2.4m 实体 + 7m playerOnly 隐形墙）；traffic_cone/jerry_can 永不生成碰撞（可踢飞）。
- **关卡骨架三区一闸**：gate/yard/shed/quay 四个 zone，playerStart (-32,0,6)，42 个敌人出生点（25 地面 + 17 高处，经 nav 八方向吸附）、55 掩体点、12 镜头 cinematicPath、撤离点 (29,0,20)。static 网格合批为单 `level-merged`，dynamic/noMerge/中继锚点留动态。
- **背景模块**（源码名 materials，实为 backdrop）：岸桥吊机、货轮、小艇、天际线、海鸥——海鸥是**全顶点着色器群飞动画**（轨道+扑翼+朝向基变换，N 鸟 1 draw）；信号灯 `saltline-blink` 顶点脉冲闪烁；风化=3D 值噪声顶点色。
- **材质补丁 `applyPatch`**：给标准材质注入三平面映射(`SL_TRIPLANAR`)、雨天湿润(`SL_FX`：朝上变湿+竖面拉丝+贴地溅湿带)、世界宏观噪声、4 种贴图语义 `SL_TINT`（含**损伤遮罩**）、铁丝网距离自适应 alpha-test。

## 玩家侧系统

- **特效全实例化、每帧约 5 个 draw call**：fx_lit(受光)/fx_add(加法)/曳光/debris/shells/decals 六个 SoA typed-array 池环形复用，粒子 shader 有 3 种 billboard + 深度纹理软融。
- **弹壳物理**：重力+四元数角速度，触地发 `shell:bounce {pos,surface}` 事件（音频按材质换变体），反弹 0.32~0.48、4 跳或落速不足即静止，4s 后缩放淘汰。
- **WebAudio 全合成音频引擎**：60+ 合成音色（无音频文件），含 `selfTest()` 冒烟序列。约占其模块一半篇幅。
- **武器视模**：单武器但完整度极高——"几猫九式突击步枪"（铭牌代号 **PAC-9**，CAL 5.8×40、720 RPM、伤害 26、30/150 弹药，空仓换弹 2.72s 分阶段 emit `weapon:reload`）+ "HX-2 反射瞄具"（红点 reticle + 二向色镀膜 + 天空菲涅尔反射的专用镜片 shader）。"骨骼"实为程序化四元数链环管几何（14 个命名部件，食指双 pose morph 扣扳机）；表面=顶点色噪声风化 + 三平面细节 shader（阳极划痕/磷化环纹/聚合物颗粒），并**共享海面模块的 `uRain` 湿度 uniform**——枪身随雨变湿。视模在独立 FOV 的相机层上，抛壳/曳光落点需按 `camera.fov / viewCamera.fov` 正切比补偿。
- **确定性回放钩子**：`window.__setShot` 可按 `fxage` 1/60 步进预跑特效后冻结，配合 `?shot` 系列参数供截图工具逐帧复现——原生成管线的验收基建。

## 工程还原方法与保真证据

1. 原文 JS 是 **esbuild IIFE 压缩包**：three.js r180（422 个导出，MIT）+ 10 个游戏命名空间，全部共享一个闭包作用域。
2. 按 esbuild 命名空间导出映射（`var ns={};br(ns,{...})`）切分；**raw 分片按原文顺序拼接经逐字节比对 == 原文**（`LOSSLESS: True`）。
3. 各分片 `npx js-beautify` 格式化（纯空白变更，剥空白 SHA256 与 raw 一致）+ `node --check` 逐一通过。
4. `scripts/build.sh` 按固定顺序拼接复原 IIFE（顺序不可调换，分片间有跨引用）；`bash scripts/build.sh raw` 可用原压缩分片构建作对照。
5. 浏览器实测：boot 进度 → 主菜单 3D 运镜 → 开始行动 → intro → **第一人称游玩**（视模、雨、体积光、HUD 全正常），全程 `#fatal` 空。

## 重要发现（工程考古）

| # | 发现 | 说明 |
|---|---|---|
| 1 | 原工程是"生成+showcase 验收"架构 | 每个模块导出 `create` + `showcase` 双入口，showcase 是供截图工具验收的摆拍场景；`?bshow=crane|ship|boat|sky`、`?shot`、`__setShot` 等参数保留 |
| 2 | shader 错误自归因 | `debug.onShaderError` 按 `SALTLINE_SKY/SHADOW/POST <pass>` 标记把编译失败归因到具体管线段 |
| 3 | 模块名与职责有出入 | 05-materials 实为 **backdrop**（吊机/船/海鸥）；07-player-fx 内含输入+玩家控制器+战斗判定+**整个 WebAudio 引擎**；03-textures 里还藏着 `$g` 道具系统（已拆出为 03-props） |
| 4 | 死代码两处 | ① 03 内 ~380 行 A* 寻路网格构建器（依赖 04-level 的 `oi`，无任何调用点，疑为迁移残留）；② grade 的 `uThunder`、vol 的 `uFlicker` uniform 声明并注册但 shader 体从未使用 |
| 5 | 一鱼四吃 | 09-game-ui 除导出外还内含 HUD 构建、设置面板、流程状态机、**全量启动器+主循环 `QC`**（由 40 字节的 99-entry 调用） |
| 6 | 性能设计密集 | 标签图集合并、静态几何合批+顶点色、FX 池化 5 draw、海鸥顶点动画零 CPU、ORM 单图三用、动态分辨率+自动降档 |
| 7 | 全资产程序化 | 见上文——这也是包体只有 1.4MB 却能撑起完整 3A 观感的原因 |
| 8 | 状态机带演出缓冲 | 死亡屏延迟 1.5s、结算屏延迟 3.3s（先做去色/黑屏渐变再弹 UI），复刻交互时不能瞬切 |
| 9 | 模块间隐式耦合 | 武器与海面共享 `uRain` 湿度 uniform（枪身随雨变湿）；视模/世界双相机 FOV 不同需正切比补偿弹道落点——拆分后这些跨模块契约都还在同一闭包内，改一处要查 notes 里的外部依赖表 |

## 已知限制

- 源码是**压缩后还原**：逻辑可读（已格式化+逐模块解析笔记），但标识符是短名（`W6/Hg/Cf…`），不是原始命名。语义注释见 `notes/`。
- 分片共享 IIFE 作用域，**不是真正 ES module**；构建靠固定顺序拼接（见 `AGENTS.md` 修改守则）。
- 三个.js 是压缩版 vendored 副本（无 license 头，MIT，r180），未从 npm 引入。

## 仓库地图

```
index.html            入口壳（canvas + boot 屏）
css/ui.css            全部 UI/ HUD 样式（原文抽出，未改动）
src/game/*.js         游戏源码（格式化、按模块，构建源）
src/game/raw/*.js     原压缩分片（保真对照 + raw 构建模式）
src/vendor/three.min.js  three.js r180（vendored）
src/00-runtime-head.js / src/game/99-entry.js  IIFE 头尾
shaders/*.glsl        从包内抽出的 GLSL（22 个，只读参考）
notes/*.md            逐模块解析笔记（9 份，本文档的依据）
scripts/build.sh      拼接构建
dist/game.js          构建产物（勿手改）
refers/               原始单文件 HTML（只读）
```
