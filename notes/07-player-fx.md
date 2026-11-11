# 07-player-fx 模块解析（player-fx）

- 源：`src/game/raw/07-player-fx.raw.js`（126,488 字节）
- 产物：`src/game/07-player-fx.js`（js-beautify，5,876 行，216,043 字节；去空白后与 raw 逐字节一致）
- 校验：`node --check src/game/07-player-fx.js` 通过（CHECK_OK）
- esbuild 命名空间导出：`create: () => Cf`、`showcase: () => JR`

> 注意：本文件名叫 player-fx，但实际内容比名字大得多——除特效外还整包内嵌了
> **输入系统（v_）、玩家控制器（x_）、命中判定/战斗辅助（zv）、完整的过程化 WebAudio 音频引擎（c_/u_）**。
> 这四个工厂函数在本文件内没有任何调用点，是由 `09-game-ui.js` 的启动序列直接引用的
> （`t.input = v_(t)`、`Cf(t)`、`c_(t)`、`x_(t)`、`zv(t)`）。

---

## 1. 模块导出

| 导出 | 函数 | 职责 |
|---|---|---|
| `create` | `async function Cf(i)` | 创建特效系统：实例化 5 个绘制批次 + 粒子池，挂到 `i.scene`，返回 FX API（见 §5） |
| `showcase` | `function JR(i)` | 截图/展示用演示场景：摆三块测试墙（concrete/metal/wood）、按 `params.fxshow` 定时打弹着/曳光/爆炸，返回 `{cam, target, update(dt)}` |

`showcase` 读取的参数（URL params）：
- `fxshow`：`all | impact | explosion | tracer`（默认 `all`）
- `fxhold=muzzle`：每帧循环播枪口焰
- `fxt`：预演秒数（首帧一次性快进，用于确定性截图）
- `fxsize`：爆炸尺寸
- 还会 hook `window.__setShot`：支持 `fxage`/`fxsize` 字段，按 1/60 步进预跑特效后冻结（`C=!0`），供截图工具复现同一帧。

---

## 2. 输入系统（`h_` 键表 + `v_(i)` 工厂，行 5114–5500）

### 2.1 键鼠映射表 `h_`（code → 动作）

| 按键 | 动作 | 按键 | 动作 |
|---|---|---|---|
| W / S / A / D | forward / back / left / right | Space | jump |
| ShiftLeft / ShiftRight | sprint | KeyC / CtrlLeft / CtrlRight | crouch |
| KeyR | reload | KeyE | interact |
| KeyF / KeyV | melee | Escape / KeyP | pause |
| KeyQ | alt | Enter / NumpadEnter | fire |
| ArrowLeft / ArrowRight | turnL / turnR | ArrowUp / ArrowDown | turnU / turnD |
| KeyJ / KeyL | turnL / turnR（备用转向） | KeyI / KeyK | turnU / turnD（备用转向） |

- 动作合并进 4 个来源集合 `o = {key, mouse, touch, pad}`，任一来源按下即进入全局按下集 `n`；`s` 存"本帧刚按下"（pressed）。
- `g_ = {pause: 1}`：pause 是唯一在非 gameplay（`r=false`）时仍生效的动作。
- gameplay 中 Space/Arrow*/ControlLeft 会 `preventDefault`；焦点在 INPUT/TEXTAREA/SELECT 或 BUTTON（Space/Enter）时忽略。
- `down(action)` / `pressed(action)` 供上层查询；`endFrame()` 清 pressed 与 look 增量。
- 鼠标键：button 0→fire、2→ads、1→melee。

### 2.2 指针锁定（pointer lock）逻辑

- `mode` 三态：`"lock"`（正常指针锁）/ `"drag"`（锁不可用的降级模式）/ `"touch"`（触屏）。
- 点击画面且 `mode==="lock"` 且未锁 → `requestPointerLock()`；失败/异常/1200ms 超时未锁（`m()`）→ 若从未成功锁过（`a=false`）则切到 `mode="drag"`。
- `pointerlockchange`：更新 `f.locked`，解锁时清 mouse 来源的 fire/ads（key 来源保留），并向外 `i.events.emit("input:lock", {locked})`。
- `pointerlockerror` → 走 `m()` 降级。
- 解锁后 `mousemove` 仍可累计 look（drag 模式或 locked 状态）；单次 movement 超 400px 视为异常丢弃。

