# 09-game-ui 模块解析（游戏主控 + UI：状态机 / 任务目标 / 敌人 AI / HUD / 菜单 / 启动器）

- 源文件：`src/game/raw/09-game-ui.raw.js`（100,365 字节）
- 格式化：`src/game/09-game-ui.js`（150,426 字节 / 3,320 行，`node --check` 通过；与 raw 剥离空白后逐字节一致，仅改空白/换行/缩进）
- esbuild 命名空间导出：`TUNE` / `create` / `showcase`
- 本模块是**整个游戏的骨架**：除导出的三件套外，还内含 HUD 构建（`hM`）、菜单/设置（`pM`）、游戏流程状态机（`mM`）、以及**全量启动器 + 主循环**（`QC`，由 `99-entry.raw.js` 的 `QC().catch(...)` 调用）。一个文件同时承担"敌人系统 + UI + 游戏主控 + boot"四职。

## 1. 模块导出

```js
br(ex, { TUNE: () => Ui, create: () => Em, showcase: () => VC });
```

| 导出 | 对应函数 | 职责 |
|---|---|---|
| `TUNE` | `Ui`（对象） | 敌人/战斗全局调参表：`{gull, hound, sightRange, sightCone, loseSight, searchTime, hearRadius, maxTokens, …, poolGulls, poolHounds, maxWrecks, maxBolts}`（详见 §7.1） |
| `create` | `async function Em(i)` | **敌人系统工厂**：建 gull/hound 对象池（10+8）、能量弹池、聚光灯、感知/令牌/警戒逻辑，返回 `U` API（见 §5.7） |
| `showcase` | `async function VC(i)` | 展示入口：先 `await Em(i)` 挂到 `i.enemies`，按 `?eshow=`（gull/hound/fight/dead/both）布置演示场景，预跑 `epre` 秒（默认 2.6s），返回 `{cam, target, update}`；`efreeze` 时 update 为空转 |

未导出但被外部引用的顶层符号：`QC`（启动器，entry 调用）、`hM`（HUD）、`pM`（菜单）、`mM`（游戏流程）——它们在拼接后的同一 IIFE 作用域内被 `QC` 内部使用。

## 2. 文件结构地图（3,320 行）

| 行段 | 内容 |
|---|---|
| 7~57 | `iu` rig 类（程序化骨骼装配） |
| 59~96 | `pm()` rig → SkinnedMesh 转换器 |
| 98~112 | `q_()` 双骨 IK 求解器（腿部 abd/hip/knee） |
| 113~174 | 模型调色板（`Ss`/`Ts`/`an`…）与几何小工具（`ft`/`Ce`/`ds`/`Ro`/`Si`/`su`） |
| 176~273 | `Z_()` 四足猎犬整机建模（骨骼 + 逐槽几何） |
| 274~364 | `FC()`/`j_()` 飞鸥整机建模（含转子盘、探照灯锥 extra rig） |
| 365~688 | `Q_()` gull 敌人对象工厂（含巡逻/交战/死亡飞行状态机） |
| 689~1321 | `iM()` hound 敌人对象工厂（寻路/掩体评分/步态/扑咬/死亡） |
| 1323~1347 | 射线-球 `sM`、射线-线段 `nM` 局部命中测试 |
| 1348~1728 | `Ui` TUNE 表 + `Em()` 敌人管理器（对象池/令牌/感知/bolt 池/聚光灯/API） |
| 1733~1754 | `HC()` 线段-线段最近距离（bolt 命中玩家胶囊） |
| 1755~1824 | `VC()` showcase |
| 1825~2191 | `hM()` HUD 构建与逐帧刷新（准星/罗盘/血量/弹药/标记/播报） |
| 2192~2504 | 设置持久化（`saltline.settings.v1`）+ `pM()` 菜单/设置/操作说明/项目介绍 DOM |
| 2505~3012 | `Yi` 流程 TUNE + 台词表 `_l` + `mM()` 游戏流程状态机（本模块核心） |
| 3013~3216 | `gM` 模块注册表 + `QC()` 启动器 + 主循环（`setAnimationLoop`） |
| 3218~3295 | `eP()` bench 面板、`tP()` showcase 用 input 桩 |
| 3297~3321 | `nP()` showcase 用 player 桩 |

## 3. 游戏流程状态机（`mM`）

### 3.1 状态与变量

- 状态变量：`_.state`（game 对象字段），取值 `"title" | "intro" | "playing" | "paused" | "dead" | "complete"`；由 `M(P)` 切换并 `events.emit("game:state", {state, prev})`，同时把状态计时 `u` 清零。
- 运行数据 `c`（run）：`time/retries/relays[]/cut/allCut/queue[]/waveHot/alertT/pursuitT/pursuitLeft/contactSaid/lowSaid/extractHint/intensity/used(Map)`。
- 菜单屏幕是另一条独立轴：`menus.show(U)`，取值 `"none" | "title" | "paused" | "dead" | "complete"`（`<div class="menu" data-screen=…>`）。

### 3.2 转移条件

