# 04-level 模块解析（关卡搭建：堆场 / 仓库 / 码头 / 大门）

- 源文件：`src/game/raw/04-level.raw.js`（45,363 字节）
- 格式化：`src/game/04-level.js`（75,083 字节，`node --check` 通过；与 raw 剥离空白后逐字节一致，仅改空白/换行）
- esbuild 命名空间导出：`create` / `showcase`
- 纯几何搭建模块：**无任何 GLSL 注入**（grep `gl_Frag` / `ShaderMaterial` / `onBeforeCompile` 全 0）；唯一的 canvas 用法是 label 图集打包（见 §5）

## 1. 模块导出

```js
br(cv, { create: () => C1, showcase: () => mR });
```

| 导出 | 函数 | 职责 |
|---|---|---|
| `create` | `async function C1(i)` | **主入口**。挂 `scene` 下 `level` 组 → `ob(i)` 建工具上下文 → `hR`(堆场) `fR`(大门围墙) `ab`(仓库) `cb`(码头) 四段布景 → 放 3 个 `relay_node` 中继点 + 电缆/配电墩 → 把 `noMerge` 物件从 static 挪到 dynamic → 静态材质升级为 vertexColors 变体并设阴影标志 → `rb()` label 图集打包 → `By()` 合并静态几何为 `level-merged` → 用 `physics.nav.isWalkable` 把出生点/地面刷怪点吸附到可行走处 → 返回游戏层 API（见 §4） |
| `showcase` | `async function mR(i)` | 展示入口：直接跑 `C1`，返回 `{ cam: [-32,1.7,6], target: [0,2.4,6.4], update }`（与 playerStart 同点，望向场地中心） |

### 1.1 `create` 返回的游戏层 API

| 字段 | 含义 |
|---|---|
| `root` | `level` 根组（含 `level-merged` 静态合并网格 + `dynRoot` 动态组） |
| `playerStart` | `{ pos: (-32, 0, 6), yaw: -π/2 }`（大门内侧，面朝 +x 场地） |
| `objectives` | 3 个中继目标（甲/乙/丙，见 §3.3） |
| `extraction` | `{ pos: (29, 0, 20), radius: 2.5 }` — 码头南端"四号登船点"梯子口 |
| `enemySpawns` | 42 个刷怪点：25 个 `ground` + 17 个 `air`（高处），分 yard/shed/quay 三 zone；地面点经 `E()` 八方向吸附到 `nav.isWalkable` |
| `zones` | 4 个矩形分区（x/z min/max）：`gate`(-40..-24, -30..30)、`yard`(-24..16, -10..30)、`shed`(-24..16, -30..-10)、`quay`(16..40, -30..30) |
| `interiorBoxes` | 仓库 AABB `(X0,0,Z0)-(X1,RIDGE,Z1)` = (-16,0,-28)-(12,9.5,-11)，供室内判定/声学 |
| `cinematicPath` | 12 组 `{pos, look}` 镜头路径，从大门 → 堆场 → 仓库 → 码头顺序推进 |
| `coverPoints` | 55 个掩体点（含 2 个集装箱顶 y=2.59 的高点），同样做过可行走吸附 |
| `skylights` / `shedLights` | 仓库天窗洞 `{x,y,z,w,d}` 列表 / 4 盏 PointLight（另一模块做光柱用） |
| `vantage` | 高点位：`stairsFoot (-2.2,0,12.4)`、`roof (13.5,2.59,12.4)`（集装箱顶狙击位） |
| `stats` | `labelsAtlased / containers / props / tris / meshes` 运行期统计 |
| `placed` | 所有 `place()` 记录 `{name,x,y,z,yaw}` |
| `groundSurfaceAt(x,z)` | 命中 `metalRects` 返回 `"metal"`，否则 `"concrete"`（脚步声/弹着分类） |
| `update(dt)` | 转发：仓库排风扇旋转（1.7 rad/s）+ label 图集脏检查 + 各道具 `userData.update`（异常只 log 一次） |

## 2. 道具 / 物件清单

### 2.1 经 `props.build` 放置的道具（34 种）