### 2.3 边缘转向（drag 降级模式）

`update(dt)` 中，`mode==="drag" && gameplay && 鼠标移动过 && 未锁定` 时：
- 归一化鼠标位置 `x,y ∈ [0,1]`；左缘 `x<0.12`、右缘 `x>0.88`、上缘 `y<0.1`、下缘 `y>0.9`；
- 超出边缘的比例 → `look.dx += Z*2.4*dt*sensitivity`、`look.dy += J*1.2*dt*sensitivity*(invertY?-1:1)`（停在屏幕边缘即持续转向）。
- 配套提示文案 `describeMode()`：`"鼠标捕获不可用：移动鼠标调整视角，停在屏幕边缘持续转向；点击开火；方向键或 IJKL 也可转向"`（drag）/ `"鼠标已捕获，按 Esc 释放"`（locked）/ `"点击游戏画面以捕获鼠标"`（默认）/ `"触屏操作已启用"`（touch）。
- 键盘备用转向：`turnR/turnL` → `look.dx += ±2.1*dt`；`turnD/turnU` → `look.dy += ±2.1*0.6*dt`（`p_=2.1`）。

### 2.4 灵敏度常量

| 常量 | 值 | 用途 |
|---|---|---|
| `f_` | 0.0021 | 鼠标 movement → look 增量 |
| `d_` | 0.0052 | 触屏拖动 → look 增量 |
| `p_` | 2.1 | 键盘转向角速度 (rad/s) |
| `m_` | 3 | 手柄右摇杆转向（平方曲线） |
| `If` | 58 | 虚拟摇杆像素半径 |

### 2.5 触屏虚拟按钮

首次 `touchstart`（全局 capture 监听）→ `K()`：置 `f.touch=true`、退出指针锁、懒建 DOM、`documentElement` 加 `is-touch`、切 `mode="touch"`。

DOM 挂到 `#ui`，结构（`N()`，行 5334）：
```html
<div class="touch">
  <div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div>
  <button class="t-btn t-fire"     data-a="fire">开火</button>
  <button class="t-btn t-ads"      data-a="ads">瞄准</button>
  <button class="t-btn t-reload"   data-a="reload">换弹</button>
  <button class="t-btn t-jump"     data-a="jump">跳跃</button>
  <button class="t-btn t-interact" data-a="interact">交互</button>
  <button class="t-btn t-pause"    data-a="pause">暂停</button>
</div>
```
- **ads 是开关**（toggle `j`，class `active`），其余按钮 touchstart 按下 / touchend·touchcancel 抬起（`d("touch", 动作, …)`）。
- **fire 按钮可拖动转视角**：记录 touch identifier，touchmove 里按位移累计 look。
- 画布左侧 45% 区域首个触点 = 虚拟摇杆（stick 定位 + nub 位移，模长钳到 `If`，输出 `H/O` 填 `move.x/y`；前推 `O>0.8 && hypot>0.93` 视为冲刺）；第二个触点 = 视角拖动。
- `setGameplay(bool)` 控制 touch 根节点显隐；`setPrompt(bool)` 点亮/熄灭交互按钮（`on` class）。

### 2.6 手柄

- 标准映射（`mapping==="standard"`）：左摇杆移动（死区 0.16），右摇杆视线（平方响应），按钮 0/1/2/3/5/6/7/9/10/11 → jump/crouch/reload/interact/melee/ads/fire/pause/sprint/melee。
- 每帧 `me(dt)` 轮询 `navigator.getGamepads()`；拔掉时清 pad 来源集合。

### 2.7 返回对象 `f`（即 `t.input`）

