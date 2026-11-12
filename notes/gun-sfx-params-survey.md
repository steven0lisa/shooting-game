# 枪械音效库 + 武器参数库盘点（三源对照）

> 调研日期：2026-11-13 · 数据快照均来自当日 GitHub API / raw 实测（各节标注）
> 红线合规：本文件是本次调研**唯一写入仓库**的文件；下载与解析中间件全部在 /tmp（未进 assets/）；未改代码、未读 refers/。
> 配套背景：doc/weapons-library.md（三源清单）；游戏现状 DGTypes 注册表已有 pac9/deagle/awp/mp5/uzi 五型 + 4 把 GLB。

## 结论先行（TL;DR）

| 问题 | 答案 |
|---|---|
| 表 A：SFX 库有几把枪？ | **24 把**（724 条 Master 干声 + 56 条 Prepared 成品），其中 **21 把有完整套件** |
| 表 B：参数库有几把枪？ | PF Gun List **145 把**；kit firearms.json **115 款枪械 + 34 种口径**；PF∩kit 同名可对上 **62 把** |
| 表 C：三源交集 | 「有参数 + 有同枪音效」**7 把**（AK47 / SKS / M1911 / PPSH-41 / MOSIN NAGANT / M4A1 / HONEY BADGER）；「有参数、按口径类共用音效」可再覆盖约 45 把；PF 剩余约 90 把只有参数无音效 |
| 推荐 | 首批收录 18 把名单见 §4（7 把全链路 + 11 把参数齐/音效借口径） |
| 许可 | SFX=CC0-1.0（repo 根 LICENSE）；kit=MIT（repo 根 LICENSE，音频另有逐文件 CREDITOS.md，armas 内 243 CC0 / 15 CC-BY）；**PF gist 无任何许可声明**（数值可参考、desc 文案勿照抄） |

---

## 0. 数据源与许可

### 0.1 FreeFirearmsSFXLibrary — CC0-1.0

- 仓库：github.com/buddingmonkey/FreeFirearmsSFXLibrary（default branch = `main`，2024-06 最后更新，~3.4 GB 音频）
- LICENSE 原文位置：仓库根 `LICENSE`（121 行 CC0-1.0 Universal 完整法律文本，已核验；GitHub API `license.spdx_id=CC0-1.0`）
- 性质：2014 年 Kickstarter「Firearm Sound Library」（Ben Jaszczak 录制）全量镜像；README 引用原众筹页说明分为两版——`Master Tracks/`（未处理的原始干声，含 metadata）与 `Prepared SFX/`（拖拽即用的成品枪声）
- 实测结构：`Master Tracks/` 24 个枪械目录 / 724 条 wav；`Prepared SFX/` 22 个目录 / 56 条 wav；`Master Sheet.xlsx`（725 行总表：Filename/CD/Track/Index/Description）+ `Prepared Master Sheet.csv`（56 行成品表）

### 0.2 PF Gun List（Gist）— 无许可声明（注意）

- 地址：gist.github.com/DET171/25079304790686bb47c5cc7c3d6f6a41（单文件 `list.json`，42.7 KB，145 条）
- **许可：gist 未附任何 LICENSE**（仓库 doc/weapons-library.md 也未标）。字段是游戏数值（事实性数据），可参考；但每条的 `desc` 是创作性文案，**不要照抄进游戏**。采用建议见 §3。
- 字段：name / cal（口径）/ dmg（近-远伤害衰减）/ cap（弹匣+1 / 备弹）/ rpm（可带模式后缀）/ r（有效射程区间）/ multi（部位倍率，头/其他，语义未官方说明）/ desc / rank（解锁等级）

### 0.3 adatechnology-game-kit — MIT（音频逐文件另有授权）

- 仓库：github.com/Andersonfrfilho/adatechnology-game-kit（pnpm monorepo，62 个 packages，活跃演进中）
- LICENSE 原文位置：仓库根 `LICENSE`（MIT，Copyright (c) 2026 Anderson Fernandes，已核验原文）
- **枪械参数**：`packages/game-weapons/src/data/firearms.json`（当前 main 实测 **115 款**，非 doc 里的 79 款——仓库在持续更新）+ `calibers.json`（**34 种口径**，含弹重/初速/风阻/噪声/弹壳尺寸）+ `ammo.json`/`archetypes.json`/`attachments.json` 等
- **音效资产**：`packages/game-audio/assets/sfx/`（1179 个 ogg）：`armas/` 258 个（枪械声：按口径枪声 + 拉栓/抛壳/换弹/上膛等机构声）、`impactos/` 291、`personagem/` 300、`itens-portas/` 155、`explosoes-fogo/` 86、`veiculos/` 62、`ambiente/` 27；清单 `manifest.json`（483 KB）驱动 recipe 混音
- 音频许可：`packages/game-audio/assets/sfx/CREDITOS.md` 逐文件标注——`armas/` 内 **243 条 CC0 / 15 条 CC-BY**；主力来源恰是 Ben Jaszczak 的 Free Firearm Sound Library（216 条，与 §0.1 同源，CC0）；CC-BY 条目（多为 Oculus Audio 环境声）需署名。**选音频时认准 CC0 条目即零负担**
- 值得注意：kit 的枪声按**口径**组织（pistol_9mm / pistol_45 / pistol_22lr / revolver_38_357 / rifle_5_56 / rifle_7_62x39 / rifle_308_3006 / shotgun_12 / launcher_40mm，各 close/far 变体），本身就是「口径类共用音效」的现成实现

---

## 1. 表 A：FreeFirearmsSFXLibrary 枪型 × 音效完备度

### 1.1 文件命名规律

- **Master Tracks**：`Master Tracks/<枪械目录>/<字母>_<编号>.wav`。字母 = 枪的盘符（A=1911、C=AK-47、D=AR-15…），编号即总表 `Filename` 字段；语义**不在文件名里**，查 `Master Sheet.xlsx` 的 Description 列（如 `C_0`="AK-47 ... Load mag"）
- **Prepared SFX**：`Prepared SFX/<枪械目录>/<字母>_<编号>P.wav`，文件名与 Master 的 FN 对应（FN=Track-1），Description 里带距离/方位标签（near/mid distance, front of shooter...），全部是**枪声**（单发+连发），没有机构声
- 语义分类统计：每枪约 8~34 条枪声（近/中/远距离 + 短/长连发）+ 2~14 条换弹/上膛机构声 + 空仓干击；**没有独立命名的 "reload.wav" 这类文件，换弹音要靠总表 Description 挑**

### 1.2 表 A 主体（24 枪全量；重点类已排前）

图例：shot列 = 近/中距单发 FN；burst = 连发；reload = 换弹（弹匣出/入/装填）；mech = 上膛/拉栓/杠杆/泵；dry = 空仓；FN → 实际文件 `Master Tracks/<目录>/<FN>.wav`。