`place(name, x, z, yaw, opts, y, flags)` —— 注意第 2/3 参是 **x/z**，y 单独第 6 参；`flags` 含 `{dynamic, noCol, colOpts}`。

| 道具名 | 推测用途 / 形状 | 出现位置线索 |
|---|---|---|
| `container20` / `container40` / `container40hc` | 20/40/40HQ 集装箱（长 6.06/12.19/12.19，宽 2.44，高 2.59/2.59/2.9） | 堆场 `hR` 约 20 组 `stack()`；码头角 `cb` 3 组；带随机 dx/dz/yaw 抖动、wear、doors、flip、reefer 选项 |
| `reefer_unit` | 冷藏箱发电机组，挂到箱端（堆叠 y +0.14） | `stack()` 里 `reefer:true` 的箱（堆场 1 组白箱、码头 3 组） |
| `relay_node` | 中继目标点道具 | C1 中放 3 个（见 §3.3） |
| `stairs_metal` | 金属楼梯（按 yaw 生成金属占地矩形） | 仓库东侧 x=-0.1（上箱顶）、大门平台 x=-8.25 |
| `catwalk` | 栈桥/走道，`rails: both/left/right/none` 可选栏杆 | 仓库天台 2 段（z=-23.15，单侧栏）、堆场箱顶 (8.98,12.42) |
| `fence_panel` | 围栏单元（`posts` 选项，`scale.x` 拉伸填缝） | 大门四周围墙 `fR`（沿四边插值布板） |
| `guard_booth` / `gate_arm` | 门卫房 / 道闸 | 大门 (-35.2,0.35) / (-36.3,5) |
| `bollard_post` | 圆柱防撞桩 | 仓库南门两翼、大门通道 6 处 |
| `bollard_mooring` | 系缆桩 | 码头 x=29.2 沿线 6 处（z=-22..25.6） |
| `jersey_barrier` | 混凝土护栏 | 大门 5 处、堆场 5 处、码头 2 处 |
| `light_mast` | 高杆灯 | 堆场 5 处 + 大门 2 处 + 码头 2 处 |
| `shelf_rack` | 货架 | 仓库北墙 6 座 + 南侧 3 座 |
| `pallet` / `pallet_stack` | 托盘 / 托盘堆 | 散布全图；叉车前托盘 y=0.535 |
| `cardboard_boxes` / `crate_stack` / `crate_wood` | 纸箱堆 / 木箱堆 / 单个木箱 | 仓库、堆场、码头散布 |
| `ibc_tote` | IBC 吨桶（带框方桶） | 仓库、堆场、码头共约 12 个 |
| `barrel` | 油桶，`color: blue/red/yellow/green` | 全图散布约 18 个 |
| `sandbags` | 沙袋工事 | 箱顶、堆场、码头共约 7 处 |
| `forklift` | 叉车（`forksUp` 货叉高度选项） | 仓库 (-8.6,4.5,-0.22) 一辆，货叉上叠托盘+木箱（noCol） |
| `toolbox_cart` | 工具车 | 仓库 (6,-12.2) |
| `gas_cylinders` | 气瓶组 | 仓库、堆场、大门附近共 4 处 |
| `tarp_cargo` | 雨布盖货堆 | 全图约 9 处 |
| `tire_stack` | 轮胎堆 | 全图约 10 处 |
| `pipe_stack` | 管材堆 | 堆场 (-16,14.4)、仓库外 (-30.x,-26) 2 处 |
| `cable_reel` | 电缆盘 | 全图 6 处 |
| `dumpster` | 大垃圾箱 | 全图 6 处 |
| `generator` | 发电机 | 仓库外 (15,-26.6)、堆场西 (-34.2,14.2) |
| `floodlight_stand` | 移动泛光灯架 | 同上两处发电机旁 |
| `traffic_cone` / `jerry_can` | 锥桶 / 油桶罐 —— **在 `cR` 无碰撞名单里，不生成碰撞体** | 全图散布（可被打飞/穿行） |
| `sign_post` | 立式标牌（`sign: no_entry/berth4/hazard_voltage/hazard_general`） | 大门 3 处、堆场 (−4.8,3.72) |

