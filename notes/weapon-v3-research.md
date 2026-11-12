# 武器 v3 / 冲刺模式 代码接入点调研（只读）

- 调研基线：`git rev-parse --short HEAD` = **fa552ad**（分支 `main`）
- 调研范围：`src/game/03-props.js`、`04-level.js`、`08-weapons.js`、`09-game-ui.js`、`src/vendor/three.min.js`（By）
- 关联契约：`notes/weapons-v2-spec.md`、`notes/04-level.md`、`notes/09-game-ui.md`、`notes/03-textures.md`（$g 道具一节）
- 结论时效判断：本次结论与上述文件强绑定；若后续改动 `04-level.js` 的 `E()/q()/C1()` 尾部、`08-weapons.js` 的 `dm()/dgBuild()/dgn()`、`09-game-ui.js` 的 `Yi/Em/mM`，需重查对应小节。

前置提醒：**「冲刺模式」在本项目里与已有的"冲刺"（Shift 疾跑，`sprint`）撞词**。代码里 `sprint/sprinting` 已大量占用（`07-player-fx.js:5146-5147`、`5713-5716`、`08-weapons.js:2881/2906`、HUD 准星 `09:2132` 的 `+10 冲刺`）。新玩法请统一用 `mode:"rush"`（或 `blitz`）内部键，UI 文案再写「冲刺模式」，否则读代码的人/AI 会把两种语义搞混。

---

## 1. 集装箱位置怎么枚举

### 结论（最短）

**用 `level.placed`**：它是 04 返回的游戏层 API 字段（`04-level.js:2020`），是一条**摆位账本**，每个道具一条 `{name, x, y, z, yaw}`，其中 `x/z` 已含 `stack()` 的抖动偏移、`y` 是该箱的**底面高度**、`yaw` 已含随机偏转与 `flip`。

```js
// 04-level.js:2020
placed: t.placed,
// 04-level.js:2010-2012 统计里已在用同一份账本
stats: { ..., containers: t.placed.filter(z => z.name.startsWith("container")).length, ... }
```

运行时取全部集装箱（含堆叠层，**y=0 的是最底层、可步行到达**）：

```js
const boxes = level.placed.filter(p => p.name.startsWith("container")); // 47 条
const ground = boxes.filter(p => p.y < 0.05);                           // 26 条（24 堆场 + 2 码头）
// ground[i] => { name:"container40", x, y:0, z, yaw }
```

账本数量（已实测统计，非估算）：`container20` 34、`container40` 11、`container40hc` 2，**合计 47**；其中堆场 44（24 个 `stack()` 调用）+ 码头 3（`stack(23.2,-28.6,…)` 2 箱、`stack(23,-25.95,…)` 1 箱）→ 最底层 26 个。

### 为什么其他三个思路都不行

| 候选 | 判定 | 依据 |
|---|---|---|
| **场景遍历匹配名字** | ❌ 不可行 | `By()`（`three.min.js` 内 `function By`，仅 `04-level.js:1871` 调用一次）把所有可合并 mesh 的 geometry `applyMatrix4(matrixWorld)` 后按材质并成一个 `level-merged`；**原物体不再进场景**。`staticRoot`（`04-level.js:1862-1872` 的 `ob()` 局部组）只被 merge 消费，C1 只把 `level-merged` 与 `dynRoot` 挂进 level 根组，`staticRoot` 既不进 scene 也不在返回 API 里。 |
| **props 注册表** | ❌ 无位置 | `$g` 的注册表 `Xg`（`03-props.js:44-48`）只存 builder 函数；`Gi`（`03-props.js:8-42`）只存尺寸/材质。builder 产物虽有 `userData.prop`（`03-props.js:59`）与 `name`，但物体已被 merge 销毁（仅内存里游离，无引用可拿）。 |
| **按 zones 网格近似** | ⚠️ 只能"大概" | `zones`（`04-level.js:1918-1935`）是 4 个矩形分区，颗粒度是整个堆场/仓库/码头；用作"随机撒点"可以，做"每个集装箱一把"会落进箱体内部或不可行走区。 |

### 关键代码摘录