| 枪型（Master 目录） | 类别 / 口径 | 干声数 | shot 近/中 | burst | 远距 | reload | mech | dry | 完备度 | PF 同枪 |
|---|---|---|---|---|---|---|---|---|---|---|
| **1917**（1917） | 步枪 / Springfield 1917 栓动 .30-06 | 25 | B_23,B_24 / B_15,B_16 | — | B_21,B_22 | B_0,B_2,B_3 | B_0,B_1 | B_9 | 完整 | - |
| **AK-47**（AK-47） | 步枪 / 7.62x39 全自动/半自动 | 51 | C_25,C_28 / C_31,C_37 | C_18,C_19 | C_17,C_23 | C_0,C_1,C_2 | C_0,C_1 | C_7 | 完整 | AK47 |
| **AR-15**（AR-15） | 步枪 / .223/5.56 卡宾枪 半自动 | 33 | D_31,D_32 / D_23,D_24 | — | D_25,D_26 | D_0,D_1,D_2 | D_6,D_7 | D_16 | 完整 | M4A1 |
| **Arisaka**（Arisaka） | 步枪 / 栓动 .30-06 | 26 | E_22,E_25 / E_16,E_18 | — | E_17,E_19 | E_0,E_1,E_2 | E_0,E_1 | E_9 | 完整 | - |
| **Marlin 336**（Marlin 336） | 步枪 / 杠杆 .30-30 | 23 | I_20,I_22 / I_15,I_17 | — | I_16,I_18 | I_0,I_1,I_2 | I_5,I_6 | I_8 | 完整 | - |
| **Model 1894**（Model 1894） | 步枪 / Winchester 杠杆 .32 Win Spl | 24 | L_21,L_23 / L_16,L_18 | — | L_17,L_19 | L_0,L_1,L_2 | L_5,L_6 | L_9 | 完整 | - |
| **Mosin**（Mosin Nagant） | 步枪/狙击 / 栓动 7.62x54R | 27 | M_19,M_21 / M_24,M_26 | — | M_23,M_25 | M_1,M_3,M_4 | M_0,M_1 | M_10 | 完整 | MOSIN NAGANT |
| **Ruger 10/22**（Ruger 10.22） | 步枪 / .22 半自动 | 35 | Q_30,Q_32 / Q_21,Q_23 | — | Q_22,Q_24 | Q_2,Q_3,Q_4 | Q_4,Q_5 | Q_13 | 完整 | - |
| **SKS**（SKS） | 步枪 / 7.62x39 半自动卡宾 | 20 | U_12,U_14 / U_17,U_19 | — | U_16,U_18 | U_0,U_1,U_2 | U_1,U_2 | U_6 | 完整 | SKS |
| **Savage 10**（Savage 10 .300 Blackout） | 步枪/狙击 / 栓动 .300 AAC Blackout | 32 | T_25,T_27 / T_16,T_18 | — | T_17,T_19 | T_0,T_2,T_3 | T_0,T_1 | T_7 | 完整 | HONEY BADGER（.300 BLK 同口径） |
| **Tikka**（Tikka） | 步枪/狙击 / Tikka T3 栓动 .30-06 | 30 | W_27,W_29 / W_22,W_24 | — | W_23,W_25 | W_0,W_1,W_2 | W_0,W_1 | W_13 | 完整 | - |
| **Carl Gustav M45**（Carl Gustav M45_Swedish K） | 冲锋枪 / Swedish K 9mm 全自动 | 37 | G_25,G_31 / G_14,G_20 | G_15,G_16 | G_13,G_19 | G_2,G_3,G_8 | G_2,G_7 | G_3 | 完整 | - |
| **PPSh**（PPSh） | 冲锋枪 / 7.62x25 Tokarev 全自动 | 36 | P_24,P_30 / P_13,P_15 | P_16,P_17 | P_12,P_14 | P_0,P_1,P_6 | P_0,P_5 | P_1 | 完整 | PPSH-41 |
| **1911**（1911） | 手枪 / .45 ACP 半自动 | 43 | A_41,A_42 / A_33,A_34 | — | A_39,A_40 | A_0,A_1,A_2 | A_6,A_7 | A_19 | 完整 | M1911 |
| **Bersa**（Bersa） | 手枪 / .380 半自动 | 48 | F_46,F_47 / F_40,F_41 | — | F_42,F_43 | F_0,F_1,F_2 | F_6,F_7 | F_23 | 完整 | - |
| **Ruger Mark III**（Ruger Mark III） | 手枪 / .22 半自动 | 36 | R_32,R_34 / R_27,R_29 | — | R_28,R_30 | R_0,R_1,R_2 | R_7,R_8 | R_19 | 完整 | - |
| **Ruger Single Six**（Ruger Single Six） | 手枪/左轮 / .22 单动左轮 | 19 | S_16,S_18 / S_11,S_13 | — | S_12,S_14 | — | S_2,S_4 | S_8 | 部分 | - |
| **Smith & Wesson 642**（Smith & Wesson 642） | 手枪/左轮 / .38 Spl 双动左轮 | 28 | V_25,V_27 / V_20,V_22 | — | V_21,V_23 | — | V_0,V_1 | V_5 | 部分 | - |
| **Supressed .22 Pistol**（Marvel Suppressed .22 Handgun） | 手枪 / .22 消音 | 5 | — / J_0,J_4 | — | J_3 | — | — | — | 仅枪声 | - |
| **Walther PPQ**（Walther PPQ） | 手枪 / 9mm 击针半自动 | 48 | X_39,X_41 / X_30,X_32 | — | X_31,X_33 | X_0,X_1,X_2 | X_6,X_7 | X_18 | 完整 | - |
| **CD**（Charles Daly） | 霰弹枪 / Charles Daly FTAW 泵动 12ga | 22 | H_19,H_21 / H_14,H_16 | — | H_15,H_17 | H_0,H_1,H_2 | H_9 | H_8 | 完整 | - |
| **Model 12**（Model 12） | 霰弹枪 / Winchester 泵动 12ga | 23 | K_20,K_22 / K_15,K_17 | — | K_16,K_18 | K_0,K_1,K_2 | K_8 | K_7 | 完整 | - |
| **Mossberg**（Mossberg） | 霰弹枪 / Model 190 栓动 12ga | 31 | N_28,N_30 / N_23,N_25 | — | N_24,N_26 | N_0,N_1,N_2 | N_0,N_1 | N_18 | 完整 | - |
| **Nova**（Nova） | 霰弹枪 / Benelli 泵动 12ga | 22 | O_19,O_21 / O_14,O_16 | — | O_15,O_17 | O_0,O_1,O_2 | O_9 | O_8 | 完整 | - |

统计：完整套件 **21 / 24**；部分 2；仅枪声 1（Marvel Suppressed .22 Handgun 仅 5 条消音枪声，无机构声）。

### 1.3 表 A 小结

- **步/狙/冲/手枪四类里的「完整套件」枪**：AK-47、AR-15、SKS、Mosin Nagant、Savage 10（.300 BLK 栓动）、Tikka（栓动）、Arisaka、1917（栓动）、Marlin 336（杠杆，缺独立上膛音判定）、PPSh、Carl Gustav M45、1911、Bersa、Walther PPQ、Ruger Mark III、Ruger 10/22 —— 全部同时具备 近/中距单发 + 换弹多段 + 上膛/拉栓 + 空仓干击
- **栓动狙击手感最佳**：Mosin Nagant（27 条，bolt 全套）、Tikka T3（30 条）、Savage 10（32 条，含消音款）——AWP/栓动狙击类音效可从这里取或降 pitch 互借
- **冲锋枪只有 2 把**（PPSh、Carl Gustav M45），但都带长/短连发；9mm SMG 类（MP5/UZI 等）可借 M45（9mm 同口径）或 PPSh（高射速连发）
- **左轮没有弹匣换弹**（S&W 642 / Ruger Single Six 只有 hammer/cock/cylinder 类动作），PF 里左轮枪（MP412 REX、1858 等）的换弹音要另行处理
- 霰弹枪 5 把（4 泵动 + 1 栓动），PF 霰弹类可全覆盖借音
- Master 是干声（近场无混响），进游戏需自己加距离混响/低通——kit 的 manifest/recipe 思路（close/far 两版混合）可直接抄

---

## 2. 表 B：参数对照（PF 全表 × kit 交叉）

### 2.1 kit 数据文件与字段结构

| 文件（packages/game-weapons/src/data/） | 内容 | 关键字段 |
|---|---|---|
| `firearms.json`（160 KB） | **115 款枪械** | id/name/maker/**category**（pistol/revolver/smg/rifle/dmr/sniper/shotgun/machine_gun/hunting/launcher）/mass/dimensions/**action**{caliber, rpm, modes[], magazine, reload(秒), muzzleSpeed(m/s), spreadDeg, bloomDeg, recoveryDegPerS, recoil[2], range(m), family, timings{draw,reload,clear}, moa, faultFactor} |
| `calibers.json`（14 KB） | **34 种口径** | id/label/diameter/bulletGrams/**muzzleSpeed**/dragPer100m/kind/noise/cartridge{caseDiameter,overallLength,caseLength,projectileDiameter} |
| `ammo.json`（29 KB） | 弹药变体 | 口径内弹种与数值修正 |
| `archetypes.json` / `attachments.json` / `melee-weapons.json` / `launchers.json` / `explosive-weapons.json` | 原型/配件/近战/发射器 | 同风格 schema |

