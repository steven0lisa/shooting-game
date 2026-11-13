# 武器模型保真审计 · 批次 4（狙击 / 栓动 12 款）

> 审计日期 2026-11-13（重跑）。方法：逐款下载 pack 模型 poster 图（`cdn.3dassets.dev/assets/<id>/v1/poster.webp`）与真枪参考图（Wikipedia REST summary / Wikimedia Commons，Commons 搜图兜底），两张图都实际目视比对（关键部件另做局部放大）后判定。
> 判定标准：**PASS** = 一眼认得出真枪原型（允许几何简化、带镜/消音/战术 Loadout 变体；族内同枪变体不算错）；**FAIL** = 张冠李戴、比例崩坏、缺标志性特征、认不出。
> 证据图：`/tmp/guncheck/<slug>-model.png` 与 `/tmp/guncheck/<slug>-real.*`（局部放大图为 `*-zoom*.png` / `*-stock.png` / `*-lever*.png` / `*-handle.png`）。

## 判定一览

| slug | 中文名 | 模型图 | 真枪图 | 判定 | 一句话理由 |
|---|---|---|---|---|---|
| sa58 | SA58 SPR 精确步枪 | /tmp/guncheck/sa58-model.png | /tmp/guncheck/sa58-real.png（FN FAL） | **FAIL** | 模型是 AR-10 式方形机匣 + 前置盒式弹匣 + 方块枪托，仅把机匣涂成橄榄绿；FAL/SA58 的标志（圆柱护木+导气箍、FAL 拉机柄、直托轮廓、20 发直弹匣）全缺，一眼会被读成 SR-25 系 DMR，不是 FAL 底盘。 |
| sr25 | Knight's SR-25 | /tmp/guncheck/sr25-model.png | /tmp/guncheck/sr25-real.jpg（SR-25 pic02） | **PASS** | AR-10 长四轨护木 + 两脚架 + 固定托 + 长管（枪口装置）与真枪 SR-25 完全同构；poster 为裸枪不带镜（游戏中配件系统补），形态可辨。 |
| m110 | M110 SASS | /tmp/guncheck/m110-model.png | /tmp/guncheck/m110-real.jpg（US Army M110 SASS） | **PASS** | 沙色 AR-10 平台 + 长导轨护木 + 前置弹匣 + 大枪口/消音管，M110 SASS 的"沙色 AR-10 精射手"轮廓成立（真枪图同为沙色）。 |
| m110t | M110 战术型（8× 光学） | /tmp/guncheck/m110t-model.png | /tmp/guncheck/m110-real.jpg（同 m110 真枪） | **PASS** | m110 同体 + 8× 镜 + 消音器 + 激光，属 roster 已注明的同枪 Loadout 变体，族内差异成立。 |
| win94 | Winchester 1894 杠杆步枪 | /tmp/guncheck/win94-model.png | /tmp/guncheck/win94-real.png（Winchester 94 .32 Spl） | **PASS** | 木托 + 木护木 + 半管护木带 + 管状弹仓轮廓 + 无外露盒式弹匣 + 扳机下杠杆拨杆，杠杆枪轮廓成立；不足是杠杆环偏小、机匣加了现代导轨。 |
| k31 | K31 直拉栓步枪 | /tmp/guncheck/k31-model.png | /tmp/guncheck/k31-real.jpg（Schmidt Rubin K31） | **PASS** | 木托长管 + 机匣侧向直拉柄（横出的圆柱拉机柄）+ 无瞄具裸枪，K31 的直拉特征在；弹匣盒与托腮板偏现代但属可容忍简化。 |
| k31zfk | K31 狙击型（ZfK） | /tmp/guncheck/k31zfk-model.png | /tmp/guncheck/k31-real.jpg（同 k31 真枪） | **PASS** | k31 同体 + 4× 镜 + 消音器，同枪 Scoped 变体（roster 已注明），直拉柄与木托保留。 |
| kar98k | Kar98k 栓动步枪 | /tmp/guncheck/kar98k-model.png | /tmp/guncheck/kar98k-real.png（Kar 98K AM021488） | **FAIL** | 模型拉机柄是**水平直柄**（直拉式圆柱横出），不是 Kar98k 标志性的下弯拉机柄；且外露大盒弹匣（真枪为内藏 5 发弹仓）+ 机匣满轨，与 K31/Mosin 共用模板，难以辨为 K98k。 |
| mosin | Mosin-Nagant PU 狙击 | /tmp/guncheck/mosin-model.png | /tmp/guncheck/mosin-real.png（Mosin remove-bg） | **PASS** | 木托长管 + 机匣下方外凸弹仓盒（Mosin 的特征性弹仓/扳机护圈体）+ 顶部小倍率镜，91/30 PU 狙轮廓可辨；拉机柄仍为直柄（真枪 PU 为下弯柄），属简化。 |
| svd | SVD 德拉贡诺夫 | /tmp/guncheck/svd-model.png | /tmp/guncheck/svd-real.jpg（SVD Dragunov） | **PASS** | 木托 + 显著托腮板 + 握把前盒式短弹匣 + 带槽木护木 + 长管两脚架，SVD 的"木托+托腮板+短弹匣"三特征齐（无拇指孔托但托腮板形态到位）。 |
| trg42 | Sako TRG-42 | /tmp/guncheck/trg42-model.png | /tmp/guncheck/trg42-real.jpg（Sako TRG-42 .338LM） | **FAIL** | 重管 + 大枪口装置 + 两脚架是对的，但枪托是 pack 通用"实心方块托 + 高托腮块"，无 TRG 枪托的握把后深切角/可调托底板/贴腮轨，也与 roster 里"TRG 枪托"标志不符，认不出是 TRG 系。 |
| mrad | Barrett MRAD | /tmp/guncheck/mrad-model.png | /tmp/guncheck/mrad-real.png（Barrett MRAD 双色图） | **PASS** | 长导轨护木 + 重管枪口装置 + 双管折叠式托 + 方形托底板 + 两脚架，折叠底盘狙击形态与 MRAD 对应（真枪同款折叠托+方托底板）。 |