```js
// 04-level.js:174-183  摆位唯一入口（04 内所有 place/stack 都走它）
function E(T, D, C, G = 0, j = {}, N = 0, Q = {}) {
    let K = i.props.build(T, j);
    return K.position.set(D, N, C), K.rotation.y = G, (Q.dynamic ? t : e).add(K), ...,
    o.push({ name: T, x: D, y: N, z: C, yaw: G }), K   // ← 账本 o 就是 placed
}

// 04-level.js:222-236  堆叠：y 逐层累加，x/z 带抖动 → 账本记录的是最终值
let ... me = E(ne, T + re, D + $, ue, { color: F, seed: Math.floor(a(1,99999)), ... }, N),
    ee = O[ne], B = H[ne], ...; Q.push(me), N += B;
```

```js
// 03-props.js:923 / 941  容器组确实有名字与尺寸，但只活在 merge 前
function M3(i, e, t = {}) { … return f.userData.color = h, f.userData.doors = r,
    qi(f, e, [p[0], p[1], p[2]], u.colliders.map(...)) }   // qi(i,e,…) 里 i.name = e → "container40"
```

### 落位实操要点（踩坑已核过源码）

1. **地面高度必须传对 `maxY`**。`spawnPickup(kind, x, z, mag, maxY)`（`08-weapons.js:3116-3123`）默认 `maxY=1.2`，而 `physics.groundHeight` 的筛选是 `z.max.y <= E`（`03-textures.js:2242` 附近的 `groundHeight` 实现）——箱顶 2.59/2.9 **大于 1.2 会被排除**，`gy` 回落到 0，武器就**生成在箱体内部被吞掉**。放箱顶必须 `maxY≈3.5`（或直接 `gy = p.y + 箱高` 自己算）。
2. **拾取判定只比 XZ、不比 Y**。`nearestPickup()`（`08-weapons.js:3164-3177`）用 `Math.hypot(p.pos.x-pp.x, p.pos.z-pp.z) <= 2.5`，站在箱体侧面同一 XZ 也能"捡到箱顶的枪"。若确实要放箱顶，建议顺手给该判定补 Y 差（例如 `|dy| < 1.6`），否则手感会很怪。
3. **朝向用 `p.yaw`**，箱子是 6.06/12.19 × 2.44 的长方体，把武器沿长轴偏一点能避免插进箱壁；尺寸常量在 04 里是模块私有（`H`/`O`，`04-level.js:207-216`），外部拿不到，自己在 v3 代码里写死 `{container20:6.06, container40:12.19, container40hc:12.19} × 2.44` 即可（`$g.PROP_SIZES` 的 `Gi` 也只有 `[长, 高, 宽]`，其中顺序是 `[X, Y, Z]`，长度是 0 位、宽是 2 位）。
4. **别把 47 个全放满**。47 个 pickup = 47 个自转模型 + 47 根 additive 光柱，全部常在场景里；建议只取最底层 26 个里的随机 N 个（8~12），或按类型去重（5 种枪 × 若干）。
5. 生成时机：**在 `resetAll()` 里**（`08-weapons.js:3212-3217`，每次 `deploy/retry/redeploy` 都经 `09:2710 H()` → `a(i.weapon,"reset")` 调到），不要只在 `dgn` 启动时的 `spawnInitial()`（`08-weapons.js:3223`）——那时还没有 mode。

---

## 2. 敌人数量在哪控制、怎么翻倍

### 结论（最短）

数量由 **7 个常量 + 1 个池上限** 决定，分布在两处：`Ui`（对象池，`09:1348-1365`）与 `Yi`（流程配额，`09:2527-2555`）。"数量翻倍"= 改这 6 个数：

| # | 常量 | 位置 | 现值 | 翻倍 |
|---|---|---|---|---|
| 1 | `Yi.patrol` | `09:2533-2536` | `{gull:2, hound:1}` | `{gull:4, hound:2}` |
| 2 | `Yi.waves` | `09:2537-2546` | `[{3,1},{3,2},{4,3}]` | `[{6,2},{6,4},{8,6}]` |
| 3 | `Yi.maxAlive`（同屏上限） | `09:2547` | `9` | `18` |
| 4 | `Yi.pursuitExtra`（撤离追猎总量） | `09:2552` | `5` | `10` |
| 5 | `Yi.pursuitMinAlive`（补怪阈值） | `09:2551` | `4` | `8`（否则补怪触发条件变松=不补） |
| 6 | `Ui.poolGulls` / `Ui.poolHounds`（**硬上限，务必同步**） | `09:1361-1362` | `10 / 8` | `20 / 16` |
| 7 | `Yi.spawnStagger`（错峰节奏，可选） | `09:2548` | `.85` | `.45`（不加则双倍数量铺开时间也翻倍） |