注：动能一列由 kit 的 muzzleSpeed × calibers.bulletGrams 现算（E=½mv²）；kit 未给 muzzleSpeed 的 12 款以「—」标。kit rpm 里栓动枪 73.17 = 60/0.82 换算的循环限制值。

### 2.2 表 B-1：PF 全表（145 枪）× kit 交叉 × SFX 同枪标记

列说明：PF 五数值列原样保留（rpm/r 常带模式后缀）；kit 列仅在同名对应时填（对应关系见 §3 口径与命名核对）；SFX 列 = SFX 库同枪（✔=原生，≈=同口径借音候选）。

| # | PF 枪名 | PF 口径 | PF 伤害 | PF 弹匣 | PF 射速 | PF 射程 | kit 对应 | kit 口径 | kit 初速 | kit 动能 | kit 射速/弹匣 | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | M9 | 9×19mm | 35-10 | 15+1 / 105 | 780 | 40-80 | Beretta 92FS | 9x19 | 381 m/s | 544 J | 300/15 | ≈ |
| 2 | GLOCK 17 (G17) | 9×19mm | 34-10 | 17+1/102 | 780 | 40-90 | Glock 17 | 9x19 | 375 m/s | 527 J | 300/17 | ≈ |
| 3 | M1911 | .45 ACP | 48-29 | 8+1/56 | 720 | 55-90 | Colt M1911 | 45acp | 253 m/s | 477 J | 300/7 | ✔ 1911 |
| 4 | DESERT EAGLE (DEAGLE) L5 | .44 MAGNUM | 56-32 | 8+1/40 | 400 | 50-80 | — | — | — | — | — | ≈ |
| 5 | M45A1 | .45 ACP | 45-28 | 10+1/60 | 670 | 50-95 | — | — | — | — | — | ≈ |
| 6 | FIVE SEVEN | 5.7×28mm | 29-22 | 20+1/100 | 800 | 80-120 | FN Five-seveN | 5_7x28 | 650 m/s | 422 J | 300/20 | ≈ |
| 7 | ZIP 22 | .22 LONG RIFLE | 15-12 | 10+1/180 | 1000 SEMI | 30-60 | — | — | — | — | — | ≈ |
| 8 | DESERT EAGLE (DEAGLE) XIX | .50 ACTION EXPRESS | 72-37 | 7+1/21 | 400 | 40-82 | Desert Eagle Mark XIX | 50ae | 470 m/s | 2143 J | 300/7 | ≈ |
| 9 | GLOCK 18 (G18) | 9×19mm | 30-20 | 19+1/57 | 1100 AUTO | 20-60 | Glock 18 | 9x19 | 375 m/s | 527 J | 1200/17 | ≈ |
| 10 | M93R | 9×19mm | 34-20 | 20+1/80 | 1100 3×BURST | 30-60 | — | — | — | — | — | ≈ |
| 11 | TEC-9 | 9×19mm | 28-20 | 20/60 | 1500 AUTO | 21-65 | — | — | — | — | — | ≈ |
| 12 | MICRO UZI | 9×19mm | 34-19 | 20/60 | 1200 AUTO | 21-65 | Mini Uzi | 9x19 | 400 m/s | 600 J | 950/20 | ≈ |
| 13 | ŠKORPION VZ. 61 (CZ-3A1) | .32 ACP | 34-19 | 20+1/60 | 850 AUTO | 40-90 | vz. 61 Škorpion | 32acp | 320 m/s | 236 J | 850/20 | ≈ |
| 14 | GB-22 | .22 LONG RIFLE | 20-15 | 1/50 | 50 SEMI | CURRENTLY UNAVAILABE | — | — | — | — | — | ≈ |
| 15 | MP1911 | .45 ACP, .380 ACP | 36-20 | 15+1/45 | 1000 AUTO | 25-70 | — | — | — | — | — | ≈ |
| 16 | ARM PISTOL | 5.56 NATO | 34-20 | 20+1/80 | 800 AUTO | 45-75 | — | — | — | — | — | ≈ |
| 17 | MP412 REX | .357 MAGNUM | 56-28 | 6/42 | 600 SEMI | 65-100 | — | — | — | — | — | ≈ |
| 18 | MATEBA 6 | .44 MAGNUM | 56-30 | 6/42 | 600 SEMI | 76-100 | — | — | — | — | — | ≈ |
| 19 | 1858 NEW ARMY | .357 MAGNUM | 60-35 | 6/42 | 140 SEMI, 350 FAN FIRE | 75-140 | — | — | — | — | — | ≈ |
| 20 | REDHAWK 44 | .44 MAGNUM | 59-35 | 6/42 | 400 SEMI | 50-100 | — | — | — | — | — | ≈ |
| 21 | EXCECUTIONER | .454 CASULL | 80-38 | 6/30 | 300 SEMI | 55-120 | — | — | — | — | — | ≈ |
| 22 | JUDGE | .410 BORE | 4×40-4×20 | 5/25 | 300 SEMI | 25-60 | — | — | — | — | — | ≈ |
| 23 | SERBU SHOTGUN | 12 GAUGE (BUCKSHOT) | 8×29-8×16 | 2+1/20 | 100 PUMP | 50-90 | — | — | — | — | — | ≈ |
| 24 | SFG 50 | .50 BMG | 100-85 | 1/20 | 30 SINGLE SHOT | 50-250 | — | — | — | — | — | ≈ |
| 25 | M79 THUMPER | .22 LONG RIFLE | 10×34-10×16 | 1/20 | 90 SINGLE SHOT | 50-130 | M79 grenade launcher | - | — | — | —/1 | ≈ |
| 26 | SAWED OFF | 12 GAUGE | 8×29-8×16 | 2/20 | 200 SEMI/INSTANT BURST (FIRES BOTH BARRELS AT ONCE) | 40-70 | — | — | — | — | — | ≈ |
| 27 | SAIGA-12U | 12 GAUGE | 8×29-8×16 | 2+3/20 | 350 SEMI | 40-70 | — | — | — | — | — | ≈ |
| 28 | OBREZ | 7.62×54mmR | 50-40 | 5/30 | 80 BOLT | 100-150 | — | — | — | — | — | ≈ |
| 29 | KSG-12 | 12 GAUGE | 8×32-8×17 | 14+1/50 | 130 | 50-90 | Kel-Tec KSG | 12ga_00buck | 400 m/s | 280 J | 120/14 | ≈ |
| 30 | REMINGTON 870 | 12 GAUGE | 8×33-8×18 | 6+1/50 | 100 | 50-130 | Remington 870 | 12ga_00buck | 400 m/s | 280 J | 120/6 | ≈ |
| 31 | DBV12 | 12 GAUGE | 8×29-8×17 | 10+1/50 | 250 SEMI | 50-140 | — | — | — | — | — | ≈ |
| 32 | KS-23M | 23×75mmR | 8×37-8×21 (19\*\*) | 3+1 | 65 PUMP | 60-110 | — | — | — | — | — | ≈ |
| 33 | SAIGA 12 | 12 GAUGE | 8×27-8×17  | 8+1/50 | 350 SEMI | 60-130 | Saiga-12 | 12ga_00buck | 400 m/s | 280 J | 180/8 | ≈ |
| 34 | STEVENS DB | 12 GAUGE | 8×36-8×19 | 2/50 | 200 SEMI/INSTANT BURST | 75-145 | — | — | — | — | — | ≈ |
| 35 | AA-12 | 12 GAUGE | 8×28-8×19 | 8/56 (20/40 with 20rd DRUM) | 300 AUTO | 50-100 | AA-12 | 12ga_00buck | 400 m/s | 280 J | 300/8 | ≈ |
| 36 | SPAS-12 | 12 GAUGE | 8×30-8×18 | 8+1/50 | 200 SEMI | 48-125 | Franchi SPAS-12 | 12ga_00buck | 400 m/s | 280 J | 120/8 | ≈ |
| 37 | AK12 | 5.45×39mmR | 33-20 | 30+1/120 | 1000 3×BURST, 700 AUTO | 70-120 | AK-12 | 5_45x39 | 880 m/s | 1316 J | 700/30 | ≈ |
| 38 | AN-94 | 5.45×39mmR | 32-24 | 30+1/120 | 1800 2×BURST, 600 AUTO | 50-120 | — | — | — | — | — | ≈ |
| 39 | AS VAL | 9×39mm | 34-20 | 20+1/120 | 900 AUTO | 50-85 | — | — | — | — | — | ≈ |
| 40 | SCAR-L | 5.56 NATO | 33-25 | 30+1/120 | 625 AUTO | 60-120 | FN SCAR-L | 5_56x45 | 870 m/s | 1514 J | 625/30 | ≈ |
| 41 | AUG A1 | 5.56 NATO | 30-23 | 30+1/120 | 680 AUTO | 60-190 | Steyr AUG A1 | 5_56x45 | 970 m/s | 1882 J | 680/30 | ≈ |
| 42 | M16A4 | 5.56 NATO | 35-22 | 30+1/120 | 900 3×BURST | 40-165 | Colt M16A2 | 5_56x45 | 948 m/s | 1797 J | 800/30 | ≈ |
| 43 | G36 | 5.56 NATO | 31-25 | 30+1/120 | 750 AUTO | 80-140 | HK G36 | 5_56x45 | 920 m/s | 1693 J | 750/30 | ≈ |
| 44 | M16A3 | 5.56 NATO | 32-22 | 30+1/120 | 800 AUTO | 80-145 | — | — | — | — | — | ≈ |
| 45 | AUG A2 | 5.56 NATO | 34-20 | 30+1/120 | 700 AUTO | 50-135 | — | — | — | — | — | ≈ |
| 46 | FAMAS F1 | 5.56 NATO | 34-20 | 25+1/125 | 900 AUTO, 900 3×BURST | 70-140 | FAMAS | 5_56x45 | 960 m/s | 1843 J | 1000/25 | ≈ |
| 47 | AK47 | 7.62×39mmR | 42-30 | 30+1/120 | 600 AUTO | 80-160 | AK-47 | 7_62x39 | 715 m/s | 2045 J | 600/30 | ✔ AK-47 |
| 48 | AUG A3 | 5.56 NATO | 32-21 | 30+1/120 | 720 AUTO | 70-140 | — | — | — | — | — | ≈ |
| 49 | L85A2 | 5.56 NATO | 28-25 | 30+1/120 | 700 AUTO | 60-110 | L85A2 | 5_56x45 | 940 m/s | 1767 J | 700/30 | ≈ |
| 50 | HK416 | 5.56 NATO | 31-24 | 30+1/120 | 850 AUTO | 80-160 | HK416 | 5_56x45 | 880 m/s | 1549 J | 850/30 | ≈ |
| 51 | AK74 | 5.45×39mmR | 34-23 | 30+1/120 | 650 AUTO | 70-110 | AK-74 | 5_45x39 | 900 m/s | 1377 J | 650/30 | ≈ |
| 52 | AKM | 7.62×39mmR | 40-32 | 30+1/120 | 600 AUTO | 80-160 | AKM | 7_62x39 | 715 m/s | 2045 J | 600/30 | ≈ |
| 53 | AK103 | 7.62×39mmR | 38-29 | 30+1/120 | 600 AUTO | 80-160 | — | — | — | — | — | ≈ |
| 54 | TAR-21 | 5.56 NATO | 29-22 | 30+1/120 | 850 AUTO | 100-140 | IWI Tavor | 5_56x45 | 910 m/s | 1656 J | 850/30 | ≈ |
| 55 | TYPE 88-2 | 5.45×39mmR | 34-20 | 75/150 | 600 AUTO | 75-135 | — | — | — | — | — | ≈ |
| 56 | M231 | 5.56 NATO | 35-25 | 30/150 | 1225 AUTO | 90-150 | — | — | — | — | — | ≈ |
| 57 | C7A2 | 5.56 NATO | 29-19 | 30+1/120 | 800 AUTO | 100-200 | — | — | — | — | — | ≈ |
| 58 | G11K2 | 4.73x33mm CASELESS | 28-21 | 45/180 | 2100 3×BURST, 460 AUTO | 90-145 | — | — | — | — | — | ≈ |
| 59 | K2 | 5.56 NATO | 34-24 | 30+1/120 | 750 AUTO | 55-162 | — | — | — | — | — | ≈ |
| 60 | MK11 | 7.62 NATO | 45-38 | 20+1/80 | 330 SEMI | 110-160 | Knight's SR-25 (Mk 11) | 7_62x51 | 800 m/s | 3104 J | 120/20 | ≈ |
| 61 | SKS | 7.62×39mmR | 40-32 | 20+1/80 | 433 SEMI | 100-150 | SKS | 7_62x39 | 735 m/s | 2161 J | 120/10 | ✔ SKS |
| 62 | SL-8 | 5.56 NATO | 38-28 | 30+1/120 | 625 SEMI | 88-148 | — | — | — | — | — | ≈ |
| 63 | VSS VINTOREZ | 9×39mm SP | 55-38 | 10+1/100 | 700 AUTO | 60-120 | VSS Vintorez | 9x39 | 295 m/s | 701 J | 850/10 | ≈ |
| 64 | MSG90 | 7.62 NATO | 50-40 | 10+1/120 | 355 SEMI | 110-200 | — | — | — | — | — | ≈ |
| 65 | BEOWULF TCR | .50 BEOWULF | 60-40 | 10+1/70 | 400 SEMI | 85-150 | — | — | — | — | — | ≈ |
| 66 | SA58 SPR | 7.62 NATO | 48-30 | 20+1/120 | 500 SEMI | 50-200 | — | — | — | — | — | ≈ |
| 67 | SCAR SSR | 7.62 NATO | 57-48 | 10+1/60 | 220 SEMI | 120-180 | — | — | — | — | — | ≈ |
| 68 | BEOWULF ECR | .50 BEOWULF | 52-30 | 10+1/100 | 780 AUTO, 780 3×BURST | 80-150 | — | — | — | — | — | ≈ |
| 69 | SCAR-H | 7.62 NATO | 42-29 | 20+1/120 | 600 AUTO | 90-150 | FN SCAR-H | 7_62x51 | 770 m/s | 2876 J | 600/20 | ≈ |
| 70 | AK12BR | 5.45×39mmR | 39-25 | 20+1/120 | 700 AUTO, 1000 2×BURST | 80-140 | — | — | — | — | — | ≈ |
| 71 | G3 | 7.62 NATO | 35-25 | 20+1/120 | 580 AUTO | 50-215 | HK G3A3 | 7_62x51 | 800 m/s | 3104 J | 550/20 | ≈ |
| 72 | AG-3 | 7.62 NATO | 45-35 | 20+1/120 | 525 AUTO | 100-170 | — | — | — | — | — | ≈ |
| 73 | HK417\*\* | 7.62 NATO | 40-32 | 20+1/120 | 600 AUTO | 70-170 | — | — | — | — | — | ≈ |
| 74 | HENRY 45-70 | .45-70 | 65-45 | 5/50 | 100 SEMI | 80-120 | — | — | — | — | — | ≈ |
| 75 | FAL 50.00 | 7.62 NATO | 41-32 | 20+1/120 | 700 AUTO | 80-180 | FN FAL | 7_62x51 | 840 m/s | 3422 J | 650/20 | ≈ |
| 76 | M4A1 | 5.56 NATO | 34-19 | 30+1/120 | 780 AUTO | 35-120 | Colt M4A1 | 5_56x45 | 880 m/s | 1549 J | 800/30 | ✔ AR-15 |
| 77 | G36K | 5.56 NATO | 34-19 | 30+1/120 | 750 AUTO | 70-160 | HK G36K | 5_56x45 | — | — | 750/30 | ≈ |
| 78 | M4 | 5.56 NATO | 35-19 | 30+1/120 | 950 3×BURST | 35-100 | — | — | — | — | — | ≈ |
| 79 | L22 | 5.56 NATO | 30-21 | 30+1/120 | 775 AUTO | 40-90 | — | — | — | — | — | ≈ |
| 80 | SCAR PDW | 5.56 NATO | 36-19 | 30+1/120 | 650 AUTO | 60-130 | — | — | — | — | — | ≈ |
| 81 | AKU12 | 5.45×39mmR | 35-19 | 30+1/120 | 800 AUTO, 800 3×BURST | 30-95 | — | — | — | — | — | ≈ |
| 82 | GROZA-1 | 7.62×39mmR | 33-22 | 30+1/120 | 750 AUTO | 50-120 | — | — | — | — | — | ≈ |
| 83 | AK12C | 5.45×39mmR | 35-21 | 30+1/120 | 700 AUTO | 45-100 | — | — | — | — | — | ≈ |
| 84 | HONEY BADGER | .300 AAC BLACKOUT | 30-22 | 30+1/120 | 800 AUTO | 65-105 | — | — | — | — | — | ✔ Savage 10（同口径 .300 BLK） |
| 85 | SR-3M | 9×39mmR | 34-20 | 20+1/120 | 900 AUTO | 50-90 | — | — | — | — | — | ≈ |
| 86 | GROZA-4 | 9×39mmR | 36-20 | 20+1/120 | 700 AUTO | 40-90 | — | — | — | — | — | ≈ |
| 87 | MC51SD | 7.62 NATO | 46-25 | 20+1/120 | 540 AUTO | 20-121 | — | — | — | — | — | ≈ |
| 88 | FAL 50.63 PARA | 7.62 NATO | 44-23 | 20+1/120 | 700 AUTO | 70-200 | FN ParaFAL | 7_62x51 | 840 m/s | 3422 J | 650/20 | ≈ |
| 89 | 1858 CARBINE | .44 MAGNUM | 65-40 | 6/72 | 110 SEMI | 30-140 | — | — | — | — | — | ≈ |
| 90 | AK105 | 5.45×39mmR | 36-20 | 30+1/120 | 600 AUTO | 40-110 | — | — | — | — | — | ≈ |
| 91 | JURY | .45 LONG COLT | 80-50 | 6/75 | 300 SEMI | 35-200 | — | — | — | — | — | ≈ |
| 92 | KAC SRR | .30 KAC | 59-42 | 6/42 | 400 SEMI | 60-150 | — | — | — | — | — | ≈ |
| 93 | X95R | 5.45×39mm | 27-20 | 30+1/150 | 950 AUTO | 65-120 | — | — | — | — | — | ≈ |
| 94 | HK51B | 5.56 NATO | 41-22 | 100/200 | 950 AUTO, 950 3×BURST | 20-90 | — | — | — | — | — | ≈ |
| 95 | K1A | 5.56 NATO | 33-19 | 30+1/120 | 900 AUTO | 60-155 | — | — | — | — | — | ≈ |
| 96 | MP5K | 9×19mm | 30-17 | 30+1/120 | 900 AUTO | 50-80 | HK MP5K | 9x19 | 400 m/s | 600 J | 900/30 | ≈ |
| 97 | UMP45 | .45 ACP | 38-21 | 25+1/125 | 600 AUTO | 60-100 | HK UMP-45 | 45acp | 285 m/s | 605 J | 600/25 | ≈ |
| 98 | G36C | 5.56 NATO | 33-20 | 30+1/120 | 750 AUTO | 33-20 | HK G36C | 5_56x45 | — | — | 750/30 | ≈ |
| 99 | MP7 | 4.6× | 30-18 | 30+1/120 | 950 AUTO | 40-90 | HK MP7A1 | 4_6x30 | 735 m/s | 540 J | 950/40 | ≈ |
| 100 | MAC10 | .45 ACP | 36-19 | 30/150 | 1090 AUTO | 20-70 | MAC-10 | 45acp | 280 m/s | 584 J | 1090/30 | ≈ |
| 101 | P90 | 5.7×28mm | 25-17 | 50+1/150 | 900 AUTO | 70-110 | FN P90 | 5_7x28 | 715 m/s | 511 J | 900/50 | ≈ |
| 102 | MP5 | 9×19mm | 34-19 | 30+1/120 | 800 AUTO | 25-120 | HK MP5A3 | 9x19 | 400 m/s | 600 J | 800/30 | ≈ |
| 103 | COLT SMG 633 | 9×19mm | 34-18 | 32+1/128 | 1000 AUTO | 55-120 | — | — | — | — | — | ≈ |
| 104 | L2A3 | 9×19mm | 36-24 | 34+1/128 | 550 AUTO | 45-105 | — | — | — | — | — | ≈ |
| 105 | MP5SD | 9×19mm | 34-19 | 30+1/120 | 800 AUTO | 22-110 | HK MP5SD3 | 9x19 | 285 m/s | 305 J | 700/30 | ≈ |
| 106 | MP10 | 9×19mm | 29-23 | 30+1/120 | 850 AUTO | 80-150 | — | — | — | — | — | ≈ |
| 107 | MP5/10 | 10mm AUTO | 35-24 | 30+1/120 | 800 AUTO | 70-125 | — | — | — | — | — | ≈ |
| 108 | M3A1 | .45 ACP | 48-25 | 30/120 | 450 AUTO | 50-120 | — | — | — | — | — | ≈ |
| 109 | UZI | 9×19mm | 35-18 | 25/75 | 600 AUTO | 55-145 | Uzi | 9x19 | 400 m/s | 600 J | 600/32 | ≈ |
| 110 | AUG A3 PARA | 9×19mm | 34-19 | 25+1/125 | 780 AUTO, 780 3×BURST | 40-90 | — | — | — | — | — | ≈ |
| 111 | K7 | 9×19mm | 30-17 | 30+1/120 | 1100 AUTO, BURST | 60-152 | — | — | — | — | — | ≈ |
| 112 | KRINKOV | 5.45x39mmR | 37-18 | 30+1/120 | 735 AUTO | 32-132 | AKS-74U | 5_45x39 | 735 m/s | 918 J | 700/30 | ≈ |
| 113 | PPSH-41 | 7.62×25mm | 25-19 | 71/213 | 1000 AUTO | 60-102 | PPSh-41 | 7_62x25 | 488 m/s | 655 J | 1250/71 | ✔ PPSh |
| 114 | FAL PARA SHORTY | 7.62 NATO | 40-24 | 20+1/120 | 700 AUTO | 60-120 | — | — | — | — | — | ≈ |
| 115 | KRISS VECTOR | .45 ACP | 35-18 | 25+1/150 | 1200 AUTO | 30-100 | Kriss Vector | 45acp | 290 m/s | 627 J | 1100/25 | ≈ |
| 116 | PP-19 BIZON | 9×19mm | 34-18 | 53+1/159 | 700 AUTO | 50-100 | PP-19 Bizon | 9x18 | 320 m/s | 312 J | 680/64 | ≈ |
| 117 | MP40 | 9×19mm | 38-22 | 32/128 | 550 AUTO | 50-100 | MP40 | 9x19 | — | — | 550/32 | ≈ |
| 118 | X95 SMG | 9×19mm | 32-18.2 | 32+1/160 | 750 AUTO | 45-130 | — | — | — | — | — | ≈ |
| 119 | TOMMY GUN | .45 ACP | 37-19 | 20/160 | 725 AUTO | 60-120 | Thompson M1A1 | 45acp | 285 m/s | 605 J | 700/30 | ≈ |
| 120 | INTERVENTION | .408 CHEY TAC | 90-80 | 7+8/42 | 50 BOLT | 150-250 | CheyTac M200 | 408cheytac | — | — | 73.17/7 | ≈ |
| 121 | REMINGTON 700 | .308 WINCHESTER/7.62 NATO | 75-70 | 6+1/48 | 60 BOLT | 50-200 | Remington 700 | 7_62x51 | 790 m/s | 3027 J | 73.17/4 | ≈ |
| 122 | DRAGUNOV SVU | 7.62×54mmR | 60-50 | 10+1/60 | 150 SEMI | 120-200 | — | — | — | — | — | ≈ |
| 123 | AWS | .308 WINCHESTER/7.62 NATO | 80-70 | 10+1/60 | 55 BOLT | 50-115 | Accuracy L96A1 | 7_62x51 | 840 m/s | 3422 J | 73.17/10 | ≈ |
| 124 | BFG 50 | .50 BMG | 100-95 | 1/42 | 16 BREECH LOADED | 50-250 | — | — | — | — | — | ≈ |
| 125 | AWM | .338 LAPUA MAGNUM | 82-70 | 5+1/1.25 | 50 BOLT | 60-140 | Accuracy AWM | 338lapua | 936 m/s | 7096 J | 73.17/5 | ≈ |
| 126 | TRG-42 | .338 LAPUA MAGNUM | 100-65 | 5+1/45 | 45 BOLT | 35-155 | Sako TRG-42 | 338lapua | 900 m/s | 6561 J | 73.17/5 | ≈ |
| 127 | MOSIN NAGANT | 7.62×39mmR | 60-50 | 5/50 | 70 BOLT | 150-250 | Mosin-Nagant 91/30 | 7_62x54r | 865 m/s | 3591 J | 73.17/5 | ✔ Mosin Nagant |
| 128 | DRAGUNOV SVDS | 7.62×54mmR | 70-60 | 10+1/50 | 60 SEMI | 70-250 | SVD Dragunov | 7_62x54r | 830 m/s | 3307 J | 120/10 | ≈ |
| 129 | K14 | .308 WINCHESTER/7.62 NATO | 68-55 | 10+1/50 | 50 BOLT | 90-220 | — | — | — | — | — | ≈ |
| 130 | HECATE II | .50 BMG | 97-93 | 7+1/28 | 28 BOLT | 40-200 | — | — | — | — | — | ≈ |
| 131 | M107 | .50 BMG | 98-88 | 5+1/35 | 80 SEMI | 50-150 | Barrett M82A1 | 50bmg | 853 m/s | 15280 J | 30/10 | ≈ |
| 132 | STEYR SCOUT | .376 STEYR | 45-35 | 8+1/64 | 85 BOLT | 25-150 | — | — | — | — | — | ≈ |
| 133 | WA2000 | .300 WINCHESTER MAGNUM | 72-66 | 6+1/42 | 90 SEMI | 20-175 | — | — | — | — | — | ≈ |
| 134 | COLT LMG | 5.56 NATO | 35-20 | 60/180 | 700 AUTO | 75-145 | — | — | — | — | — | ≈ |
| 135 | M60 | 7.62 NATO | 40-26 | 100/200 | 600 AUTO | 120-190 | M60 | 7_62x51 | 853 m/s | 3529 J | 550/100 | ≈ |
| 136 | AUG HBAR | 5.56 NATO | 35-23 | 42/172 | 650 AUTO | 30-190 | — | — | — | — | — | ≈ |
| 137 | MG36 | 5.56 NATO | 30-23 | 100+1/200 | 750 AUTO | 70-100 | — | — | — | — | — | ≈ |
| 138 | RPK12 | 5.45×39mmR | 32-21 | 45+1/135 | 700 AUTO, 1000 3×BURST | 100-180 | — | — | — | — | — | ≈ |
| 139 | L86 LSW | 5.56 NATO | 35-25 | 30+1/210 | 610 AUTO | 35-25 | — | — | — | — | — | ≈ |
| 140 | RPK | 7.62×39mmR | 42-32 | 45+1/180 | 600 AUTO | 42-32 | RPK | 7_62x39 | 745 m/s | 2220 J | 600/40 | ≈ |
| 141 | HK21 | 7.62 NATO | 39-29 | 100/200 | 800 AUTO, 3×BURST | 80-150 | — | — | — | — | — | ≈ |
| 142 | SCAR HAMR | 5.56 NATO | 32-23 | 50+1/200 | 650 AUTO | 110-180 | — | — | — | — | — | ≈ |
| 143 | RPK74 | 5.45×39mmR | 36-21 | 45+1/180 | 650 AUTO | 90-170 | — | — | — | — | — | ≈ |
| 144 | MG3KWS | 7.62 NATO | 38-23 | 50/300 | 1000 AUTO | 60-168 | MG3 | 7_62x51 | 820 m/s | 3261 J | 1100/100 | ≈ |
| 145 | MG42\*\* | 7.62 NATO | 36-20 | 50/250 | 1200 AUTO | 50-250 | MG42 | 7_92x57 | 740 m/s | 3203 J | 1200/50 | ≈ |

