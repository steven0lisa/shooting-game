# 08-weapons 模块解析（PAC-9 视模 / 第一人人称手臂 / 铭牌贴图 / 枪口焰）

- 源文件：`src/game/raw/08-weapons.raw.js`（58,207 字节）
- 格式化：`src/game/08-weapons.js`（88,986 字节 / 2,281 行，`node --check` 通过，非空白字节与 raw 完全一致）
- esbuild 命名空间导出：`create` / `showcase`

## 1. 模块导出

```js
br(Xv, { create: () => dm, showcase: () => PC });
```

| 导出 | 函数 | 作用 |
|---|---|---|
| `create` | `async function dm(i)` | **主入口**。程序化拼出步枪几何（`w_()` 七组 BufferGeometry）+ canvas 铭牌贴图 + 瞄具镜片/枪口焰 shader + 双手模型 → 组装 `viewmodel-pac9` Group 挂到 `i.camera`（layer `zc`）→ 返回武器运行时 API 对象 `ve`（update/射击/换弹/ADS/弹簧后坐力全在内部闭包） |
| `showcase` | `async function PC(i)` | **展示/截图入口**。调 `dm` 后存 `i.weapon`，提供两套机位：8 个世界展示位姿（side/right/top/hands/rhand/muzzle/optic/lower，枪放场景里 layer `vf`）与 6 个第一人称位姿（hip/ads/sprint/fire/reload/empty），通过 `window.__setShot` 桥接截图工具；返回 `{cam, target, update(dt)}`（fire 位姿下 update 持续重开枪口焰） |

### `create` 返回的 API（`ve`，存 `i.weapon`）

| 字段/方法 | 说明 |
|---|---|
| `name` | `"几猫九式突击步枪"`（铭牌代号 PAC-9） |
| `ammo` / `magSize` / `reserve` | 30 / 30 / 150 |
| `damage` / `rpm` / `spread` | 26 / 720 / 当前动态扩散值（基础 .0125） |
| `state` | `"idle"` / `"reloading"` / `"inspect"` / `"sprinting"` / `"firing"` |
| `ads` | 0..1 平滑 ADS 进度（0.18s 线性 + smoothstep） |
| `root` | `viewmodel-pac9` Group |
| `update(dt)` | 主驱动：开火/换弹/弹簧/摆动/状态机全在此 |
| `reset()` | 弹药、状态、全部弹簧归零，弹匣/副手归位 |
| `reloadNow()` | 触发换弹（空仓 T=2.72s，非空 T=2.1s） |
| `muzzleWorld(out?)` | 枪口世界坐标（经 viewCamera FOV 补偿投影） |
| `addAmmo(n)` / `setVisible(b)` / `snap()` / `setWetness(w)` | 补弹 / 显隐 / 跳过过渡直接对齐输入 / 共享雨水湿度 uniform |

### 发出的事件（`i.events.emit`）

| 事件 | 载荷 |
|---|---|
| `weapon:fire` | `{origin, dir, muzzle, ads}` |
| `weapon:reload` | `{phase, empty}`，phase ∈ `start` / `magout`(0.47s) / `magin`(1.345s) / `bolt`(2.19s，仅空仓) / `done` |
| `weapon:dry` | `{}`（空仓击发，随后 0.32s 自动换弹） |

## 2. 武器 / 瞄具 / 铭牌清单

### 2.1 武器规格对象 `mi`

```js
mi = {
  name: "几猫九式突击步枪",
  muzzle: [0, 0, -.531],        // 枪口（枪口焰挂点）
  eject: [.023, .004, -.028],   // 抛壳口
  sightY: .069,                 // 瞄准基线高
  lensF: .0285,                 // 镜片前沿 z
  window: [6 点],               // 反射瞄具窗口六边形轮廓
  magPos: [0, -.02, -.0665],    // 弹匣原点
  boltTravel: .062,             // 枪机行程
  railTop: .0435, grip: [0,-.1,.073], handguard: [0,0,-.255],
  handguardR: .021, handlePos: [-.026,.007,-.078], // 拉机柄
  squeeze: .86                  // 下机匣"手握压扁"横向缩放
}
```

### 2.2 canvas 铭牌贴图（`TC()`，1024×512 图集，区域表 `hm`）