**刷怪点总数不用也不该改**：`level.enemySpawns` 是 42 条（`04-level.js:1917`，实点：`g(` 25 条 ground + `x(` 17 条 air），翻倍靠"同点复用 + 距离/冷却打分"，`Q()`（`09:2803-2842`）里 `c.used` 有 6 秒冷却 `(09:2822-2823)`，不会重复踩同一点。

**令牌上限建议不改**：`Ui.maxTokens=2 / maxTokensCrowd=3`（`09:1356-1357`，`requestToken` 在 `09:1464-1473` 用 `存活>5 ? 3 : 2`）——这是防"齐射秒人"的核心节流。翻倍后存活数天然 >5，自动走 3，已比现在更凶；再放开会变成不公平。同理 `maxBolts=32`（`09:1364`）与 gull 每轮 3 发（`Zv.burst=3`）在数量翻倍后会更快耗尽，可能出现"有敌无弹"的软性降难度，属于可接受范围，但要知道它存在。

### 关键代码摘录

```js
// 09-game-ui.js:2527-2555  Yi（流程 TUNE，挂在 game.flow）
var Yi = { …, patrol: { gull: 2, hound: 1 },
  waves: [{gull:3,hound:1},{gull:3,hound:2},{gull:4,hound:3}],
  maxAlive: 9, spawnStagger: .85, spawnFar: 18,
  pursuitEvery: 7, pursuitMinAlive: 4, pursuitExtra: 5, … };

// 09-game-ui.js:2854-2864  开局巡逻编队（唯一"初始刷怪数量"来源）
function ie() { let P = s.playerStart…;
  for (let V of ["gull","hound"]) for (let Y = 0; Y < Yi.patrol[V]; Y++)
      K(V, Q(V, {minDist:32, …}), {state:"patrol"}) }

// 09-game-ui.js:2866-2883  每次切断中继触发的波次配额（me() 里 F(cut-1)）
function F(P) { let V = Yi.waves[Math.min(P, Yi.waves.length-1)], …
  for (…V.gull…) Y.push("gull"); for (…V.hound…) Y.splice(…, 0, "hound"); … }

// 09-game-ui.js:2885-2903  出怪门控：同屏上限 + 池尽静默丢弃
if (V >= Yi.maxAlive) { L.at = c.time + 1; continue }
if (!K(L.type, L.pos, {state:"alert", target:n.pos}) && !i.enemies.stub && (L.tries=(L.tries||0)+1) < 6) { L.at=c.time+1.5; continue }
c.queue.splice(Y, 1), …
```

### 三个必须知道的机制细节

1. **池大小是启动期固定的**。`Em(i)` 在 boot 时按 `Ui.poolGulls/poolHounds` 建池（`09:1535-1542`：`for (T=0; T<Ui.poolGulls; T++) d.push(Q_(…))`，hound 同构），此后 `spawn()`（`09:1641-1656`）只在 `d`/`v` 里找 `!active`。**池不够时 spawn 返回 null**，而 `X()` 重试 6 次后走 `c.queue.splice(Y,1)` —— **静默丢掉这只怪，不报错**。所以"翻倍"必须同时抬池，否则你会看到"波次说 6 只、实际只出来 3 只"且无任何日志。
2. **池扩容有两条路**：(a) 启动即按 2 倍建池（简单，代价 = 多 10 个 gull + 8 个 hound 的完整 rig 克隆常驻内存/初始化时间，`j_()/Z_()` 建模在 `09:274-364`，每只都是 SkinnedMesh）；(b) `spawn()` 里池尽时按需 `Q_(h,f,u,T++)` 现造并 `s.add(rig.group)`（零启动开销，代码多 ~10 行，需把 `d/v` 的 push 逻辑抽成 `makeGull/makeHound`）。**mode 是标题页才选、boot 早已完成**，所以"启动时按模式建池"这条路不存在——只能 (a) 常驻双倍 或 (b) 懒扩容。推荐 (b)。
3. `Yi` 是**模块级共享可变对象**（`_.flow = Yi` 在 `09:2637` 直接暴露）。按模式改它时先在 `U()` 里"先还原基线再套模式倍率"，否则 campaign→rush→campaign 来回切换会累乘（这是最容易忘的一处）。

---

## 3. 模式选择 UI 与流程接入点

### 结论（最短）

