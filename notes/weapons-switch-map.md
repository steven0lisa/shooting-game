# 武器切换改造地图（按 1 切步枪 / 按 2 切沙漠之鹰）

> 任务：摸清武器系统全部代码接点，给出「文件 + 短名 + 行号 + 代码摘录」级答案。
> 所有行号基于当前格式化源码 `src/game/*.js` 逐一 grep/Read 核对（2026-11-11）。
> 没把握的点明确标 **未定位**；仅调研，未改任何代码。

## 0. 先看：跨文件公共契约（决定"改动接在哪一层"）

- 所有分片拼接进**同一个 IIFE 作用域**，跨文件直接互引短名（`AGENTS.md`）。所以同文件内加函数是零成本，跨文件只需改引用点。
- **⚠️ 三个"藏在 vendor 里的游戏胶水"**：`src/vendor/three.min.js` 第 3832 行（该文件共 3831+1 行，游戏常量拼在尾部）里定义了
  - `Pi={eye:1.68,crouchEye:1.05,radius:.32,height:1.8,fov:74,viewFov:54}`（玩家常量）
  - **`vf=0, zc=1`（图层号：0=世界层，1=视模层）**
  - `Pr={...}`（画质预设）、`dr={...}`（showcase/降级桩工厂）
  - `dr.weapon:()=>({stub:!0,update:Wt,reset:Wt,setVisible:Wt,ammo:30,magSize:30,reserve:120,state:"idle",name:"KR-7",ads:0,spread:.01})` —— **这就是 `t.weapon` 被消费的最小 API 面**，做武器门面(facade)照这个表实现即可。
- **`t.weapon` 的全部外部消费方**（facade 必须对齐的字段/方法）：

| 消费方 | 位置 | 读什么 |
|---|---|---|
| 主循环 update | `09-game-ui.js:3172-3178`(`u` 助手)、`:3198` | `update(dt)` |
| 主循环湿度 | `09-game-ui.js:3199-3205` | `setWetness(w)`（带 `&&` 守卫，可不实现） |
| HUD | `09-game-ui.js:2081` `ve = i.weapon \|\| {}` → `:2129-2139` | `magSize/ammo/reserve/name/state/spread` |
| 玩家控制器 ADS | `07-player-fx.js:5671-5672` `ne = i.weapon \|\| {}` | `ads`（数字）与 `stub` |
| 流程重置 H() | `09-game-ui.js:2688` `a(i.weapon,"reset")` | `reset()` |
| 开始/重启 U() | `09-game-ui.js:2733` `a(i.weapon,"setVisible",!0)` | `setVisible(b)` |
| boot/title | `09-game-ui.js:3011`、`:3167`（`?noweapon`） | `setVisible(false)` |
| showcase PC | `08-weapons.js:2208-2262` | `root/debug/reset/update/snap` |
| 无人调用（可留可省） | — | `muzzleWorld/addAmmo/reloadNow/damage/rpm/info`：全仓 grep 仅 08 内定义（`:1997-1999`），**无外部调用点**（`reloadNow` 只被 08 内部 `Fe()` 复用） |

- **update 时序**（`09-game-ui.js:3180-3214` `setAnimationLoop`）：
  `u("input")`(`:3185`) → `game.update`(`:3188`，返回真且非 title/paused 才 `d=true`) → `d && (u("player"), u("weapon"), u("enemies"))`(`:3198`) → fx/ground/… (`:3208`) → `u("audio"), u("hud")` (`:3208`，**无条件**) → `render.frame`(`:3210`) → **`t.input.endFrame()`(`:3214`，清 pressed)**。
  ⇒ 任何 `input.pressed(x)` 消费必须发生在 `:3185~3214` 之间（weapon.update 在内，安全）。

---

## 1. 视模工厂（src/game/08-weapons.js）

### 1.1 导出与签名

```js
// 08-weapons.js:2-5
br(Xv, {
    create: () => dm,
    showcase: () => PC
});
```
- `08-weapons.js:1699  async function dm(i) {` —— **主入口**，`i` 是全局 ctx（`window.__G`，`09:3070`）。启动时被 `09-game-ui.js:3145` `await r("weapon","weapon",()=>dm(t))` 调用（`r()` 见 `09:3086-3096`，结果存 `t.weapon`）；另被 `09:3019` `gM.weapon = Xv` 注册（showcase 路径用）。
- `08-weapons.js:2208  async function PC(i)` —— showcase 入口，`:2209` 内部 `await dm(i)`，`:2210` `i.weapon = e`。

### 1.2 返回对象 `ve`（`08-weapons.js:1976-2010`，`:2206  return _e(), ve`）

```js
// 08-weapons.js:1976-2010（节选）
ve = {
    name: mi.name,            // 1977 "几猫九式突击步枪"（mi 定义 :181-203）
    ammo: Gv,                 // 1978 30（常量 :1661）
    magSize: Gv,              // 1979
    reserve: B_,              // 1980 150（常量 :1662）
    state: "idle",            // 1981 idle|reloading|inspect|sprinting|firing
    ads: 0,                   // 1982 0..1
    spread: .0125,            // 1983 动态值
    damage: H_,               // 1984 26
    rpm: O_,                  // 1985 720
    root: e,                  // 1986 Group "viewmodel-pac9"
    debug: ce,                // 1987 {freeze,reloadT,empty,flash,noFire}（PC 截图用，:1969-1975）
    info: {tris, meshes},     // 1988-1991
    update: Xe,               // 1992 → function Xe(dt) @ :2104
    reset: _e,                // 1993 → function _e() @ :2012
    setVisible(Me){ e.visible = !!Me },        // 1994
    muzzleWorld: Re,          // 1997 → :2046（经 viewCamera FOV 比例补偿的枪口世界坐标）
    reloadNow: Fe,            // 1998 → function Fe() @ :2050
    addAmmo(Me){ ve.reserve += Me },           // 1999
    setWetness(Me){ Wv.value = ... },          // 2002（Wv 雨水 uniform @ :1596）
    snap() { ... }            // 2005（弹簧清零，PC@:2262 用）
};
```