| 区域 | 文字 | 渲染参数 → 外观推断 |
|---|---|---|
| `model` | `PAC-9` | 700 78px Impact 大字，枪身两侧机匣型号 |
| `maker` | `几猫兵工厂 · 港区装备` | 600 30px，出厂铭 |
| `cal` | `CAL 5.8×40   SN PA-004217` | 500 27px 等宽，口径/序列号 |
| `prop` | `港务局装备 · 四号泊位武器库` | 600 28px，归属单位 |
| `safe` / `semi` / `auto` | `S` / `1` / `A` | 30px 居中，A 为红色 `rgba(205,60,40,.95)`（快慢机档位） |
| `rack` | `B4-07` | 800 104px 米黄大字，护木两侧武器库编号 |
| `warn` | `警告：存放前必须清空弹膛` / `仅限授权突击队员使用` / `港务安全规程 44/7` | 3 行 600 24px 警示语 |
| `optic` | `HX-2 反射瞄具` | 700 44px，瞄具壳体两侧 |
| `light` | `900 LM  IPX8` | 600 40px——**画了但没有任何 quad 引用**（预留的战术灯标签） |
| `dots` | 白点 + 红点 | 快慢机指示点 |
| `r2..r12` | `T2`…`T12` | 导轨刻度，顶导轨 6 处（y=.04365 = railTop） |

- 字体统一 `"PingFang SC"` 三连（sans/monospace/Impact 兜底），色调 `rgba(196,198,194,0.92)`（旧铝字色）。
- **做旧**：`destination-out` 合成 + LCG 随机（`a=a*16807%2147483647`）打 2,600 个半透明噪点洞，模拟铭牌磨损掉漆。

### 2.3 标牌 quad 摆放（`F_`，22 处）

`[区域, x, y, z, 宽度, 面向 L/R/T, 可选绕 x 轴旋转]`——左/右机匣两侧对称摆 `model/warn/rack/auto/safe/optic/cal` 等，顶面 T 摆 `r2~r12`；材质 `MeshStandardMaterial + map、polygonOffset -3、renderOrder 2`，避免与枪身 z-fighting。

### 2.4 瞄具与配件（几何层面）

| 部件 | 依据 | 外观推断 |
|---|---|---|
| HX-2 反射瞄具 | `mi.window` 六边形窗口 + `U_()` 专用镜片 shader + 铭文 `HX-2 反射瞄具` | 六边形窗红点反射瞄，镜片带**蓝→琥珀二向色镀膜**、太阳眩光、离轴可见的发射器余辉；红色 reticle = 中心点(r≈0.0011)+环(r=0.0128)+十字刻度，`uBright=7`，玻璃**前倾 0.1 rad**（"真瞄具玻璃有点倾角"） |
| 折叠/固定机械角 | 导轨前后 `Rt/Fi` 组 + `Dv` 圆头长槽 ×8/×10 | 护木八面 **M-LOK 风格长圆散热槽**（每 45° 一面，部分面开 6 个或 10 个槽） |
| 顶导轨 | 49 段 `qo` 小齿（z=-.094 起步进 .01）+ 中段另一组 8+4 齿 rotateZ(π/4) | 段式 Picatinny 齿，前后两段、后段斜 45° 收尾 |
| 拉机柄 | `handlePos` + 枪机 `bolt` 组（`boltTravel=.062`） | 侧面拉机柄，空仓挂机时枪机后定 |
| 弹匣 | `mag` 组：`D(x)=.15·max(0,x-.07)²` 曲线 + 8 道防滑筋 + 10 个倒角块 | **弧形弹匣**，随换弹动画脱离/插回 |
| 子弹 | `round` 组，色 `[1.25,.72,.5]`（黄铜） | 弹匣口露出一发黄铜弹 |
| 枪口焰 | `N_()` 9 个 quad，aType 0~4 | 星形火光/喷流/横向条纹/核心光斑/枪口余热（`uHeat`），additive、`renderOrder 10` |

## 3. 视模系统（手臂 / 动画 / 后坐力）

### 3.1 手部"骨骼"结构

**没有 three.js SkinnedMesh**——手指是**程序化分段管状几何 + 四元数链**，部件名（`Vv()` 内 `n(name, mesh)`，`debugParts` 可收集）：