### 2.3 表 B-2：kit 独有枪械（53 款，PF 没有的补枪型候选）

| kit 枪名 | 类别 | 口径 | 初速 | 动能 | 射速 | 弹匣 | 模式 |
|---|---|---|---|---|---|---|---|
| HK PSG-1 | dmr | 7.62×51 mm (.308) | — | — | 120 | 5 | semi |
| M14 EBR | dmr | 7.62×51 mm (.308) | 850 m/s | 3504 J | 120 | 20 | semi |
| .30-06 hunting rifle | hunting | .30-06 Springfield | 880 m/s | 3756 J | 73.17 | 4 | bolt |
| CBC 122 | hunting | .22 LR | 380 m/s | 188 J | 73.17 | 10 | bolt |
| CBC 7022 | hunting | .22 LR | 380 m/s | 188 J | 300 | 10 | semi |
| Rossi Puma | hunting | .357 Magnum | 500 m/s | 1275 J | 109.09 | 10 | lever |
| Ruger 10/22 | hunting | .22 LR | 380 m/s | 188 J | 300 | 10 | semi |
| Winchester 1887 | hunting | 12 ga 00 buck | — | — | 109.09 | 5 | lever |
| Winchester 1894 | hunting | .30-30 Winchester | 670 m/s | 2177 J | 109.09 | 7 | lever |
| Browning M2 .50 | machine_gun | .50 BMG | 890 m/s | 16634 J | 550 | 100 | auto |
| FN M240B | machine_gun | 7.62×51 mm (.308) | 853 m/s | 3529 J | 750 | 100 | auto |
| FN M249 | machine_gun | 5.56×45 mm | 915 m/s | 1674 J | 850 | 200 | auto |
| FN MAG | machine_gun | 7.62×51 mm (.308) | 840 m/s | 3422 J | 750 | 100 | auto |
| FN Minimi | machine_gun | 5.56×45 mm | 915 m/s | 1674 J | 850 | 200 | auto |
| FN Minimi Para | machine_gun | 5.56×45 mm | 915 m/s | 1674 J | 850 | 200 | auto |
| M134 Minigun | machine_gun | 7.62×51 mm (.308) | 853 m/s | 3529 J | 3000 | 200 | auto |
| PKM | machine_gun | 7.62×54R | 825 m/s | 3267 J | 650 | 100 | auto |
| CZ 75 | pistol | 9×19 mm | 370 m/s | 513 J | 300 | 16 | semi |
| Glock 19 | pistol | 9×19 mm | 360 m/s | 486 J | 300 | 15 | semi |
| HK USP | pistol | 9×19 mm | 350 m/s | 459 J | 300 | 15 | semi |
| Makarov PM | pistol | 9×18 mm Makarov | 315 m/s | 303 J | 300 | 8 | semi |
| SIG Sauer P226 | pistol | 9×19 mm | 350 m/s | 459 J | 300 | 15 | semi |
| SIG Sauer P320 | pistol | 9×19 mm | 350 m/s | 459 J | 300 | 17 | semi |
| Taurus G2C | pistol | 9×19 mm | 340 m/s | 433 J | 300 | 12 | semi |
| Taurus PT100 | pistol | .40 S&W | 300 m/s | 526 J | 300 | 11 | semi |
| Taurus TH380 | pistol | .380 ACP | — | — | 300 | 12 | semi |
| Taurus TS9 | pistol | 9×19 mm | 360 m/s | 486 J | 300 | 17 | semi |
| Walther P99 | pistol | 9×19 mm | 375 m/s | 527 J | 300 | 15 | semi |
| Colt Python | revolver | .357 Magnum | 430 m/s | 943 J | 150 | 6 | single |
| S&W 686 | revolver | .357 Magnum | 430 m/s | 943 J | 150 | 7 | single |
| S&W Model 29 | revolver | .44 Magnum | 440 m/s | 1510 J | 150 | 6 | single |
| Taurus 82 | revolver | .38 Special | 260 m/s | 345 J | 150 | 6 | single |
| IMBEL IA2 | rifle | 5.56×45 mm | 860 m/s | 1479 J | 700 | 30 | auto,semi |
| M1 Garand | rifle | .30-06 Springfield | 865 m/s | 3629 J | 120 | 8 | semi |
| Taurus T4 | rifle | 5.56×45 mm | 880 m/s | 1549 J | 750 | 30 | auto,semi |
| Taurus T4 (civil) | rifle | 5.56×45 mm | 880 m/s | 1549 J | 120 | 30 | semi |
| Benelli M4 | shotgun | 12 ga 00 buck | 400 m/s | 280 J | 180 | 7 | semi |
| Boito double-barrel | shotgun | 12 ga 00 buck | 410 m/s | 294 J | 180 | 2 | break,volley |
| CBC Pump Military 3.0 | shotgun | 12 ga 00 buck | 400 m/s | 280 J | 120 | 7 | pump |
| Mossberg 500 | shotgun | 12 ga 00 buck | 400 m/s | 280 J | 120 | 5 | pump |
| Mossberg 500 Cruiser | shotgun | 12 ga 00 buck | 400 m/s | 280 J | 120 | 5 | pump |
| Mossberg 590 | shotgun | 12 ga 00 buck | 400 m/s | 280 J | 120 | 8 | pump |
| B&T MP9 | smg | 9×19 mm | 400 m/s | 600 J | 1100 | 30 | auto,semi |
| CZ Scorpion EVO 3 | smg | 9×19 mm | 370 m/s | 513 J | 1150 | 30 | auto,semi |
| FN PS90 | smg | 5.7×28 mm | 715 m/s | 511 J | 120 | 50 | semi |
| HK UMP9 | smg | 9×19 mm | 380 m/s | 542 J | 700 | 30 | auto,semi |
| SIG MPX | smg | 9×19 mm | — | — | 850 | 30 | auto,semi |
| Taurus SMT9 | smg | 9×19 mm | 380 m/s | 542 J | 750 | 30 | auto,semi |
| Barrett MRAD | sniper | .338 Lapua Magnum | — | — | 73.17 | 10 | bolt |
| M24 SWS | sniper | 7.62×51 mm (.308) | 790 m/s | 3027 J | 73.17 | 5 | bolt |
| Mauser Kar98k | sniper | 7.92×57 mm Mauser | 760 m/s | 3379 J | 73.17 | 5 | bolt |
| Remington 700 (.300 WM) | sniper | .300 Winchester Magnum | — | — | 73.17 | 3 | bolt |
| Steyr SSG 69 | sniper | 7.62×51 mm (.308) | — | — | 73.17 | 5 | bolt |