### 1.3 枪模如何挂相机（层 `zc`）

```js
// 08-weapons.js:1919-1921
e.traverse(Me => {
    Me.layers.set(zc)        // zc = 1（vendor/three.min.js:3832）
}), i.camera.add(e);
```
- 双相机在 `02-render.js:1413-1417`：主相机 `a = PerspectiveCamera(Pi.fov=74, …)`、`a.layers.set(vf)`（=0）；视模相机 `l = PerspectiveCamera(Pi.viewFov=54, near .01, far 10)`、`l.layers.set(zc)`（=1）。
- 每帧 `02-render.js:1568` `l.matrixWorld.copy(a.matrixWorld)` —— 视模相机跟随主相机；主相机渲染层 0（看不到枪），视模相机渲染层 1（只看到枪）。
- **所以第二把枪视模 = 同样 `traverse(→layers.set(zc)) + i.camera.add(root)`，天然可并存**，靠 `root.visible`（`setVisible`，`:1994`）二选一显示。
- `muzzleWorld`/`Re→Pe`（`:2039-2048`）用 `tan(camera.fov/2)/tan(viewCamera.fov/2)` 把视模空间枪口点投影到世界——第二把枪直接复用即可。

### 1.4 update 如何被驱动

- `ve.update = Xe`（`:1992`），`function Xe(dt)` `08:2104-2205`。
- 驱动点唯一：主循环 `09-game-ui.js:3198` `d && (u("player", p), u("weapon", p), u("enemies", p))` → `u` 在 `:3172-3178` 调 `t.weapon.update(f)`（带 try/catch 与一次性报错）。
- 门控：`d = t.game.update(p) !== !1 && state !== "title" && state !== "paused"`（`09:3188`）——title/paused 不更新武器；intro/dead/complete 会更新。
- `Xe` 内部开火门：`08:2112  let Oe = !!be.fire && e.visible && !ce.noFire` —— **`e.visible=false` 即停火**（切枪隐藏靠这个免费获得）。

### 1.5 第二把枪视模的最自然注入点（三选一，推荐 A）

**A（推荐，单文件、09 零改动）——在 `dm` 内部做"双视模 + 门面"：**
1. 新增建模函数（放 `dm` 外、同文件，例如 `async function dgn(i)`，仿 `dm` 结构：自己的 `mi2` 规格对象、自己的几何 `w_2()`、自己的位姿表，**不复用 `eu/qv/tu/nu`（`:1666-1681`）与常量块**）。
2. 注入锚点 = `08-weapons.js:1919-1921` 之后：`dgn` 的 root 同样 `layers.set(zc)` + `i.camera.add`，初始 `visible=false`。
3. 把 `ve`（`:1976`）的数据字段改成对"当前 active 武器"的 getter：
   `get ammo(){return A.ammo}`（`magSize/reserve/name/state/ads/spread` 同理；`reset/setVisible/update/setWetness` 转发到 active；`addAmmo` 改写 `A.reserve`）。
   外部对这些字段**只读**（见 §0 消费方表），getter 安全。
4. 切换输入处理放在 `Xe` 里、紧挨现有换弹键 `08:2116`：
   `be.pressed && be.pressed("weapon1")` / `"weapon2"` → 换 `A`、互切 `root.visible`、`A.reset()` 或保留各自弹药。
   （`pressed` 语义与门控见 §4；本帧 `input.update` 已在 `:3185` 跑过，`endFrame` 在 `:3214` 才清，安全。）

**B——09 侧改一行接线**：08 导出新包装工厂（如 `wS` 创建两把返回 facade），`09-game-ui.js:3145` 的 `dm(t)` 换成 `wS(t)`。改动点最少但要动 boot 链。

**C（不推荐）**：两把都各自 `t.weaponPac9/t.weaponDeagle`，逐个改 §0 全部消费方——接线面太大。

### 1.6 可复用 vs 需重写（08 内部件）

| 复用（模块级，非 PAC-9 专属） | 位置 |
|---|---|
| 弹簧积分 `pa(k,c)`/`ma(spring,target,dt)` | `:1685-1697` |
| smoothstep `Yo`、`bi/kl/kn/fo/Fo`（08 内 `Fo/bi/kn` 来自别片，IIFE 全局可用） | `:1684` |
| `Vv` 手生成器、`yl/Cn/xr/qo/Rt/Fi/Dv` 几何工具 | `:1175` 等 |
| `TC/F_/U_/N_` 铭牌/镜片/枪口焰 | `:1334/:1369/:1425/:1518` |
| `Bf` 材质细节 shader、`Wv` 雨水 uniform | `:1647/:1596` |
| 需要自己定义 | 位姿表（`eu/qv/tu/nu`）、换弹关键帧（`$ / ue` `:1870-1896`）、时间常量（`me/ee/B/P/V` `:1897-1901`、`W_/G_` `:1682-1683`）、数值常量（`Gv/B_/O_/H_/V_` `:1661-1665`）、状态机 `k`（`:1928-1968`） |

---

## 2. 开火链路（07-player-fx.js + 08-weapons.js + 09-game-ui.js）

### 2.1 完整调用链（鼠标左键 → 命中判定 → FX → 弹药）