| 从 → 到 | 触发 |
|---|---|
| （初始）→ title | `QC` 末尾：非 `?shot`/`?autostart` 时 `l.show("title")`，同时 player 禁用、HUD 隐藏、武器隐藏、audio intensity 0.15 |
| title → intro | 主菜单「开始行动」（`deploy`）或标题页按 `Enter`/`NumpadEnter`：`audio.resume()` + `input.requestLock()` + `U({})` → `H()` 全量重置 → `M("intro")` |
| intro → playing | 状态计时 `u >= h`（`h = Yi.introSeconds` 3.5s；重试/重开走 `retryIntroSeconds` 1.3s，`quick:true`）。进入时 `T()`：player.enabled=true、HUD.show(true)、`setObjective(D())`、`M("playing")` |
| playing → paused | ① `input.pressed("pause")`（Esc/P）② `visibilitychange` 页面隐藏 ③ 指针锁丢失（`input:lock` 事件 `!P.locked` 且 `g` 标志为真）。暂停时 `setGameplay(false)`、`exitLock()`、`audio.setPaused(true)`、HUD 隐藏、菜单 `show("paused")` |
| paused → playing | 「继续游戏」按钮（`resume`，经 `j(!0)`）或按暂停键（有 `d=.35s` 防抖 + 先尝试 `closePanel()`） |
| playing/paused → dead | `events.on("player:dead")`：写死亡统计（`setDead({time, relays, total})`）、关 HUD/清播报、`M("dead")`；dead 态逐帧把 `post.saturation→0.12`、`fade→0.55`，`u>1.5s` 才 `menus.show("dead")`（先黑屏一拍再出菜单），audio intensity 0.15 |
| playing → complete | 撤离达成 `ee()`：`player.invulnerable=true`、锁操作、`events.emit("extraction:reached")`、播报 done 台词、算结算 → `M("complete")`；`u>3.3s` 才 `menus.show("complete")`，`fade→0.72`、`saturation→t*0.7` |
| dead → intro | 「重试」（`retry`）：`retries++` + `U({quick:true, keepRetries:true})` |
| complete → intro | 「再次出击」（`redeploy`）：`U({quick:true})`（retries 归零） |
| paused → intro | 「重新开始任务」（`restart`）：`retries++` + 同 retry 路径 |

辅助：`start({skipIntro, quick})`（外部/截图用，跳过 intro 直接 `T()`）、`pause()/resume()`、`debugCut()`（直接切断下一个中继，调试用）。

### 3.3 主循环的门控（`QC` 内）

```js
d = t.game.update(p) !== !1 && state !== "title" && state !== "paused"
// d 为真才 update: player / weapon / enemies
// 非 paused 才 update: fx / ground / level / backdrop / mats
// 永远 update: input / audio / hud / render.frame
```
`mM.update` 自身返回值：`title` 返回 `false`（还顺带驱动标题运镜）；`paused` 返回 `false`；`intro/playing/dead/complete` 返回 `true`（intro/dead/complete 期间世界继续跑，只有暂停才冻结 player/enemies）。标题运镜 `z()`：沿 `level.cinematicPath` Catmull-Rom（无路径则用 playerStart 拼两点），循环周期 `max(26, len/titleSpeed)`，`titleFov=50`，带轻微手持噪声与 `post.fade` 进出。

## 4. 任务目标系统（中继 → 撤离）

### 4.1 数据来源与重置

- `H()`（run 重置）：清敌人（`enemies.clear()`）、清特效、`combat.reset()`、`weapon.reset()`、时间/波次/追踪计时清零，然后把 `level.objectives` 映射成运行态中继：
  `{o(原目标), id, short(取 id 末位字母，缺省 A/B/C), t(进度0~1), cut, cutting}`，逐个 `userData.setState("live")`（`O()` 调用 level 侧中继道具的状态机：live/cutting/cut），`hud.setRelays(0, 3)`。
- 3 处中继来自 level 模块（04-level：堆场/仓库/码头各 1，短名甲/乙/丙 → 这里取 id 末位）。

### 4.2 交互与切断（`$()` / `ue()` / `me()`）

- **可交互判定 `$()`**：最近的未切断中继，满足 水平距离 ≤ `interactRange` 2.2m、垂直差 ≤ 2.5m、且朝向点积 ≥ `interactFacing` 0.45（0.9m 外才要求朝向）。
- **按住 E 切断 `ue(dt)`**：`input.down("interact")` 时 `L.t += dt / cutSeconds`（2.4s 满），每帧 `events.emit("objective:progress", {id, t})` 并 `userData.setState("cutting")`；松手则 `t -= dt*1.6` 回退（松手比按住快 60%），回到 "live"。同时 `hud.setPrompt("切断中继 X", t)` 画按住进度环。
- **切断完成 `me(L)`**：`cut++`、`setState("cut")`、`events.emit("objective:done", {id, index, total})`、`hud.setRelays(cut, total)`、`player.addShake(.18)`、**触发波次 `F(cut-1)`**、播报台词、刷新目标文案与地图标记；`cut >= total` 时 `allCut=true`、`pursuitLeft = pursuitExtra(5)`、`pursuitT=12`、`events.emit("objective:all")`、播报 all 台词。
- **目标文案 `D()`**：`allCut → "前往撤离艇"`；`cut==0 → "切断三处上行中继"`；剩 1 处 → `"切断最后一处中继"`；否则 `"切断剩余 N 处中继"`。`setObjective` 触发 HUD 打字机（46 字符/s）+ flash 动画。

### 4.3 撤离判定

- `level.extraction = {pos, radius(默认2.5)}`；水平进入 radius 且垂直差 <3.5：
  - `allCut && player.alive` → `ee()` 走结算（§3.2）；
  - 未切完 → 提示 `"中继尚未断开，撤离艇无法在火力下接应"`（`extractHint` 冷却 8s 防复读）。

### 4.4 目标追踪 HUD 数据流

```
level.objectives ──H()──▶ run.relays[] ──q()──▶ hud.setMarkers([{id,short,label,pos,kind:"relay"}…])
                                                  （allCut 后追加 {kind:"extract", short:"撤离", label:"撤离艇"}）
hud.update(dt) 每帧：
  罗盘条：marker 与玩家方位差 → translate3d 夹在 ±(罗盘宽/2-14)，超限加 .edge
  世界标记：pos+(kind==extract?1.2:1.9) → project(camera)，出画夹到 0.9/0.82 边界 → .offscreen
  距离：<1m 取整更新 "N米"；<3m 加 .near；准星中心 0.16 椭圆内加 .dim（与 ADS 互斥：ads≥0.5 时整组 .off）
```

