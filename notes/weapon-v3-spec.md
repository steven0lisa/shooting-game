# 武器系统 v3 设计契约（全武器收录 / 5 弹匣制 / 冲刺模式）

> 实现分工（文件互斥）：WP1a=notes+assets/models + src/game/08b-gundata.js；WP1b=assets/audio + src/game/08c-sounddata.js；
> WP2=src/game/08-weapons.js；WP3=src/game/07-player-fx.js + 09-game-ui.js + css/ui.css；主会话=spec/build.sh/集成。
> v2 契约（notes/weapons-v2-spec.md）除本文覆盖处外继续有效。调研依据：notes/weapon-v3-research.md、mega-weapon-pack-survey.md、gun-sfx-params-survey.md。

## 1. 收录清单（64 把）

- 来源：3dassets.dev Mega Weapon Pack（**CC0，无需署名**）——手枪 9 半自动 + 6 左轮 = **15**；长枪 = 步枪/卡宾 20 + 狙击/DMR 18 + 冲锋/PDW 11 = **49**。霰弹枪 9 备选不做。
- 参数：PF Gun List（145 把）优先、adatechnology kit（115 款）补缺，逐枪映射到游戏刻度（步枪 dmg≈22-34、手枪≈28-58、狙击≈85-120、冲锋≈15-24；射速/弹匣/射程照真实比例）。
- 音效：FreeFirearmsSFXLibrary（CC0）同枪套件优先 → 同口径借音 → 类共用回退（步枪/狙击/冲锋/手枪四类各一套）。机构声（拉栓/弹匣）可共用 kit CC0 ogg。
- **"能满足游戏要求"= 64 把**（模型全、参数全、声音三级回退兜底）。既有的 pac9/deagle/awp/mp5/uzi 保留为独立高质量实现，新 64 把数据驱动进注册表（awp/mp5/uzi/deagle 若与新表撞名以既有实现为准）。

## 2. 数据契约（两个纯数据文件，构建序列插在 08-weapons.js 之前）

```js
// src/game/08b-gundata.js  —— WP1a 产出
var GUNDATA = [ {
  slug: "ak47",                    // 唯一 id（文件名用）
  name: "AK-47 突击步枪",            // HUD 显示名（中文）
  cat: "long" | "pistol",          // long→槽1主武器，pistol→槽2副武器
  model: "assets/models/v3/ak47.glb",
  mag: 30, rpm: 600, fire: "auto" | "semi" | "bolt",
  damage: 30, range: 280, adsFov: 52,   // 狙击类 18~24
  bloom: .15, rc: 1.0,             // 每发散布增量 / 后坐系数（基准=mp5 .12/1.0）
  reloadT: 2.2, reloadE: 2.8,      // 战术/空仓换弹秒数
  scaleLen: .36                    // 视模最长边目标尺寸（手枪 .22~.30，长枪 .36~.55）
} /* ...64 条 */ ];

// src/game/08c-sounddata.js  —— WP1b 产出
var SOUNDDATA = {
  ak47:  { shot: ["assets/audio/v3/ak47_shot.wav"], reload: ["..."], bolt: [] },
  // ...逐枪；空数组/缺项 = 走类共用回退
  fallback: {
    long_shot: ["..."], pistol_shot: ["..."], smg_shot: ["..."], sniper_shot: ["..."],
    reload: ["..."], bolt: ["..."]     // 每项 1~3 个变体文件
  }
};
```

## 3. 5 弹匣制（所有武器，含手枪——取消无限备弹）

- **备弹 = 4 × 弹匣**（枪内 1 匣 + 备 4 匣 = 共 5 个弹匣）：pac9 30/120、deagle 7/28、awp 10/40、mp5 30/120、uzi 25/100、新枪按表。
- 取消 reserve=-1 全部路径（weapon-v3-research.md §4 已列 16 处：常量 4 / pac9 守卫 3 / GLB 分支 5 / pickup 4）：换弹消耗备弹、备弹 0 则不能换弹（仍可捡枪）。HUD 的 ∞ 分支保留（恒不触发）。
- 捡起的武器 = 满 5 弹匣；丢弃的武器**携带剩余弹药**（现状）。

## 4. 冲刺模式（rush）

| 项 | 战役 campaign | 冲刺 rush |
|---|---|---|
| 开局装备 | 槽1 pac9 + 槽2 deagle | **仅槽2 deagle**（5 弹匣），槽1 空 |
| 集装箱 | 也随机放枪（收录可捡） | **每个集装箱随机 1 把**（全池随机，长枪/手枪都可能），5 弹匣 |
| 敌人 | 基准 | **数量 ×2**（见 §5） |
| 其余 | 同 | 同 |

- 模式选择：主菜单两个按钮「开始行动 · 战役」「开始行动 · 冲刺」（pM() 的 innerHTML，09:2279-2284；点击分发 09:2461-2473 可读 dataset）。内部键 **`i.mode = "campaign" | "rush"`**（勿用 sprint——疾跑已占用）；必须在 H()（weapon.reset，09:2710）之前写入。
- 集装箱点位：`level.placed`（04:2020）47 条账本（container20=34/40=11/40hc=2），取 x,z + groundHeight 贴地；每点随机一把（同点不重复即可，允许同枪多点）。
- 现有 3 个固定刷枪点（awp/mp5/uzi）两模式都保留。

## 5. 敌人翻倍（rush）

依据 weapon-v3-research.md：`Yi.patrol{2,1}`(09:2533)、`Yi.waves[{3,1},{3,2},{4,3}]`(09:2537)、`Yi.maxAlive=9`(09:2547)、`Yi.pursuitExtra=5/pursuitMinAlive=4`(09:2551-2552)、`Ui.poolGulls=10/poolHounds=8`(09:1361-1362)。
- **池必须 boot 期就按 2× 建**（20/16）——模式在标题页才选、池在 boot 固定，池尽 spawn() 静默丢怪是已知假绿坑；rush 只放大**活跃配置**（maxAlive/waves/patrol×2），campaign 用基准值。
- `Yi` 是共享可变对象（09:2637）：**按模式从深拷贝基线重算**，禁止累乘（campaign↔rush 来回切会翻倍爆炸）。

## 6. 运行时加载（64 模型不能拖慢 boot）

- **懒加载**：boot 只建 pac9 + deagle（+可选 awp/mp5/uzi 既有 5 实例可保留）；其余型号首次被需要（刷出/捡起/切换）才 `dgGlb` 加载，加载完成前用**盒体占位**视模（接口同正式实例，无缝替换）。
- 模型放 `assets/models/v3/<slug>.glb`（约 60~90MB，全部入库随部署）；音频 `assets/audio/v3/`。
- `window.__DG` 保持可查（types/pickups/mode 等）。

## 7. 按键/门面（不变）

1/2/Q/F/G 与门面 API（v2 §4）不变；`kind` 对新枪 = slug；事件 `w` 字段 = slug，音频按 SOUNDDATA 查表回退类共用。