### 2.2 本模块内联拼装的道具（不走 props.build）

| 内联函数 | 推测用途 | 构成 / 出现位置 |
|---|---|---|
| `Ka` | 铁丝网围笼（储物笼，内塞废铁皮/易拉罐等随机杂物，14+6 件随机散布） | 2.2×1.2×1.25 chainlink + 钢框架；大门 1（蓝）、堆场 4（蓝/橙各色）、码头 2 |
| `Qa` | 红色小型料箱/工具车（1.1×0.8×0.75，顶上撒 12 个小杂物） | 全图 5 处（红/蓝色） |
| `Ef` | 管材堆放架（两根木导轨上码 9 根锈管，长 3.4，金字塔堆法） | 堆场 (-20.9,8.3)、码头 (19.6,17.5) |
| `e0` | 车轮挡块（橡胶三角截面 + 黄漆条，Shape→Extrude） | 叉车旁 2 个、码头 2 个 |
| `Sf` | 通道指示牌立柱（镀锌杆 3.2m + 黄色牌面 + stencil 文字标签） | "一号通道"/"二号通道"×2/"三号通道" 4 处 |
| `av` | 平板拖车/平台车（10.4×4.2，木铺板+黄角件+橡胶碰条，`n=2` 时错位叠两层，顶面可站立，返回顶高） | 码头 (23.3,-15.4)、(23.7,14.4) 各 n=2 |
| `Lr` | 地面电缆/软管（折线采样插值 + 长段下垂/侧摆抖动 → tube） | 仓库中继供电、码头配电墩、发电机引出线、堆场多处 |
| `lv` | 配电墩/接线箱（混凝土基座 + 灰箱 + 深色顶盖 + hazard 警示条） | 堆场 (0.9,3.62)、码头 (20.4,-7.3) |

### 2.3 材质名清单（经 `M`/`MI`/`mats.*` 取用）

| 类别 | 名字 |
|---|---|
| 结构钢 | `steel_galv` `steel_dark` `steel_worn` `steel_rust` `steel_bare` `aluminium` |
| 混凝土 | `concrete` `concrete_painted` `concrete_dirty` `floor_epoxy` `diamond_plate` |
| 漆面 | `paint_grey` `paint_red` `paint_blue` `paint_yellow` `paint_white` `paint_orange` `paint_teal` `hazard_stripes` |
| 木材 | `wood_dark` `wood_pallet` |
| 其他 | `corrugated_roof` `glass_dirty` `rubber` `chainlink` `tire` |
| 内饰变体 | `MI(name)` = `mats.get(name, {interior:true})`（仓库内部材质走此通道） |
| 动态生成 | `mats.emissive(0xFF6BB8?,7)`（天窗下发光盘）、`mats.emissive(13624063,2.4)`、`mats.emissive(10473727,1.6)`、`mats.emissive(16773328,3)`（货架/桌沿灯条） |

### 2.4 decal（贴花）与 label（文字）

| decal 名 | 出现位置 |
|---|---|
| `leak_stain` | 仓库天窗洞正下方地面（按洞编号 ×1.7 旋转） |
| `oil_stain` ×2 | 仓库地面 (7.6,-15.2)、(-3.8,-13.6) |
| `hazard_voltage` | 仓库南墙电箱处 |
| `caution_stripes` | 仓库地面 (-3.5,-11.9) |
| `rust_run` | 码头墙面竖条 ×6+、仓库南墙 1 处 |
| `grime_streak` | 仓库南墙 |
| `berth4` / `no_entry` / `arrow` | 仓库南墙 / 大门内墙 / 地面导向箭头 |

| label 文字（canvas 画字） | 出现位置 / 朝向 |
|---|---|
| `四号登船点` | 码头梯子旁地面 y+，stencil 黄字 |
| `一号通道` / `二号通道`（×2） / `三号通道` | `Sf` 牌面，黑字 stencil |
| `四号泊位维修车间` | 仓库南墙 (x=4.2, y=4.3) z+，白字 0.55 高 |
| `甲号中继 · 堆场` / `乙号中继 · 仓库` / `丙号中继 · 码头` | objectives 的 `label` 字段（给游戏层 UI，不画进场景） |