```
{ move:{x,y}, look:{dx,dy}, fire, ads, sprint, crouch,
  locked, touch, gamepad, sensitivity=1, invertY=false,
  mode:"lock"|"drag"|"touch",
  down(a), pressed(a), update(dt), endFrame(),
  requestLock(), exitLock(),
  setGameplay(bool), setPrompt(bool),
  onModeChange(cb), describeMode() }
```

---

## 3. 玩家控制器（`Mt` 调参 + `x_(i)` 工厂，行 5501–5776）

### 3.1 调参表 `Mt`（外部可读 `player.tuning`）

| 分组 | 键值 |
|---|---|
| 速度 | walk 3.8、sprint 6.4、crouch 1.9、ads 2.4 |
| 加减速 | accelGround 34、decelGround 26、accelAir 9 |
| 跳跃 | gravity 21、jumpApex 1（起跳速度 `√(2·g·apex)`）、coyote 0.12s、jumpBuffer 0.13s |
| 身体 | standHeight=Pi.height、crouchHeight 1.15、eyeRate 11、pitchLimit 1.5 |
| 步频 stride | walk 1.55 / sprint 2.1 / crouch 1.05（米/步） |
| 视角摆动 | bobY 0.024、bobX 0.013、bobSprint 1.9、bobAds 0.22、rollStrafe 0.02 |
| 落地 | landDip 0.36、landDipMax 0.2 |
| FOV | fovSprint +6、fovAds 52、adsLook 0.6（ADS 时视角灵敏度 ×0.6） |
| 生命 | regenDelay 4s、regenRate 25/s |
| 后坐力 | recoilKeep 0.35（直接吃进 yaw/pitch 的比例）、recoilApply 34、recoilRecover 6.5、recoilHold 0.09s |
| 震屏 | shakeDecay 1.7、shakePitch 0.03、shakeYaw 0.03、shakeRoll 0.045 |

### 3.2 状态对象 `C`（即 `t.player`）

```
{ pos, eye, vel, forward, yaw, pitch,
  health=100, maxHealth=100, alive, onGround,
  sprinting, crouching, ads(0..1), speed, enabled,
  invulnerable, baseFov, hurtPulse, lookScale,
  lastSafe(落水回溯点), tuning=Mt,
  reset(start?), damage(amount, fromPos), heal(amount),
  addRecoil(pitchDelta, yawDelta), addShake(amount),
  setFov(v), update(dt) }
```

### 3.3 机制要点

- **移动**：`input.move` 按 yaw 旋转成世界速度目标；地面加减速按 accel/decel 限步逼近，空中 accelAir，无输入空中阻尼 0.6；后退（move.y<0）速度 ×0.82→1 渐变；方向归一化防斜向超速。
- **冲刺**：需 `sprint && move.y>0.55 && |move.x|<0.6 && 未蹲 && ads<0.35 && 未开火`；地面还要 `speed > walk*0.6`，空中继承上一帧 sprinting。
- **蹲伏**：按住 crouch 进入；松开要头顶无盒（扫 `physics.boxes`，忽略 bulletOnly）才站起；蹲下时跳不起来（除非 `G()` 通过）。
- **跳跃**：coyote + jumpBuffer 双缓冲；起跳 `vel.y = √(2·g)`，清 buffer/coyote，强制站立，发 `player:jump`。
- **物理**：`physics.moveCapsule(pos, vel, dt, Pi.radius, height, wasGround)`；世界边界 `physics.bounds` 钳位（±0.4）。
- **受伤/回血**：`damage()` 无视 invulnerable=false 时扣血 → `hurtPulse` 累加（+0.35+amt/40）、`addShake(0.22+amt/70)`、发 `player:hit {amount, fromPos}`；血量归零 → `alive=false` 发 `player:dead`，死亡态走尸体相机（眼高 0.22、俯仰摆动）。
  回血：4s 无伤后 25/s。