```
① 07-player-fx.js:5250  e.addEventListener("mousedown", …)   e = renderer.domElement
     :5249  g = P => P === 0 ? "fire" : P === 2 ? "ads" : P === 1 ? "melee" : null
     :5256  u |= 1 << P.button, d("mouse", g(P.button), !0)     // d() @ :5223 合并进按下集 n / 边沿集 s
   （键盘备用：h_.Enter/NumpadEnter → "fire"，:5132-5133；keydown @ :5239-5243）
② 07-player-fx.js:5493  输入更新 ee()：f.fire = r && n.has("fire")   // r = gameplay 标志
③ 09-game-ui.js:3185 u("input") → :3198 u("weapon") → 08-weapons.js:2104 Xe(dt)
④ 08-weapons.js:2112-2114
     let Oe = !!be.fire && e.visible && !ce.noFire,
         pt = Oe && !k.prevFire;            // 边沿（当前未用 pt，纯全自动）
   08:2144  let bt = !k.reload && k.sprintT < .45      // 换弹中/冲刺初段禁止开火
   08:2145-2148
     if (Oe && bt) if (ve.ammo > 0) {
         let Je = 0;
         for (; k.cooldown <= 0 && ve.ammo > 0 && Je < 3;) Be(), k.cooldown += 60 / O_, Je++
     } else k.dryDone || (… emit("weapon:dry") …, k.autoReload = .32)
⑤ Be() 单发 —— 08-weapons.js:2070-2102：
     :2073  ve.ammo--, k.burst++, k.heat = min(1.3, k.heat+.05)          ← ★弹药扣减（每发 -1）
     :2074-2077  散布锥：be=ve.spread；Oe=随机2π；pt=tan(spread)*√rand；dir 应相机四元数
     :2077  Ie.copy(Me.eye || we.position)                              // 射线起点=玩家眼
     :2080-2083  ut = i.combat.playerShot(Ie, ze, { damage: H_, range: V_ })   // 26 / 300
     :2085  Ne = ut?.point ?? 起点+dir*V_                              // 曳光落点兜底
     :2086-2087  i.fx.tracer(We, Ne)；i.fx.shell(Pe(mi.eject,dt), xe)；i.render.lightPool.flash(We, 16756832, 45, 9, .05)
     :2087-2092  i.events.emit("weapon:fire", {origin, dir, muzzle, ads})
     :2093-2097  player.addRecoil(.0068*pn*bt*(.85+rand*.3), Ti)、addShake(.12*bt)、弹簧冲量 kZ/kP/kY/kR、bloom+=.17
     :2098-2101  枪口焰 quad（x=N_()）uniform/缩放、boltT=0；ammo<=0 → k.boltLocked=!0, round隐藏(d.visible=!1)
```

### 2.2 战斗判定工厂 `zv`（`07-player-fx.js:5778-5875`，由 `09:3145` `t.combat = zv(t)` 创建）

```js
// 07-player-fx.js:5791-5795 签名
playerShot(n, s, { damage: o = 28, range: r = 300, impulse: a = 1 } = {}) {
    e.shots++;                                                   // stats.shots
    let l = i.physics.raycast(n, s, r);                          // 世界命中（03-textures.js:2158 d3().raycast）
    let c = i.enemies.raycast(n, s, l ? l.dist : r);             // 敌人命中（09-game-ui.js:1657-1674）
    if (c) {
        e.hits++;
        let u = c.part === "weak" ? 2.2 : 1;                     // ★弱点击伤倍率 ×2.2
        let h = c.enemy.damage(o * u, c.point, s, c.part) === !0;// 敌人扣血，true=击杀
        … emit("impact", f)      // → 07:1720 impact FX 分派 C()
        … emit("player:hitEnemy", {enemy, part, killed, weak})   // → 09:1954 HUD 命中标记
        return f;   // {point, normal, dist, surface:"enemy", enemy, part, dir, from, killed}
    }
    if (l) { … emit("impact", {…, surface: l.surface, enemy: null}); return u }
    return null
}
```
- 说明：`impulse` 形参**解构后未见使用**（5791-5833 内无引用）——**未定位到用途**（疑似死参数）。
- `enemyShot(n, s, {damage=6, range=200})` `07:5835-5861`：对玩家胶囊（半径 .38 / 高 .95）线段近似命中 → `c.damage(o, n)`。
- `explode(n, s=5, o=80, r="player")` `07:5862-5873`：按距离+LOS 衰减，玩家吃 50%。
- `stats {shots,hits,kills}` `07:5779-5783`（监听 `enemy:killed`）、`reset()` `07:5788`。
- `enemies.raycast(origin, dir, maxDist=300)` `09:1657-1675`：包围粗筛（半径 1.7²）→ 各自 `_raycast`，返回 `{dist, point, normal, enemy, part}`。

### 2.3 敌人受击接口

| 敌人 | hp 字段 | 扣血方法 | 位置 |
|---|---|---|---|
| gull（机械飞鸥） | `d.hp`，spawn 置 `d.hp = Pn.hp`（45） | `damage(y, b, m, A)`：`d.hp -= y`，emit `enemy:hit`，`hp<=0` 调死亡 `v(m)` 返回 `!0` | 方法 `09:489-495`；hp 初值 `09:497`；TUNE `09:366`；别名 `Pn = Zv` `09:386` |
| hound（机械猎犬） | `m.hp`，spawn 置 `m.hp = Gt.hp`（140） | `damage(T, D, C, G)`：`m.hp -= T`，emits `enemy:hit`，冲量弹簧（**弱点击时 pitch 冲量 ×1.6**），`hp<=0` 调 `q(C)` | 方法 `09:876-891`；hp 初值 `09:893`；TUNE `09:690`；别名 `Gt = Kv` `09:712` |
| 弱点判定 | — | hound `_raycast`：先头部球（`sM` 半径 .155）→ `part:"weak"`，再两段身体胶囊 → `part:"body"`；**gull `_raycast` 恒 `part:"body"`（`09:529`）** | `09:913-919` / `09:516-529` |

受击后链路：`enemy:hit`（**无音频绑定，未定位到监听方**——07 音频只绑 `enemy:alert/fire/step/spawn/killed` 等）；真正响的是 `impact{surface:"enemy"}` → `07:4620-4627` `ze("impact_enemy")`。击杀 feed：`09:1956` 监听 `enemy:killed`。

### 2.4 事件订阅方（开火后谁在听）