## 3. 关卡结构推测

### 3.1 整体布局（坐标即世界坐标，米）

```
            x=-40            x=-24      x=16         x=40
   ┌────────────────────┬──────────────────┬──────────────┐ z=30
   │      GATE 大门      │   YARD 堆场      │              │
   │ 门卫房/道闸/围栏    │ 集装箱阵列+货架   │              │
   │ 出生点(-32,6)      │ 箱顶栈桥/楼梯     │   QUAY 码头   │
   ├────────────────────┼──────────────────┤ 铁轨/系缆桩   │ z=-10
   │                    │  SHED 仓库(-16..12,│ 登船梯(30,20) │
   │                    │  z-28..-11)       │ 拖车/围笼     │
   └────────────────────┴──────────────────┴──────────────┘ z=-30
```

- **仓库（`ab`）**：山墙仓库，参数表 `no = {X0:-16, X1:12, Z0:-28, Z1:-11, EAVE:7, RIDGE:9.5, ZR:-19.5, FLOOR:.03}`；柱列 `No=[-16,-11.1,-6.2,-0.8,5.6,12]`；南墙开 5m 大洞（`yt` x∈[-6,-1]）、东墙装卸口（`Yt` z∈[-22,-17] 高4.5，带月台/防撞柱/hazard 条纹）。屋面：每坡 20 块板（`sv=20`）×4 条带（`A1`），按 `iv` 表挖 **8 个天窗洞**（`["S",1,4]` 等，S/N 坡 × 带 × 板号），洞口配 `leak_stain` 贴花 + 天窗玻璃，洞数组即返回的 `skylights`。室内：地坪环氧、货架 9 座、叉车、2 段天台 catwalk、排风扇 `ue`（环形护栏 + 5 片叶，`update` 里旋转）、4 盏 PointLight(16761994, 34, 13, 2) 挂 y=5.75。
- **堆场（`hR`）**：主体是 ~20 组集装箱 `stack()` 阵列（三排：z≈-5 / 2 / 12.4 / 20.12 / 22.62，含 40 尺与 hc 箱、开门端 `doors`、带楼梯+箱顶栈桥的"箱顶狙击位"），外加 5 座灯杆、悬垂电缆、大量散件道具。
- **码头（`cb`）**：常量 `lb = {X:30, LADDER_Z:20, RAILS:[18.5,28.5], Z0:-30, Z1:28}` —— x=30 是码头岸线；两条 `RAILS` 是地面轨道（板+锈轨+亮轨三层叠）；护舷轮胎（`Ci`=TorusGeometry `.clone()`）挂壁、系缆桩 6 座、"四号登船点"梯子与黄扶手（即 extraction）。
- **大门（`fR`）**：四边围墙 `fence_panel` 按线段插值铺板（`scale.x` 拉伸配板宽），北墙在 z∈[2,8] 留豁口 + 道闸 + 门卫房；围栏给两层碰撞：低 2.4m `metal` + 高 7m `playerOnly`（只挡玩家的隐形墙）。

### 3.2 static 与 dynamic 两组

- `level-static`（组 `e`）：所有静态布景先挂这里；`create` 末尾 `By(staticRoot)` 合并成单个 `level-merged` 网格（省 draw call）。
- `level-dynamic`（组 `t`）：**不参与合并**。进动态组的三类：
  1. `place(..., {dynamic:true})` 的道具；
  2. `userData.noMerge` 的子树（排风扇、天窗灯组等，`create` 里遍历 staticRoot 把 noMerge 且祖先没有标记的节点 `attach` 到 dynRoot）；
  3. 3 个 `relay_node` 组——**注意：它们的子节点先被逐个 remove 清空，空组再移入 dynRoot**，`objectives[].object` 指向这些空组（推测：中继的实际光柱/标记 UI 由游戏层挂到该组上，或视觉由另一模块按 objectives 生成）。
- 道具 `userData.update` 函数收集进 `updaters[]`，每帧调用（放 `dynamic` 组的道具才会动）。

