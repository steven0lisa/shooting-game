# 武器模型保真审计 · 批次 3（现代步枪/卡宾 12 款）

> 审计日期 2026-11-13。方法：逐款下载 pack 模型 poster 图（cdn.3dassets.dev/assets/<id>/v1/poster.webp）与真枪参考图（Wikipedia/Wikimedia，Honey Badger 走图片搜索兜底），两张图都实际目视比对后判定。
> 判定标准：**PASS** = 一眼认得出真枪原型（允许几何简化；HK416 族内、AUG A1/A2 族内 loadout 差异不算错）；**FAIL** = 张冠李戴、比例崩坏、缺标志性特征、认不出。
> 证据图：`/tmp/guncheck/<slug>-model.png` 与 `/tmp/guncheck/<slug>-real.png`。

## 判定一览

| slug | 中文名 | pack 模型 (id) | 真枪参考 | 模型观察 | 判定 | 说明 |
|---|---|---|---|---|---|---|
| mk18 | MK18 CQBR 近战卡宾 | Short Carbine, CQB Loadout (33437) | Mk 18 CQBR（维基 M4A1-CQBR 图） | AR 短卡宾：10in 级短管+四轨护木+红点+竖握把+枪灯+STANAG 弹匣+缩折托 | **PASS** | 正是 CQB loadout 形态，特征齐全 |
| mk12 | MK12 SPR 特等射手步枪 | Long Barrel Rifle, Suppressed (33444) | Mk 12 SPR（SPRCrane.jpg） | 长管 AR：长护木+大倍率光学镜+消音器+固定托 | **PASS** | SPR 长管射手枪形态可认 |
| mk11 | MK11 精确步枪 | Marksman Rifle, Scoped (33442) | Mk 11 Mod 0（SR-25 图） | SR-25 系长管+8× 镜+消音器+两脚架+固定托 | **PASS** | 与 SR-25/Mk11 实枪形态一致 |
| hk416 | HK416 卡宾枪 | Piston Carbine (33319) | HK416（HK416N.png） | AR 卡宾：四面轨护木+STANAG 弹匣+伸缩托+活塞短管节 | **PASS** | HK416 识别特征（四面轨+短管节）在 |
| hk416a5 | HK416A5 夜战型 | Piston Carbine, Night Loadout (33440) | HK416（同上） | hk416 同体+倍率镜+枪灯+激光指示器 | **PASS** | 族内 night loadout 变体成立（roster 已注明同枪变体） |
| fal | FAL 50.00 战斗步枪 | Battle Rifle (33324) | FN FAL（DN-SC-92-04655） | 长管+圆柱护木/导气座+固定直托+20 发窄弹匣+消焰器 | **PASS** | FAL 长管直托轮廓成立；顶部导轨为 kit 现代化改型，不影响识别 |
| galil | Galil ARM 突击步枪 | Heavy Tri Rail Carbine (33330) | IMI Galil（Galil_noBG.png） | AK 系机匣+侧折骨架托+护木轨，**供弹具为大容量弹鼓**，消焰器短 | **FAIL** | 张冠李戴：真枪 Galil 从无弹鼓出厂型（35 发盒式弯弹匣），弹鼓是 RPK/Combloc 机枪特征；整体观感偏「AK 弹鼓机枪」而非 Galil；亦无 ARM 标志性提把/两脚架 |
| tavor7 | IWI Tavor 7 | Bullpup Marksman Rifle (33333) | IWI Tavor 族（TAR-21 图） | 无托布局：握把在前、弹匣后置嵌入枪身尾段，长管+护木轨+消焰器 | **PASS** | 无托结构正确（弹匣位于扳机/握把后方），Tavor 族形态可认；真枪参考用 TAR-21 同族图（Tavor 7 无独立维基图） |
| rfb | Kel-Tec RFB 无托战斗步枪 | Bullpup Battle Rifle (33325) | Kel-Tec RFB（Keltecrfb_noBG.png） | 无托布局：握把在前、弹匣后置，长管+前部枪口配件+两脚架 | **PASS** | 无托+前抛壳 .308 战斗步枪形态成立 |
| aug | Steyr AUG A1 | Bullpup Rifle (33321) | Steyr AUG（A3 军版图） | 无托布局：握把居中、弹匣后置、枪身一体延伸为托+机匣顶部光学基座 | **PASS** | AUG 无托+一体托特征正确（弹匣在握把后方） |
| auga2 | Steyr AUG A2 | Bullpup Rifle, Optic Loadout (33441) | Steyr AUG（同上） | aug 同体+全息瞄具+竖握把+枪灯 | **PASS** | A2=可卸瞄具导轨版，模型挂全息瞄具符合 A2 形态（roster 注明同枪变体） |
| honeybadger | Honey Badger 消音步枪 | Integrally Suppressed Rifle (33326) | AAC/Q Honey Badger（Recoil 图，维基无枪图） | AR 平台：短粗一体消音管+短护木+PDW 式托+STANAG 弹匣 | **PASS** | 「短+消音+AR 底子」三特征齐全（scaleLen .740 全库最短之一，与实枪比例相符） |

## 汇总

- **PASS：11 / 12**
- **FAIL：1 / 12**
  - `galil`（33330 Heavy Tri Rail Carbine）——供弹具弹鼓张冠李戴 + 缺 ARM 提把/两脚架标志件，一眼会被认成 AK 系弹鼓机枪。若要修复：换 35 发盒式弯弹匣 + 加提把与折叠两脚架 + 加长鸟笼消焰器；或整体换用带 Galil 特征的 pack 模型。

## 备注

1. **真枪图源**：10 款走 Wikipedia REST summary / Wikimedia Commons；`mk18` 用 CQBR 条目图（Mk 18 无独立维基条目）；`tavor7` 用 TAR-21 图（同族无托外形）；`honeybadger` 维基「Honey Badger」条目是动物蜜獾、Commons 无枪图，改用图片搜索的 Recoil Magazine 实枪图兜底。
2. **初判修正记录**：tavor7 与 rfb 第一次目判曾误判为传统布局，复核确认两者弹匣均后置于握把后方（无托正确），改 PASS——无托判定以「弹匣与扳机/握把的相对位置」为准。
3. 同批 12 款的模型图/真枪图均存于 `/tmp/guncheck/`（临时目录，重启即失）。
