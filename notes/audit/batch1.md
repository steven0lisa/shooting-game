# 武器模型保真审计 · 批次 1（手枪 12 款）

> 审计日期 2026-11-13。仓库基线 commit `49bd3e9`（main）。
> 方法：逐款取两套图并**都实际目视看过**再判 ——
> ① 模型侧：先看 3dassets pack 海报（`cdn.3dassets.dev/assets/<id>/v1/poster.webp`），再用 Blender 直接渲染游戏在用资产
> `assets/models/v3/<slug>.glb`（正交侧视 + 3/4 视，clay/纯色材质），排除海报角度遮挡；
> ② 真枪侧：Wikipedia REST summary / Wikimedia Commons 实枪图。
> 判定标准同批次 2/3：**PASS** = 一眼认得出是这款枪（允许低模简化；同族仅管长/套件差异不算错）；
> **FAIL** = 张冠李戴、比例崩坏、缺标志性特征、完全认不出。
> 证据图：`/tmp/guncheck/<slug>-model.png`、`/tmp/guncheck/<slug>-real.png`（临时目录，重启即失）。

## 判定表

| slug | 中文名 | 模型图来源 | 真枪图来源 | 判定 | 一句话理由 |
|---|---|---|---|---|---|
| glock17 | Glock 17 手枪 | pack 33296 poster + `v3/glock17.glb` 直渲 | Wikipedia「Glock」首图（Commons *Glock 17 (6825676904) без фона*） | **PASS** | 方套筒+前后防滑纹+无外置击锤+聚合物握把，Glock 家族轮廓一眼可辨；方形扳机护圈属低模简化 |
| glock19 | Glock 19 手枪 | pack 33290 poster + `v3/glock19.glb` | Commons *Glock 19 (transparent background)* | **PASS** | 与 17 同族缩短版（套筒/握把同步变短），紧凑型比例正确 |
| glock19x | Glock 19X | pack 33458 poster + `v3/glock19x.glb` | Commons *Glock 19X at ADAS 2018 (cropped)* | **PASS** | 沙色（FDE）枪身 + 黑套筒的双色正是 19X 招牌配色，另挂反射瞄+枪灯符合 Carry Loadout |
| glock34 | Glock 34 长滑套 | pack 33293 poster + `v3/glock34.glb` | Commons *Glock34 with gtl22*（带电筒的 G34） | **PASS** | 套筒/枪管明显长于 17（长滑套本体成立），可调照门；枪口螺纹段略长于真枪，同族差异不计错 |
| glock34sd | Glock 34 消音 | pack 33456 poster + `v3/glock34sd.glb` | 同上（G34 同枪参考） | **PASS** | 同 glock34 长滑套 + 消音器/枪灯/红点，Suppressed Loadout 形态成立 |
| glock18 | Glock 18 冲锋手枪 | pack 33294 poster + `v3/glock18.glb` | Commons *Glock 18C*（18 族唯一可用实枪图，C 型同机身） | **PASS（带瑕疵）** | 长弹匣垂出握把 = 33 发冲锋手枪特征；但机匣下方多出一块与握把同网格的方块（真枪无此件，形似副弹匣/前握把），且无快慢机标记 |
| glock18c | Glock 18C | pack 33457 poster + `v3/glock18c.glb` | Commons *Glock 18C* | **PASS（带瑕疵）** | 同上多块问题；另外真 18C 的补偿口（C）未表现，改挂消音器属 Loadout 取向 |
| p365 | SIG P365 微型手枪 | pack 33292 poster + `v3/p365.glb` | Commons *SIG Sauer P365 left side — no bg* | **PASS（弱）** | 紧凑级尺寸对（套筒 0.145 m，比 glock19 的 0.171 m 短 15%）、10 发短握把成立；但套筒轮廓沿用 Glock 平板 + 大方形抛壳口面，SIG 的锥形套筒与握把纹理全无 —— 只能认成「紧凑手枪」，认不出是 P365 |
| m17 | M17 执勤手枪 | pack 33455 poster + `v3/m17.glb` | Wikipedia「SIG Sauer P320」首图（*Sig Sauer P320 Modular Handgun System*） | **FAIL** | 套筒与机架 3 件网格与 glock17 **逐字节相同**（md5 一致）+ 枪灯/红点；P320/M17 的 FDE 沙色、模块化套筒造型、手动保险、高机械照门全无 —— 一眼是「带配件的 Glock」 |
| mark4 | Ruger Mark IV 目标手枪 | pack 33291 poster + `v3/mark4.glb` | Commons *Ruger Standard Mark IV 22-45 Lite*（另核 *Ruger Mk II Target* 经典轮廓） | **PASS（弱）** | 长牛管+可调照门+棕色握把的 .22 目标手枪形态成立；真枪细管式上机匣与 Luger 角握把被简化成方形套筒 + 近垂直握把 |
| webley | Webley Mk VI 左轮 | pack 33299 poster + `v3/webley.glb` | Commons *Webley mk VI — white background* | **PASS** | 顶折式结构在（枪管与机匣前铰接、框架顶端闭锁、居中转轮、外露击锤），管长/转轮比例对；鸟头握把做成直板、枪绳环缺失 |
| deagle | 沙漠之鹰 | poly.pizza/m/e9k4dwOzCX 页 poster 实为卡通猴占位图，改渲 `assets/models/desert-eagle.glb`（md5 = `0d1f2574…`，与游戏在用资产一致） | Wikipedia「Desert Eagle」首图 *DesertEagle 50AE* | **PASS** | 超大方形套筒+导轨泄气槽+三角形保险+粗大导气块+方握把，Desert Eagle 轮廓一眼可辨 |