### 3.3 中继（relay）目标点布置

| id | label | zone | 坐标 (x, y, z) | 来源 |
|---|---|---|---|---|
| `relay_a` | 甲号中继 · 堆场 | yard | (1.5, 0, 7.5) | C1 直接 `place("relay_node", 1.5, 7.5, .35, {seed:1})` |
| `relay_b` | 乙号中继 · 仓库 | shed | (-2, 0.03, -19.5) | `ab()` 返回的 `relayPos`（`no.FLOOR` 地坪上、屋脊 `ZR` 正下方） |
| `relay_c` | 丙号中继 · 码头 | quay | (23, 0, 0) | `cb()` 返回的 `relayPos`（码头中央、两条铁轨之间） |

三个点各配一条供电电缆：`Lr` 折线从 (-2,-27.5) 仓库北墙引到乙号中继、从配电墩 (20.4,-7.3) 引到 (22.9,-0.7)（丙号中继附近），强化"中继是供电节点"的语义。

### 3.4 碰撞体（collider）生成

- 单一出口：`col(x0,y0,z0,x1,y1,z1, surface, opts)` → `physics.addBox(min,max,{surface,...})`。surface 取值 `concrete`（默认）/ `metal` / `wood`。
- 墙体/地坪在 `ab`/`cb`/`fR` 里**手写一串 `col()` 调用**（仓库每面墙、门洞两侧、天窗坡面、轨道区、围栏等），屋顶斜面按坡向给 AABB。
- 道具碰撞走 `M(obj, yaw, opts)`（`place` 默认调用）：读 `obj.userData.colliders`（由 props 模块预生成的 min/max 盒），逐个 `applyMatrix4(matrixWorld)` 转世界系后 `physics.addBox`。关键规则：
  - **斜放切片**：`|sin 2θ| > 0.2`（明显斜放）时把长边切成 1~10 段分别成盒（减小斜盒的空隙），且整体内缩 7%；
  - **薄/矮剔除**：高度 < 0.2 且顶 < 0.3 的盒直接跳过（贴地贴花类不挡人）；
  - `cR = {traffic_cone, jerry_can}` 名单内道具**不生成碰撞**；`{noCol:true}` 也跳过。
- `M/MI` 之外的动态项：`ab` 排风扇挂 dynRoot 不进合并（其碰撞也靠 props 自带）；`playerOnly:true`（围栏高墙、临水混凝土墙的外侧）只挡玩家；`noNav:true`（栈桥立柱、货架立柱等）标记不进寻路网格。
- `metalRects[]` 记录所有金属占地矩形（集装箱阵列、catwalk、stairs、拖车、轨道区手动 push），`groundSurfaceAt(x,z)` 命中即报 `"metal"`，供脚步声/命中反馈。

## 4. 与外部模块的接口

### 4.1 依赖的外部符号（混淆名，未在本文件定义）

| 符号 | 推测实体 | 用法 |
|---|---|---|
| `br` | esbuild `__export` 帮助函数 | 导出 `create`/`showcase` |
| `lt` | `THREE` 命名空间 | 作为 `THREE` 字段随返回值导出 |
| `wt` | `Group`/`Object3D` | 一切容器节点 |
| `Qi` | `makeMesh(geo, mat, {cast,recv})` 工厂 | 所有网格创建出口 |
| `$e` | `BoxGeometry` | 方盒几何 |
| `Wi` | 带 bevel 的盒几何工厂 | `bevel` 选项的箱体 |
| `ot` | `CylinderGeometry(rTop?,r,h,seg,open)` | 圆柱/管/桶 |
| `Fn` | `TubeGeometry`（折线点→管） | 电缆/软管 |
| `rn` / `Qe` | `PlaneGeometry` / `Mesh` | decal/label 四边形 |
| `W` | `Vector3` | 坐标运算 |
| `$n` | `Box3` | `M()` 里临时 AABB（min/max/applyMatrix4） |
| `ji` / `or` / `rr` | `Shape` / `Path`(absarc) / `ExtrudeGeometry` | 山墙轮廓（带圆洞）与挡块 |
| `Ci` | `TorusGeometry` | 门洞圈边、护舷轮胎（`.clone()`） |
| `Qr` | `PointLight(color,intensity,distance,decay)` | 仓库 4 盏灯 |
| `xs` / `Ln` | `CanvasTexture` / `LinearMipmapLinearFilter` | label 图集纹理 |
| `bs` | `MathUtils`（`ceilPowerOfTwo` / `clamp`） | 图集尺寸与 UV 夹取 |
| `By` | 静态合并函数（按材质合并 group） | 产出 `level-merged` |