| 部件名 | 生成器 | 说明 |
|---|---|---|
| `palm` | `EC()` | 手掌：24 边超椭圆（指数 0.8）截面沿 z loft，半宽由 `Hv/L_/k_` 三条剖面函数控制，背侧 `Bv` 亮、掌侧 `am` 暗 |
| `guard` | `I_` 网格 | 指根护垫，4 个高斯隆起（对应 4 指根） |
| `bar0..2` | `Lf` | 三根指根横条 |
| `seam` | `Lf` | 掌心接缝线 |
| `heelPad` | `Lf` | 掌根垫（`wC` 厚度剖面） |
| `finger0..3` | `C_(om[d], angles)` | 四指：`om[d]` 定义 `base/len[3]/rad[4]`（四段半径收细），弯曲角 `[近节, 中节, 远节, 侧摆]` 乘四元数链；**食指支持双 pose morph**（`indexPoses`，`z(t)` 线性混合 position/normal，扣扳机切换） |
| `thumb` | `MC(dirs)` | 拇指：3 方向定轴 + 万向节基准（`_C`），`saddle` 马鞍形、`patch` 补强、`tipW/tipH` 指尖压扁 |
| `web` | `SC` | 虎口连接膜（12 边环 loft，含符号翻转修复） |
| `cuff` | `yl(24)` | 袖口椭圆环（沿前臂方向 `slerp` 变形） |
| `strapTab` / `pullTab` | `Lf` | 绑带舌片 / 拉环（后跟 `heelPad`、腕部 `pullTab` 即任务提示的骨骼名） |
| `sleeve` | `yl(v)` 大环 | **战术衣袖**：24 角 × 环向，角度表加密（75°/255° 缝合线），sin() 编织纹起伏 + 随机 `vC` 噪声 + AO 段染色，长度随 `sleeve` 参数（.34/.36）延展到肘部 |

核心环管生成器 `yl`：`v(点, 颜色, 亮度)` 攒环 → `collapse()` 焊环（法线取平均）→ `geo(flip?)` 出 indexed BufferGeometry。`z_()` 是**单指高级生成器**：16 个固定截面角（`Nv`）+ 3 骨骼四元数 + `pad/edge/saddle/stitch/patch` 标志切出指肚垫、侧棱、马鞍、缝线（`kf` 深色线色）、根部 AO。

- 调色板（顶点色常量）：`Bv=[31,21.5,12.5]` 皮背、`am=[12.5,10,7.6]` 皮掌、`lm=[16,11,6.6]` 中间、`Fv/Lv` 垫、`kf=[36,27,16]` 缝线、`gl/Df` 袖织物、`pC` 拉环、`E_` 袖主体——**全部是 HDR 顶点色**（材质乘 `glove_fabric` 贴图）。
- 双手：主手 `Vv({mirror:false})` 挂 `mi.grip`（扣扳机，食指 morph）；副手 `Vv({mirror:true})`（`P_()` 镜像翻面修复 winding）沿动画轨迹执行换弹动作。

### 3.2 动画状态与位姿

**枪身位姿混合**（hip→ADS/冲刺/换弹，输出 `e.position + e.rotation("YXZ")`）：

| 位姿 | 位置 p | 旋转 r |
|---|---|---|
| `eu` 髋射 | `[.118, -.122, -.275]` | `[.034, .085, -.03]` |
| `qv` ADS | `[0, -sightY, -.135]` | 0（机械对正） |
| `tu` 冲刺 | `[-.035, .004, .03]` | `[-.04, .62, .26]`（枪下摆外倾） |
| `nu` 换弹持握 | `[-.03, .1, -.02]` | `[.46, .22, -.8]`（拉近翻看） |

**副手换弹轨迹**（关键帧 `[t, {q,p}]` 表 `$` 普通 / `ue` 空仓，`Yo` smoothstep 插值 `le()`）：`G` 握把待机 → `N` 下探 → `j` 中间 → `Q` **拔匣**(0.8s) → `K` **插匣**(1.28s) → `ie` 拍实(1.45~1.52s) → 归位；空仓线额外 `ne→re` **拉栓**(1.96~2.26s，`re = ne + boltTravel`)。弹匣组 `f` 在 0.47~1.345s 窗口内**跟手**（quaternion = 手·C⁻¹），时间点到 `magin` 补弹。

**状态判定**：`state = reloading | inspect | sprinting(>0.5) | firing(shot<0.14s) | idle`；闲 24s 触发 3.5s **检视动画**（三组权重 `Un/zo/$i` 让枪翻转 +0.3 pitch、±.75 roll）。