## 5. 敌人系统

### 5.1 两种敌人（注意：turret/antenna/beacon/gimbalYaw 是**骨骼名**，不是独立敌人类型）

| type | 中文 | 形态 | 建模函数 | 对象池 |
|---|---|---|---|---|
| `gull` | 机械飞鸥 | 四旋翼无人机，云台枪 + 探照灯 + 红绿白频闪 | `j_()`（双 rig：本体 + `disc`转子盘/`cone`灯光锥 extra） | `poolGulls = 10` |
| `hound` | 机械猎犬 | 四足步行平台，背负炮塔 + 天线 + 信标灯 | `Z_()`（骨：root/body/neck/head/turret/gun/antenna/beacon + 4×abd/thigh/shin） | `poolHounds = 8` |

- 每只敌人都有编号 stencil 标签：gull `"G-11…"（id+11）`、hound `"H-03…"（id+3）`，贴在机身两侧。
- hound 身上的 `beacon` 骨骼按节奏闪（巡逻 0.8、交战 2.2 频率）；gull 的 `strobeG/R/W` 频闪 + `lamp` 探照灯（锥体是自写 GLSL `zn` ShaderMaterial，随 `gimbalYaw`/`ball` 骨骼指向）。

### 5.2 感知与警戒（`Em` 内共享 `think()`）

- 视觉：`sightRange=45m`、水平锥 `sightCone=200°`（`BC=cos(100°)`）、近身 3.5m 无视锥角；`physics.lineOfSight` 判遮挡；采样周期 0.11~0.19s。
- 视线持续 `seeT > (patrol ? 阈值 : 阈值*0.45)`（gull 阈值 0.4s、hound 0.55s，`Q_`/`iM` 调 `think(d, dt, C)`）→ `mode="engage"` + `enemy:alert` + `rally()`（18m 内同伴转 investigate）。
- 丢失视线 `noSeeT > loseSight(4s)` 或玩家死亡 → `search`，`modeT = searchTime(8)+rand*3`，超时回 `patrol` 并把 home 挪到当前位置。
- 曝光 `exposure`：看见 +0.1/s、丢失 −0.45/s，直接影响散布（`spreadFar+(spreadNear-spreadFar)*exposure`）。
- 听觉：`weapon:fire` 事件（0.3s 节流）→ `alert(开火点, hearRadius=45)`；`explosion` → `alert(pos, 30)`；`alert` 让 40~90m 内敌人转 investigate（`modeT=9+rand*4`），巡逻中的发 `enemy:alert {noise:true}`。
- 被击中 `provoke()`：直接转 investigate + 20m rally。
- **攻击令牌**：同时开火者上限 `maxTokens=2`（存活 >5 时 3），两次开火最小间隔 `tokenGap=1.25s`，且同类型连发后 0.5s 内不给另一只（轮换 gull/hound）——防"齐射秒杀玩家"。`requestToken/releaseToken` 管理。
- `game:state` 到 `title` 时 `clear()` 全清。

### 5.3 gull 行为（`Q_`，飞行）

- 模式：`patrol`（绕 home 半径 `patrolR` 4~9m 慢旋）→ `investigate/search`（绕 lastKnown 4.5m）→ `engage`（环绕玩家：`orbitR∈[12,25]`、高度 `alt∈[4,8]`，每 3~8s 随机换向/改半径；丢失目标 1.5s 后扑向 lastKnown）。
- 飞行物理：PD 控制加速度 `accel=11` 限速（巡逻 3 / 交战 8），三向 feeler 射线避障（前方/地面/天花板各 1/3 帧轮询），贴地 `groundHeight+1.1`，受伤半血后晃动加抖动。
- 攻击状态机 `atk`：`idle → tele（telegraph 0.55s，lens 变红 UC=[14,1,.35]，emit `enemy:telegraph`）→ burst（3 发 bolt，gap 0.12s，带提前量 lead 0.2~0.85，散布按 exposure+玩家移速）→ idle（cooldown 1.9~3.3s）`。前置条件：engage + LOS + 冷却好 + 朝向差 <0.35 + 距离 < `fireRange` 42m + 拿到令牌。
- bolt：`fireBolt()` 从 32 个实例化槽取一个（速度 70、寿命 1.3s），每帧射线检测（世界命中 → `impact` 事件；`HC()` 线段-玩家胶囊距离² < 0.36² → `player.damage(boltDamage=7)`）。
- 死亡 `v()`：随机掉一个转子（缩到 1e-4）、火焰+黑烟、自旋坠落 5s 或落地 → `combat.explode(pos, 半径3, 伤害30, "enemy")` + `retire`；emit `enemy:killed {type:"gull"}`。
- 半血 `<50%` 冒烟（色 2500652）+ 散布 ×1.5。
- 附带：最近的一只活 gull 的探照灯从 `render.lightPool` 租一盏灯，沿 `yaw+gy/gp` 射线 14m 打在场景上（`H()`，0.1s 更新）。

### 5.4 hound 行为（`iM`，四足）

