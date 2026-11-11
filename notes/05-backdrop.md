# 05-materials 模块解析

> 源文件：`src/game/raw/05-materials.raw.js`（53,151 字节）→ 格式化产物 `src/game/05-materials.js`（1,820 行，84,920 字节）
> 校验：`node --check` 通过；`tr -d [:space:]` 对比确认与 raw 仅空白差异（WS_ONLY_OK）。

## 1. 模块导出

esbuild 命名空间导出（`br(mv, {create, showcase})`）：

| 导出 | 对应函数 | 职责 |
|---|---|---|
| `create: () => pv` | `async function pv(i)` → `Eb(i, {})` | 构建完整背景场景（backdrop）：吊机 crane、货轮 ship、小艇 boat、天际线 skyline、海鸥 gulls、灯具 lamps，注册碰撞盒，返回 `{update, root, boat, crane, ship, skyline, gulls, lamps, colliders, spreader, boatBase, extractionPoint, shipName, craneId, stats}` |
| `showcase: () => MR` | `function MR(i)` | 展示模式：读 `i.params.bshow`（crane/ship/boat/sky 四选一，非法值回退 crane），以 `only` 过滤只建单体，返回该单体的 `{cam, target}` 相机预设 + `update` |

**注意：模块名虽叫 materials，实际主体是「场景背景搭建」**——真正定义材质库（paint_grey 的 canvas 贴图等）的是别的模块；本模块是材质库的**消费方**，通过 `i.mats.*` 接口取用现成材质。

## 2. 本模块消费的材质清单

| 材质名 | 获取方式 | 视觉特征推断（从用法/tint 推断） | 用途 |
|---|---|---|---|
| `paint_grey` | `so()`（vertexColors 开启） | 中灰漆面，靠顶点色做风化斑驳 | 吊机主体结构、立柱、横梁 |
| `paint_yellow` | `so()` | 黄色机械漆，tint 常给 `[.72,.52,.12]`（暗金黄） | 吊机活动部件、小车、护栏 |
| `paint_white` | `so()` | 白漆，tint `[.78,.78,.76]` 暖白 | 舱面白漆、集装箱顶、灯柱 |
| `paint_red` | `so()` | 红漆，tint `[.5,.14,.1]` 暗红 | 吊具（spreader）横梁警示涂装 |
| `paint_orange` | `so()` | 橙漆，tint `[1,.9,.85]` | 小艇座椅/浮筒点缀 |
| `plastic_grey` | `so()` | 塑料灰（非金属） | 小艇 hull 蒙皮 |
| `hull_paint` | `so()` | 船体漆（偏青灰，按区块随机变色） | 货轮船壳水线以上部分 |
| `hull_red` | `so()` | 船底防锈红 | 货轮船壳水线以下 + 舷侧条纹 |
| `steel_galv` | `mats.get` | 镀锌钢，银灰金属 | 细杆、梯子、栏杆、缆绳卡扣 |
| `steel_dark` | `mats.get` | 深灰金属，tint `[.1,.1,.11]` 近黑 | 铰链、基座、暗部结构 |
| `hazard_stripes` | `mats.get` | 黄黑警示条纹贴图 | 吊机立柱脚部、危险区包围盒 |
| `hazard_voltage` | `mats.decal` | 高压警示贴花（三角闪电） | 配电箱面 |
| `glass` | `mats.get` | 透明玻璃 | 小艇挡风玻璃、舷窗 |
| `rope` | `mats.get` | 麻绳/缆绳 | 系泊缆、吊索 |
| `rubber` | `mats.get` | 黑橡胶 | 靠泊轮胎护舷 |
| `polymer_black` | `mats.get` | 黑色聚合物（哑光） | 小艇内饰、仪表台 |
| `rust_run` | `mats.decal` | 流锈污渍贴花（按噪声定长随机截取） | 船壳锈迹 |
| `logo_a` / `logo_b` | `mats.decal` | 品牌 logo 贴花（带 aspect 宽高比） | 小艇侧舷、雷达柱 |
| 几猫04号 / 几猫撤离艇 | `mats.label` | 文字标签贴图，支持 `{color, font: "stencil"/"sans", distress}` 做旧 | 吊机机身编号、船名 |