- **落地**：离地 >0.12s 落地 → `landDip` 弹簧下压；落速 >7.5 加震屏；发 `player:land {speed, surface, pos}`；落速 >13 按 `(v-13)*7` 掉血。
- **落水/越界救援**：`pos.y < oi.seaY - 2.2` → 回传 `lastSafe`、扣 12 血、转身 π、发 `player:rescued`。`lastSafe` 更新条件：`pos.x <= oi.quayX - 1.2 && pos.y > -0.5`（码头安全区）。
- **脚步**：按 stride 累计米数取整发 `player:step {surface, sprint, pos}`；surface 优先水洼 `ground.isPuddle` → 否则 `level.groundSurfaceAt`。
- **后坐力**：`addRecoil(pitch, yaw)`：35% 立即进相机角，65% 进弹簧量 `x/y`（pitch 钳 ±0.3、yaw ±0.2），`recoilHold` 0.09s 后按 6.5/s 回弹；实际施加走 `recoilApply=34` 的平滑。
- **震屏**：`addShake(amt)` 累加 `_∈[0,1]`，按 1.7/s 衰减；相机叠加三轴不同频率正弦（43.1/71.7、37.3/83.9、29.7/61.3 rad/s）。**爆炸监听**：`events.on("explosion")` 按距离衰减自动 `addShake`。
- **镜头写入**（`K(dt)`）：`camera.position=eye`、`camera.rotation(YXZ)`（含 bob 横摆 p、竖摆 d、landDip g.x、后坐 b/m、震屏、roll v、死亡附加 roll/pitch）；FOV 在 baseFov+6(sprint)→52(ads) 间 `kn` 平滑（切换中 30/s，否则 7/s）；`params.fov` 存在时由外部接管。
- **后处理写值**：`render.post.damage / lowHealth / ads` 每帧刷新（供红屏/暗角/ADS 后期）。
- **爆炸响应**已在 §3.3 震屏条目。

---

## 4. 特效系统（`Cf`，行 1243–1787）

### 4.1 渲染批次（5 个 draw call，挂在 `root` Group `"fx"`）

| 批次 | 名称 | 容量 | 材质/混合 | 内容 |
|---|---|---|---|---|
| `r` = `Ev(lit)` | `fx_lit` | 1400（$b） | alpha 混合，受光照（太阳 wrap 光照 + 半球环境光 + 深度软融） | 烟、尘、蒸汽、火焰（HDR 色） |
| `a` = `Ev(add)` | `fx_add` | 3200（Zb） | 加法混合 | 火花、余烬、闪光、水花高光 |
| `u` = `q1` | 曳光 | 48 | 走 fx_add 批次 push | 弹道曳光（每发推 3 个条带：本体/辉光/头部） |
| `h` = `$1` | `fx_debris` | 256 | 实例化碎块（带 instanceColor、受影） | 命中碎屑/爆炸碎片 |
| `f` = `Z1` | `fx_shells` | 60 | 实例化黄铜弹壳（material `brass`，回退自制金属材质） | 抛壳物理 |
| `p` = `j1` | `fx_decals` | 160 | 贴花四边形（polygonOffset -4、vertexColors、深度写关） | 弹孔/焦痕/烟灰 |

共享顶点着色器 `HR`（见 §6）；lit 批次用片元 `VR`、add 批次用 `WR`。
深度软融：`onBeforeRender` 里取 `render.depthTexture`（非 live 且 `params.fxsoft!=="0"` 时开 `uSoft`），按场景深度做粒子与几何交界软化。

### 4.2 粒子池

- **lit 池 `Rf(1400, sorted=true)` / add 池 `Rf(3040, sorted=false)`**：SoA Float32Array（px/py/pz、vx/vy/vz、age/life、s0/s1 尺寸、sk 缩放缓动、rot/rotv、r/g/b/a、drag/grav/wind/turb、seed、fin/fout 淡入出、stretch、shade、frame、mode、flags、ramp、gy…）。
- add 池 `mode`：0=billboard、1=速度拉伸、2=贴地平面（水花环）；`flags` 含 `qc=1, Xc=2, GR=4`（地面标记等）。
- add 图集帧号：`oo=0, _v=1, n0=2, OR=3, Mv=4, V1=5, Gc=6, W1=7`（软光斑/闪/水环/火焰帧等，`Ob(128)` 4×2 图集）。
- lit 图集：`Bb(128)` 4×2（Wc=4, H1=2），程序化生成烟/云/尘 alpha + 法线（种子噪声 `yv(9173)`）。
- 曳光池 `q1(48)`：from→to、speed、长度 `clamp(speed*0.022, 2, 7)`，到达后再存活 2 帧收尾。