- 移动：`physics.nav.findPath` 寻路（0.6s 重规划），到达判定 0.45m，转弯角差 >1.1rad 时停步转向；卡死 0.5s 重新规划；同类间 1.7m、与玩家 1.25m 排斥推挤。
- 交战子状态机 `es`：
  - `move`：跑向 `firePos`（`w()` 评分选点：优先 `level.coverPoints`（−2 分）、玩家周围 7 个 nav 随机点、玩家背后 5 个环形点；扣分项=太近/太远/不可行走/无 LOS(+22)/与同伴射线夹角 >0.86 重叠(+14)/距同伴 <3m(+16)），跑到射程 [7,20] 内或有 LOS 且超时 → `aim`；
  - `aim/cool`：面向玩家，`cool` 好且朝向差 <0.14 → 拿令牌 → `tele`（0.5s 预警）→ `burst`（4 发 hitscan，gap 0.11s，伤害 5，`combat.enemyShot` 判定，tracer 260m/s 橙色 16760944）→ 打 1~2 轮 → `move` 重新选位；
  - `wind → lunge → recover`：距离 < `lungeRange` 3m 且 `lungeCd` 3.5s 好 → 0.28s 蓄力（`enemy:telegraph {melee:true}`）→ 9.5m/s 冲刺 0.36s，<1.35m 命中 `player.damage(15)` + `enemy:melee` → 0.55s 恢复。
- 步态：四足分对角两对 `wm=[[0,3],[1,2]]`，按前瞻落脚点误差选对，抬腿弧 `lift`，落脚 emit `enemy:step`（脚步声）；身体姿态是 6 个弹簧阻尼器（`xa()`：sY/sP/sR/sL/sA/sA2）拟合足端高度差 → pitch/roll/升降，antenna 随惯性摆。
- 腿部 IK：`q_()` 双骨解算写 `abd/hip/knee` 角（大腿 L1=0.4、小腿 L2=0.42）。
- **弱点**：`_raycast` 先测头部球（`sM` 半径 0.155）→ `part:"weak"`；再测两段身体胶囊（`nM`）→ `part:"body"`。受伤时按冲量方向给弹簧速度（weak 时 pitch 冲量 ×1.6），emit `enemy:hit`。
- 半血（`smokeBelow=0.4`）冒烟（色 2303272）。
- 死亡 `q()`：emit `enemy:killed`、`addWreck`（残骸队列上限 `maxWrecks=5`，超了让最老的下沉 3.2s 后 `retire`）；尸体 2.2s 内重力塌落 + 四足滑开，6.5s 冒烟，`sink>0` 时缓慢下沉。

### 5.5 波次机制（`Yi` + `F/X/ie`）

| 时机 | 行为 |
|---|---|
| 每次切断中继 | `F(cut-1)` 取 `Yi.waves[min(idx,2)]`：`[{gull:3,hound:1}, {gull:3,hound:2}, {gull:4,hound:3}]`；类型交错插入队列（hound 插在 1,3,5…位），每只 `at = time + 1.6 + 序号*0.85s` 错峰；`waveHot=30`；HUD 警告 `"发现敌情 · 东北方…"`（按所有刷怪点相对玩家的合向量算 8 方位，`jC` 表） |
| 开局 | `ie()` 巡逻配置 `patrol:{gull:2, hound:1}`，`minDist:32m` 远点 + 视线外优先刷 |
| 每帧 `X(dt)` | 队列到点出怪：`aliveCount >= maxAlive(9)` 则推迟 1s；`enemies.spawn` 失败重试 ≤6 次（每次 +1.5s）；成功一只就 `enemies.alert(player.pos, 60)` |
| `allCut` 后追猎 | 每 `pursuitEvery(7s)` 且存活 `< pursuitMinAlive(4)`、队列空时补 1 只（60% gull），共 `pursuitExtra(5)` 只；且每 4s `alert(pos, 90)` 维持高压 |
| 刷怪点选择 `Q()` | 从 `level.enemySpawns`（按 type 过滤 `air/ground`）打分：≥18m 加分、6s 内用过的点 −3、看不见玩家 +2.5；没有合格点就玩家 26m 外圆周随机（夹在场地范围内），gull 强制高度 ≥2.5（默认 6~9m） |

音频强度 `intensity`：`allCut/队列未空/(waveHot>0 且有活敌)` → 1；`alertT>0`（受击 8s/警戒 10s 衰减）或 26m 内有敌人 → 0.6；否则 0.15。

### 5.6 台词表 `_l`

| key | 文本 | 触发 |
|---|---|---|
| `intro` | 几猫队员，这里是指挥中心。港区主控已封锁泊位。切断堆场、仓库、码头的三处中继。 | intro 1.3s |
| `contact` | 你已被发现！空中有机械飞鸥，地面有机械猎犬。消灭它们。 | 首次 `enemy:alert`（3.2s） |
| `cut[0/1]` | 第一/二处中继已断开。… | 切断第 1/2 处（3.6s） |
| `all` | 三处中继全部断开！撤离艇在码头南端的舷梯旁，快撤！ | 第 3 处（4.5s） |
| `low` | 伤势严重！找掩体躲避，稍作恢复。 | health<30（一次性，3s） |
| `done` | 几猫队员已登船，港区封锁解除。干得漂亮！ | 撤离（2.2s） |

（另有 `player:rescued` → 消息 `"已从水中获救"`；鼠标锁丢失/拖拽模式提示走 `o.message(r.describeMode())`。）

### 5.7 `create()` 返回的 API（`U`）

| 字段/方法 | 说明 |
|---|---|
| `list` | 活跃敌人数组（含池内对象被 activate 后 push 进来） |
| `TUNE` | 即 `Ui` 调参表 |
| `spawn(type, pos, opts)` | 从池取 inactive 激活；opts：`{state:"alert"?, target?, yaw?, hover?, patrolRadius?, patrolLine?, passive?, hidden…}`；hound 池尽时回收最老残骸；emit `enemy:spawn`；失败返回 null |
| `raycast(origin, dir, maxDist=300)` | 命中敌人返回 `{dist, point, normal, enemy, part}`（包围粗筛 1.7 + 各自 `_raycast` 细测，gull 球体 y×2.3 拉伸、hound 头/身分件） |
| `aliveCount()` | 存活数（波次/强度用） |
| `clear()` | 全部 deactivate、清队列/残骸/bolt/令牌/灯 |
| `alert(pos, radius=40)` | 噪音警戒（见 §5.2） |
| `update(dt)` | dt 截 0.05s；更新玩家移速平滑 → 逐敌 `_update` → bolt 模拟 `_()` → 聚光灯 `H()` |
| `debug` | `{ctx, gulls, hounds, wrecks, bolts, mats, tris}`（tris：gull 含 extra、hound 单体） |