> 颜色数组（如 `[.72,.52,.12]`）是**顶点色 tint**：`so()` 拿到的材质带 `vertexColors:true`，几何体经 `Lc()` 注入顶点色时乘上该 tint（见 `hv` / `Mb` 内 `l()`）。

## 3. 材质生成技法

- **无 canvas 程序化贴图**：本模块不含任何 canvas/纹理绘制；贴图（条纹、锈迹、logo、文字）由 `mats.decal()` / `mats.label()` 从材质库模块拿，这里只管贴到几何面上。
- **顶点色风化（核心技法）**：
  - `t0(x,y,z)`：整数哈希（`Math.imul` 三个大素数异或，MurmurHash3 风格），输出 `[0,1]`。
  - `rl(x,y,z)`：**3D 值噪声**——`t0` 做格点随机 + `r*r*(3-2r)` smoothstep + 三线性插值。
  - `hv(x,y,z,base,scale)`：把噪声变成颜色扰动——基础明度浮动（`1 - s*(.3-.36*noise)`），且 `r>.68` 时向暖色偏移（`R*1.45, G*.7, B*.4`，模拟锈斑/褪色斑块）。返回**共享的模块级数组 `P1`**（注意别持有引用）。
  - `so(i, name, t)`：`mats.get(name, {vertexColors:true, ...t})` + `WeakSet` 标记；几何合并器 `io.add` 对被标记且无 color 属性的几何调 `Lc(geo, (x,y,z)=>hv(...))` 自动铺顶点色。
- **`onBeforeCompile` 注入（2 处，见 §5）**。
- **`mats.emissive(colorHex, intensity)` 签名**：本模块唯一调用 `i.mats.emissive(16769716 /* 0xffe2b4 暖白 */, 6)`——返回可直接 `add()` 的发光材质（灯罩/指示灯）。
- **`mats.decal(name)`**：返回 `{material, aspect}`（aspect 为贴图宽高比，用于按比例缩放 quad，如 `ll(1.1*min(3, aspect), 1.1, ...)`）。
- **`mats.label(text, opts)`**：返回 `{material, aspect}`，opts：`{color:"white", font:"stencil"|"sans", distress:0~1 做旧度}`。

## 4. `get()` 接口签名与选项

```js
i.mats.get(name)                       // 基础用法
i.mats.get(name, { vertexColors: true })  // 经 so() 包装，注入顶点色支持
```

- 本模块只传 `{vertexColors: true, ...t}`（`so()` 包装层），**未出现 `{interior: true}`**——该选项属于其他模块（室内场景）的用法，本 chunk 内 grep `interior` = 0 命中。
- `get` 按名字返回缓存的共享材质实例（`so()` 结果进 `WeakSet` 去重标记）。

## 5. 嵌入 GLSL（2 段 `onBeforeCompile`）

### 5.1 `saltline-blink`（函数 `pb()`，灯具闪烁材质）
- 材质：`new Nn({vertexColors:true, fog:false})`（Nn = MeshBasicMaterial 类，无光照），`customProgramCacheKey = () => "saltline-blink"`。
- 顶点属性 `blink: vec3 = (period, phase, duty)`；uniform `uTime`。
- 顶点着色器在 `#include <begin_vertex>` 后算 `vBlink`：`fract(uTime/period + phase)`，用两段 `smoothstep`（0→0.06 上升沿、duty→duty+0.12 下降沿）得到脉冲包络；`period<=0` 时恒为 1（常亮）。
- 片元在 `#include <color_fragment>` 后 `diffuseColor.rgb *= vBlink`——实现信号灯/航空障碍灯的闪烁。
- 收集器接口：`{uTime, mat, add(geo, colorRGB, period=0, phase=0, duty=0.5), build()}`；`build()` 合并所有灯为单 mesh（`castShadow=false`），由 `Eb` 里 `backdrop-lamps` 每帧 `o.uTime.value += dt` 驱动。