- **DOM 在字符串里**：`pM()`（`09-game-ui.js:2266-2362`）用 `s.innerHTML = \`…\`` 一次性拼所有菜单屏；标题屏按钮在 **`09:2279-2284`**（`data-act="deploy"` 等 4 个）。
- **点击分发在 `09:2461-2473`**：`let D = T.dataset.act; … D && e[D] && e[D](U)`——`e` 就是 `mM()` 传给 `pM(i, e)` 的回调表（`09:2580-2604`：`deploy/resume/restart/retry/redeploy`）。**处理器收到的是原始 click 事件**，所以可以直接读 `U.target.closest("button").dataset.*`（例如 `data-mode="rush"`）。
- **启动序列**：`deploy()` → `U({})`（`09:2750-2760`）→ `H()`（全量重置，`09:2709-2721`）→ `T()`（进 playing，`09:2762-2764`）。
- **mode 该加在哪**：`U()` 的入参加一个 `mode`，存进 `c`（run 对象，`09:2606-2622`）与 ctx（`i.mode`），并在 `U()` 里 **`H()` 之前** 就把 mode 写进 `i.mode`，因为 `H()` 会立刻调 `a(i.weapon,"reset")`（`09:2710`），而武器要按 mode 决定"是否按集装箱撒枪"。

### 关键代码摘录

```js
// 09-game-ui.js:2279-2284（标题屏，唯一能加模式选择的地方）
<div class="m-actions">
  <button class="btn primary" data-act="deploy">开始行动</button>
  <button class="btn" data-act="settings">设置</button>
  <button class="btn" data-act="about">项目介绍</button>
  <button class="btn m-only-narrow" data-act="controls">操作说明</button>
</div>

// 09-game-ui.js:2461-2473（唯一 click 分发；最后一个分支把事件透传给业务回调）
s.addEventListener("click", U => { let T = U.target.closest("button"); … 
  let D = T.dataset.act;
  D === "about" ? … : D && e[D] && e[D](U) })

// 09-game-ui.js:2580-2604（业务回调表）
l = pM(i, { deploy() { a(i.audio,"resume"), r.requestLock(), U({}) }, resume(){…}, restart(){…}, retry(){…}, redeploy(){…} });

// 09-game-ui.js:2750-2760（U：开局重置入口）
function U({ skipIntro: P = !1, quick: V = !1, keepRetries: Y = !1 } = {}) {
  if (Y || (c.retries = 0), l.show("none"), … H(), a(i.weapon,"setVisible",!0), …)
```

### 接入方案（改动面＝3 处 UI + 1 处流程 + 2 处消费）

1. **UI（`09:2279-2284`）**：把单个「开始行动」换成两个按钮（或一个 `.seg` 切换 chip 放在 `.m-premise` 下）：
   `<button class="btn primary" data-act="deploy" data-mode="campaign">战役</button>` +
   `<button class="btn primary" data-act="deploy" data-mode="rush">冲刺</button>`。
   复用 `data-act="deploy"` 可以**不改分发逻辑**，只改 `deploy` 内部：
   ```js
   deploy(ev) {
     const m = (ev && ev.target && ev.target.closest("button") || {}).dataset
             && ev.target.closest("button").dataset.mode || "campaign";
     a(i.audio,"resume"), r.requestLock(), U({ mode: m });
   }
   ```
2. **流程（`09:2750`）**：`U({ mode: M = "campaign" })`；进入后立刻 `i.mode = M; c.mode = M;`（**放在 `H()` 之前**）。`_.start(P)`（`09:2640-2645`）也补 `mode: P.mode`；`QC` 的 `?autostart` 分支（`09:3182-3188`）补 `mode: i.mode || "campaign"`，这样 URL 也能指定模式（截图/验收用得上）。
3. **敌人消费**：`ie()/F()/X()` 全走 `Yi`；在 `U()` 里 `applyMode(M)` 一份纯函数，把 `Yi.patrol/waves/maxAlive/pursuitExtra/pursuitMinAlive/spawnStagger` 从**基线副本**重算（基线副本自己留一份 `YiBase = {...Yi}` 并深拷贝 `patrol/waves`）。注意 `waves` 是对象数组，直接 `Object.assign(Yi, {waves: base.waves.map(o=>({...o}))})`。
4. **武器消费**：`i.mode` 由 `08` 的 `resetAll()` 读（`08:3212`），见 §1 落位要点 5。
5. **HUD/文案（可选）**：标题屏 `.m-premise`（`09:2278`）与暂停/结算文案若随模式变，改字符串即可；`setObjective(D())`（`09:2766-2770`）的"切断三处上行中继"是否在 rush 里保留 —— 见下方"待拍板"。