敌人对象公共字段（两族同构）：`id/type/pos/alive/hp/active/rig/lens/yaw/mode(engage|investigate|search|patrol)/los/seeT/noSeeT/exposure/passive/hasToken/damage()/_activate()/_deactivate()/_raycast()/_update()`。

## 6. rig 骨骼系统（`iu` class）

### 6.1 API

| 方法 | 语义 |
|---|---|
| `bone(name, parent, x=0, y=0, z=0)` | 注册骨骼：`parent` 用名字引用（不存在抛 `"rig: unknown parent bone"`），记录 `local` 与累加的 `world`（父 world + local）、`i` 索引 |
| `add(slot, bone, geometry, scale=[1,1,1], shade=true)` | 把几何挂到某骨骼：删掉除 position/normal/uv 外的属性（清色/法线外的自定义属性）、补 uv、**整体平移到骨骼 world 位置**；为每顶点写 `color`（`shade` 时按法线 y 做 `0.74+0.26*(ny*0.5+0.5)` 的顶光渐变 × scale 色）、`skinIndex`（全绑当前骨）、`skinWeight`（全 1）；按 slot 分桶（首现顺序记入 `order`） |
| `build(order?)` | 按 slot 顺序把各桶几何统一 toNonIndexed 后 `sa()` 合并（即 three 的 mergeGeometries），算包围球/盒，返回 `{geometry, slots, bones, tris}` |

### 6.2 配套函数

- `pm(rigDef, materials, {castShadow, receiveShadow, radius, center, extra})`：按 `bones[]` 建 `Fa`(Bone) 层级 → 合并几何建 `ka`(SkinnedMesh) → `k0`(Skeleton) bind → 手动设 boundingSphere/Box（供射线/剔除），返回 `{group, mesh, bones(按名索引), skeleton, extraMesh}`；`extra` 用于 gull 的转子盘/灯光锥第二个网格（`bindMatrix` 共享同一 skeleton，renderOrder=5）。
- `q_(out, target…, L1, L2)`：平面双骨 IK，写 `abd`（髋外摆）、`reach`、`hip`、`knee` 角，供 hound 四腿。

### 6.3 用在什么模型上

| rig 构建 | 骨骼树 | 槽位 | 用途 |
|---|---|---|---|
| `Z_()` hound | root→body→{neck→head, turret→gun, antenna, beacon} + 4×(abd→thigh→shin) | `["shell","metal","glow","lens"]` | 四足猎犬整机（约几百个 primitive 拼装：装甲壳/散热格栅/炮管/天线杆/信标灯/脚掌） |
| `j_()` gull | root→body→{rotor0-3, gimbalYaw→ball→lamp, gun, strobeG/R/W}；**两套 rig**（本体 e + extra t） | 本体 `["shell","metal","glow","lens"]`、extra `["disc","cone"]` | 四旋翼飞鸥（旋翼盘 disc、探照灯锥 cone 走自写 shader） |

两者都由 `Em()` 各建一份模板（`f = j_()`、`p = Z_()`），池内每只 `Q_(h, f, u, i)` / `iM(h, p, u, i)` 克隆装配（`pm`），材质表 `u = {shell, metal, glow(顶点色自发光), lensBase, disc, cone}` 来自 `mats.get("armor_white"/"gunmetal", {triplanar, vertexColors})`。

## 7. TUNE 常量表

### 7.1 `Ui`（导出的 TUNE，敌人全局）

| 键 | 值 | 含义 |
|---|---|---|
| `sightRange` | 45 | 视觉半径 m |
| `sightCone` | 200 | 视锥角（度），半角余弦预计算 `BC` |
| `loseSight` | 4 | 丢失视线转 search 的秒数 |
| `searchTime` | 8 | 搜索单位时长（+0~3s 随机） |
| `hearRadius` | 45 | 开火噪音警戒半径 |
| `maxTokens` / `maxTokensCrowd` | 2 / 3 | 同时可开火数（存活>5 用 3） |
| `tokenGap` | 1.25 | 两次开火授权最小间隔 s |
| `exposureUp` / `exposureDown` | 0.1 / 0.45 | 曝光（散布系数）增减速 /s |
| `poolGulls` / `poolHounds` | 10 / 8 | 对象池大小 |
| `maxWrecks` | 5 | hound 残骸队列上限 |
| `maxBolts` | 32 | gull 能量弹实例池 |
| `gull` / `hound` | Zv / Kv | 分族调参（下表） |

### 7.2 `Zv` = gull

| 键 | 值 | 含义 |
|---|---|---|
| `hp` | 45 | 生命 |
| `boltDamage` / `boltSpeed` | 7 / 70 | 弹伤 / 弹速 m/s |
| `burst` / `burstGap` | 3 / 0.12 | 连发数 / 发间隔 s |
| `telegraph` | 0.55 | 开火预警 s |
| `cooldown` | [1.9, 3.3] | 轮间隔随机区间 s |
| `rangeMin` / `rangeMax` | 12 / 25 | 环绕半径 m |
| `altMin` / `altMax` | 4 / 8 | 飞行高度 m |
| `maxSpeed` / `patrolSpeed` / `accel` | 8 / 3 / 11 | 限速与加速度 |
| `spreadFar` / `spreadNear` | 0.065 / 0.018 | 满/零曝光散布 rad |
| `fireRange` | 42 | 可开火距离 m |
| `explodeRadius` / `explodeDamage` | 3 / 30 | 坠毁爆炸半径 m / 伤（`"enemy"` 阵营） |