### 4.3 FX API（`Cf` 返回值 = `t.fx`）

| 方法 | 签名（推断） | 用途 |
|---|---|---|
| `update(dt)` | | 推进所有池、begin/end 两个批次、更新贴花/弹壳/碎块/发射器 |
| `clear()` | | 全清 |
| `muzzleFlash(pos, dir, {scale=1, color})` | `j` | 枪口焰：多层加法光斑 + 反向拉伸火焰 + 火星 + `lightPool.flash` |
| `tracer(from, to, {color, intensity=16, speed=260, width=0.024, trail})` | `G` | 曳光；`trail!==false` 时沿线每 0.07s 补 5 点烟迹 |
| `impact(point, normal, surface, dir, enemy)` | `C` | **按材质分派**的命中特效（见 4.4） |
| `sparks(pos, dir, count=12)` | `H` | 通用火花爆 |
| `smoke(pos, {size=1, life=2.5, rise=0.6, color, vel, alpha=0.4, count=3})` | `O` | 单团烟 |
| `dust(pos, dir?, scale=1, r, g, b)` | `q` | 落尘/枪口尘（8 快 + 2 慢团） |
| `debris(pos, {color|mat, size=0.06, speed=5, count=6, normal, spread})` | `U` | 抛碎块（颜色取自材质 `i.mats.get`） |
| `explosion(pos, size=1)` | `K` | 组合爆炸：闪光（lightPool 两次 flash）、火球、黑烟、火星、碎块、焦痕 decal、`events.emit("explosion", {pos,size})` |
| `shell(pos, vel)` | `N` | 抛一枚弹壳 |
| `splash(pos, scale=1)` | `T` | 水花：水柱 + 落水滴 + 贴地水环（mode 2） |
| `addEmitter(pos, kind, {ttl, scale})` | `ne` | 持续发射器，kind ∈ `steam / smolder / embers / fire / drip`（24 槽池；`fire` 会向 `lightPool` 申请动态光并闪烁） |
| `decal(pos, normal, name="bullet_concrete", alpha?)` | | 直接贴花 |
| `wind` | Vector3 | 风向（粒子 drag 用，值 `(-0.8, 0, 0.3)`） |
| `root` | Group | 特效根节点 |
| `stats()` | | `{lit, add, tracers, debris, drawCalls:5}` |

### 4.4 `impact` 材质分派（`C(point, normal, surface, dir, enemy)`）

| surface | 特效 |
|---|---|
| `metal` | 18–24 速度火花（拉伸）+ 2 亮橙火星 + 灰烟 + 2 碎屑 + decal `bullet_metal` + 0.09s 节流的 lightPool 橙闪 + `p.add(…,"bullet_metal")`（弹孔 decal 亦走 `p`） |
| `wood` | 木屑碎块 + 棕色尘 + 偶发火星 + `bullet_wood` decal |
| `water` | 直接 `splash(pos, 1)` |
| `rubber` / `dirt` | 棕褐/暗色尘爆 + 碎屑 + `soot` decal |
| `glass` | 12 片高亮玻璃碎（ramp=3 HDR）+ 白尘 + `bullet_glass` |
| `enemy` | 血雾/肉屑（13+2 火花、橙红火星）+ 35% 红调碎屑 + lightPool 暗红闪 |
| `default`（concrete 等） | 灰尘 + 碎屑 + 4 条反溅火花 + `bullet_concrete` |
- 距相机 >55m（`distanceToSquared > 3025`）时数量/强度减半（`oe=0.5`）。
- 落点在水洼（`ground.isPuddle` 且 y<0.08）且法线上扬 → 强制按 `water` 处理。
- `dir` 反射向量 `J1 = reflect(-normal)` 用于反溅方向。