| 事件 | 订阅者 | 行 |
|---|---|---|
| `weapon:fire` | 音频 `ze("rifle_shot")` | `07:4591-4598` |
| `weapon:fire` | 敌人听觉警戒 `U.alert(D, Ui.hearRadius=45)`（0.3s 节流） | `09:1718-1722` |
| `impact` | FX 分派 `C(point,normal,surface,dir,enemy)`（血雾/弹孔/火花…） | `07:1720-1722` |
| `player:hitEnemy` | HUD `hitmarker(kill/weak/hit)` | `09:1954-1955` |
| `enemy:killed` | HUD feed + `combat.stats.kills++` | `09:1956` / `07:5784` |

---

## 3. 弹药与换弹

### 3.1 数值定义（**代码为准：30 / 150**）

```js
// 08-weapons.js:1661-1665
Gv = 30,     // 弹匣（ammo 初值=magSize，:1978-1979）
B_ = 150,    // 备弹（reserve，:1980；HUD 静态 HTML 里备弹占位 "120" 只是初始值，:09:1895）
O_ = 720,    // RPM（射速循环用 60/O_，:2148）
H_ = 26,     // 伤害
V_ = 300,    // 射程
```
> `dr.weapon()` 桩里 `reserve:120`（vendor:3832）与 HUD 占位 `"120"`（09:1895）是旧占位，**真实值 150**。
> 全仓 `addAmmo` 无外部调用点 ⇒ 备弹只减不增。

### 3.2 弹匣扣减 / 补弹

- 扣减：**每发** `08:2073  ve.ammo--`（在 `Be()` 内）。
- 空仓锁：`08:2101  ve.ammo <= 0 && (k.boltLocked = !0, d.visible = !1)`（`d`=弹匣口那发 `round` 网格，`:1759`）。
- 补弹（换弹 magin 相位）：`08:2133-2134`
  ```js
  let Tt = Math.min(ve.magSize - ve.ammo, ve.reserve);
  ve.ammo += Tt, ve.reserve -= Tt, Je.empty || (k.boltLocked = !1)
  ```

### 3.3 reload 时间轴（weapon:reload 事件）

- **触发口**（都调 `Fe()`，定义 `08:2050-2062`）：
  - 手动 R：`08:2116  be.pressed && be.pressed("reload") && Fe()`
  - 空仓自动：`08:2149  … emit("weapon:dry") … ve.reserve > 0 && (k.autoReload = .32)` → `08:2116` `k.autoReload` 倒数到 0 再 `Fe()`
- `Fe()` 初判（`08:2050-2061`）：
  ```js
  if (k.reload || ve.ammo >= ve.magSize || ve.reserve <= 0) return !1;
  let Me = ve.ammo <= 0;                       // ★空仓/战术换弹区分
  k.reload = { t: 0, T: Me ? G_ : W_, empty: Me, f: {} },   // W_=2.1（战术，:1682）/ G_=2.72（空仓，:1683）
  … emit("weapon:reload", { phase: "start", empty: Me })
  ```
- **相位推进**在 `Xe` 内 `08:2123-2141`（`Vt(name, at)` 是"到点发一次"助手，`:2127-2130`）：
  | phase | 时刻常量 | 行 | 附加 |
  |---|---|---|---|
  | `magout` | `me = .47`（`:1897`） | `:2131` `Vt("magout", me)` | `k.bump.v -= .25` |
  | — | `Pt > .86` | `:2131` `fresh` | round 网格重新可见 |
  | `magin` | `ee = 1.345`（`:1898`） | `:2131` `Vt("magin", ee)` | `k.bump.v += .55` + ★补弹（2133-2134） |
  | `tap` | `1.5` | `:2136` | `k.bump.v += .4` |
  | `bolt` | `V = 2.19`（`:1901`），**仅 empty** | `:2136` `Je.empty && … Vt("bolt", V)` | `boltLocked=false`、`k.bump.v += .3`（拉栓行程锚点 `B=2.02/P=2.14` `:1899-1900`） |
  | `done` | `Pt >= Je.T`（2.1 / 2.72） | `:2139-2141` | 清 `k.reload`，emits `{phase:"done"}` |
- 空仓/战术的其它差异：副手轨迹走 `ue`（空仓，含 1.96~2.26s 拉栓，`:1887-1896`）或 `$`（战术，`:1870-1886`）—— `:2136  le(Je.empty ? ue : $, Pt)`；`k.rackW` 只在 empty 下计（`:2136`）；magin 时战术换弹保持 `boltLocked`（`:2134` 尾部 `Je.empty || (k.boltLocked = !1)` 与 empty 分支共同决定）。
- 音效订阅：`07:4601-4605` `ln("weapon:reload", …)` 按 `phase` 分派（见 §6）。
- HUD 侧无 `weapon:reload` 监听，纯读 `ve.state`（`09:2138` `ve.state === "reloading" ? "换弹中"`）。`state` 赋值 `08:2170`。

### 3.4 "无限备弹"改哪里最省

**最小改动 = 1 行**：`08:2134` 删掉（或改写）`ve.reserve -= Tt`。理由：
- `Fe()` 的 `ve.reserve <= 0`（`08:2051`）从此永假 → 换弹永不被备弹拦；
- 空仓自动换弹 `ve.reserve > 0 &&`（`08:2149`）永真；
- HUD 备弹恒显 150（`09:2136  U.textContent = String(xe).padStart(3,"0")`），cue 的"弹药耗尽"分支（`09:2138`，条件 `xe > 0` 为假时）不再出现。
- 想显 999：同时把 `B_ = 999`（`08:1662`）且不扣减。
- **⚠️ 不要用 `Infinity`**：`09:2131  xe = Math.max(0, ve.reserve | 0)` —— `Infinity|0 === 0`，HUD 会显示 "000" 并把 cue 变成"弹药耗尽"。
- 手枪"7 发弹匣 + 无限备弹"：手枪自己常量 `mag7=7`，备弹同上不扣减；HUD pips 会在 `magSize` 变化时自动重建（`09:2132  Ne !== X.mag && (T.innerHTML = "<i></i>".repeat(Ne) …)`），7 个没问题（上限 60，`09:2129`）。

---

## 4. 输入系统（07-player-fx.js，工厂 `v_`）