### 7.3 `Kv` = hound

| 键 | 值 | 含义 |
|---|---|---|
| `hp` | 140 | 生命（血厚 3 倍于 gull） |
| `shotDamage` / `burst` / `burstGap` | 5 / 4 / 0.11 | hitscan 单发伤 / 连发 / 间隔 |
| `telegraph` / `cooldown` | 0.5 / [1.8, 3] | 预警 / 轮间隔 |
| `runSpeed` / `stalkSpeed` / `patrolSpeed` | 4.5 / 2 / 1.5 | 交战跑动 / 近距离潜行 / 巡逻 m/s |
| `accel` / `turnRate` | 7 / 2.5 | 加速度 / 转向 rad/s |
| `rangeMin` / `rangeMax` | 8 / 18 | 火力带 m |
| `spreadFar` / `spreadNear` | 0.12 / 0.045 | 散布 |
| `lungeRange` / `lungeDamage` / `lungeCooldown` / `lungeSpeed` | 3 / 15 / 3.5 / 9.5 | 扑咬 距离/伤/CD/速度 |
| `replan` | 0.6 | 寻路重规划间隔 s |
| `smokeBelow` | 0.4 | 低于此血量比例冒烟 |

### 7.4 `Yi`（流程 TUNE，挂在 `game.flow`）

| 键 | 值 | 含义 |
|---|---|---|
| `introSeconds` / `retryIntroSeconds` | 3.5 / 1.3 | 首次/重试开场镜头时长 s |
| `interactRange` / `interactFacing` | 2.2 / 0.45 | 交互距离 m / 最小朝向点积 |
| `cutSeconds` | 2.4 | 按住 E 切断中继所需秒数 |
| `patrol` | `{gull:2, hound:1}` | 开局巡逻配置 |
| `waves` | 3 组 | 三次切断各触发的刷怪配额（§5.5） |
| `maxAlive` | 9 | 同屏存活上限 |
| `spawnStagger` / `spawnFar` | 0.85 / 18 | 波次内错峰 s / 刷怪最小距离 m |
| `pursuitEvery` / `pursuitMinAlive` / `pursuitExtra` | 7 / 4 / 5 | 撤离阶段追猎：间隔 s / 触发所需存活以下 / 总补怪数 |
| `titleSpeed` / `titleFov` | 1.15 / 50 | 标题运镜速度倍率 / 标题 FOV |

### 7.5 其它常量

| 符号 | 值 | 含义 |
|---|---|---|
| `XC`（设置默认） | `{quality:"auto", sens:1, invertY:false, volume:.8, fov:Pi.fov(74)}` | localStorage key `saltline.settings.v1`；sens 夹 [0.2,3]、volume [0,1]、fov [60,95]、quality ∈ auto/low/medium/high/ultra（`dM`） |
| `tx` / `nx` / `WC` | 4 / −90 / 450 | 罗盘条 像素每度 / 起始角 / 终止角（−90°~450° 共 540° 覆盖，`GC` 标注 北/东北/东…） |
| `ix` | 2π×19 ≈ 119.38 | 交互进度环周长（stroke-dasharray） |
| `jC` | 北方/东北方/…/西北方 | 敌情方位文案 8 向 |
| 评级阈值 | 见 §9 | `time<270→2分, <400→1分`；`acc≥.5→2, ≥.3→1`；`retries==0→1` |

## 8. UI / HUD 清单与数据绑定

### 8.1 HUD（`hM()`，挂在 `#ui` 下，`aria-hidden`）

| 元素（class） | 内容 / 字符串 | 数据绑定（`update(dt)` 逐帧，带脏检查缓存 `X`） |
|---|---|---|
| `.h-compass`（`.h-tape`/`.h-needle`/`.h-cmarks`/`.h-heading`） | 刻度条 + 中文方位 + 三位航向数字 | `player.yaw` → 航向 `round(-yaw*180/π)%360`；tape 按 4px/° 平移 |
| `.h-obj`（`.h-k`"任务目标" / `.h-obj-t` / `.h-relays`） | 目标文案 + 3 个中继方点 + `0/3` | `setObjective`（打字机 46 字/s + flash）；`setRelays(done,total)` 点加 `.cut`、满 `.all` |
| `.h-warn` | 波次警告（`发现敌情 · 方位`） | `warn(text, secs=3)` 重挂动画 |
| `.h-arcs`（4×`.h-arc` SVG） | 受击方向弧 | `player:hit {fromPos}` → 相对玩家方位旋转 + 生命 1.5s 衰减透明 |
| `.h-cross`（c-t/c-b/c-l/c-r/c-dot） | 动态准星 | 可见条件 `ads≤0.6 && alive && state!=="reloading_hidden"`；间距 = `tan(spread)/tan(fov/2)*(h/2)+4(+10 冲刺)` 夹 [4,70] |
| `.h-hit`（4 i） | 命中标记 | `player:hitEnemy` → `hitmarker(kill/weak/hit)` WAAPI 动画（kill 420ms、weak/kill 放大 1.5） |
| `.h-prompt`（进度环 + `.h-key` + `.h-plabel`） | `"按住 E · 切断中继 A"` | `setPrompt(text, t0~1)`；按键随环境：touch→`交互`、手柄未锁→`Y`、否则 `E`；同时 `input.setPrompt()` |
| `.h-feed` | 击杀条 `"<b>机械飞鸥</b> 已摧毁"`（最多 4 条、4.2s） | `enemy:killed`（gull→机械飞鸥 / hound→机械猎犬 / 其它→机械守卫）；同帧 `player:hitEnemy {killed,weak}` 追加 `<em>弱点命中</em>` |
| `.h-msg` | 居中消息（鼠标模式提示、"已从水中获救"、撤离警告…） | `message(text, secs=3)` |
| `.h-health`（`.h-k`"生命状态" + 数字 + 10 段条） | 血量 | `player.health/maxHealth`；≤3 段 `.crit`；掉血时 `.on` 高亮 |
| `.h-ammo`（`.h-cue` + 数字 + 备弹 + pips + 武器名） | 弹药 | `weapon.magSize/ammo/reserve/name/state`；pips 1~60 个；cue：`换弹中` / `R · 换弹`（touch 为 `换弹`）/ `弹药耗尽` / `弹药不足`（≤27% 弹匣）；`low`/`urgent` 样式 |
| `.h-marks` + `.h-cmarks` 里的 `.h-cm/.h-wm` | 世界/罗盘双套标记 | 见 §4.4 |
| `.comms`（`.comms-who`"指挥中心" + `.comms-t`） | 无线电打字机 | `radio(text, secs=4.5)` 队列，58 字符/s 打出、停 4.5s 换下一条；每条 emit `radio:line {text}`（供字幕/音效） |