### 4.5 弹壳物理（`Z1`，`fx_shells`）

- 生成：随机姿态四元数 + 随机角速度（±40/±20/±40），`_floorAt` 向下 raycast 6m 记录地板高度与材质。
- 模拟：重力 9.81、四元数积分；触地（y < floor+0.0065）：
  - **前 2 次弹跳发 `shell:bounce {pos, surface}` 事件**（音频据此播 `shell_bounce` 并按 surface 变体）；
  - 反弹系数 `vy *= -(0.32 + rand*0.16)`，水平 ×0.6 + 扰动，角速度随机化；第 1 次触地重 raycast 更新 floor；
  - `vy > -0.9` 或已弹 4 次 → 静止（state 2，姿态摆正平躺）；或 age>8s 强制止落。
- 静止 4s 后 0.7s 内缩放到 0 淘汰；环形缓冲 cap 60。

### 4.6 贴花（`j1`，`fx_decals`）

- 图集 `Hb(256)`：3 张 canvas 生成 map/orm（+nrm），4×2 格，`da` 表映射 decal 名 → 格子：
  `bullet_metal:[0,1]、bullet_concrete:[2,3]、bullet_wood:[4]、scorch:[5]、soot:[6]、bullet_glass:[7]`。
- 每种默认尺寸 `ZR = {bullet_metal:.25, bullet_concrete:.34, bullet_wood:.24, scorch:2.4, soot:.3, bullet_glass:.3}`。
- 四边形绕法线切线构建、随机 roll（wood 限 ±0.15rad）、法线偏移 0.004+序号×0.0003 防 z-fight；**满 160 张时最老 14 张（Yb=14）渐隐**腾位。

### 4.7 发射器池（`ie`，24 槽）

`kind` 行为：`steam`（13/s 白汽）、`smolder`（阴燃烟，随 TTL 衰减）、`embers`（火星）、`fire`（24/s 火球 + 4/s 烟 + 动态光闪烁 `14+6sin(23t)+4sin(37.7t)`）、`drip`（按 `√(2h/g)` 计算下落时间的滴水，落地成小水花）。
`X()` 返回句柄 `{active, kind, pos, stop(), setPos(), ttl, scale, shade}`；`kind==="fire"` 时向 `i.render.lightPool.acquire()` 借灯，stop 时 release。

### 4.8 其他联动

- 监听 `impact` → `C(...)`；`player:step`/`player:land` 在水洼/水面时触发 `splash`（step 0.4~0.55、land 0.9 缩放）。
- 光源节流：`lightPool.flash(color, intensity, dist, decay, hold)`，metal/enemy 命中与枪口/爆炸共用，0.07~0.09s 节流。

---

## 5. 与外部的接口清单

### 5.1 输入依赖的上下文（`v_(i)` 读取）
`i.renderer.domElement`（或 `#view`）、`#ui`、`i.events`（emit `input:lock`）。

### 5.2 玩家控制器依赖（`x_(i)`）
`i.input`、`i.camera`、`i.weapon`（读 `.ads/.stub`，ADS 平滑优先用武器值）、`i.physics`（`moveCapsule / boxes / bounds`）、`i.ground.isPuddle`、`i.level.playerStart / groundSurfaceAt`、`i.events`、`i.render.post`（写 damage/lowHealth/ads）、`i.params.fov`、外部常量 `Pi`（半径/眼高/蹲眼高/身高/FOV）、`oi`（seaY/quayX）、`Mt`。

### 5.3 特效依赖（`Cf(i)`）
`i.scene 或 i.render.scene`、`i.render.depthTexture/lightPool/resolution`、`i.physics.raycast`、`i.mats.get`、`i.ground.isPuddle`、`i.camera`、`i.events`、外部 `Mn`（太阳方向/颜色/强度）、`en`（天空色 zenith/horizonAway/fog）。

### 5.4 本模块对外 emit 的事件