### 待拍板（不改代码也能先定）

- **rush 是否仍保留"切断 3 处中继 + 撤离"**？若保留，则 §2 的 `waves` 翻倍照常生效（3 波都在切中继时触发，循环完整）；若 rush 是"纯生存/清剿"，就要另写目标与结算分支（`D()`、`ee()`、`setDebrief` 都要动，工作量显著大于前四项之和）。
- **rush 是否给"奖励"**（备弹/护甲）？5 弹匣制本身是削弱，配合双倍敌人会让 rush 明显更难，需要数值平衡（例如 rush 的 pickup 每把带满 4 匣）。

---

## 4. 5 弹匣制改造点（备弹 = 4×弹匣，共 5 匣）

设计口径：`mag` 满匣、`reserve = 4 × mag`，HUD 备弹数字显示 reserve（初始 120/28/40/120/100），**∞ 分支可整段删掉**（`inf` 永远 false，留着是死代码但无害）。

### 4.1 常量与类型表（4 处）

| 位置 | 现状 | 改成 |
|---|---|---|
| `08-weapons.js:1661-1662` | `Gv = 30, B_ = 150`（`B_` 全文再无人引用，grep 只此一处） | `B_` 可复用为 `4 * Gv = 120`（或直接写 `Gv * 4`） |
| `08-weapons.js:1981`（`dm()` 的 pac9 实例初始值） | `reserve: -1` | `reserve: Gv * 4` |
| `08-weapons.js:2017`（pac9 `_e()` 重置） | `ve.ammo = Gv, ve.reserve = -1, …` | `ve.reserve = Gv * 4` |
| `08-weapons.js:2306/2336/2367/2398/2429`（`DGTypes` 五种枪） | 各自 `reserve: -1` | `pac9:120, deagle:28, awp:40, mp5:120, uzi:100`（= 4×mag：30/7/10/30/25） |

```js
// 08-weapons.js:2301-2312  类型表结构（其余四种同构）
var DGTypes = { pac9: { kind:"pac9", name:"几猫九式突击步枪", mag:30, reserve:-1, rpm:720,
                        hold:"auto", damage:26, range:300, adsFov:52, reloadT:2.1, reloadE:2.72, … } }
```

### 4.2 pac9 分支（`dm()`，4 处）

| 位置 | 现状（摘录） | 改动 |
|---|---|---|
| `08:2054-2055` `Fe()` 换弹守卫 | `if (k.reload \|\| ve.ammo >= ve.magSize \|\| ve.reserve === 0) return !1;` | `ve.reserve <= 0`（`=== 0` 在有限备弹下足够，但 ≤ 更稳） |
| `08:2140-2141` `magin` 补弹 | `let Tt = ve.reserve < 0 ? ve.magSize - ve.ammo : Math.min(ve.magSize - ve.ammo, ve.reserve); ve.ammo += Tt, ve.reserve >= 0 && (ve.reserve -= Tt)` | **公式已兼容有限备弹，可原样保留**（`reserve < 0` 分支从此不触发）；建议简化成 `Tt = Math.min(...)` + `ve.reserve -= Tt` |
| `08:2159` 空仓自动换弹 | `ve.reserve !== 0 && (k.autoReload = .32)` | `ve.reserve > 0 && (…)`（`!== 0` 在 -1 时代恒真，有限制下 `!== 0` 已够，但 `> 0` 语义明确） |
| `08:2003-2005` `addAmmo()` | `ve.reserve >= 0 && (ve.reserve += Me)` | 兼容：改动后恒真，可简化为 `ve.reserve += Me`（无限时代放弃加弹是有意的，改有限后应能补） |

### 4.3 通用 GLB 分支（`dgBuild()`，**这块最容易漏**，5 处）

`dgBuild` 的换弹**完全不看 reserve**——现在无限备弹所以没写，改有限后必须补：