HUD API 汇总：`show/setObjective/setRelays/setMarkers/setPrompt/radio/clearRadio/warn/message/feed/hitmarker/reset/update`。

### 8.2 菜单（`pM()`，`.menu` 根，`data-screen`）

| 屏幕 | 字符串要点 |
|---|---|
| `title`（`m-title`） | `B4` + `几猫突击小队` + `几猫港区 · 05:42`；主标题 `几猫` + `3A大作`；前提句 `港区防御系统失控。切断三处中继，突破封锁，登船撤离。`；按钮 `开始行动/设置/项目介绍/操作说明`（`m-only-narrow`）；注脚 `使用 Fable5.2 自主研发 · 国产第一人称射击游戏 · 开发体验版`；右侧操作速览 legend（键位/触屏两版） |
| `paused`（`m-card`） | `行动暂时中止` / `已暂停` / `继续游戏·设置·操作说明·重新开始任务`；`.m-line[data-f=lookmode]` 显示当前鼠标模式文案 |
| `dead`（`m-dead`） | `突击队员倒下` / `信号中断`；统计 `生存时间`(dead-time) `已切断中继`(dead-relays `0/3`)；按钮 `重试` |
| `complete`（`m-debrief`） | `四号泊位 · 行动简报` / `几猫港区已解除封锁`；`行动评级`(rating)；统计 `用时`(time) `命中率`(acc) `摧毁机械`(kills) `重试次数`(retries)；按钮 `再次出击` |
| `.panel`（tab：设置/操作说明/项目介绍） | 设置：`画面质量`(低/中/高/极高 seg)、`鼠标灵敏度`(0.2~3)、`反转垂直视角`、`主音量`、`视野范围`(60~95°)、`显示模式`(全屏，不支持时隐藏)、画质说明 note；操作说明：键盘 `$C`（移动/视角/开火/瞄准/换弹/`切断中继 按住E`/跳跃/冲刺/蹲伏/近战/暂停）+ 触屏 `ZC` + 手柄一段；项目介绍：`几猫3A大作` 宣传文案（Fable5.2 自研…） |
| `.loc-card` | `几猫港区 · 四号泊位 · 05:42` / `几猫突击小队 · 单兵行动，无人支援`（intro 0.5s 弹出、结束收起） |

菜单 API：`root/settings/fmtTime/screen/panelOpen/closePanel/show(U)/locationCard(on)/setLookMode/setDead({time,relays,total})/setDebrief({time,accuracy,kills,retries,rating})/applySettings`。按钮点击 emit `ui:click`、悬停 emit `ui:hover`（供 UI 音效）；设置改动即写 localStorage 并 `applySettings`（sens/invertY→input，volume→audio，fov→player.setFov，quality→render.setQuality(Pr 预设)）。

### 8.3 交互事件一览（HUD/菜单监听）

`player:hitEnemy`（标）、`enemy:killed`（feed）、`player:hit`（方向弧）、`radio:line`、`ui:click`、`ui:hover`、`input:lock`、`visibilitychange`、`keydown(Enter/Esc/Tab 焦点圈)`、`resize`。

## 9. 结算统计字段

**死亡屏 `setDead`**：`time`（生存时间，`fmtTime` mm:ss）、`relays/total`（已切断中继 `N/3`）。

**简报屏 `setDebrief`**：

| 字段 | 来源 | 显示 |
|---|---|---|
| `time` | `run.time`（playing 态累计） | `用时` mm:ss |
| `accuracy` | `combat.stats.hits / combat.stats.shots`（shots=0 → `null` 显示 `—`） | `命中率` `Math.round(acc*100)%` |
| `kills` | `combat.stats.kills` | `摧毁机械` |
| `retries` | `run.retries`（每次 retry/restart +1，redeploy 归零） | `重试次数` |
| `rating` | `score = (time<270?2:time<400?1:0) + (acc≥.5?2:acc≥.3?1:0) + (retries===0?1:0)`，index 0..5 → `["险象环生","火力全开","稳扎稳打","干净利落","精准果断","完美突击"]` | `行动评级` |

## 10. 对外接口与模块间调用图

### 10.1 本模块产出（给谁用）

```
ex(namespace) ── TUNE=Ui ──▶ 其它模块/调试读调参
               ── create=Em ──▶ QC 装配：t.enemies = await Em(t)
               ── showcase=VC ──▶ ?show=enemies 演示
QC（被 99-entry 调用）──▶ 全局 boot + 主循环
hM ──▶ t.hud；mM ──▶ t.game；pM ──▶ mM 内部 menus
```