| 事件 | 发出者 | 载荷 |
|---|---|---|
| `input:lock` | 输入 | `{locked}` |
| `player:jump` | 控制器 | `{pos}` |
| `player:land` | 控制器 | `{speed, surface, pos}` |
| `player:step` | 控制器 | `{surface, sprint, pos}` |
| `player:hit` | `damage()` | `{amount, fromPos}` |
| `player:dead` | `damage()` | `{}` |
| `player:rescued` | 落水回溯 | `{}` |
| `explosion` | FX `K()` | `{pos, size}` |
| `shell:bounce` | 弹壳池 | `{pos, surface}`（复用单例 `wv`） |
| `impact` | showcase / 战斗 | `{point, normal, surface, dir, enemy?, part?, from, dist?, killed?}` |
| `player:hitEnemy` | `combat.playerShot` | `{enemy, part, killed, weak}` |

### 5.5 战斗辅助 `zv(i)`（`t.combat`）
- `stats = {shots, hits, kills}`（监听 `enemy:killed` 累 kills）、`reset()`。
- `playerShot(from, dir, {damage=28, range=300, impulse=1})`：先 `physics.raycast` 再 `enemies.raycast`（取更近者）；弱点部位 `part==="weak"` ×2.2；命中发 `impact` + `player:hitEnemy`，返回 hit 描述或 null。
- `enemyShot(from, dir, {damage=6, range=200})`：对玩家胶囊（半径 0.38、高 0.95 的线段近似）做射线距离检测，命中 `player.damage` 返回 true。
- `explode(pos, radius=5, damage=80, by="player")`：对 `enemies.list` 按距离+LOS 衰减伤害，玩家吃 50%。

### 5.6 音频引擎 `c_(i)`（`t.audio`，行 1898–5113，占本文件约 55%）

- **全程序化合成**（无音频资源文件）：WebAudio `AudioContext(latencyHint:"interactive")`，不可用时回退 `iC()` 静默桩（`silent:!0`）。
- 声音库 `Go`：60+ 条目，每条 `{gen(合成函数), n(变体数), sr(采样率), peak, bus(near/dry/world/music), max(并发), pri(优先级), loop?, ir?}`。代表性条目：`rifle_shot/tail_in/tail_out/dry`、`reload_magout/magin/bolt`、`shell_bounce`、`step_concrete/water/metal`、`land/jump/hurt/ear_ring`、`impact_{metal,concrete,wood,water,enemy,glass}`、`whiz/ricochet`、`gull_*`/`hound_*`/`telegraph/alert`、`explosion`、`relay_cut/hum`、`thunder/foghorn/gull_cry/halyard/container_bang`、`ui_click/hover`、`objective(_all)/complete/death`、循环层 `rain(_interior)/wind/sea/music_{drone,ost,perc,brass,motif}/ir_outdoor/ir_shed`。
- 事件绑定 `ln(event, handler)`：`weapon:fire/dry/reload/melee`、`shell:bounce`（按 surface 换变体）、`impact`（surface→音效映射 `l_`/`Iv`）、`player:step/land/jump/hit/dead`、`enemy:*`、`explosion`、`objective:done/all`、`extraction:reached`、`thunder`、`ui:click/hover`、`game:state`（playing/paused/complete 状态机 + 自动 intensity）。
- 公开 API（`Object.assign(Re, …)`）：`ctx、resume()、play(name, opts)、loop(name, opts)、update(dt)、ready(Promise)、selfTest()、setIntensity/setInterior/setVolume/setPaused、names、intensity/interior getter、debug()`；`autoIntensity` 默认 true。
- 自动解锁：首个 pointerdown/keydown/touchend/mousedown 上 `resume()`（浏览器手势策略）。
- 内置 `selfTest` 演练脚本（行 ~4960–5050）：定时 emit `player:step/weapon:fire/impact/shell:bounce/enemy:*` 等事件做冒烟测试。
- 预生成列表 `nC`（50 条）在 boot 时按需合成，`boot` 标记的优先。

### 5.7 showcase 对外
返回 `{cam:[x,y,z], target:[x,y,z], update(dt)}`；hook `window.__setShot`。

---

## 6. 嵌入 GLSL / Canvas

### 6.1 GLSL（4 段，行 510–627）