### 4.1 按键注册表 `h_`（`07-player-fx.js:5114-5142`）—— code → action 映射对象

```js
// 07-player-fx.js:5114-5142（节选）
var h_ = {
    KeyW: "forward", KeyS: "back", KeyA: "left", KeyD: "right",
    Space: "jump",
    ShiftLeft: "sprint", ShiftRight: "sprint",
    KeyC: "crouch", ControlLeft: "crouch", ControlRight: "crouch",
    KeyR: "reload",          // :5125
    KeyE: "interact",
    KeyF: "melee", KeyV: "melee",
    Escape: "pause", KeyP: "pause",   // :5129-5130
    KeyQ: "alt",
    Enter: "fire", NumpadEnter: "fire",
    ArrowLeft/Right/Up/Down: "turnL/turnR/turnU/turnD",
    KeyJ/L/I/K: turn 备用键
},
f_ = .0021, d_ = .0052, p_ = 2.1, m_ = 3, If = 58,
g_ = { pause: 1 };   // :5148-5150 只有 pause 允许在非 gameplay 时生效
```

### 4.2 按键如何变成状态（三段）

1. **keydown/keyup**（`:5239-5245`）：`let V = h_[P.code]; if (!V) return;` → 焦点在 INPUT/TEXTAREA/SELECT（或 BUTTON+Space/Enter）跳过 → `!P.repeat && d("key", V, !0)`；keyup `d("key", h_[P.code], !1)`。
2. **`d(source, action, down)`**（`:5223-5233`）：按来源集合 `o={key,mouse,touch,pad}` 合并进全局按下集 `n`，首次按下同时进边沿集 `s`。
3. **查询 API**（`:5188-5193`）：
   ```js
   down(P)    { return n.has(P) && (r || g_[P] === 1) },
   pressed(P) { return s.has(P) && (r || g_[P] === 1) },   // r = gameplay（setGameplay @ :5198）
   ```
   `s` 每帧末清：`endFrame()`（`:5496-5498` `s.clear()`）由主循环 `09:3214` 调用。
   ⚠️ **门控**：`r=false`（title/intro/paused/dead/complete，见 `09:2737/2767/2771/2961/2969/3011`）时 `pressed("weapon1")` 恒 false —— 切枪只在 playing 生效，正合适。

### 4.3 加 Digit1/Digit2 的最小改法

```js
// 07-player-fx.js:5114 h_ 表内加两行（keyup/keydown 全表驱动，零其它改动）
Digit1: "weapon1",
Digit2: "weapon2",
```
消费端（二选一，都在 pressed 有效窗口 `09:3185~3214` 内）：
- **推荐** `08-weapons.js:2116` 旁（`Xe` 内）：`be.pressed && be.pressed("weapon1") && …`；或
- `09-game-ui.js:2994` 旁（`mM` 的 update `B`，`function B(P)` @ `09:2987`，playing 分支里已有 `r.pressed("pause")` 的现成写法）。
- 无 preventDefault 冲突：`09/07` 只对 `Space/Arrow*/ControlLeft` 拦默认行为（`07:5243`）。

### 4.4 触屏按钮 DOM（要不要加切枪键：加，落点明确）

- 生成：**`07-player-fx.js:5332  function N()`**，`innerHTML` 一行模板（`:5334`）挂到 `#ui`（`v_` 里 `t = document.getElementById("ui")` `:5154`）：
  ```html
  <div class="touch">
    <div class="t-stick">…</div>
    <button class="t-btn t-fire"     data-a="fire">开火</button>
    <button class="t-btn t-ads"      data-a="ads">瞄准</button>
    <button class="t-btn t-reload"   data-a="reload">换弹</button>
    <button class="t-btn t-jump"     data-a="jump">跳跃</button>
    <button class="t-btn t-interact" data-a="interact">交互</button>
    <button class="t-btn t-pause"    data-a="pause">暂停</button>
  </div>
  ```
- 绑定：`:5340-5348` `btn` 映射表（key=按钮名）→ `:5349-5383` **通用 for 循环**，按下 `d("touch", L, !0)`、抬起 `d("touch", L, !1)`（`L` 即动作名；`ads` 特判开关 `:5354-5357`，`fire` 特判拖动转视角 `:5358/:5364-5368`）。
- **加切枪按钮 = 三处**：① `:5334` innerHTML 加 `<button class="t-btn t-swap" data-a="weapon2">切枪</button>`；② `:5340-5348` `btn` 加 `swap: V(".t-swap")`（**key 必须等于动作名**，通用循环拿 key 当 action —— 想直接产出 `weapon2` 就把 key 命名为 `weapon2` 或在循环里映射）；③ `css/ui.css:167-177` 旁加一条 `.t-swap { width…; right…; bottom…; }`（现成范例 `.t-reload` `ui.css:174`、`.t-interact` `:175`）。
- 显隐：`.touch.on`（`ui.css:162`）由 `setGameplay` 控制（`07:5198-5200`），`is-touch` 类加在 documentElement（`:5392`）。
- 手柄（可选）：按钮号 → 动作表 `X`（`07:5428-5439`，如 `2:"reload"`），轮询 `d("pad", …)` `:5470-5473`。

---

## 5. HUD（09-game-ui.js 工厂 `hM` + css/ui.css）

### 5.1 弹药数字 DOM（构建）

```js
// 09-game-ui.js:1895-1900
O = li("div", "h-ammo", '<div class="h-cue"></div><div class="h-ammo-row">'
     + '<b class="h-ammo-n">30</b><span class="h-ammo-r">120</span></div>'
     + '<div class="h-pips"></div><div class="h-wname"></div>'),
q = O.querySelector(".h-ammo-n"),   // 当前弹（大字）
U = O.querySelector(".h-ammo-r"),   // 备弹（"/ 150"，"/ " 由 CSS ::before 生成）
T = O.querySelector(".h-pips"),     // 弹量点阵
D = O.querySelector(".h-wname"),    // ★武器名（现成元素）
C = O.querySelector(".h-cue"),      // "R · 换弹 / 换弹中 / 弹药耗尽 / 弹药不足"
```
- `li()` 元素助手 `09:1840`；挂载 `09:1902  t.append(G, n, c, d, y, v, x, m, E, w, S, O)`（`t = li("div","hud")` `:1847`，挂 `#ui`）。
- 样式：`.h-ammo` `css/ui.css:128`，`.h-ammo-n`（76px 大数字）`:133`，`.h-ammo-r` + `::before "/ "` `:134-135`，pips `:137-140`，**`.h-wname` `:141`**，触屏布局 `.is-touch .h-ammo` `:179-180`，窄屏 `:304-305`。