## 汇总

- **PASS：9 / 12** —— sr25、m110、m110t、win94、k31、k31zfk、mosin、svd、mrad
- **FAIL：3 / 12**
  - `sa58`（33438 Battle Rifle, Marksman Loadout）——底盘认错：模型是 AR-10 构型，SA58/SA58 SPR 是 FAL 底盘；缺 FAL 圆柱护木/导气箍、FAL 拉机柄、直托轮廓。修复方向：换 FAL 系底座（复用 33324 Battle Rifle 的机匣/护木）+ 保留 8× 镜/消音 rail 件。
  - `kar98k`（33334 Wood Stock Bolt Sniper）——缺 K98k 下弯拉机柄（模型为直拉式横柄）+ 外露盒式弹匣（真枪内藏 5 发弹仓），与 K31/Mosin 同模板导致辨识度丢失。修复方向：改下弯拉机柄 + 改内藏弹仓（弹仓底板外露即可）+ 去掉机匣全轨或改短桥轨。
  - `trg42`（33337 Heavy Barrel Sniper）——枪托不对：模型用 pack 通用实心方块托，缺 TRG 的握把后深切角/可调托底板/贴腮轨；管/枪口/两脚架可用。修复方向：专用 TRG 托型（深凹握把后方 + 后部可调托底板 + 绿色/黑色聚合物托）。

## 备注

- **系统性模板问题（建议批次负责人知悉）**：本 pack 所有精确射手/栓狙共用同一套"黑色方形机匣 + 前置盒式弹匣 + 方块/双管托"骨架，差异主要落在管长、枪口装置、涂装与配件。因此 AR-10 系（sr25/m110/m110t）天然吻合，非 AR 系（sa58= FAL、trg42= TRG）就必然失真。若要整批提升保真度，优先专项重做这三款的机匣/枪托（sa58、kar98k、trg42）。
- **与批次 3 的口径差异（需统一）**：本轮实测下载 `33324 Battle Rifle`（roster 中 `fal` 用的模型）poster 比对，发现它与 `33438`（`sa58`）**共用同一套橄榄绿方形机匣 + 方块托骨架**，两者都不是 FAL 的圆柱护木/导气箍外形。批次 3 当时把 `fal` 判为 PASS（理由"FAL 长管直托轮廓成立"），本轮对同底盘的 `sa58` 判 FAIL。二者判定口径不一致，建议由批次负责人统一：若接受"绿色方机匣 AR 化 FAL"即算 PASS，则 `sa58` 应同判 PASS；若按真实 FAL 特征严格判，则 `fal` 也应下调为 FAIL。本报告按严格口径记录，未改动 batch3 结论。
- **难以取图的款**：无。sa58 用 FN FAL 维基无背景图（SA58 为其美制民用版，底盘相同）；trg42 用 Commons `Sako TRG-42.jpg`；win94 用 Commons `Winchester-94-32spl_noBG.png`；k31 用 Commons `Schmidt Rubin K31.jpg`（维基 K31 条目的 originalimage 为空）；M110 用 Commons 美军 M110 SASS 官方照。m110t/k31zfk 无独立真枪图，沿用同枪基础型真枪图比对。
- **证据口径说明**：所有模型图来自 CDN poster（v1/poster.webp，1280×1280，白色底 3/4 视角）；关键判定部位（拉机柄、弹匣、杠杆、枪托）另做 2~4 倍局部放大后判读（`/tmp/guncheck/*-zoom*.png`、`kar98k-zoom.png`、`k31-handle.png`、`trg42-stock.png`、`win94-lever2.png`、`win94-fore.png`、`svd-stock.png`）。
- 本批未跑 Blender、未做本地渲染、未改动 `assets/`、`src/` 与其他 notes。
