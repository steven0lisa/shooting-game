# 武器系统 v2 设计契约（槽位 / 捡丢 / Q 快切 / 新枪）

> 三个并行实现方（A 素材 / B src/game/08-weapons.js / C 07+09+css）的共享契约。
> 消费端接口以本文为准；与 notes/weapons-switch-map.md 冲突时以本文为新口径。

## 1. 武器类型注册表（5 种）

| kind | 名称 | 弹匣 | 备弹 | RPM | 扛法 | 伤害 | 射程 | adsFov | 换弹(战术/空仓) | 模型 | 枪声音效 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pac9 | 几猫九式突击步枪 | 30 | **-1(∞)** | 720 | 全自动 | 26 | 300 | 52 | 2.1 / 2.72 | 程序化(dm) | 合成 rifle_shot |
| deagle | 沙漠之鹰 | 7 | -1 | 210 | 半自动(单发) | 55 | 120 | 52 | 2.15 / 2.85 | assets/models/desert-eagle.glb | pistol_shot |
| awp | AWP 狙击步枪 | 10 | -1 | 45 | 栓动(单发) | 110 | 600 | **18** | 2.6 / 3.2 | assets/models/awp.glb | assets/audio/awp_shot.* |
| mp5 | MP5 冲锋枪 | 30 | -1 | 800 | 全自动 | 22 | 180 | 52 | 2.0 / 2.5 | assets/models/mp5.glb | assets/audio/mp5_shot.* |
| uzi | Uzi 冲锋枪 | 25 | -1 | 950 | 全自动 | 17 | 120 | 52 | 1.9 / 2.4 | assets/models/uzi.glb | assets/audio/uzi_shot.* |

- **备弹统一 -1 = 无限**（HUD 显 ∞）；所有武器的换弹守卫/补弹公式必须把 `reserve < 0` 当无限（见 §5 适配点）。
- 弱点倍率沿用 combat 的 ×2.2：AWP 爆头 242 → 猎犬(140)一枪死；MP5/Uzi 靠射速补。
- 散布/后坐基线：awp 散布最小(bloom .34/发但恢复快、基础 .0005→ADS .0001)、mp5 中(bloom .12)、uzi 大(bloom .20、基础散布 .022)。
- 每种类型独立位姿表（hipP/hipR/adsP/adsR/reloadP/reloadR）与 scaleLen（awp 0.55、mp5 0.36、uzi 0.22）。

## 2. 槽位与按键

| 输入 | 动作名 | 行为 |
|---|---|---|
| 1 | weapon1 | 装备槽 1（主武器）；槽 1 空则忽略 |
| 2 | weapon2 | 装备槽 2（副武器）；槽 2 空则忽略 |
| **Q** | lastWeapon | 快速切到上一把武器（= 切到 lastSlot；lastSlot 空则切另一非空槽） |
| **F** | pickup | 捡起最近地面武器（半径 2.5m）：**按枪的类别入槽**——长枪(步枪/狙/冲锋)→槽1主武器、手枪→槽2副武器；仅当目标槽已有武器时才丢弃它（丢在捡取点），**另一槽的武器保留不动**；捡起后自动装备该武器 |
| **G** | drop | 丢弃当前武器（原地生成地面武器，槽位置空，自动切另一非空槽；两槽皆空=徒手） |

- 初始装备：槽 1 = pac9，槽 2 = deagle（现状不变）。
- 徒手（cur() 为 null）：不能开火/换弹；HUD 显示 `— / —`；仍可 F 捡枪。
- 触屏：新增 `.t-pickup`（data-a="pickup"）、`.t-drop`（data-a="drop"）两个按钮；现有 `.t-swap`（weapon2）保留。

## 3. 地面武器（pickup 实体）

- 生成点（初始刷 3 把，坐标可微调但须落在可行走地面 y≈0）：
  - `awp` @ (8, 0, 2)（堆场，甲号中继附近）
  - `mp5` @ (-4, 0, -12)（仓库，乙号中继附近）
  - `uzi` @ (18, 0, 4)（码头，丙号中继附近）