### 5.2 更新函数与脏检查

- HUD API 对象 `I`：`09:1974-2075`（`show@1976 / setObjective@1979 / setRelays@1982 / setMarkers@1994 / setPrompt@2012 / radio@2022 / warn@2031 / message@2034 / feed@2037 / hitmarker@2048 / reset@2068 / update: se@2075`）。
- 逐帧 `function se(k)` `09:2078`；`09:2079  if (ae(k), !Q) return;`（HUD 隐藏时跳过，`Q` 由 `show()` `:1976-1978` 控制）；`09:2081  ve = i.weapon || {}`。
- **脏检查缓存 `X`**：`09:1911-1932`（`ammo/mag/reserve/name/cue/low/hp/hpSeg/hurt/head/tapeX/gap/crossOn/prompt*/marksOn/done/total`，初值 `-1/null/1e9`）。
- 弹药写入段（**照抄这个模式**）：
  ```js
  // 09-game-ui.js:2129-2139
  let Ne = Math.max(1, Math.min(60, ve.magSize | 0 || 30)),   // 弹匣容量（变了就重建 pips）
      dt  = Math.max(0, ve.ammo | 0),
      xe  = Math.max(0, ve.reserve | 0);
  if (Ne !== X.mag && (X.mag = Ne, T.innerHTML = "<i></i>".repeat(Ne), ne = [...T.children], X.ammo = -1), dt !== X.ammo) {
      X.ammo = dt, q.textContent = String(dt).padStart(2, "0");
      for (…) ne[we].className = we < dt ? "" : "off"
  }
  xe !== X.reserve && (X.reserve = xe, U.textContent = String(xe).padStart(3, "0")),
  ve.name !== X.name && (X.name = ve.name, D.textContent = ve.name || "");   // ★武器名
  … cue（2138）…, Ie !== X.low && (X.low = Ie, O.classList.toggle("low", Ie));
  ```
- 其它脏检查范例：罗盘 `09:2087  Re !== X.tapeX && (X.tapeX = Re, s.style.transform=…)`、航向 `:2089`、准星显隐 `:2123  We !== X.crossOn && …`、准星间距 `:2127  Oe !== X.gap && …`（用 `ve.spread`，`09:2124`）。`resize` 时失效缓存 `R()` `09:1950-1953`（`X.tapeX = 1e9, X.gap = -1`）。

### 5.3 加"1/2 武器槽指示器"的插入点

1. **DOM**：`09:1895-1901` 处新增（如 `S2 = li("div", "h-slots", '<b class="on">1 PAC-9</b><b>2 沙漠之鹰</b>')`）并在 `09:1902` 的 `t.append(...)` 里加进去；或直接拼进 `.h-ammo` 的 innerHTML 串（紧邻 `.h-wname`）。
2. **样式**：`css/ui.css:141`（`.h-wname` 行）附近加 `.h-slots`；配色沿用 `--bone/--signal`、字号参考 `.h-k`/`.h-wname`（`ui.css:141`、标签统一 letter-spacing 见 `:336`）。触屏布局别忘 `.is-touch` 覆盖（`:179-184`）。
3. **更新**：`X` 缓存 `09:1911-1932` 加字段 `slot: -1`；在 `se` 的弹药段（`09:2136` 之后）加
   `cur !== X.slot && (X.slot = cur, …切 class…)`，`cur` 从 facade 读（如 `i.weapon.slot` 或 `ve.name` 推断）。
4. 武器名显示**已有现成元素** `.h-wname`（`09:1899` `D`、更新 `:2136`、样式 `ui.css:141`）——切换武器时它会随 `ve.name` 自动变，无需新增。
5. 脏检查机制照抄：**"读值 → 与 `X.xxx` 比 → 不等才写 DOM 并回填 `X.xxx`"**（范例 `:2087/:2123/:2132-2136`）。
- HUD 刷新频率：`09:3208` `u("hud", p)` **无条件跑**（paused 也刷新，只是 `.hud` 隐藏）。

---

## 6. 音频（07-player-fx.js，工厂 `c_` → 引擎 `u_`）

### 6.1 步枪开火音如何触发

```js
// 07-player-fx.js:4591-4598  （ln(event, handler) 助手 @ :4582-4590，内部 events.on + try/catch）
ln("weapon:fire", () => {
    I = I + 1 & 3, ze("rifle_shot", { variant: I, gain: 1, jitter: .012 });  // 4 变体轮换
    …音乐 intensity 联动…
}), ln("weapon:dry", () => ze("rifle_dry", { gain: .9 })),
   ln("weapon:reload", te => {
    te.phase === "magout" ? ze("reload_magout")
    : te.phase === "magin" ? ze("reload_magin")
    : te.phase === "bolt" ? ze("reload_bolt")
    : te.phase === "start" && ze("jump", { gain: .5, pitch: 1.3 })   // 拔弹匣前的"啧"一声是复用 jump
   }), ln("weapon:melee", () => ze("jump", …)), …
```
- **emit 点（08）**：`weapon:reload {phase}` —— start `08:2058-2061`、magout/magin/bolt 经 `Vt()` `08:2127-2136`、done `08:2139-2141`；`weapon:dry` `08:2149`；`weapon:fire` `08:2087-2092`。
- 声音库 `Go`：`07:3355` 起（`rifle_shot` `:3356-3365` {gen:KR, n:4, sr:44100, peak:.97, bus:"near", max:5, pri:9, boot:1}；`rifle_dry` `:3386`；`reload_magout/magin/bolt` `:3396/:3405/:3414`）。合成器函数：`KR` 开火 `:2099`、`t8` 干击发 `:2198`、`n8/i8/s8` 换弹三段 `:2228/:2248/:2268`。
- 播放器 `ze(name, opts)` `07:4241-4290`：查 `Go[te]`（**不存在直接 return false** `:4243-4244`）、变体轮换 `:4246`、取 buffer `r.get(name#variant)`、无则同步合成 `p()` `:4048-4052`（→`r_` `:3923`→`Go.gen`）、总线/声像/抢占 `:4262-4263`、`playbackRate` 随机 `:4274-4275`。
- 公开 API：`07:5063-5066  Object.assign(Re, { ctx: e, resume: yr, play: ze, loop: Be, … })` —— **`i.audio.play(name, opts)` 外部可直接调**。

