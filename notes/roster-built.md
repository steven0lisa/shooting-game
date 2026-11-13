# 武器 v3 落地名册（WP1a 产出）

> 生成日期 2026-11-13。模型来源 [3dassets.dev Mega Weapon Pack](https://3dassets.dev/packs/mega-weapon-pack)（CC0 1.0，**无需署名**）。
> 数值来源：PF Gun List（145 把）优先 + adatechnology-game-kit `firearms.json`（115 款）补缺/校验。
> 对应产物：`src/game/08b-gundata.js`（GUNDATA 69 条）、`assets/models/v3/*.glb`（69 个文件）。
>
> **2026-11-13 补充（WP1c）**：追加 9 把霰弹枪（包内 9 件全收，cat=`long` 进槽 1），总数 60 → **69**。
> 霰弹枪段见「### 霰弹枪（主武器 · 9 把）」，音效为 FFSL 4 套源（model12 / charlesdaly / nova / mossberg）逐枪变调派生。

## 结论数字

| 项 | 值 |
|---|---|
| 收录总数 | **69**（原 60 + 霰弹枪 9；包内可用 64，排除 4 件与既有实现重复） |
| 手枪（副武器） | **15** |
| 长枪（主武器） | **54** = 步枪/卡宾 20 + DMR 7 + 狙击 9 + 冲锋/PDW 9 + **霰弹枪 9** |
| 模型总体积 | **85.1 MB**（69 个 GLB，均通过 `file` = glTF binary v2 与 GLB 头校验） |
| 单文件范围 | 0.55 ~ 3.26 MB（最大 = AW50 带镜反器材版 33453，3.26 MB / 95.7k 面） |
| 三角面范围 | 23.6k ~ 95.7k / 件（霰弹枪 25.3k ~ 66.0k；均值 47.4k，**比既有 4 把 GLB 重**，地面掉落建议 LOD/缩小） |
| 参数来源分布 | PF Gun List 21 / PF+kit 交叉校验 27 / 纯 kit 补缺 12（**PF 参与 48 条，kit 参与 39 条**）；霰弹枪 9 条为 PF+kit 同枪或同族映射 |

## 排除项（4 件，与既有定制实现重复）

| pack id | 模型名 | 排除理由 |
|---|---|---|
| 33303 | Folding Stock SMG | Uzi 造型（折叠托 9mm），与既有 `uzi.glb` 定制实现重复 |
| 33443 | Folding Stock SMG, Suppressed | 同上（消音版，连带排除） |
| 33335 | Chassis Bolt Sniper | AWP/AI 底盘系栓狙，与既有 `awp.glb` 重复 |
| 33449 | Chassis Sniper, Scoped | 同上（带镜版，连带排除） |

> 另 9 件霰弹枪原按 spec §1 标「备选不做」，**2026-11-13 WP1c 已全数收录**（见名册表霰弹枪段）；
> 7 件机枪、6 件发射器、1 件信号枪仍排除。

## 名册表

> 列说明：MB = 模型文件体积；dmg = 单发伤害；rpm = 每分钟射速；mag = 弹匣；rng = 有效射程(m)；
> adsFov 全部 52 者省略（仅 DMR/狙击列 18~24）。
> **oal (m) = 真实全长 overall length（枪托展开 / 枪口装置装好的状态），单位米，保留 3 位小数。**
> 数据来源：该枪映射真枪的**公开实测规格**（厂商 spec sheet / 军方技术手册 / Wikipedia 尺寸栏）。
> 带消音器的 Loadout 版（`glock34sd` / `hk416a5` / `m40a5` / `mk12` / `mk11` / `m110t` / `sa58` / `k31zfk` / `apc9sd`）
> 只取枪身本体长度，**不含外挂消音器**；见下方「oal 数据来源与估算项」。
> 用途：渲染长度 = oal × 统一视模系数，枪与枪的尺寸比严格等于真实比（`08-weapons.js` 读取）。

### 手枪（副武器 · 15 把）

| # | slug | 中文名 | 模型（pack 原名 / id） | MB | dmg | rpm | mag | rng | ads | bloom/rc | 换弹 T/E | scaleLen | oal (m) | 参数来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `glock17` | Glock 17 手枪 | Service Pistol (33296) | 0.67 | 36.8 | 300 | 17 | 120 | 52 | 0.24 / 1.05 | 1.90 / 2.50 | 0.28 | 0.204 | PF GLOCK 17(34)→36.8 / kit Glock 17（17 发、光学板） |
| 2 | `m17` | M17 执勤手枪 | Service Pistol, Duty Loadout (33455) | 0.87 | 38 | 270 | 17 | 130 | 52 | 0.25 / 1.10 | 1.95 / 2.55 | 0.29 | 0.203 | PF M9→38.0 / kit SIG P320；Duty Loadout（RX 光学+枪灯） |
| 3 | `glock19` | Glock 19 手枪 | Compact Pistol (33290) | 0.64 | 36.8 | 300 | 15 | 110 | 52 | 0.23 / 1 | 1.80 / 2.40 | 0.26 | 0.187 | PF GLOCK 17(34)→36.8 / kit Glock 19 |
| 4 | `glock19x` | Glock 19X 战术手枪 | Compact Pistol, Carry Loadout (33458) | 0.90 | 37.6 | 280 | 15 | 120 | 52 | 0.24 / 1.05 | 1.85 / 2.45 | 0.27 | 0.189 | PF GLOCK 17→37.6 / kit Glock 19；Carry Loadout（反射瞄+激光） |
| 5 | `p365` | SIG P365 微型手枪 | Subcompact Pistol (33292) | 0.62 | 33.2 | 300 | 10 | 95 | 52 | 0.22 / 1 | 1.70 / 2.30 | 0.22 | 0.147 | kit Glock 19 近似 −10%（10 发短握把） |
| 6 | `glock34` | Glock 34 长滑套手枪 | Long Slide Pistol (33293) | 0.72 | 37.6 | 300 | 17 | 135 | 52 | 0.25 / 1.10 | 1.90 / 2.50 | 0.30 | 0.224 | PF GLOCK 17→37.6 / 真实 G34 长滑套+补偿口 |
| 7 | `glock34sd` | Glock 34 消音手枪 | Long Slide Pistol, Suppressed (33456) | 1.15 | 37.8 | 260 | 17 | 140 | 52 | 0.26 / 1.15 | 1.95 / 2.55 | 0.30 | 0.224 | PF GLOCK 17→37.8；Suppressed Loadout |
| 8 | `glock18` | Glock 18 冲锋手枪 | Machine Pistol (33294) | 0.83 | 34.9 | 1100 | 19 | 110 | 52 | 0.28 / 1.35 | 1.90 / 2.50 | 0.26 | 0.186 | PF GLOCK 18(30)→34.9 / kit Glock 18 1200 rpm |
| 9 | `glock18c` | Glock 18C 战术冲锋手枪 | Machine Pistol, Fitted (33457) | 1.25 | 35.7 | 1100 | 30 | 120 | 52 | 0.29 / 1.40 | 1.95 / 2.60 | 0.27 | 0.186 | PF GLOCK 18→35.7；Fitted（30 发扩容+消音+枪灯） |
| 10 | `mark4` | Ruger Mark IV 目标手枪 | Target Pistol (33291) | 0.70 | 28 | 300 | 10 | 120 | 52 | 0.22 / 1 | 1.80 / 2.40 | 0.30 | 0.254 | PF ZIP 22(.22LR 15)→28 下界 / 牛管+拇指托+可调照门（.22 目标手枪造型） |
| 11 | `webley` | Webley Mk VI 左轮 | Break Top Revolver (33299) | 0.62 | 47 | 170 | 6 | 120 | 52 | 0.26 / 1.20 | 2 / 2.65 | 0.30 | 0.286 | PF 1858 NEW ARMY(60)→49 / .455 古董左轮（顶折式） |
| 12 | `python` | Colt Python 左轮 | Magnum Revolver (33297) | 0.62 | 47 | 180 | 6 | 145 | 52 | 0.26 / 1.25 | 2.10 / 2.75 | 0.30 | 0.275 | PF MP412 REX .357(56)→47 / kit Colt Python |
| 13 | `sw686` | S&W 686 左轮 | Service Revolver (33295) | 0.61 | 47 | 180 | 6 | 145 | 52 | 0.25 / 1.20 | 2.10 / 2.75 | 0.29 | 0.243 | PF MP412 REX .357→47 / kit S&W 686（7 发） |
| 14 | `coltsaa` | Colt SAA 单动左轮 | Single Action Revolver (33300) | 0.56 | 58 | 150 | 6 | 150 | 52 | 0.27 / 1.35 | 2.10 / 2.75 | 0.30 | 0.279 | PF JURY(.45 LC 80)→58 上界 / 单动结构 |
| 15 | `sw642` | S&W 642 短管左轮 | Snub Revolver (33298) | 0.55 | 41 | 170 | 5 | 95 | 52 | 0.24 / 1.15 | 1.95 / 2.60 | 0.22 | 0.165 | kit Taurus 82(.38 Spl) / PF 左轮基准 |

### 步枪 / 卡宾（主武器 · 20 把）

| # | slug | 中文名 | 模型（pack 原名 / id） | MB | dmg | rpm | mag | rng | ads | bloom/rc | 换弹 T/E | scaleLen | oal (m) | 参数来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `ak47` | AK-47 突击步枪 | Wood Stock Rifle (33322) | 1.29 | 34 | 600 | 30 | 290 | 52 | 0.17 / 1.25 | 2.40 / 3 | 0.44 | 0.870 | PF AK47(42)→34 / kit AK-47；SFX 同枪 |
| 2 | `akms` | AKMS 折叠托突击步枪 | Folding Stock Rifle (33323) | 0.89 | 33 | 600 | 30 | 280 | 52 | 0.17 / 1.25 | 2.30 / 2.90 | 0.42 | 0.880 | PF AKM(40)→33 / kit AKM |
| 3 | `ak74` | AK-74 突击步枪 | Standard Assault Rifle (33318) | 1.08 | 27 | 650 | 30 | 280 | 52 | 0.14 / 1.05 | 2.40 / 3 | 0.46 | 0.940 | PF AK74(34)→27 / kit AK-74 |
| 4 | `ak74n` | AK-74N 巡逻型突击步枪 | Standard Rifle, Patrol Loadout (33439) | 1.66 | 27.2 | 640 | 30 | 290 | 52 | 0.15 / 1.10 | 2.45 / 3.05 | 0.46 | 0.940 | PF AK74→27.2；Patrol Loadout（3× 棱镜+前握把+枪灯） |
| 5 | `m16a1` | M16A1 步枪 | Carry Handle Rifle (33329) | 1.10 | 25.4 | 800 | 30 | 270 | 52 | 0.14 / 1.05 | 2.10 / 2.75 | 0.47 | 1.006 | PF M16A3(32)→25.4 / kit Colt M16A2 |
| 6 | `m16a4` | M16A4 步枪 | Long Barrel Rifle (33320) | 1.64 | 28 | 300 | 30 | 300 | 52 | 0.13 / 1 | 2.10 / 2.70 | 0.47 | 0.986 | PF M16A4(35)→28 / kit Colt M16A2 |
| 7 | `mk12` | MK12 SPR 特等射手步枪 | Long Barrel Rifle, Suppressed (33444) | 2.17 | 28.6 | 290 | 30 | 330 | 52 | 0.16 / 1.15 | 2.20 / 2.80 | 0.47 | 1.000 | PF M16A4→28.6；4× 光学+消音（5.56 SPR） |
| 8 | `m4a1` | M4A1 卡宾枪 | Short Carbine (33316) | 1.10 | 27.1 | 780 | 30 | 250 | 52 | 0.15 / 1.05 | 2.20 / 2.80 | 0.40 | 0.840 | PF M4A1(34)→27.1 / kit Colt M4A1；SFX AR-15 |
| 9 | `mk18` | MK18 CQBR 近战卡宾枪 | Short Carbine, CQB Loadout (33437) | 1.42 | 28 | 950 | 30 | 180 | 52 | 0.18 / 1.30 | 2.10 / 2.70 | 0.38 | 0.760 | PF M4(35)→28；CQB Loadout（10.3in 短管） |
| 10 | `hk416` | HK416 卡宾枪 | Piston Carbine (33319) | 1.17 | 26.3 | 850 | 30 | 250 | 52 | 0.15 / 1.10 | 2.20 / 2.80 | 0.40 | 0.886 | PF HK416(31)→26.3 / kit HK416（短行程活塞） |
| 11 | `hk416a5` | HK416A5 夜战型 | Piston Carbine, Night Loadout (33440) | 1.65 | 26.6 | 850 | 30 | 255 | 52 | 0.16 / 1.15 | 2.25 / 2.85 | 0.40 | 0.886 | PF HK416→26.6；Night Loadout（夜视瞄+灯+激光+消音） |
| 12 | `fal` | FAL 50.00 战斗步枪 | Battle Rifle (33324) | 1.34 | 32.3 | 700 | 20 | 320 | 52 | 0.18 / 1.30 | 2.50 / 3.10 | 0.46 | 1.090 | PF FAL 50.00(41)→32.3 / kit FN FAL |
| 13 | `galil` | Galil ARM 突击步枪 | Heavy Tri Rail Carbine (33330) | 1.17 | 32 | 650 | 35 | 270 | 52 | 0.18 / 1.30 | 2.50 / 3.05 | 0.43 | 0.979 | kit 7.62×39 基准 ≈ PF AKM(40)→32 / 真实 35 发 |
| 14 | `honeybadger` | Honey Badger 消音步枪 | Integrally Suppressed Rifle (33326) | 1.57 | 23.7 | 800 | 30 | 210 | 52 | 0.15 / 1 | 2.20 / 2.80 | 0.39 | 0.740 | PF HONEY BADGER(.300 BLK，30)→23.7；SFX Savage 10 |
| 15 | `win94` | Winchester 1894 杠杆步枪 | Lever Action Rifle (33342) | 1.25 | 30 | 110 | 7 | 200 | 52 | 0.16 / 1.20 | 2.50 / 3.10 | 0.48 | 0.978 | kit Winchester 1894(.30-30，7 发) / PF HENRY 45-70 类比 |
| 16 | `aug` | Steyr AUG A1 突击步枪 | Bullpup Rifle (33321) | 1.19 | 23.7 | 680 | 30 | 290 | 52 | 0.14 / 1 | 2.30 / 2.90 | 0.44 | 0.790 | PF AUG A1(30)→23.7 / kit Steyr AUG A1 |
| 17 | `auga2` | Steyr AUG A2 突击步枪 | Bullpup Rifle, Optic Loadout (33441) | 1.51 | 27.1 | 680 | 30 | 285 | 52 | 0.15 / 1.05 | 2.35 / 2.95 | 0.44 | 0.790 | PF AUG A2(34)→27.1；Optic Loadout（全息+前握把+枪灯） |
| 18 | `aks74u` | AKS-74U 短突击步枪 | Tanker Carbine (33327) | 0.94 | 29.7 | 735 | 30 | 180 | 52 | 0.18 / 1.30 | 2.20 / 2.80 | 0.38 | 0.490 | PF KRINKOV(37)→29.7 / kit AKS-74U |
| 19 | `rfb` | Kel-Tec RFB 无托战斗步枪 | Bullpup Battle Rifle (33325) | 1.33 | 32.7 | 280 | 20 | 380 | 52 | 0.18 / 1.30 | 2.50 / 3.10 | 0.45 | 0.660 | kit FN SCAR-H(.308 2876 J) / PF FAL(41)→32.7 |
| 20 | `k31` | K31 直拉栓步枪 | Straight Pull Rifle (33341) | 1.33 | 34 | 55 | 6 | 380 | 52 | 0.18 / 1.20 | 2.50 / 3.10 | 0.48 | 1.110 | kit .30-06 栓动基准 / 7.5×55 Swiss（3600 J）；直拉枪机循环快 |

### 精确射手 / DMR（主武器 · 7 把）

| # | slug | 中文名 | 模型（pack 原名 / id） | MB | dmg | rpm | mag | rng | ads | bloom/rc | 换弹 T/E | scaleLen | oal (m) | 参数来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `svd` | SVD 德拉贡诺夫狙击步枪 | Battle Marksman Rifle (33332) | 1.22 | 33.5 | 300 | 10 | 420 | **20** | 0.18 / 1.30 | 2.55 / 3.15 | 0.48 | 1.220 | PF DRAGUNOV SVDS(70)→33.5 / kit SVD Dragunov |
| 2 | `sr25` | Knight's SR-25 精确步枪 | Marksman Rifle (33328) | 1.39 | 34 | 300 | 20 | 410 | **22** | 0.17 / 1.25 | 2.50 / 3.10 | 0.48 | 1.050 | PF MK11(45)→34 / kit Knight's SR-25 |
| 3 | `m110` | M110 SASS 精确步枪 | Semi Auto Marksman Rifle (33331) | 1.39 | 32.3 | 300 | 20 | 400 | **22** | 0.16 / 1.20 | 2.45 / 3.05 | 0.47 | 1.029 | kit M14 EBR(7.62×51 3504 J) / PF MK11(45)→32.3 |
| 4 | `mk11` | MK11 精确步枪（8× 光学） | Marksman Rifle, Scoped (33442) | 1.92 | 34 | 280 | 20 | 430 | **20** | 0.18 / 1.30 | 2.55 / 3.15 | 0.48 | 1.049 | PF MK11(45)→34；Scoped（8× 镜+消音） |
| 5 | `m110t` | M110 战术型（8× 光学） | Semi Auto Marksman, Scoped (33448) | 1.92 | 33.6 | 280 | 20 | 420 | **20** | 0.17 / 1.25 | 2.50 / 3.10 | 0.47 | 1.029 | PF MK11 同族（SR-25 系 7.62）；Scoped（8× 镜+消音+激光） |
| 6 | `sa58` | SA58 SPR 精确步枪 | Battle Rifle, Marksman Loadout (33438) | 1.99 | 34 | 280 | 20 | 400 | **20** | 0.18 / 1.30 | 2.55 / 3.15 | 0.46 | 1.010 | PF SA58 SPR(48)→34；Marksman Loadout（8× 镜+消音+激光） |
| 7 | `tavor7` | IWI Tavor 7 无托精确步枪 | Bullpup Marksman Rifle (33333) | 1.47 | 34 | 280 | 20 | 360 | **22** | 0.17 / 1.22 | 2.45 / 3.05 | 0.45 | 0.663 | PF AG-3(.308，45)→34 / 无托半自动 |

### 狙击 · 栓动（主武器 · 9 把）

| # | slug | 中文名 | 模型（pack 原名 / id） | MB | dmg | rpm | mag | rng | ads | bloom/rc | 换弹 T/E | scaleLen | oal (m) | 参数来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `trg42` | Sako TRG-42 栓动狙击 | Heavy Barrel Sniper (33337) | 1.37 | 120 | 45 | 5 | 650 | **18** | 0.38 / 2.05 | 2.90 / 3.50 | 0.58 | 1.199 | PF TRG-42(100)→120 / kit Sako TRG-42（.338 LM） |
| 2 | `mrad` | Barrett MRAD 栓动狙击 | Folding Chassis Sniper (33336) | 1.42 | 108 | 50 | 5 | 600 | **18** | 0.36 / 1.85 | 2.90 / 3.50 | 0.56 | 1.189 | PF AWM(.338 LM，82)→108 / kit Barrett MRAD（折叠托） |
| 3 | `m40a5` | M40A5 消音狙击步枪 | Suppressed Bolt Sniper (33338) | 1.45 | 98 | 52 | 5 | 540 | **20** | 0.33 / 1.65 | 2.90 / 3.50 | 0.53 | 1.130 | kit M24 SWS(7.62×51) / PF REM700→98；一体消音 |
| 4 | `tac50` | McMillan TAC-50 反器材狙击 | Anti Materiel Rifle (33339) | 2.74 | 116 | 45 | 5 | 620 | **18** | 0.38 / 2 | 2.90 / 3.50 | 0.58 | 1.467 | PF HECATE II(97)→116 / .50 BMG 29in 重管 |
| 5 | `aw50` | AW50 反器材步枪（8× 光学） | Anti Materiel Rifle, Scoped (33453) | 3.26 | 114 | 45 | 5 | 630 | **18** | 0.37 / 2 | 2.90 / 3.50 | 0.58 | 1.440 | PF HECATE II→114；Scoped（8× 镜+激光测距） |
| 6 | `m95` | Barrett M95 无托反器材 | Bullpup Anti Materiel Rifle (33340) | 1.31 | 118 | 45 | 5 | 600 | **18** | 0.37 / 2 | 2.90 / 3.50 | 0.56 | 1.153 | PF HECATE II(.50 BMG)→118 / 无托构型 |
| 7 | `kar98k` | Kar98k 栓动步枪 | Wood Stock Bolt Sniper (33334) | 1.26 | 97.6 | 50 | 5 | 430 | **20** | 0.32 / 1.60 | 2.80 / 3.40 | 0.52 | 1.110 | PF K14(.308，68)→97.6 / kit Mauser Kar98k 7.92×57 |
| 8 | `mosin` | Mosin-Nagant PU 狙击步枪 | Wood Sniper, Scoped (33450) | 1.56 | 92 | 65 | 5 | 480 | **22** | 0.30 / 1.60 | 2.80 / 3.40 | 0.53 | 1.230 | PF MOSIN NAGANT(60)→92 / kit Mosin 91/30；SFX 同枪 |
| 9 | `k31zfk` | K31 狙击型（ZfK 4× 光学） | Straight Pull Rifle, Scoped (33452) | 1.86 | 99 | 50 | 6 | 440 | **22** | 0.30 / 1.60 | 2.90 / 3.50 | 0.52 | 1.110 | kit .30-06 栓动基准 / 7.5×55（3800 J）；4× 镜+消音 |

### 冲锋枪 / PDW（主武器 · 9 把）

| # | slug | 中文名 | 模型（pack 原名 / id） | MB | dmg | rpm | mag | rng | ads | bloom/rc | 换弹 T/E | scaleLen | oal (m) | 参数来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `augpara` | AUG A3 Para 冲锋枪 | Bullpup SMG (33305) | 0.94 | 21.2 | 780 | 25 | 140 | 52 | 0.14 / 0.70 | 2 / 2.60 | 0.34 | 0.665 | PF AUG A3 PARA(34)→21.2 / kit Steyr AUG 循环 |
| 2 | `mpx` | SIG MPX 冲锋枪 | Carbine Length SMG (33308) | 1.11 | 20 | 850 | 30 | 165 | 52 | 0.12 / 0.62 | 2.10 / 2.70 | 0.36 | 0.673 | kit SIG MPX(9×19) ≈ PF MP5(34)→20 |
| 3 | `mpxc` | SIG MPX 战术冲锋枪 | Carbine SMG, Fitted (33445) | 1.43 | 20.3 | 900 | 30 | 170 | 52 | 0.12 / 0.64 | 2.05 / 2.65 | 0.33 | 0.673 | kit SIG MPX；Fitted（反射瞄+前握把+枪灯） |
| 4 | `m1a1` | Thompson M1A1 冲锋枪 | Classic Straight Magazine SMG (33306) | 1.20 | 23.3 | 725 | 30 | 160 | 52 | 0.16 / 0.78 | 2.30 / 2.80 | 0.38 | 0.810 | PF TOMMY GUN(37)→23.3 / kit Thompson M1A1；SFX 同枪 |
| 5 | `ppsh41` | PPSh-41 冲锋枪 | Drum Fed SMG (33309) | 1.40 | 15 | 1000 | 71 | 150 | 52 | 0.16 / 0.72 | 2.30 / 2.80 | 0.37 | 0.843 | PF PPSH-41(25)→15 下界 / kit PPSh-41；SFX 同枪 |
| 6 | `apc9sd` | B&T APC9 SD 消音冲锋枪 | Integrally Suppressed SMG (33302) | 1.06 | 16 | 900 | 30 | 150 | 52 | 0.12 / 0.60 | 2 / 2.60 | 0.33 | 0.610 | kit B&T MP9 近似（9mm 亚音速）/ PF MP5 基准→16 |
| 7 | `rattler` | SIG MCX Rattler PDW | PDW With Brace (33307) | 0.99 | 18.5 | 800 | 30 | 130 | 52 | 0.14 / 0.70 | 2 / 2.60 | 0.30 | 0.570 | PF HONEY BADGER(.300 BLK，30)→18.5 / 5.5in 短管 |
| 8 | `rattlerf` | SIG MCX Rattler 战术型 | PDW, Fitted (33447) | 1.49 | 18.8 | 800 | 30 | 135 | 52 | 0.14 / 0.72 | 2.05 / 2.65 | 0.31 | 0.570 | PF HONEY BADGER→18.8；Fitted（反射瞄+消音+激光） |
| 9 | `sten` | Sten Mk II 冲锋枪 | Side Magazine SMG (33304) | 0.87 | 22.6 | 550 | 32 | 145 | 52 | 0.15 / 0.72 | 2.20 / 2.80 | 0.36 | 0.762 | PF L2A3(36)→22.6 / 侧置弹匣 32 发 |

### 霰弹枪（主武器 · 9 把，WP1c 补充）

> 全 9 件取自包里「霰弹枪（备选）」组，**裸枪版 7 + 同枪变体 2**（`ksgf`←Bullpup Shotgun Fitted、
> `vepr12`←Magazine Shotgun Fitted——后者兼作 Vepr-12 战术型，弹匣供弹构型本就不同）。
> 游戏刻度：泵动/折开式走「近距一发重创」档（damage 92~100 / rpm 48~75 / range 35~44），
> 半自动走「可连发、单发较弱」档（damage 70~72 / rpm 110~125 / range 42~45）；
> 折开式 2 发枪 mag=2（真实构型），泵动弹仓 6~7，弹匣式 8。
> `reserve` 不写（08-weapons 按 4×mag 自动算）。

| # | slug | 中文名 | 模型（pack 原名 / id） | MB | dmg | rpm | mag | rng | ads | bloom/rc | 换弹 T/E | scaleLen | oal (m) | 参数来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `rem870` | 雷明顿 M870 霰弹枪 | Pump Shotgun (33311) | 1.05 | 95 | 60 | 6 | 38 | 52 | 0.20 / 1.45 | 2.80 / 3.50 | 0.45 | 1.070 | PF REMINGTON 870(8×33)→95 / kit Remington 870（120 rpm、6 发、400 m/s）；泵动 |
| 2 | `versamax` | 雷明顿 Versa Max 战术霰弹枪 | Semi Automatic Shotgun (33310) | 1.02 | 72 | 110 | 7 | 45 | 52 | 0.22 / 1.55 | 2.90 / 3.60 | 0.45 | 1.105 | kit 12ga 半自动基准（Benelli M4 180 / CBC 系列）；PF SPAS-12 半自动档(8×30)→72 |
| 3 | `saiga12` | Saiga-12 弹匣霰弹枪 | Magazine Fed Shotgun (33312) | 1.25 | 70 | 120 | 8 | 42 | 52 | 0.24 / 1.60 | 3 / 3.80 | 0.45 | 1.145 | PF SAIGA 12(8×27)→70 / kit Saiga-12（180 rpm、8 发弹匣）；弹匣式 |
| 4 | `vepr12` | Molot Vepr-12 战术霰弹枪 | Magazine Shotgun, Fitted (33451) | 1.58 | 71 | 125 | 8 | 43 | 52 | 0.24 / 1.65 | 3.10 / 3.90 | 0.45 | 1.120 | PF SAIGA 12 同族(8×27)→71 / kit Saiga-12 循环；Fitted（全息镜+枪灯+斜握把），Vepr-12 战术型 |
| 5 | `ksg` | Kel-Tec KSG 无托泵动霰弹枪 | Bullpup Shotgun (33313) | 0.94 | 92 | 70 | 7 | 40 | 52 | 0.20 / 1.35 | 2.70 / 3.40 | 0.45 | 0.663 | PF KSG-12(8×32)→92 / kit Kel-Tec KSG（120 rpm、14 发双管）；模型双管各 7 发档 |
| 6 | `ksgf` | Kel-Tec KSG 战术型（全息瞄） | Bullpup Shotgun, Fitted (33446) | 1.08 | 93 | 72 | 7 | 41 | 52 | 0.21 / 1.38 | 2.75 / 3.45 | 0.45 | 0.663 | PF KSG-12→93；Fitted（全息瞄具）；同枪变体沿用裸枪 oal |
| 7 | `citori` | Browning Citori 上下双管霰弹枪 | Over And Under Shotgun (33314) | 0.97 | 100 | 50 | 2 | 44 | 52 | 0.18 / 1.50 | 2.60 / 3.45 | 0.45 | 1.156 | PF STEVENS DB(8×36)→100 上界 / kit Boito double-barrel（break/volley）；折开式，管长 28in |
| 8 | `stevens311` | Stevens 311 平双管霰弹枪 | Side By Side Shotgun (33315) | 0.92 | 99 | 48 | 2 | 42 | 52 | 0.18 / 1.50 | 2.60 / 3.45 | 0.45 | 1.156 | PF STEVENS DB(8×36)→99 / kit Boito 双管基准；折开式，双扳机 |
| 9 | `sawnoff` | 截短双管霰弹枪 | Sawn Off Shotgun (33317) | 0.75 | 100 | 75 | 2 | 35 | 52 | 0.24 / 1.70 | 2.60 / 3.60 | 0.32 | 0.500 | PF SAWED OFF(8×29)→100 / kit Boito 双管；短管=`近距最狠、射程最短`，rc 最高 |

### 霰弹枪数值与素材备注（WP1c）

- **oal 来源**：rem870 1.070（Remington 870 Express 28in 管，42.0 in）／versamax 1.105（Versa Max Tactical 22in 管，43.5 in）／saiga12 1.145（Saiga-12 430mm 管，45.1 in）／vepr12 1.120（Vepr-12 折叠托展开档）／ksg 0.663（KSG 26.1 in）／ksgf 0.663（同枪身，配件不改全长）／citori 1.156（Citori 28in 管 45.5 in）／stevens311 1.156（28in 双管 45.5 in）／sawnoff 0.500（截短 18.5in 档，模型实测 0.465 m）。
- **模型清单（裸枪优先，同枪变体仅取 2 件）**：33311 泵动（木托、通风肋、珠形准星）、33310 气动半自动（聚合物护木+固定托）、33312 弹匣式战术（伸缩托+弹匣+导轨）、33451 弹匣式带配件（全息+灯+斜握把）、33313 无托泵动（双管弹仓在握把后）、33446 同枪带全息、33314 上下双管折开、33315 平双管折开（双扳机）、33317 截短双管（手枪握把+挂环）。全部 glTF binary v2。
- **音效派生规则**（`assets/audio/v3/`，63 个 wav 全部 astats 通过：时长 >0.14s、峰值 -0.4~-10 dB、无削波）：
  | slug | 源套件（FFSL） | 变调 |
  |---|---|---|
  | rem870 | Model 12（泵动 12ga） | ×0.98 |
  | ksg / ksgf | Nova（泵动 12ga） | ×1.04 / ×1.055 |
  | versamax | Charles Daly（12ga 泵动） | ×0.99 |
  | saiga12 / vepr12 | Mossberg（12ga） | ×1.02 / ×1.035 |
  | citori | Charles Daly | ×1.01 |
  | stevens311 | Model 12 | ×1.015 |
  | sawnoff | Model 12 + Charles Daly | ×1.06，枪声截 0.80s（短管爆响无尾啸） |
  折开式 3 把（citori / stevens311 / sawnoff）的 `reload` 用**开膛+闭膛动作声**（12ga 泵动套件里的 open/close action），符合折开式装填原理；`bolt` 与 `reload` 同源（折开枪无独立拉栓动作）。
- **音效覆盖**：9 把枪 **shot/reload/bolt/dry 四项全有自己的文件**（各 1~2 个变体），不依赖 fallback。
- **接线现状（实测）**：`weapon:fire` 已按 `Go[slug + "_shot"]` 路由，浏览器实测 9 把的 `shot` 懒加载按 slug 生效（如 `stevens311_shot.wav`）。`reload` / `bolt` / `dry` 通道已注册进 Go（`dgSfxPlan` + `dgRegisterGo`），但 `07-player-fx.js` 的 `weapon:reload` 处理器只特判 deagle / mp5 / uzi，其余（含全部 60 把 GUNDATA 枪）落 `reload_magout` / `reload_magin` / `reload_bolt` 通用合成音——**属既有接线限制、非本次遗漏**（红线不碰 07/08），后续要启用逐枪换弹音需在 07 的 reload 分支按 `Go[w + "_reload"]` 扩展。

## oal 数据来源与估算项

来源口径：**映射真枪的公开实测全长**（厂商 spec sheet / 军方技术手册 / 型号尺寸栏），取「枪托展开、枪口装置装好」状态。
手枪量级 .14~.30、冲锋/PDW .25~.75、步枪/卡宾 .70~1.05、狙击/DMR .95~1.45、霰弹枪 .50~1.16 —— 全部 69 条落在所属区间内。

**直接对照公开规格的 49 条**（含任务书锚点全对齐）：

| 类别 | slug → oal（m） |
|---|---|
| 手枪 | glock17 .204 / m17 .203（P320 M17）/ glock19 .187 / glock19x .189 / p365 .147 / glock34 .224 / glock18 .186 / mark4 .254 / webley .286 / python .275 / sw686 .243 / coltsaa .279 / sw642 .165 |
| 步枪/卡宾 | ak47 .870 / akms .880 / ak74 .940 / m16a4 .986 / mk12 1.000 / m4a1 .840 / mk18 .760 / hk416 .886 / fal 1.090 / galil .979 / honeybadger .740 / win94 .978 / aug .790 / aks74u .490 / rfb .660 / k31 1.110 |
| DMR | svd 1.220 / m110 1.029 / tavor7 .663 |
| 狙击 | trg42 1.199 / tac50 1.467 / aw50 1.440 / m95 1.153 / kar98k 1.110 / mosin 1.230 |
| 冲锋/PDW | augpara .665 / m1a1 .810 / ppsh41 .843 / sten .762 |
| 霰弹枪 | rem870 1.070 / versamax 1.105 / saiga12 1.145 / vepr12 1.120 / ksg .663 / ksgf .663 / citori 1.156 / stevens311 1.156 / sawnoff .500 |

**估算 9 条**（模型构型与该型号多口径/多枪管版对应不唯一，取同级同类公开值）：

| slug | oal | 估算依据 |
|---|---|---|
| `m16a1` | 1.006 | M16A1 = 39.63 in（M16A2/A4 的 39.5 in 同族，A1 略长） |
| `mpx` / `mpxc` | .673 | SIG MPX 8" 管折托展开 26.5 in；两把同枪身，仅配件差异 |
| `sr25` | 1.050 | SR-25 20" 管，41.5 in（公开值区间 40.5~41.5） |
| `mk11` | 1.049 | MK11 Mod 0 20" 管，与 SR-25 同身 |
| `sa58` | 1.010 | DSA SA58 SPR 16"，折托展开，40 in 档 |
| `mrad` | 1.189 | Barrett MRAD 24" 管，46.8 in（27" 版为 49.4 in） |
| `m40a5` | 1.130 | M40A5 25" 管，44.5 in（不含消音器） |
| `apc9sd` | .610 | B&T APC9 SD 含一体消音器 24 in 档（裸枪 .44） |
| `rattler` / `rattlerf` | .570 | MCX Rattler 5.5" 管 + 折叠撑杆托，22.5 in |

> 同枪变体（`ak74n`=ak74、`hk416a5`=hk416、`m110t`=m110、`k31zfk`=k31、`glock34sd`=glock34、`glock18c`=glock18、`auga2`=aug、`mpxc`=mpx、`rattlerf`=rattler）
> 一律沿用裸枪值：配件不改变枪身全长，只在 `scaleLen` 上体现视觉差异。

## 数值刻度与映射规则（供后续模块核对）

| 类别 | damage | rpm | adsFov | bloom | rc | reloadT | reloadE | scaleLen | **oal (m)** |
|---|---|---|---|---|---|---|---|---|---|
| 手枪 | 28~58 | 150~300（左轮 150~180）/ 冲锋手枪 1100 | 52 | .22~.29 | 1.0~1.4 | 1.7~2.1 | 2.3~2.75 | .22~.30 | **.147~.286** |
| 冲锋/PDW | 15~24 | 550~1100 | 52 | .12~.16 | .60~.78 | 2.0~2.3 | 2.6~2.8 | .30~.38 | **.490~.843** |
| 步枪/卡宾 | 22~34 | 600~950（半自动 290~300） | 52 | .13~.18 | 1.0~1.30 | 2.1~2.5 | 2.7~3.1 | .38~.48 | **.660~1.110** |
| DMR | 30~34 | 280~300 | 20~22 | .16~.18 | 1.20~1.30 | 2.45~2.55 | 3.05~3.15 | .45~.48 | **.663~1.220** |
| 狙击（栓动） | 85~120 | 45~65 | 18~22 | .30~.38 | 1.6~2.05 | 2.8~2.9 | 3.4~3.5 | .50~.58 | **1.110~1.467** |
| 霰弹枪·泵动/折开 | 92~100 | 48~75 | 52 | .18~.24 | 1.35~1.70 | 2.6~2.8 | 3.4~3.6 | .32~.45 | **.500~1.156** |
| 霰弹枪·半自动 | 70~72 | 110~125 | 52 | .22~.24 | 1.55~1.65 | 2.9~3.1 | 3.6~3.9 | .45 | **1.105~1.145** |

- **PF 伤害线性缩放**：手枪取 PF 近距伤害在 [15, 80] 区间内线性映射到 [28, 58]；步枪 [28, 42] → [22, 34]；冲锋 [25, 38] → [15, 24]；狙击 [50, 100] → [85, 120]；**霰弹枪按任务书自定刻度**（PF 的 8×N 弹丸伤害不直接映射，泵动 92~100 / 半自动 70~72 对应 hound 140 HP 的「1~2 发 vs 2 发」节奏）。保序不保绝对值。
- **PF 无同名的 20 把**（如 K31、Galil、M14、RFB、Tavor、Win1894、MPX、APC9、Sten 等）：按 kit `action.muzzleSpeed × calibers.bulletGrams` 动能与同族 PF 枪对齐，或按口径族基准取中值。
- **rpm**：kit `action.rpm` 优先（真实循环率）；kit 的栓动 `73.17` 是循环限制值，本表按枪机行程微调为 45~65（重反器材更慢）。
- **mag**：真实弹匣优先；Loadout 变体按模型实际弹匣（Glock18C 30 发、MPX Fitted 30 发等）。
- **敌人 HP 基准**：hound 140 / gull 45（`09-game-ui.js` Pn.hp / Gt.hp），据此校准"几发击杀"。

## 命名与 slug 约定

- slug = 真枪名小写无分隔（`ak47` / `glock17` 类）；同枪有 Loadout 版的用后缀区分（`glock19` / `glock19x`、`m110` / `m110t`、`rattler` / `rattlerf`）。
- slug 同时是：模型文件名（`assets/models/v3/<slug>.glb`）、GUNDATA 键、SOUNDDATA 键（WP1b 共用此键）。
- 与国际惯例枪名对应关系（易混处）：
  - `ak74` ← pack「Standard Assault Rifle」（标准 AK 系 5.45 造型）
  - `ak47` ← pack「Wood Stock Rifle」（木托 AK 造型）
  - `m16a1` ← pack「Carry Handle Rifle」（提把 M16 造型）
  - `m16a4` ← pack「Long Barrel Rifle」（20in 枪管 M16A4 造型）
  - `svd` ← pack「Battle Marksman Rifle」（木托半自动狙击，SVD 造型）
  - `sr25` ← pack「Marksman Rifle」（SR-25 系精确射手）
  - `m110` ← pack「Semi Auto Marksman Rifle」（AR 系 7.62 DMR，M110 造型）
  - `tavor7` ← pack「Bullpup Marksman Rifle」（无托 .308 精确射手）
  - `trg42` ← pack「Heavy Barrel Sniper」（重管栓狙，TRG-42 造型）
  - `rem870` ← pack「Pump Shotgun」（木托泵动 12ga，870 造型）
  - `versamax` ← pack「Semi Automatic Shotgun」（气动半自动 12ga）
  - `saiga12` ← pack「Magazine Fed Shotgun」（弹匣供弹自动霰弹）
  - `vepr12` ← pack「Magazine Shotgun, Fitted」（弹匣式带全息/灯/斜握把 = Vepr-12 战术型）
  - `ksg` / `ksgf` ← pack「Bullpup Shotgun」/「Bullpup Shotgun, Fitted」（无托双管弹仓，KSG 造型）
  - `citori` ← pack「Over And Under Shotgun」（上下双管折开）
  - `stevens311` ← pack「Side By Side Shotgun」（平双管折开，双扳机）
  - `sawnoff` ← pack「Sawn Off Shotgun」（截短双管 + 手枪握把）

## slug 与音效表（WP1b / 08c-sounddata.js）的对齐

本表 slug 是 SOUNDDATA 的唯一键。WP1c 后 `08c-sounddata.js` 有 **33 个键 = 32 个逐枪条目 + fallback**（原 23 + 霰弹枪 9），直接同 slug 命中 **12** 条（原 3 + 霰弹枪 9 全部同 slug）。

> 注：音效侧有 `m1911` 条目，但本表**没有** M1911——包内 Target Pistol（33291）实为 .22 口径牛管目标手枪（木拇指托+可调照门），命名 `mark4`（Ruger Mark IV 造型）更准确，故音效侧 `m1911` 在本表无对应（可留作 WP2 后续手工加枪或改挂 `mark4`）。

| GUNDATA slug | SOUNDDATA 条目 | 说明 |
|---|---|---|
| `ak47` | `ak47` | 同枪（AK-47 全套 51 条） |
| `ppsh41` | `ppsh41` | 同枪（PPSh 36 条） |
| `sw642` | `sw642` | 同枪（S&W 642 28 条） |
| `rem870` / `versamax` / `saiga12` / `vepr12` / `ksg` / `ksgf` / `citori` / `stevens311` / `sawnoff` | 同名（各 9 条内） | WP1c 逐枪派生（源：FFSL 4 套 12ga 泵动/折开套件） |

**其余 20 个音效条目遵循 SFX 库原生的枪型名**，与本表 slug 不一致（属音效侧设计选择，不是缺陷），WP1b 接入时应按后续别名表匹配，或由 08-weapons 的 `dgSfxPlan()` 走 `fallback`（按 cat+fire 四类共用音，已就绪）：

| SFX 库条目 | 建议对齐的本表 slug |
|---|---|
| `ar15` | `m4a1`（5.56 卡宾通用族，AR-15 音也是 M16A1/M16A4/M4A1 的最佳源） |
| `mosinnagant` | `mosin` |
| `carlgustavm45` | `mpx` / `mpxc`（9mm SMG 类，M45 是 9mm SMG 通用源） |
| `waltherppq` | `glock17` / `glock19` / `p365`（9mm 击针手枪通用源） |
| `sks` / `ruger1022` / `rugermarkiii` / `rugersinglesix` / `springfield1917` / `arisaka` / `tikka` / `savage10` / `marlin336` / `model1894` / `bersa380` / `charlesdaly` / `model12` / `mossberg` / `nova` | 本表无对应造型（包内无 SKS/春田/有坂/鲁格 .22/杠杆枪除 Win94 外等），**只能走 fallback** |

> 结论：**完备度不因此降级**——`fallback` 提供 `long_shot / pistol_shot / smg_shot / sniper_shot / reload / bolt` 六类共用音，69 把全部有声音；同枪优先命中 12 把 + 可借音 3 族。
> **霰弹枪不在 fallback 四类里**（fallback 只有 pistol/smg/long/sniper_shot），故 9 把霰弹枪一律自带独立套件，不依赖回退。

## 遗漏 / 降级项

1. **未收录 4 件**（见上方排除表）——均为既有实现的重复造型，非遗漏。霰弹枪 9 件已于 WP1c 全数收录，排除项不涉及霰弹枪。
2. **裸枪 / 带配件版的混用（实测 49 裸枪 + 11 带配件版）**——任务书要求「同枪有 Loadout/Scoped 版的取裸枪」，但**裸枪数量不足**：按 survey 的四个分组统计，**纯裸枪可用仅 42 件**：手枪 11 / 步枪 15 / 狙击 9（裸枪 10 件中 Chassis Bolt Sniper 属 AWP 系已排除）/ 冲锋 7（裸枪 8 件中 Folding Stock 属 Uzi 系已排除）。42 < 任务书目标 60±，**要凑数必然要借同枪变体**——手枪侧尤其明显（裸枪只有 11，够不到 15）。**处置**：
   - **手枪 15 = 11 裸枪 + 4 同枪变体**（`m17`←Service Pistol Duty、`glock19x`←Compact Carry、`glock34sd`←Long Slide Suppressed、`glock18c`←Machine Pistol Fitted）。变体差异：模型自带瞄具/枪灯/消音/扩容弹匣，数值按模型实际配置微调（弹匣 30 发、瞄准更快），slug 加后缀区分，不与裸枪同名。**无同枪重复模型**。
   - **长枪 45 = 34 裸枪 + 11 变体**：变体全部对应**独立的真实枪型差异**而非纯配件（`mk18`←Short Carbine CQB = 10.3in 短管型、`mk12`←Long Barrel Suppressed = 18in SPR、`auga2`←Bullpup Rifle Optic = AUG A2 光学型、`hk416a5`←Piston Carbine Night = HK416A5、`ak74n`←Standard Rifle Patrol = AK-74N 棱镜型、`sa58`←Battle Rifle Marksman = SA58 SPR、`mk11`/`m110t`←Marksman/Semi Auto Scoped = 带 8× 镜型号、`aw50`←Anti Materiel Scoped、`mosin`←Wood Sniper Scoped、`k31zfk`←Straight Pull Scoped、`mpxc`←Carbine SMG Fitted、`rattlerf`←PDW Fitted）。这些在真实世界里就是不同型号（SPR/CQBR/A2/A5/N 型/Scoped 版），作为独立武器收录合理；**若后续 WP2 要求"每把都能挂配件"，这 11 把的变体性可由 08-weapons 的瞄具系统覆盖，届时可退回裸枪模型**。
3. **无 5.7mm 枪族**：包内无 Five-seveN/P90 造型，PF 相关枪（FIVE SEVEN / P90 / PS90）无法映射，未收录。
4. **无霰弹枪/机枪/发射器**：霰弹枪 9 把已于 WP1c 收录（见上方霰弹枪段）；机枪/发射器仍按任务书排除。
5. **`.50 BMG` 与 `.408 CheyTac` 参数为手填**：kit `calibers.json` 有 50bmg/408cheytac 口径但部分枪 `muzzleSpeed` 缺失，反器材三把（TAC-50/AW50/M95）按 PF HECATE II/BFG 50 伤害区间取 114~118，物理值参考公开弹道。

## 复用与校验命令

```bash
# 语法（不通过不许提交）
node --check src/game/08b-gundata.js

# 名册/文件一致性（69 条、无重复 slug、模型全部存在、oal 合法）
node -e 'const fs=require("fs"),vm=require("vm");const c={};vm.createContext(c);
vm.runInContext(fs.readFileSync("src/game/08b-gundata.js","utf8")+";GUNDATA",c);
const a=c.GUNDATA;console.log(a.length,new Set(a.map(g=>g.slug)).size,
 a.filter(g=>!fs.existsSync(g.model)).map(g=>g.slug),
 a.filter(g=>!(+g.oal>0.05&&+g.oal<2.5)).map(g=>g.slug));'

# 音效表与文件一致性（SOUNDDATA 每个路径都必须存在）
node --check src/game/08c-sounddata.js && node -e 'const fs=require("fs"),vm=require("vm");const c={};vm.createContext(c);
vm.runInContext(fs.readFileSync("src/game/08c-sounddata.js","utf8")+";SOUNDDATA",c);
const sd=c.SOUNDDATA;let miss=[];for(const k in sd){if(k==="fallback")continue;
 for(const g of ["shot","reload","bolt","dry"]) if(sd[k][g]) for(const p of sd[k][g]) if(!fs.existsSync(p)) miss.push(k+":"+p);}
console.log(Object.keys(sd).length,miss);'

# 模型完整性（每个文件必须是 glTF binary v2）
for f in assets/models/v3/*.glb; do file "$f" | grep -q "glTF binary" || echo "BAD $f"; done
```