| 变量 | 类型 | 用途 |
|---|---|---|
| `HR` | vertex | 粒子顶点：3 种 billboard 模式（mode 0 相机公告牌 / 1 速度拉伸条带——曳光与火花，带屏幕宽度钳制 `aMisc.w` / 2 贴地平面对齐——水花环）；roll 旋转、图集 UV（`uAtlas` 4×2）、透视尺寸→像素 `uPx`、软融距离 `vSoftD` |
| `Xb` | fragment 公共段 | `softFade()`：采样场景深度纹理（`uDepth`）重建线性深度，粒子与几何交界处按 `vSoftD` 渐隐（`uSoft` 开关） |
| `VR` | fragment（lit） | 烟雾光照：flipbook 法线 + 球面法线混合、wrap 太阳光 + 朝日前向散射、半球环境光、`vInfo.z>=2` 判定为 HDR 火焰核心（emissive 改写颜色）、age 腐蚀 alpha、`#include <tonemapping_fragment>/<colorspace_fragment>` 后 premultiply |
| `WR` | fragment（add） | 加法：`alpha = tex.r * vCol.a * softFade`，输出 `vec4(rgb*k, 1)` |

### 6.2 Canvas / 程序化纹理

| 函数 | 产物 |
|---|---|
| `Bb(128)` | fx_lit 图集（4×2=8 帧）：`Uint8Array` 直写 DataTexture，RGB=高度场转法线、A=形状 alpha（种子噪声 `yv(9173)`、smoothstep 圆形衰减） |
| `Ob(128)` | fx_add 图集（4×2）：程序化软光斑/闪/环/火帧 |
| `Hb(256)` | 贴花图集：**3 个 `<canvas>`**（map / ORM / normal），2D 径向渐变 + 抖动多边形画弹孔、焦痕、烟灰；`da` 表映射格子 |
| `XR()` | 碎块几何：`BoxGeometry(1,1,1,2,1,2)` 顶点抖动（种子 PRNG）去规则感 |
| `$R()` | 弹壳几何：11 点轮廓 `LatheGeometry`（弹壳剖面）+ `computeVertexNormals` |
| 触屏 DOM | `N()` 动态建 `.touch` 按钮层（见 §2.5） |

### 6.3 噪声 `yv(seed)`
64×64 网格值噪声：mulberry32 风格种子 PRNG 预生成 4096 随机数，双线性 + smoothstep 插值；附 `fbm(x,y,octaves=4)` 与 `rnd()`。被 lit/add/decal 三张图集的程序化生成共用。

---

## 7. 关键发现（摘要）

1. **名不符实的大杂烩**：`07-player-fx` 除特效外还内嵌输入、玩家控制器、战斗判定、完整过程化音频引擎四大子系统；四个工厂（`v_/x_/zv/c_`）在本文件零调用点，全靠 `09-game-ui.js` 启动序列跨文件引用——拆分边界是按原文物理切段而非按职责。
2. **输入有三重降级**：pointer lock → 边缘拖拽转向（drag）→ 触屏虚拟摇杆；IJKL/方向键是 drag 模式下的保底转向手段，与 `describeMode()` 提示文案一一对应。
3. **特效全走 GPU 实例化 + 每帧仅 5 个 draw call**：lit(1400)/add(3200) 两批粒子 + 曳光(48) + 碎块(256) + 弹壳(60) + 贴花(160)，SoA typed array 池、环形复用；深度纹理软融让粒子与几何交界不硬切。
4. **事件总线是模块间唯一粘合剂**：本模块 emit `explosion/shell:bounce/impact/player:* /input:lock`，同时又 listen `impact/player:step/player:land/explosion` 驱动自身特效与音效——FX 与音频对同一批事件各自独立订阅，无直接调用。
5. **确定性回放钩子**：showcase 包装 `window.__setShot`，按 `fxage` 以 1/60 步进预跑特效后冻结，配合 `fxt/fxsize` 参数实现截图工具的逐帧复现；音频引擎另带 `selfTest()` 自动演练事件序列。