**开火/枪机**：冷却 `60/720=83ms`，每帧最多补射 3 发；枪机 `boltT` 0.072s 正弦往复，空仓 `boltLocked` 后定、`round` 隐藏；热量 `heat += .05/shot`（上限 1.3、-0.2/s），余热 >.4 时枪口冒烟 `fx.smoke`（0.085s 一次）。

### 3.3 后坐力 / 摆动参数（弹簧 `pa(k,c)` + `ma` 子步积分）

| 弹簧 | (k, c) | 驱动 |
|---|---|---|
| `kZ` | (520, 30) | 后坐上跳（枪身后移），开火脉冲 `+1.5·lerp(1,.6,ads)` |
| `kP` | (380, 26) | 俯仰，脉冲 `+1.5·bt` |
| `kY` | (300, 22) | 水平随机 `±.5·bt` |
| `kR` | (300, 20) | 滚转随机 `±.9·bt` |
| `swY/swP` | (110, 15) | 视角转动甩枪（mouse dx/dy×3.2/2.6，钳 ±.09/±.07） |
| `jY/jP` | (140, 13) | 起跳（-.22/.7）与落地冲击（按 `vel.y`） |
| `bump` | (600, 30) | 换弹碰撞顿挫（拔匣 -.25、插匣 +.55、拍实 +.4、拉栓 +.3、空击 -.08） |

- 扩散模型：`base(ads lerp .0125→.0012) + 速度项 + bloom(每发+.17、1.5/s 衰减) + 空中 .022 − 蹲伏 .002`，经 `kn(...,18)` 平滑；前 9 发全额后坐、之后 ×.38，第 4 发起加 `sin` 径向散布。
- 机动摆动：`bobPhase += dt·(5.2+speed·1.55)`，水平 `sin·.006`、垂直双频 `sin(2φ)` 步态曲线，ADS 时 `bi(1,.12,ads)` 抑制、冲刺时 ×1.4 放大。
- 玩家侧联动：`player.addRecoil(.0068·…)`、`addShake(.12·bt)`。

## 4. 程序化建模技法

**没有 Box/Cylinder/Lathe 原语拼装**，全自研四种生成器：

| 生成器 | 原理 | 用在哪 |
|---|---|---|
| `Cn(profile, segs, color, jitter, ox, oy, colorFn)` | **Lathe 式旋转体**：`[半径, 深度]` 剖面绕 (ox,oy) 偏移轴 360° 扫掠，支持带孔剖面与逐点调色 | 枪管/瞄具环/螺丝/护木导轨条/枪口制退器 |
| `xr/qo(outline, z0, z1, bevel, …)` | **Shape + ExtrudeGeometry 带 bevel**（`hC` 造轮廓与孔、`M_` 修正面法线），`xr` 额外 rotateY(π/2) 成侧立板 | 机匣侧板、护木八面（`xr` 后 `rotateZ(F·π/4)` 转 8 个方位开槽）、枪托、握把 |
| `yl` 环管 / `I_` 网格 / `Lf` 剖面扫掠 | 手写 indexed BufferGeometry（攒顶点→建索引→`computeVertexNormals`→焊缝法线平均） | 整只手、衣袖、掌垫 |
| `Rt/Fi/Dv/fC` | 圆角矩形/胶囊槽/八边形的快捷封装（底层仍是 Extrude） | 小零件、散热槽（`Dv`）、导轨齿 |

**顶点风化噪声**（两层）：
1. `im(x,y,z)` —— `sin(i·12.9898+j·78.233+k·37.719)·43758.5453` 经典 hash，返回 [0,1)。
2. `sm(geo, color, amount, maskFn)` —— 每顶点亮度 `0.9+0.2·im(…·70)`（整体色斑）；若 `maskFn(法线)` 选中面且 amount>0，再用高频 `im(…·300)` 取 >.84 尾部做**剥落麻点**（`d²` 放大 `1+amount·1.6·d`）。两套 mask：`cC`（|n|max<.95，侧面通用）、`b_`（挤出侧壁）。
3. `Rt` 把结果写进 `color` 属性，材质统一 `vertexColors: true`——**风化全靠顶点色烘焙，零贴图**。