## 汇总

- **PASS：11 / 12**（其中 4 款为「弱 PASS/带瑕疵」，见下方备注）
- **FAIL：1 / 12**

### FAIL 清单

1. **`m17`（pack 33455 Service Pistol, Duty Loadout）**
   - **性质：张冠李戴 —— 模型就是 glock17 的同一套枪身 + 配件。**
   - 硬证据（GLB 网格逐字节比对）：`slide/gunmetal`（11006 verts，md5 `ddfad7a9`）、`service-pistol-duty-loadout_4`（2172 verts，`1c4bbf39`）、`_5`（3541 verts，`e38d3ad7`）三件与 `v3/glock17.glb` 的对应网格**完全相同**；m17 的 `_6` 又与 `glock34` 的 `_6` 同源（`ca8a1346`）。即 m17 = glock17 换弹匣底板 + 加枪灯 + 加红点。
   - 真枪差异（真 M17 = SIG P320 军用版）：**FDE 沙色整枪**（模型全黑）、P320 特征性**模块化套筒/平顶轮廓 + 高机械照门**（模型是 Glock 式方套筒 + 大方形抛壳口面）、**手动保险**（模型无）、握把为 SIG 纹理模块（模型是 Glock 握把）。
   - 建议：换用真正的 P320/M17 模型；若保留则至少改配色 + 修掉手动保险缺失，否则两条不同真枪共用同一套几何，玩家只会认成「Glock 加灯」。
   - 附带影响：本批里 glock17 与 m17 视觉上几乎同枪（仅差灯/红点），73 款名册里属重复形制。

## 备注（非剔除级偏差，供后续换模/修模参考）

1. **同族几何复用是这批手枪的普遍现象**（不构成 FAIL，但会造成「几把枪长得一样」）：
   - `glock19` 与 `glock19x` 共用套筒（`dd1390d8`，9738 verts）与机架三件（`3270ffd1`/`80070831`/`dcfd377e`）——19X 只多了瞄具/枪灯/配色；
   - `glock34` 与 `glock34sd` 共用套筒（`45bcf39b`，11645 verts）与 `_6`；
   - `glock18` 与 `glock18c` 共用套筒（`a6c777e5`，11006 verts）与弹匣（`c973b9da`）。
   这些属 roster 已登记的「同枪 Loadout 变体」，判定不计错。
2. **glock18 / glock18c 的前下多余方块**：该块与握把同在 `machine-pistol_6` 网格内（隐藏该网格后方块与握把一起消失），不是独立浮件；但它形状/位置在真 Glock 上不存在（无前握把、无副弹匣位），渲染出来像「枪管下挂了个方盒子」。18C 还缺补偿口（C 型唯一可见标识）。若要修：删该方块 + 加滑套顶部快慢机刻线 / 补偿口。
3. **p365（弱 PASS）**：模型是独立网格（不与 glock 同源，套筒/机架 md5 均不同）。整体尺寸 0.145 × 0.130 m（长:高 ≈ 1.12）在亚紧凑级，比 glock19（0.171 × 0.147）短一档，配 10 发短握把，**尺寸语义正确**；但套筒做成 Glock 式平板 + 大方形抛壳口面，P365 的锥形套筒收口与 SIG 握把纹理没做，**只能认成「紧凑手枪」而非特定型号**。roster 自己也注明是「kit Glock 19 近似 −10%」。
4. **mark4（弱 PASS）**：牛管、可调照门、棕色握把三件在，`.22 目标手枪` 语义成立；但真 Ruger Mark IV 的标志是**细管式上机匣 + Luger 角（约 110°）握把**，模型给的是方形套筒 + 近垂直握把（握把底还有 Glock 式弹匣底板件），远看更像「加长枪管的 Glock」。若要更强识别度：收窄上机匣为圆管、加大握把倾角。
5. **webley（PASS 但握把失真）**：顶折结构（前铰接 + 框架顶闭锁 + 居中转轮 + 外露击锤）与管长/转轮比例都对，能认出是 Webley 系顶折左轮；但鸟头握把被简化成直板、.455 时代的枪绳环（lanyard ring）缺失。
6. **deagle 取图特例**：任务指定的 poly.pizza 页面 `og:image` 指向的 CDN 图（`static.poly.pizza/ad52df37…jpg`）是**卡通猴头像**（该页渲染器的 poster 占位图，不是枪），不能用于判形；改用游戏自带 `assets/models/desert-eagle.glb`（已核对与 poly.pizza 提供的 `.glb` md5 相同 = 同一模型）Blender 直渲判形，并以 poly.pizza 页标题「Rigged Desert Eagle」佐证。
7. **真枪图源说明**：`glock18` 无独立可用实枪图，用 *Glock 18C* 图（同机身、仅补偿口不同）作族参考；`m17` 用 P320 首图（M17 即 P320 军用型）；`mark4` 用 *Mark IV 22-45 Lite* 图判形、另核 *Mark II Target* 经典轮廓；`glock34sd` 与 `glock34` 同图。