- 视觉：该类型模型克隆平放于地面 + 缓慢自转（0.5 rad/s）+ 信号橙色(0xffb347)加法混合光柱（细圆柱，高 1.2m，透明渐变）。
- 每个地面武器携带自身弹药状态（弹匣余量；备弹恒 ∞）。
- 丢弃/替换产生的地面武器同样持久存在（不消失）；`reset()`（重开一局）清掉动态掉落、重刷初始 3 把。
- 距离判定：与玩家 XZ 距离 ≤ 2.5m 即可 F；`weapon.pickup` 提供最近目标信息。

## 4. 门面 API 契约（08 `dgn` 返回值 → t.weapon，B 提供 / C 消费）

```
kind: string|null        // 当前武器类型；徒手 = null
slot: 1|2                // 当前槽
slots: [{slot:1,kind,name},{slot:2,kind,name}]   // 供 HUD 槽位条；空槽 kind=null,name="—"
name / ammo / magSize / reserve / state / ads / spread / damage / rpm
adsFov: number           // ADS 时玩家 FOV（awp=18，其余 52；C 的玩家控制器读它）
pickup: {kind,name,dist}|null   // 最近地面武器（≤2.5m 才非 null）
update(dt) / reset() / setVisible(b) / muzzleWorld(v) / reloadNow()
cancelReload() / addAmmo(n) / setWetness(w) / snap()
```

- 切枪/捡/丢/Q 的输入消费**全部放在 08 的 facade.update 内部**（用 `i.input.pressed(...)`，模式照现有 weapon1/2），C 只负责按键映射与展示。
- `weapon:fire` / `weapon:reload` / `weapon:dry` 事件载荷的 `w` 字段 = 武器 kind（音频按 kind 分派）。

## 5. 既有代码适配点（B 必做）

1. pac9 的 `Fe()`（08 约 :2051）：`ve.reserve <= 0` 守卫改为 `ve.reserve === 0`；补弹 `Math.min(ve.magSize - ve.ammo, ve.reserve)` 改为 reserve<0 视作无限；`08:2149` `ve.reserve > 0` 恒真化（-1 时也自动换弹）。
2. `_e()` 里 `ve.reserve = B_` → -1；`B_ = 150` 常量废弃或保留不用。
3. deagle（现有 dgBuild）并入统一类型注册表（参数照上表微调：散布/后坐保持现状）。
4. `dgGlb` 复用加载 awp/mp5/uzi（模型缺失时**回退**程序化占位几何：细长盒体拼接，保证游戏不崩）。
5. `window.__DG` 保留并扩展：`{types, pickups:[{kind,pos}], muzzle...}` 供验收调试。

## 6. 素材文件契约（A 交付 / B 引用）

- 模型：`assets/models/awp.glb`、`assets/models/mp5.glb`、`assets/models/uzi.glb`（GLB v2，单文件含材质；CC0 或 CC-BY，CC-BY 须写 ASSETS.md 署名）
- 音效：`assets/audio/awp_shot.wav|mp3|ogg`、`assets/audio/awp_bolt.*`（栓动）、`assets/audio/mp5_shot.*`、`assets/audio/mp5_reload.*`、`assets/audio/uzi_shot.*`、`assets/audio/uzi_reload.*`（扩展名 wav/mp3/ogg 皆可，B 按实际文件名注册）
- ASSETS.md 追加「武器 2 扩展素材」一节（来源 URL + 作者 + 许可）。

## 7. HUD 契约（C 实现，读 §4 门面）

- `.h-slots` 改为由 `ve.slots` 渲染：`1 <name|—>` / `2 <name|—>`，active=ve.slot。
- 徒手/空槽：弹药大字 `—`、备弹空、pips 清空、`.h-wname` 空。
- 新增 `.h-pickup` 提示（准星下方）：`ve.pickup` 非空时显示「按 F 捡起 <name>」。
- `.h-wname` 显示当前武器名（已有机制保留）。
- 操作说明菜单（09 的字符串）追加：`Q 切换上一把 · F 捡起武器 · G 丢弃武器`。
- 07 `h_` 表新增：`KeyQ:"lastWeapon"`、`KeyF:"pickup"`（原 KeyF 的 melee 只留 KeyV）、`KeyG:"drop"`。
- 触屏按钮：`.t-pickup`（pickup）、`.t-drop`（drop）+ css 定位（避开现有按钮区）。
- 玩家控制器 ADS FOV：`fovAds` 固定 52 的地方改为优先读 `i.weapon.adsFov`（无则 52）——awp 开镜变成 18° 狙击镜。