---

## 3. 表 C：三源交集结论

### 3.1 交集计数

| 组合 | 数量 | 明细 |
|---|---|---|
| 参数 + 同枪音效（全链路） | **7** | AK47、SKS、M1911、PPSH-41、MOSIN NAGANT、M4A1（AR-15 音）、HONEY BADGER（Savage 10 .300 BLK 音） |
| 参数齐（PF+kit 同名） | **62** | 表 B-1 中 kit 列非「—」者；其中 55 把 SFX 无同枪，需按口径借音 |
| kit 独有（PF 没有） | **53** | 表 B-2；SIG 系/Taurus 系/PKM/M249/Kar98k/M24 等，可作补枪型 |
| PF 独有（kit 没有） | **83** | 仅 PF 数值；含大量 PF 特色枪（G11K2、HONEY BADGER 等无 kit 对应） |
| 三库都覆盖（口径级） | ≈52 | 62 - 7 + 口径借音可覆盖的 PF 独有枪（见 3.2） |

### 3.2 口径借音矩阵（有参数、无同枪音效的解法）

SFX 库按口径可分的「声源枪」与 kit 自带口径音效（armas/*.ogg）双重可用；下表给出 PF 侧无同枪音效时的推荐借法：

| PF 侧枪族（口径） | SFX 借音源 | kit 自带音效（armas/） | 备注 |
|---|---|---|---|
| 5.56 步枪族：M16A4/M16A3/M4/C7A2/HK416/G36/G36K/G36C/SCAR-L/AUG 系/FAMAS/L85A2/TAR-21/L22/SCAR PDW/K1A… | **AR-15**（5.56 半自动，33 条全套） | `rifle_5_56_close/far_*.ogg`（9 条） | 覆盖面最大的借音源 |
| 7.62x39 步枪族：AKM/AK103/GROZA-1/RPK | **AK-47**（51 条，含长短连发） | `rifle_7_62x39_close_*.ogg`（12 条） | AK 音色辨识度高，不建议跨口径借 |
| 5.45 步枪族：AK74/AK12/AK12C/AKU12/AK105/KRINKOV | AK-47（降 pitch ~4%）或 AR-15 | —（kit 无 5.45 枪声） | 音色上 5.45≈5.56 更近，可借 AR-15 |
| 9mm 手枪族：M9/G17/G18/M93R/TEC-9/MP5/10 等 | **Walther PPQ**（9mm 击针半自动，48 条全套） | `pistol_9mm_close/far_*.ogg`（10 条） | PPQ 音色干净，适合当 9mm 通用手枪声 |
| .45 手枪/冲锋枪：M45A1/UMP45/MAC10/TOMMY GUN/KRISS VECTOR/M3A1 | **1911**（.45，43 条全套） | `pistol_45_close/far_*.ogg`（9 条） | 冲锋枪版可叠 PPSh 连发尾巴 |
| 9mm SMG：MP5/MP5K/MP5SD/UZI/MICRO UZI/PP-19/AUG A3 PARA/K7 | **Carl Gustav M45**（9mm SMG，37 条含连发） | —（kit SMG 无独立枪声，按口径用手枪声） | M45 与 MP5 音色气质接近 |
| 5.7 枪族：FIVE SEVEN/P90 | 无（SFX 无 5.7） | — | 只能用 kit pistol_9mm 变调或 PPSh 高频段；候选缺口 |
| .22 枪族：ZIP 22/GB-22 | Ruger Mark III / Ruger 10/22 / Marvel Suppressed .22 | `pistol_22lr_close/far_*.ogg`（6 条） | 小口径全覆盖 |
| 7.62x54R：DRAGUNOV SVDS/SVU、OBREZ | **Mosin Nagant**（栓动全套） | — | SVU 无托半自动可叠 SKS 半自动节奏 |
| 栓动/半自动狙击（.308/.338/.300WM/.408/.50BMG）：AWS/AWM/TRG-42/REM 700/M107/HECATE II/BFG 50/INTERVENTION | Tikka / Savage 10 / Mosin（栓动声通用，枪声按口径挑） | `rifle_308_3006_close/far_*.ogg`（12 条） | .50 级需自行加低频，无原生素材 |
| 霰弹枪族：REM 870/KSG/SAIGA 12/AA-12/SPAS-12/SAWED OFF/DBV12… | CD / Model 12 / Nova / Mossberg（12ga 泵动/栓动） | `shotgun_12_close/far_*.ogg`（12 条） | AA-12 连发可叠 AK burst |
| 左轮族：MP412 REX/1858/REDHAWK/EXECUTIONER/JUDGE | S&W 642（.38 双动）/ Ruger Single Six（.22 单动） | `revolver_38_357_far_*.ogg`（4 条） | 无换弹匣音；甩弹巢声 kit 有 cylinder_* 可借（CC0） |
| DMR（7.62 NATO）：SCAR-H/G3/AG-3/FAL 系/MK11/MSG90/HK417 | AR-15 或 Savage 10 | `rifle_308_3006_*` | 半自动大口径，AR 节奏 + 308 音色 |

### 3.3 PF 数值采用与 kit 缺口补法

- **优先级**：伤害/弹匣/射速/射程/部位倍率用 **PF**（游戏向、直接可调）；初速/动能/弹重/风阻/口径物理用 **kit**（PF 无这些字段）；kit 的 timings{draw,reload,clear}/spreadDeg/recoil 直接当手感参数用，PF 无对应
- kit 没有的 PF 枪（83 把）：口径在 kit calibers.json 34 种内的（如 5.45x39/9x39/7.62x25/4.6x30 都有），初速/动能直接按口径取 caliber 默认值补齐；口径不在 kit 内的（.408 CheyTac/.376 Steyr/.410 Bore/.50 Beowulf 等）手填公开弹道数据
- kit 没有的枪型音效：见 3.2 借音矩阵；完全无源的（5.7mm 枪族）是唯一真实缺口

---

## 4. 推荐收录名单

结合游戏现状（DGTypes 已有 pac9/deagle/awp/mp5/uzi 五型 + desert-eagle/awp/mp5/uzi 四把 GLB），建议扩充顺序：

### 第一批：全链路枪（参数+音效同枪齐备，7 把）

1. **AK-47**（PF 表#46）— SFX AK-47 全套 51 条；kit AK-47 参数
2. **M1911**（#3）— SFX 1911 全套 43 条；kit Colt M1911
3. **SKS**（#61）— SFX SKS 20 条；kit SKS
4. **PPSh-41**（#122）— SFX PPSh 36 条；kit PPSh-41（71 发弹鼓，高射速特色枪）
5. **Mosin Nagant**（#133）— SFX Mosin 27 条；kit Mosin-Nagant 91/30（栓动狙击入门）
6. **M4A1**（#76）— SFX AR-15 33 条；kit Colt M4A1
7. **Honey Badger**（#83）— SFX Savage 10（.300 BLK 同口径）32 条；kit 无（PF 参数 + calibers 补物理）

### 第二批：参数齐 + 借音（11 把，含现有 GLB 的升级）

8. **MP5**（现有 GLB）— PF MP5 + kit HK MP5A3/MP5SD3 参数 + Carl Gustav M45 音
9. **UZI / Micro Uzi**（现有 GLB）— PF UZI/MICRO UZI + kit Uzi/Mini Uzi + M45 音
10. **Desert Eagle XIX**（现有 GLB）— PF DEAGLE XIX + kit Desert Eagle Mark XIX + 1911 音（降 pitch）
11. **AWP**（现有 GLB）— PF AWM + kit Accuracy AWM + Tikka/Mosin 栓动音
12. **Glock 17** — PF G17 + kit Glock 17 + Walther PPQ 音（pac9 的直接升级备选）
13. **M9** — PF M9 + kit Beretta 92FS + PPQ 音
14. **HK416** — PF + kit + AR-15 音（5.56 通用族代表）
15. **AK74** — PF + kit + AK-47 音（5.45 系代表）
16. **Remington 870** — PF + kit + 泵动霰弹音（霰弹类开门枪）
17. **Dragunov SVDS** — PF + kit SVD + Mosin 音（半自动狙击）
18. **Remington 700** — PF + kit + Savage/Tikka 音（栓动狙击二线）

### 音效补充采购位（kit 自带，MIT 友好）

- 机构声（拉栓/抛壳/弹匣/甩弹巢/干击）：直接用 kit `armas/` 的 CC0 条目（bolt_*/casing_*/mag_*/cylinder_*/dry_fire 等），命名规整且与 FFSL 同源
- 远距版枪声：kit close/far 双版本 + SFX 的 distant 条目（AK-47 有 8 条远距）
- 口径级兜底：kit `rifle_5_56 / rifle_7_62x39 / rifle_308_3006 / pistol_9mm / pistol_45 / pistol_22lr / shotgun_12`