| 位置 | 现状（摘录） | 必须改成 |
|---|---|---|
| `08:2821-2822` `reloadNow()` 守卫 | `if (l.reload \|\| w.ammo >= w.magSize) return !1;` | 追加 `\|\| w.reserve <= 0` |
| `08:2892-2895` `magin` 补弹 | `O("magin", PH.mgI) && (l.bump.v += .5, w.ammo = w.magSize; …)` | 按需补：`const need = w.magSize - w.ammo; const take = Math.min(need, w.reserve); w.ammo += take; w.reserve -= take;`（否则换弹白送满匣，5 匣制形同虚设） |
| `08:2836-2840` `dy()` 空仓自动换弹 | `l.autoReload = .32` 无条件 | `l.autoReload = w.reserve > 0 ? .32 : -1`（否则空仓+零备弹时每帧空转，虽被 `dryDone` 挡住但会持续发 dry 音效判定） |
| `08:2958` `_()` 重置 | `w.ammo = T.mag, w.state = "idle", …`（**不重置 reserve**） | 追加 `w.reserve = T.reserve`（否则重开后第二次出击备弹是上一局剩余值） |
| `08:3009` 实例 `addAmmo()` | `addAmmo() {},` 空实现 | 实现 `addAmmo(n){ w.reserve += n }`（门面 `08:3350-3353` 只转发，不补也能跑，但补弹能力缺失） |

```js
// 08-weapons.js:2985-2991  实例字段（reserve 只在这里从类型表快照一次）
let w = { name: T.name, kind: kind, ammo: T.mag, magSize: T.mag, reserve: T.reserve, … }
```

### 4.4 地面武器 / 捡丢（`dgn` 门面，4 处，属于设计决策）

现有语义是"每个地面武器只带一个弹匣余量、备弹恒 ∞"（`weapons-v2-spec.md` §3）。改有限备弹后必须明确一种口径：

| 位置 | 现状（摘录） | 决策点 |
|---|---|---|
| `08:3143-3146` `spawnPickup()` 记录 | `mag: Math.max(0, Math.min(T.mag, mag \| 0))`（**只有弹匣，无 reserve**） | 建议给 `rec` 加 `reserve` 字段并传入；否则捡起后 reserve 沿用"上一个持有者的残余" |
| `08:3193` `doPickup()` 替换旧枪 | `… spawnPickup(ts.kind, px, pz, oldAmmo, py + 1)`（只传 ammo） | 同上，把 `old.reserve` 一并传下去 |
| `08:3196-3197` 捡起装载 | `ni.reset(); ni.ammo = bm`（reserve 被 `reset` 覆盖成满值） | 若 `reset` 现在写满 reserve，则每次捡枪都白送 4 匣；应改成"捡起 = 恢复该把枪记录的 ammo+reserve"或明确"地面枪一律满备弹"（后者更简单，但就等于无限后勤） |
| `08:3200-3206` `doDrop()` | `mag = inst[k].ammo`，丢弃后原地生成 pickup | 同上，丢弃应带走 reserve |

> 若不想动这套"捡丢持久化"，最省事口径是：**地面/丢弃武器一律满 5 匣**（`spawnPickup` 内部 `reserve = 4*mag` 重算）。规则简单、玩家易懂，但会让"换枪回血式补弹"成为策略——需你拍板。

### 4.5 HUD（`09-game-ui.js`，1 处可删、0 处必改）

```js
// 09-game-ui.js:2139-2146
inf = !hr && ve.reserve < 0,                       // ← 改有限后恒 false
xe = inf ? -1 : Math.max(0, ve.reserve | 0);
…
hr ? (…U.textContent = "") : (inf ? X.reserve !== -2 : xe !== X.reserve) &&
   (X.reserve = inf ? -2 : xe, U.textContent = inf ? "∞" : String(xe).padStart(3, "0"));
```

- **不改也能工作**：`inf=false` → 走 `xe` 分支，显示 `"120" / "028" / "040" / "100"`（三位补零，位数没问题）。
- 建议**保留 `inf` 三元**作为"未来某种无限备弹武器"的逃生口（例如补给枪），只把 `ve.reserve < 0` 的语义保留给 -1 特例即可；删掉会更干净但失去灵活性。
- 关联行：`09:2159` `dt === 0 ? inf \|\| xe > 0 ? "R · 换弹" : "弹药耗尽"` —— 有限制下 `xe > 0` 判断天然正确，无需改。
- `09:1916` 的 `reserve: -1` 是 HUD 脏检查缓存初值（`X` 对象），**不是真实弹药**，不用动（`-2` 是 ∞ 哨兵）。

### 4.6 顺带检查（不需要改，但值得知道）