### 10.2 消费的其它模块 API（按 ctx 字段）

| 依赖 | 使用点 |
|---|---|
| `render`（02，`Hg`） | `render.post.fade/saturation/flash`（转场/死亡去色）、`render.lightPool.acquire/flash`（gull 探照灯、枪口光）、`render.setQuality(Pr[q])`、主循环 `render.frame/onLevelReady/stats` |
| `level`（04，`C1`） | `objectives`（中继）、`extraction{pos,radius}`、`enemySpawns`（air/ground 刷怪点）、`coverPoints`（hound 选位）、`cinematicPath`（标题运镜）、`playerStart`、`interiorBoxes`（室内枪械湿度判定） |
| `weapons`（08，`dm`） | `reset/setVisible/update`、读 `magSize/ammo/reserve/name/state/spread`、`setWetness` |
| `player-fx`（07，`Cf`=fx、`x_`=player、`zv`=combat、`v_`=input、`c_`=audio） | fx：`sparks/debris/smoke/explosion/tracer/muzzleFlash/dust/clear`；player：`reset/pos/eye/forward/yaw/health/maxHealth/alive/damage/addShake/invulnerable/enabled/setFov`；combat：`reset/explode/enemyShot/stats{shots,hits,kills}`；input：`requestLock/exitLock/pressed("pause")/down("interact")/setPrompt/setGameplay/describeMode/onModeChange/mode/locked/touch/gamepad/sensitivity/invertY`；audio：`resume/setPaused/setIntensity/setVolume/loop("gull_rotor"/"hound_servo")` |
| `materials`（03/05，`Gg`/`pv`…） | `mats.get("armor_white"/"gunmetal",{triplanar,vertexColors})`、`mats.emissive`、`mats.label("G-11"/"H-03",{font:"stencil",distress})` |
| `physics`（03-textures `d3`） | `raycast/groundHeight/lineOfSight/nav.findPath/isWalkable/randomPoint/build` |
| `mats/quality` | `quality = zy(q)`、`Pi`（玩家常量，fov 默认 74）、`Pr`（画质预设表） |
| stubs `dr`（vendor 头） | showcase 模式下用 `dr.audio/weapon/enemies/hud/fx/ground/backdrop` 空实现顶替 |

### 10.3 发出的事件（供别的模块订阅）

`game:state {state,prev}`、`objective:progress {id,t}`、`objective:done {id,index,total}`、`objective:all`、`extraction:reached`、`enemy:spawn/hit/killed/telegraph/fire/melee/step/alert`、`impact`（bolt 撞墙，带 surface）、`radio:line {text}`、`ui:click`、`ui:hover`；并**订阅** `weapon:fire`、`explosion`（噪音警戒）、`player:hit/dead/rescued/hitEnemy`、`enemy:alert/killed`、`input:lock`。

### 10.4 启动顺序（`QC`，正常路径）

```
render(Hg) → mats(Gg) → physics.build → level(C1) → backdrop(pv) → ground(O1)
→ fx(Cf) → audio(c_) → player(x_) → combat(zv) → weapon(dm) → enemies(Em) → hud(hM) → game(mM)
→ render.onLevelReady → (?shot|?autostart 则 game.start({skipIntro:true})) → boot 淡出 → setAnimationLoop 主循环
```
失败兜底：模块级 `r()` 捕获后可用 `dr[name]()` 桩顶替（render/level 等关键模块 `d=!1` 直接抛）；全局 `bM()` 显示 `几猫启动失败：…`，`window.__errors/__fatal/__frames/__ready` 暴露给截图/bench。`?show=<name>` 走 showcase 支路（stub level + `gM[name].showcase`），`?bench` 起 `eP()` 性能面板（p99/fps/GPU/错误数）。

## 11. 关键发现速览

1. **玩法循环一句话**：主菜单开场运镜 → intro 播报 → 3 处中继各"按住 E 2.4s 切断"并各触发一波增援（3+1/3+2/4+3）→ 全切后进入 5 次追猎的撤离阶段 → 跑到码头南端撤离点触发结算（用时/命中率/击杀/重试 → 6 档评级），期间死亡走"信号中断"屏可无限重试。
2. 该模块一鱼四吃：敌人系统（`Em`）+ HUD（`hM`）+ 菜单设置（`pM`）+ 流程状态机（`mM`），外加**全量 boot/主循环 `QC`**——是拆分里职责最重的文件。
3. 敌人只有 gull/hound 两种，`turret/antenna/beacon/gimbalYaw` 是 hound/gull 身上的**骨骼名**；弱点击中只存在于 hound 头部球体（`part:"weak"`），gull 全身 `body`。
4. 开火"令牌"（2~3 个）+ 1.25s 全局限速 + 类型轮换，是防止敌人齐射秒人的核心节流设计。
5. hound 有完整的**掩体选位评分系统**（coverPoints 优先、LOS/重叠/距离罚分）与 hitscan 火力带 [8,18]m，gull 是弹道 bolt（32 实例池）+ 环绕飞行，两者 AI 手感截然不同。
6. 中继进度"松手回退 1.6×"、"0.9m 外要求朝向"是交互手感的两个隐藏参数；`objective:progress` 事件已预留（字幕/音效可用）。
7. 死亡/结算屏不是立即弹出：dead 等 1.5s（先去色黑屏）、complete 等 3.3s，配合 `post.saturation/fade` 渐变——复刻时别做成瞬切。
8. HUD 全部走"脏检查缓存 `X`"逐字段比对再写 DOM（含罗盘 px、pips 数组重建、标记 transform 拼串），是单文件里少见的性能自觉；`hM.update` 在 paused 也照跑（暂停时 HUD 隐藏但仍刷新）。