### 4.2 依赖的 ctx（`create(i)` 的 `i`，即游戏装配上下文）

| 依赖 | 用途 |
|---|---|
| `i.scene` | 挂 `level` 根组 |
| `i.rng.fork()` | 可复现随机（种子流派生；无则回退 `Math.random`） |
| `i.mats.get(name, {interior?, vertexColors?})` | 材质表；`i.mats.names` 用于筛可升级为 vertexColors 的材质 |
| `i.mats.decal(name)` | 贴花 → `{material, aspect}` |
| `i.mats.label(text, opts)` | 文字贴图 → `{material, aspect}`（opts: color/font/distress） |
| `i.mats.emissive(color, intensity)` | 自发光灯条材质 |
| `i.props.build(name, opts)` | 道具工厂（seed/color/wear/doors/reefer/forksUp/posts/sign/rails… 由各道具自己解释） |
| `i.physics.addBox(min,max,{surface,noNav,playerOnly,...})` | 碰撞注册 |
| `i.physics.nav.isWalkable(x,z)` | 出生点/刷怪点/掩体点吸附 |

（`i.ground` / `i.player` 等本模块不碰；`showcase` 只透传 `update`。）

## 5. 嵌入 GLSL / canvas 绘制

- **GLSL：无**。本模块不注入 shader，材质全部走 `mats.get` 的共享材质。
- **canvas：1 处 —— `rb()` 标签图集打包器**（关卡里十几处中文/英文 stencil 标签都是 canvas 纹理）：
  1. 遍历 `staticRoot`，收集 `material.name === "label"` 且有贴图、祖先无 `noMerge` 的网格，按材质分组；<2 张直接返回空实现（SSR/`typeof document === "u"` 同样返回空实现）；
  2. 每张按 `scale=0.5` 降采样后 **shelf 打包**进一张 2048 宽、高取 2 的幂且 ≤4096 的大 canvas（间距 `Dr=4`，超 4096 放弃）；
  3. `drawImage` 双绘（先画带 4px bleed 的大图再裁中心，避免采样渗边）；
  4. 克隆首张材质为 `name:"label_atlas"` 指向该 canvas 纹理（mipmap + 各向异性继承），把所有标签网格的 UV 重映射到图集子矩形（几何按 `uuid|materialUuid` 克隆去重，尊重 `noMerge`）；
  5. 返回 `{count, material, size, update(dt)}`：`update` 在累计 ~8s 预算内轮询各原图 `map.version`，变了就整张重绘——静态关卡实际是"一次性保险"。
- 其余 canvas 相关只有 `getContext('2d')` 的图集绘制本身；没有第二处 2D 绘制。

## 6. 其他值得留意的实现细节

1. **材质升级**：对 `mats.names` 里的非透明标准材质，若 `mats.get(name)` 恰好是网格当前材质，则再取 `vertexColors:true` 变体替换——目的是让合并后的静态网格用顶点色做旧化/色差（道具 props 侧应写入顶点色）。
2. **阴影统一设定**：`castShadow = 非透明 && 非 basic`，`receiveShadow = 非 basic`（decal/label plane 显式 `cast=false`）。
3. **刷怪/掩体吸附 `E()`**：不可走时按 0.5/1/1.5/2m 半径 × 8 方向找最近可行走点，找不到就保持原位——保证 spawn 不卡在箱体里。
4. **统计** `stats.tris` 按合并后 index/position 计数；`meshes` = 合并网格子数 + dynRoot 网格数。
5. **`update` 的容错**：道具 `userData.update` 抛错只 `console.error` 一次（`w` 标志），不会每帧刷屏。