---

## 5. 获取方式

```bash
# SFX（CC0，按需单文件下载，仓库 3.4GB 建议不整库 clone）
#   https://raw.githubusercontent.com/buddingmonkey/FreeFirearmsSFXLibrary/main/Master%20Tracks/AK-47/C_25.wav
#   https://raw.githubusercontent.com/buddingmonkey/FreeFirearmsSFXLibrary/main/Prepared%20SFX/AK-47/C_27P.wav
#   总表: https://raw.githubusercontent.com/buddingmonkey/FreeFirearmsSFXLibrary/main/Master%20Sheet.xlsx
#         （注意 URL 空格要 %20；Prepared+Master+Sheet.csv 的 "+" 写法会 404）
# kit（MIT）
git clone --depth 1 https://github.com/Andersonfrfilho/adatechnology-game-kit /tmp/adatk
#   参数: packages/game-weapons/src/data/firearms.json + calibers.json
#   音效: packages/game-audio/assets/sfx/armas/*.ogg（认准 CREDITOS.md 里 CC0 条目）
# PF（数值参考）
#   https://gist.githubusercontent.com/DET171/25079304790686bb47c5cc7c3d6f6a41/raw/list.json
```

---

## 附：数据质量与坑

1. **SFX 文件名无语义**：Master Tracks 是 `C_0.wav` 这类编号，语义全在 `Master Sheet.xlsx`；URL 里的空格必须 `%20`，用 `+` 连接会 404
2. **PF 数据小毛病**（采用时注意）：G36C 的 r 字段是 `33-20`（区间反了）、RPK r=`42-32`、L86 LSW r=`35-25`；AWM cap=`5+1/1.25`（1.25 应为备弹数写错）；GB-22 r=`CURRENTLY UNAVAILABE`（原文拼写错）；rank 字段有 `59 `、`6  ` 等带尾空格变体；个别 rpm 带模式后缀（`1000 SEMI`、`50 BOLT`）需再解析
3. **kit 数值口径**：栓动枪 rpm=73.17 是循环动作限速值而非真实射速；muzzleSpeed 缺失 12 款（HK G36C/G36K、MP40、SIG MPX、PSG-1、Taurus TH380、MRAD、M200、Rem700 .300WM、SSG 69、Win 1887）；动能表为现算值非仓库原字段
4. **doc/weapons-library.md 口径过时**：写 79 款枪械/28 口径，实测 main 分支已是 115 款/34 口径（仓库活跃演进）；「79 款」应为旧版本数字
5. **kit 音频许可分层**：repo 是 MIT 但**音频资产不是 MIT**——逐文件 CC0/CC-BY（CREDITOS.md）；CC-BY 的 15 条 armas 音频若使用必须署名，入库只挑 CC0 最稳
6. **PF 无许可**：数值照搬风险低（事实数据），但 desc 描述文案是创作内容，进游戏前必须重写
7. SFX 左轮两把（S&W 642、Single Six）没有换弹匣类音效是枪械原理决定的，不算库缺陷；PF 左轮的换弹需用 kit cylinder_* 或自制

*调研中间产物（/tmp，可复现）：/tmp/sfx-tree.json、/tmp/pf-guns.json、/tmp/kit-tree.json、/tmp/sfx-meta/{prepared.csv, master-parsed.json, master-recs.json, gun-sfx-map.json, kit-firearms.json, kit-calibers.json}*