### 5.2 `saltline-gulls`（函数 `wb()`，海鸥群）
- 材质：`new Nn({color, side:Sn(双面), fog:false})`，cache key `"saltline-gulls"`。
- 顶点属性 `aOrbit(vec4: 中心xyz+轨道半径)`、`aPar(vec4: 角速度, 相位, 扑翼频率, 扑翼幅度)`；同一份 6 顶点「双翼三角」几何 × N 只实例化拼进一个 buffer。
- 顶点着色器全程程序化：绕中心圆轨道飞行 + 上下起伏 `sin`、翅膀扑动（`gflap` 混入 `gl.y` 和 `gl.z` 压缩）、朝向用 `gfw/grt` 基向量旋转——**CPU 零动画，一次 draw call 渲染鸟群**。

## 6. 几何工具箱（本模块另一半内容）

| 函数 | 作用 |
|---|---|
| `Ee(x1,y1,z1,x2,y2,z2,r)` | 轴对齐盒（r>0 用圆角盒 `Wi`），居中平移 |
| `xt(w,h,depth,axis,x,y,z,seg)` | 圆柱/胶囊，axis 指定主轴后旋转平移 |
| `Ke(p1,p2,r,seg)` | 两点间圆柱（`setFromUnitVectors` 对齐） |
| `jt(p1,p2,w,h,r)` | 两点间方梁（`makeBasis` 定向） |
| `kr(points,r,seg)` | 折线段圆柱串（缆绳/管线） |
| `ua(p1,p2,sag,n)` | 悬链线采样（下垂 `y -= 4*sag*t*(1-t)`，系泊缆） |
| `ll(w,h,x,y,z,rx,ry)` | 平面 quad（贴花/标签载体） |
| `ns(batcher,mat,points,{h,post,r,tint,mid})` | 沿路径生成栏杆（立柱+扶手+中横杆） |
| `Bn(x,y,z,r)` | 球体（灯泡），配合 blink 材质 |
| `io` 类 | 几何合批器：`add(mat, geo, tint)` → `build({cast,recv})` 合并为每材质一个 mesh；支持 `remap`/`dz`/`minSize`（把 crane 嵌入 skyline 时降级重映射 + 小件剔除） |
| `hv` / `t0` / `rl` | §3 噪声顶点色 |
| `uv(seed)` | 线性同余 PRNG（`1664525/1013904223`），容器配色随机源 |

场景构建主函数：`z1`(吊机+吊具 crane-spreader)、`vb`(货轮 几猫撤离艇)、`xb`(小艇 boat)、`Mb`(skyline 集装箱城+吊机群+道路+码头，还内嵌 `z1` 复用)、`mb`(远景简易吊架)、`wb`(海鸥)、`Eb`(总装+动画 update：吊具摇摆、雷达旋转、船体浮沉)。

## 7. 其他发现

- `Eb` 每帧 `update(dt)`：`uTime` 累加驱动 blink/gulls；吊具 `rotation.x/z` 用双频 `sin` 微摆；小艇 `position.y` 叠加两级正弦浮沉。
- 碰撞：crane/ship 的 `colliders`（AABB）注册到 `i.physics.addBox(..., {surface:"metal"|"rubber", tag:"backdrop"})`；`noNav` 标记可通行性。
- 撤离点常量：`extractionPoint = (30, 0, 20)`，`shipName = "几猫撤离艇"`，`craneId = "几猫04号"`。
- `showcase` 支持 `?bshow=crane|ship|boat|sky` 单体查看，相机预设写死在 `MR` 内。