### 6.2 想用外置音频文件替换/叠加 —— 最干净的插口

**结论：走 `Go.gen` 注册新条目（唯一干净入口），事件层用 `i.audio.play()` 或扩 `weapon:fire` 载荷分支。**

1. **不能**直接往内部 buffer 表 `r`（`07:4025  let r = t ? t.bufs : new Map`）塞 AudioBuffer —— 它是 `u_` 的闭包私有，外部够不到；`h()`（`:4031`）同理。
2. **推荐做法**：
   ```js
   // ① 在 Go（07:3355 旁）注册
   Go.pistol_shot = { gen: () => float32Array（或 [ch0, ch1]）, n: 1, sr: <采样率>,
                      peak: .97, bus: "near", max: 4, pri: 9 };
   // ② 预加载（一次性）：i.audio.ctx（07:5064 公开）fetch+decodeAudioData
   //    → getChannelData(0) 存到闭包变量，gen 同步返回它。
   //    时机：audio.ready（07:5069）之后、首次开火之前（boot 完成即可，游戏 10~20s 启动期足够）。
   ```
   - 归一化免写：`o_`（`07:3908-3920`）会按 `Go.peak` 重标定幅度（`:3913-3915`）并加首尾微淡入出（`:3911` `em(r, sr, 3e-4, .012)`）。
   - gen 签名：`r_` 调 `Go.gen(sr, rng, variant)`（`07:3928`），返回 `Float32Array` 或数组即可（`o_` `:3909` 支持单/多声道）。
   - 想避免首播同步合成抖动，可把名字加进预生成队列 `nC`（`07:3980`）或 `tC` 懒加载集合（`07:3979`）——外置 gen 很快，一般不必须。
3. **触发层**（换弹/开火音分武器）：
   - 最松耦合：手枪自己的开火代码**直接** `i.audio.play("pistol_shot", {gain, pitch})`（`07:5066`）；或
   - 事件分支：08 里 `emit("weapon:fire", {origin, dir, muzzle, ads, w:"deagle"})`（`08:2087-2092` 加字段），在 `ln("weapon:fire")`（`07:4591`）按 `te.w` 分派 `rifle_shot` vs `pistol_shot`；换弹同理改 `07:4601` 的 phase 分支。
   - **`weapon:fire` 当前载荷无武器身份字段** —— 必须新增，否则音频层分不出是谁开的枪。
4. 叠加/微调：`ze` 支持 `gain / pitch / jitter / delay / variant` opts（`07:4274-4276`）；同名多变体靠 `n`（变体数）轮换。
5. 循环层/环境层不动；`bus:"near"` 走近场总线（无位置感），`"world"` 才吃 `pos` 声像（`07:4261-4282`）——第一人称枪声用 `near` 正确。

---

## 7. 数值 / TUNE（沙漠之鹰的数放哪）

### 7.1 步枪参数（全部在 08，常量块 `08-weapons.js:1661-1683`）

| 参数 | 短名 | 当前值 | 定义位置 | 使用位置 |
|---|---|---|---|---|
| 弹匣 | `Gv` | 30 | `08:1661` | `:1978-1979`（ve.ammo/magSize）、`:2013`（reset） |
| 备弹 | `B_` | 150 | `08:1662` | `:1980`、`:2013`、补弹 `:2134` |
| 射速 RPM | `O_` | 720 | `08:1663` | `:2148  k.cooldown += 60 / O_`（=83ms/发，每帧最多补 3 发） |
| 伤害 | `H_` | 26 | `08:1664` | `:1984`（展示）、`:2081`（playerShot 传参） |
| 射程 | `V_` | 300 | `08:1665` | `:2082`（playerShot）、`:2085`（曳光兜底） |
| 换弹时长 | `W_` / `G_` | 2.1（战术）/ 2.72（空仓） | `08:1682-1683` | `:2055  T: Me ? G_ : W_`、`:2120` |
| 散布（基础/ADS） | 内联 | .0125 → .0012 | `08:2161  ho = bi(.0125, .0012, k.adsE) + Ti*bi(.013,.004,ads) + k.bloom*bi(.0065,.0022,ads) + (onGround===false?.022:0) - (crouch?.002*(1-ads):0)` | 每帧 `:2162  k.spreadS = kn(k.spreadS, ho, 18, dt); ve.spread = k.spreadS`；初值 `k.spreadS .0125` `:1956`、`ve.spread` `:1983` |
| bloom | 内联 | 每发 +.17，衰减 1.5/s | `:2097  k.bloom = Math.min(1, k.bloom + .17)`、`:2150  k.bloom = max(0, k.bloom - dt*1.5)` | 计入 `:2161` |
| 后坐（视模弹簧） | `kZ/kP/kY/kR` | (520,30)/(380,26)/(300,22)/(300,20) | `08:1959-1962` | 冲量 `:2097  kZ.v += 1.5*bi(1,.6,ads)；kP.v += 1.5*bt；kY.v += ±.5*bt；kR.v += ±.9*bt`（`bi(a,b,t)=lerp`） |
| 甩枪/落地弹簧 | `swY/swP/jY/jP/bump` | (110,15)×2 /(140,13)×2 /(600,30) | `08:1963-1967` | `:2186-2190` |
| 玩家侧后坐 | addRecoil | pitch `.0068*系数`，yaw 按 `<4 发随机 / ≥4 发 sin 波动` | `08:2093-2097`（`bt=bi(1,.55,ads)*(crouch?.85:1)`；前 9 发全额 `pn`，之后 ×.38 `:2095`） | 实现 `07:5622 addRecoil(F,X)` |
| 玩家后坐参数 | `Mt.recoilKeep/Apply/Recover/Hold` | .35 / 34 / 6.5 / .09 | `07:5533-5536`（`Mt` 表 `07:5501`） | 玩家控制器 `x_`（`07:5545`） |
| 震屏 | `Mt.shakeDecay/Pitch/Yaw/Roll` | 1.7/.03/.03/.045 | `07:5537-5540` | `addShake`（开火 `.12*bt`，`08:2097`） |
| 热量/烟 | 内联 | +.05/发，上限 1.3，冷却 -.2/s，>.4 冒烟 | `08:2073/:2150/:2156` | 枪口余热 `uHeat` `:2175` |
| ADS 时长/FOV | — | 0.18s 线性 smoothstep；FOV→52 | `08:2158`、`07:5529 fovAds:52` | — |