- `08:3254-3261` 门面 `reserve` getter/setter 是直通，有限值自动正确。
- `08:2004/3350` 之外**全仓无** `addAmmo` 调用方（grep 结果只有定义处），说明目前没有"弹药补给"玩法依赖它——改有限备弹不影响现有循环，但也意味着**没有补弹来源**，5 匣打光是纯枯竭。
- 敌人掉落/补给箱不存在（`combat`/`enemies` 无 ammo 相关），若 rush 想调节难度只能靠 pickup 自带满备弹。

---

## 5. 实施面汇总（按改动文件聚合，供排期）

| 文件 | 改动点 | 数量级 |
|---|---|---|
| `09-game-ui.js` | 标题屏按钮字符串（2279-2284）、`deploy` 读 `data-mode`（2580-2586）、`U()` 加 mode + `applyMode`（2750-2760）、`_.start`/autostart 透传（2640-2645、3182-3188）、`YiBase` 基线副本（2527 附近）、HUD ∞ 分支（2139-2146 可选） | 6 处，约 80~120 行 |
| `08-weapons.js` | 5 个 `reserve` 常量值、pac9 3 处守卫、`dgBuild` 5 处（守卫/补弹/自动换弹/reset/addAmmo）、pickup 4 处、`resetAll` 按 mode 撒枪 | 约 15 处，约 60~100 行 |
| `04-level.js` | **可零改动**（`placed` 已够用）；若要"只取可到达的箱"，可加一个 `containerSpots` 字段（在 `C1` 返回处 `2020` 附近派生） | 0~1 处，约 10 行 |
| `03-props.js` | **零改动** | — |
| `css/ui.css` | 模式切换 chip 样式（`.m-actions` 已有 flex，`227-238`；窄屏规则 `324-325` 需确认两个 primary 不挤爆） | 0~15 行 |

---

## 6. 我认为实现上最大的坑（按严重度排序）

1. **敌人池不会自己变大，池尽会静默丢怪**（`09:1641-1656` + `09:2885-2903`）。只把 `waves/maxAlive` 翻倍而不动 `Ui.poolGulls/poolHounds`，结果是"配额翻倍、实际没翻倍"，且**没有任何日志/报错**（`tries>=6` 后直接 `splice` 丢弃）。这是最容易"以为做完了"的假绿点。而池又只能在 boot 建，mode 是 boot 之后才选的 → 必须"懒扩容"或"常驻双倍"，两条都不轻。
2. **`Yi` 是全局共享可变对象**（`09:2637` `flow: Yi`）。按模式改常量后若不从基线副本重算，campaign↔rush 来回切换会**累乘/残留**（例如先 rush 再把 maxAlive 乘回 1 仍是 18）。必须 `YiBase` 深拷贝 + 每次 `U()` 全量覆盖。
3. **`spawnPickup` 的 `maxY=1.2` 会把箱顶武器埋进箱体**（`08:3122` + `groundHeight` 的 `z.max.y <= E` 过滤）。而 `nearestPickup` 又不校验 Y（`08:3164-3177`），导致"看不见却捡得到"。这两个既有缺陷恰好都会在"集装箱撒枪"这个需求上被放大，必须先处理再放枪。
4. **`dgBuild` 换弹完全不消耗 reserve**（`08:2892-2895` 直接 `w.ammo = w.magSize`）。这是 5 匣制最隐蔽的一处：四种 GLB 枪（deagle/awp/mp5/uzi）会变成事实无限，只有 pac9 变成有限——测试时如果只测初始步枪会误判"改完了"。
5. **`_()` 重置不复位 reserve**（`08:2958`）。闸门一：第一次出击满备弹是类型表快照给的，之后 `retry/redeploy` 会带着上一局残弹上阵（甚至 0 发），看起来像"开局没子弹"的随机 bug。
6. **命名撞车**：`sprint/sprinting` 已被 Shift 疾跑占用（`07:5713-5716`、`08:2881/2906`、HUD `09:2132`）。新玩法若也叫 sprint，会与"冲刺时不能换弹/不能开镜"等既有规则纠缠。用 `rush`。
7. 次要：47 个 pickup 常驻场景（47 模型 + 47 光柱）；gull 数量翻倍后 `maxBolts=32` 可能不够（表现为"敌人在瞄准但打不出弹"）；`spawnStagger` 不改则双倍波次会拖到 8 秒才铺完，观感像"没翻倍"。