**材质细节 shader**（`Bf(mat, kind)` onBeforeCompile，`customProgramCacheKey="pac9-detail-{kind}"`）：
- kind 0 各色阳极氧化（scuff+smudge 划痕污渍）、1 磷化（`sin(z·5200)` 机加工环纹+拉丝）、2 聚合物（细颗粒磨砂）——三平面对象空间噪声 `dn3` 调 roughness + 微法线 `dBump`。
- 共享 uniform `uRain=Wv`：朝上法线区域叠加**雨滴**（`dDrops` 网格水珠）+ 湿润变暗/变滑——与 sea 模块的全局湿度联动（`setWetness`）。
- 五种材质：`pac9_anodised`(暗青黑, 金属 .45) / `pac9_phosphate`(深灰, 金属 .7) / `pac9_polymer`(黑) / `pac9_polymer_tan`(沙色弹匣) / `pac9_matte`(白底顶点色)；贴图材质经 `i.mats.get(name, {triplanar, vertexColors, scale})` 复用全局纹理库（anodized_black/gunmetal/brass/glove_fabric/rubber，scale 2~4 决定平铺密度）。
- **"手捏扁"后处理**：`ano/gun/poly/plain/bolt` 五组里 `z>-.1002 && y<.0341` 的顶点 `x *= .86`——下机匣在握持区横向压扁 14%，贴合手掌观感。

**镜片/枪口焰是唯二的 ShaderMaterial**：`U_`（描边 ShapeGeometry 二次取 UV 做玻璃）与 `N_`（9 quad 程序化火焰，`h1` hash 驱动每发形态随机）。

**统计**：`create` 内累加全部三角形（`Kc`）与 mesh 数，`console.log("[weapon] 几猫九式突击步枪: N tris, M meshes (flash only while firing)")`；铭牌失败降级 `catch → "[weapon] markings skipped"`。

## 5. 与外部的接口

### 5.1 调出去（依赖上下文 `i.*`）

| 调用 | 用途 |
|---|---|
| `i.combat.playerShot(origin, dir, {damage:26, range:300})` | **实际命中判定**，返回 `{point}` 用于曳光落点 |
| `i.fx.tracer(from, to)` / `i.fx.shell(pos, vel)` / `i.fx.smoke(pos, opts)` | 曳光、抛壳（带相机速度与随机初速）、枪口烟 |
| `i.render.lightPool.flash(pos, 16756832, 45, 9, .05)` | 开火点光源闪烁（色 16756832=0xFFB060 暖橙，强度 45/9/0.05s） |
| `i.events.emit("weapon:*")` | 事件总线（fire/reload/dry，供 UI 与音效） |
| `i.mats.get(name, opts)` | 全局材质/纹理库 |
| `i.rng.fork()` | 独立随机流（开火散布、枪口焰种子） |
| `i.input`（`fire/ads/pressed("reload")/move/look`）、`i.player`（`alive/sprinting/speed/crouching/onGround/vel/eye/addRecoil/addShake`） | 输入与玩家状态 |
| `i.camera` / `i.viewCamera` | 视模挂相机；`muzzleWorld` 按两相机 FOV 比例补偿（视模层与世界层 FOV 不同） |
| `i.combat` 之外还写 `i.weapon = ve`（showcase） | 供截图/调试层访问 |

### 5.2 读进来 / 层与桥

- `layers`：视模全部 `layers.set(zc)`（仅视模相机渲染层），showcase 世界展示切 `vf`。
- `window.__setShot`：保留原生引用后包一层——传 `{wpose}` 就切位姿（并回传 cam/fov），否则透传给原截图桥。
- `debug` 后门（showcase/截图用）：`{freeze 冻结动画, reloadT 强制换弹进度, empty 空仓态, flash 常亮枪口焰, noFire}`；`reset/snap` 保证确定性单帧输出。
- 外部混淆符号（来自其它模块，本文件未定义）：`br`(命名空间导出) `Wi`(圆角矩形 Shape) `Ii`(几何合并) `nt/He/et`(BufferGeometry/Attribute) `ji/or/Ae/rr/H0`(Shape/Path/Vector2/Extrude/ShapeGeometry) `Qt/Qe/wt/zn/Ve/xs`(材质/网格/组/Shader/Color/CanvasTexture) `W/Lt/In/Ye`(Vector3/Quaternion/Euler/Matrix4) `Fo/bi/kn/Zn`(clamp01/lerp/damp/clamp) `zc/vf`(图层号) `Mn/en`(太阳/天空) `Vn/Ln/Sn/hr`(色彩空间/过滤/双面/加法混合)。