### 7.2 敌人数值与受伤倍率（09 + 07）

| 项 | 值 | 位置 |
|---|---|---|
| 全局 TUNE `Ui` | sightRange 45 / sightCone 200° / loseSight 4 / searchTime 8 / hearRadius 45 / maxTokens 2(3) / tokenGap 1.25 / exposure .1/.45 / poolGulls 10 / poolHounds 8 / maxWrecks 5 / maxBolts 32 | `09:1348-1365`（导出 `TUNE`，命名空间声明 `09:2  br(ex, {TUNE: ()=>Ui, …}`） |
| gull 分族 `Zv`（别名 `Pn`） | **hp 45**、boltDamage 7、boltSpeed 70、burst 3/0.12、telegraph .55、cooldown [1.9,3.3]、orbit 12~25、alt 4~8、maxSpeed 8、spreadFar/Near .065/.018、fireRange 42、explodeRadius/Damage 3/30 | `09:365-385`（别名 `:386`） |
| hound 分族 `Kv`（别名 `Gt`） | **hp 140**、shotDamage 5、burst 4/0.11、telegraph .5、cooldown [1.8,3]、runSpeed 4.5、range 8~18、spreadFar/Near .12/.045、lunge 3/15/3.5/9.5、smokeBelow .4 | `09:689-711`（别名 `:712`） |
| hp 生效点 | spawn 时 `d.hp = Pn.hp`（`09:497`）、`m.hp = Gt.hp`（`09:893`） | — |
| **弱点击伤倍率 ×2.2** | `07:5801  let u = c.part === "weak" ? 2.2 : 1;` → `enemy.damage(o * u, …)` | `07:5791-5833` |
| **×1.6 的真相** | `09:888  m.sP.v += K * 2.4 * Q * (G === "weak" ? 1.6 : 1)` —— 只是 hound 受击**俯仰冲量**放大，**不是伤害倍率** | `09:876-891` |
| 玩家弹默认参数 | `{damage=28, range=300, impulse=1}`（步枪实传 26/300；`impulse` 未见使用） | `07:5792-5794` |
| 敌人对玩家 | gull bolt 7（`09:1583` `Ui.gull.boltDamage`）、hound burst 5（`09:1152` `s.combat.enemyShot`）、扑咬 15（`09:1066` `Gt.lungeDamage`） | — |

### 7.3 沙漠之鹰数值建议落位

- **完全照 08:1661-1683 的形态加一个平行常量块**（同文件、`dm` 之外或 `dgn` 内部闭包）：`MAG=7`、`RPM≈180`、`DMG≈50`、`RANGE≈150`、`RELOAD_T`（如 1.4/1.8s）、自己的位姿/换弹关键帧。
- 开火函数里对 `i.combat.playerShot(..., {damage: 手枪DMG, range: 手枪RANGE})`（对应 `08:2081-2082` 的位置）—— **zv 不用改**（伤害/射程由调用方传入）。
- 弱点逻辑（×2.2）、命中部位、听觉警戒（`weapon:fire` → `hearRadius` 45）全部自动复用，**09/07 零改动**；只有音效身份要按 §6.2 加载荷字段或直调 `play`。
- 敌人 hp 不用动（45/140 就是按 26 伤调的）：手枪 50 伤 ⇒ gull 1 枪（45）、hound 3 枪（140）——若想"爆头 2 枪"再回来微调 `Zv.hp/Kv.hp`。

---

## 附：落地顺序 checklist（改码时按此走，本任务未执行）

1. `07:5114` `h_` 加 `Digit1/2` → 消费点选 `08:2116` 旁（或 `09:2994` 旁）。
2. `08` 内加 `dgn` 手枪视模工厂 + 注入 `08:1919-1921` 后挂相机 + `ve` 字段改 getter（§1.5 方案 A）。
3. 手枪 `Be2`：复制 `08:2070-2102` 骨架，换常量（§7.3）、加 `w:"deagle"` 载荷（§6.2）。
4. 备弹：`08:2134` 去掉 `ve.reserve -= Tt`（步枪/手枪通用无限）。
5. 音频：`Go` 注册 `pistol_shot`（+ 可选 reload 三段），fetch+decode 预载（§6.2）；`07:4591/4601` 分支。
6. HUD：`09:1895/1902` 插槽指示器 DOM + `X` 加 `slot` + `:2136` 后更新 + `ui.css:141` 旁样式（§5.3）。
7. 触屏：`07:5334/5340` 加切枪按钮 + `ui.css:174` 旁 `.t-swap`（§4.4）。
8. 验证：`node --check` → `bash scripts/build.sh` → `python3 -m http.server 8931` 浏览器实测（AGENTS.md 修改守则 §7）。
