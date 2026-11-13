/* ============================================================ 武器系统 v3 —— GUNDATA（武器数值表）
   契约见 notes/weapon-v3-spec.md §2；名册与来源见 notes/roster-built.md。
   纯数据文件，不做任何运行时逻辑：本表 69 型武器由 08-weapons.js 按 slug 索引读取。

   收录 69 把（手枪 15 + 长枪 54 = 步枪/卡宾 20 + DMR 7 + 狙击 9 + 冲锋/PDW 9 + 霰弹枪 9）
   ——模型全部来自 3dassets.dev Mega Weapon Pack（CC0 1.0，无需署名），
   已排除与既有定制实现重复的 4 件（Uzi 系折叠托 SMG ×2 / AI 底盘栓狙及带镜版 ×2）；
   既有的 pac9 / deagle / awp / mp5 / uzi 保留为独立高质量实现，不进本表。

   字段：
     slug    唯一 id，也是模型文件名（assets/models/v3/<slug>.glb）与音效表键
     name    HUD 显示名（中文）
     cat     "long" = 槽1 主武器 / "pistol" = 槽2 副武器
     model   GLB 路径（相对 index.html）
     mag/rpm 弹匣容量 / 每分钟射速
     fire    "auto" 连发 / "semi" 半自动（含左轮）/ "bolt" 栓动
     damage  单发伤害（敌人 hound 140 HP、gull 45 HP 基准）
     range   有效射程（米）
     adsFov  开镜视场角（狙击/DMR 18~24，其余 52）
     bloom   每发散布增量（基准 mp5 .12）
     rc      后坐系数（基准 mp5 1.0）
     reloadT 战术换弹秒数 / reloadE 空仓换弹秒数
     scaleLen 视模最长边目标尺寸（米）
     oal     真实全长 overall length（米，枪托展开/枪口装置装好状态）：
             渲染长度 = oal × 统一视模系数，枪与枪的尺寸比 = 真实比。
             取该枪映射真枪的公开实测规格；逐条来源见 notes/roster-built.md 的 oal 列。

   数值来源：PF Gun List（145 把，近距伤害线性缩放到本游戏刻度，保留强弱次序）
   优先，adatechnology-game-kit firearms.json（115 款，真实 rpm/弹匣/初速/动能）补缺与校验。
   ============================================================ */

var GUNDATA = [
    /* ---- 手枪（副武器 · 15） ---- */
        { slug: "glock17", name: "Glock 17 手枪", cat: "pistol", model: "assets/models/v3/glock17.glb", mag: 17, rpm: 300, fire: "semi", damage: 36.8, range: 120, adsFov: 52, bloom: 0.24, rc: 1.05, reloadT: 1.90, reloadE: 2.50, scaleLen: 0.28, oal: 0.204 },
        { slug: "m17", name: "M17 执勤手枪", cat: "pistol", model: "assets/models/v3/m17.glb", mag: 17, rpm: 270, fire: "semi", damage: 38, range: 130, adsFov: 52, bloom: 0.25, rc: 1.10, reloadT: 1.95, reloadE: 2.55, scaleLen: 0.29, oal: 0.203 },
        { slug: "glock19", name: "Glock 19 手枪", cat: "pistol", model: "assets/models/v3/glock19.glb", mag: 15, rpm: 300, fire: "semi", damage: 36.8, range: 110, adsFov: 52, bloom: 0.23, rc: 1, reloadT: 1.80, reloadE: 2.40, scaleLen: 0.26, oal: 0.187 },
        { slug: "glock19x", name: "Glock 19X 战术手枪", cat: "pistol", model: "assets/models/v3/glock19x.glb", mag: 15, rpm: 280, fire: "semi", damage: 37.6, range: 120, adsFov: 52, bloom: 0.24, rc: 1.05, reloadT: 1.85, reloadE: 2.45, scaleLen: 0.27, oal: 0.189 },
        { slug: "p365", name: "SIG P365 微型手枪", cat: "pistol", model: "assets/models/v3/p365.glb", mag: 10, rpm: 300, fire: "semi", damage: 33.2, range: 95, adsFov: 52, bloom: 0.22, rc: 1, reloadT: 1.70, reloadE: 2.30, scaleLen: 0.22, oal: 0.147 },
        { slug: "glock34", name: "Glock 34 长滑套手枪", cat: "pistol", model: "assets/models/v3/glock34.glb", mag: 17, rpm: 300, fire: "semi", damage: 37.6, range: 135, adsFov: 52, bloom: 0.25, rc: 1.10, reloadT: 1.90, reloadE: 2.50, scaleLen: 0.30, oal: 0.224 },
        { slug: "glock34sd", name: "Glock 34 消音手枪", cat: "pistol", model: "assets/models/v3/glock34sd.glb", mag: 17, rpm: 260, fire: "semi", damage: 37.8, range: 140, adsFov: 52, bloom: 0.26, rc: 1.15, reloadT: 1.95, reloadE: 2.55, scaleLen: 0.30, oal: 0.224 },
        { slug: "glock18", name: "Glock 18 冲锋手枪", cat: "pistol", model: "assets/models/v3/glock18.glb", mag: 19, rpm: 1100, fire: "auto", damage: 34.9, range: 110, adsFov: 52, bloom: 0.28, rc: 1.35, reloadT: 1.90, reloadE: 2.50, scaleLen: 0.26, oal: 0.186 },
        { slug: "glock18c", name: "Glock 18C 战术冲锋手枪", cat: "pistol", model: "assets/models/v3/glock18c.glb", mag: 30, rpm: 1100, fire: "auto", damage: 35.7, range: 120, adsFov: 52, bloom: 0.29, rc: 1.40, reloadT: 1.95, reloadE: 2.60, scaleLen: 0.27, oal: 0.186 },
        { slug: "mark4", name: "Ruger Mark IV 目标手枪", cat: "pistol", model: "assets/models/v3/mark4.glb", mag: 10, rpm: 300, fire: "semi", damage: 28, range: 120, adsFov: 52, bloom: 0.22, rc: 1, reloadT: 1.80, reloadE: 2.40, scaleLen: 0.30, oal: 0.254 },
        { slug: "webley", name: "Webley Mk VI 左轮", cat: "pistol", model: "assets/models/v3/webley.glb", mag: 6, rpm: 170, fire: "semi", damage: 47, range: 120, adsFov: 52, bloom: 0.26, rc: 1.20, reloadT: 2, reloadE: 2.65, scaleLen: 0.30, oal: 0.286 },
        { slug: "python", name: "Colt Python 左轮", cat: "pistol", model: "assets/models/v3/python.glb", mag: 6, rpm: 180, fire: "semi", damage: 47, range: 145, adsFov: 52, bloom: 0.26, rc: 1.25, reloadT: 2.10, reloadE: 2.75, scaleLen: 0.30, oal: 0.275 },
        { slug: "sw686", name: "S&W 686 左轮", cat: "pistol", model: "assets/models/v3/sw686.glb", mag: 6, rpm: 180, fire: "semi", damage: 47, range: 145, adsFov: 52, bloom: 0.25, rc: 1.20, reloadT: 2.10, reloadE: 2.75, scaleLen: 0.29, oal: 0.243 },
        { slug: "coltsaa", name: "Colt SAA 单动左轮", cat: "pistol", model: "assets/models/v3/coltsaa.glb", mag: 6, rpm: 150, fire: "semi", damage: 58, range: 150, adsFov: 52, bloom: 0.27, rc: 1.35, reloadT: 2.10, reloadE: 2.75, scaleLen: 0.30, oal: 0.279 },
        { slug: "sw642", name: "S&W 642 短管左轮", cat: "pistol", model: "assets/models/v3/sw642.glb", mag: 5, rpm: 170, fire: "semi", damage: 41, range: 95, adsFov: 52, bloom: 0.24, rc: 1.15, reloadT: 1.95, reloadE: 2.60, scaleLen: 0.22, oal: 0.165 },
    /* ---- 步枪 / 卡宾（主武器 · 20） ---- */
        { slug: "ak47", name: "AK-47 突击步枪", cat: "long", model: "assets/models/v3/ak47.glb", mag: 30, rpm: 600, fire: "auto", damage: 34, range: 290, adsFov: 52, bloom: 0.17, rc: 1.25, reloadT: 2.40, reloadE: 3, scaleLen: 0.44, oal: 0.870 },
        { slug: "akms", name: "AKMS 折叠托突击步枪", cat: "long", model: "assets/models/v3/akms.glb", mag: 30, rpm: 600, fire: "auto", damage: 33, range: 280, adsFov: 52, bloom: 0.17, rc: 1.25, reloadT: 2.30, reloadE: 2.90, scaleLen: 0.42, oal: 0.880 },
        { slug: "ak74", name: "AK-74 突击步枪", cat: "long", model: "assets/models/v3/ak74.glb", mag: 30, rpm: 650, fire: "auto", damage: 27, range: 280, adsFov: 52, bloom: 0.14, rc: 1.05, reloadT: 2.40, reloadE: 3, scaleLen: 0.46, oal: 0.940 },
        { slug: "ak74n", name: "AK-74N 巡逻型突击步枪", cat: "long", model: "assets/models/v3/ak74n.glb", mag: 30, rpm: 640, fire: "auto", damage: 27.2, range: 290, adsFov: 52, bloom: 0.15, rc: 1.10, reloadT: 2.45, reloadE: 3.05, scaleLen: 0.46, oal: 0.940 },
        { slug: "m16a1", name: "M16A1 步枪", cat: "long", model: "assets/models/v3/m16a1.glb", mag: 30, rpm: 800, fire: "auto", damage: 25.4, range: 270, adsFov: 52, bloom: 0.14, rc: 1.05, reloadT: 2.10, reloadE: 2.75, scaleLen: 0.47, oal: 1.006 },
        { slug: "m16a4", name: "M16A4 步枪", cat: "long", model: "assets/models/v3/m16a4.glb", mag: 30, rpm: 300, fire: "semi", damage: 28, range: 300, adsFov: 52, bloom: 0.13, rc: 1, reloadT: 2.10, reloadE: 2.70, scaleLen: 0.47, oal: 0.986 },
        { slug: "mk12", name: "MK12 SPR 特等射手步枪", cat: "long", model: "assets/models/v3/mk12.glb", mag: 30, rpm: 290, fire: "semi", damage: 28.6, range: 330, adsFov: 52, bloom: 0.16, rc: 1.15, reloadT: 2.20, reloadE: 2.80, scaleLen: 0.47, oal: 1.000 },
        { slug: "m4a1", name: "M4A1 卡宾枪", cat: "long", model: "assets/models/v3/m4a1.glb", mag: 30, rpm: 780, fire: "auto", damage: 27.1, range: 250, adsFov: 52, bloom: 0.15, rc: 1.05, reloadT: 2.20, reloadE: 2.80, scaleLen: 0.40, oal: 0.840 },
        { slug: "mk18", name: "MK18 CQBR 近战卡宾枪", cat: "long", model: "assets/models/v3/mk18.glb", mag: 30, rpm: 950, fire: "auto", damage: 28, range: 180, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.10, reloadE: 2.70, scaleLen: 0.38, oal: 0.760 },
        { slug: "hk416", name: "HK416 卡宾枪", cat: "long", model: "assets/models/v3/hk416.glb", mag: 30, rpm: 850, fire: "auto", damage: 26.3, range: 250, adsFov: 52, bloom: 0.15, rc: 1.10, reloadT: 2.20, reloadE: 2.80, scaleLen: 0.40, oal: 0.886 },
        { slug: "hk416a5", name: "HK416A5 夜战型", cat: "long", model: "assets/models/v3/hk416a5.glb", mag: 30, rpm: 850, fire: "auto", damage: 26.6, range: 255, adsFov: 52, bloom: 0.16, rc: 1.15, reloadT: 2.25, reloadE: 2.85, scaleLen: 0.40, oal: 0.886 },
        { slug: "fal", name: "FAL 50.00 战斗步枪", cat: "long", model: "assets/models/v3/fal.glb", mag: 20, rpm: 700, fire: "auto", damage: 32.3, range: 320, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.46, oal: 1.090 },
        { slug: "galil", name: "Galil ARM 突击步枪", cat: "long", model: "assets/models/v3/galil.glb", mag: 35, rpm: 650, fire: "auto", damage: 32, range: 270, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.50, reloadE: 3.05, scaleLen: 0.43, oal: 0.979 },
        { slug: "honeybadger", name: "Honey Badger 消音步枪", cat: "long", model: "assets/models/v3/honeybadger.glb", mag: 30, rpm: 800, fire: "auto", damage: 23.7, range: 210, adsFov: 52, bloom: 0.15, rc: 1, reloadT: 2.20, reloadE: 2.80, scaleLen: 0.39, oal: 0.740 },
        { slug: "win94", name: "Winchester 1894 杠杆步枪", cat: "long", model: "assets/models/v3/win94.glb", mag: 7, rpm: 110, fire: "semi", damage: 30, range: 200, adsFov: 52, bloom: 0.16, rc: 1.20, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.48, oal: 0.978 },
        { slug: "aug", name: "Steyr AUG A1 突击步枪", cat: "long", model: "assets/models/v3/aug.glb", mag: 30, rpm: 680, fire: "auto", damage: 23.7, range: 290, adsFov: 52, bloom: 0.14, rc: 1, reloadT: 2.30, reloadE: 2.90, scaleLen: 0.44, oal: 0.790 },
        { slug: "auga2", name: "Steyr AUG A2 突击步枪", cat: "long", model: "assets/models/v3/auga2.glb", mag: 30, rpm: 680, fire: "auto", damage: 27.1, range: 285, adsFov: 52, bloom: 0.15, rc: 1.05, reloadT: 2.35, reloadE: 2.95, scaleLen: 0.44, oal: 0.790 },
        { slug: "aks74u", name: "AKS-74U 短突击步枪", cat: "long", model: "assets/models/v3/aks74u.glb", mag: 30, rpm: 735, fire: "auto", damage: 29.7, range: 180, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.20, reloadE: 2.80, scaleLen: 0.38, oal: 0.490 },
        { slug: "rfb", name: "Kel-Tec RFB 无托战斗步枪", cat: "long", model: "assets/models/v3/rfb.glb", mag: 20, rpm: 280, fire: "semi", damage: 32.7, range: 380, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.45, oal: 0.660 },
        { slug: "k31", name: "K31 直拉栓步枪", cat: "long", model: "assets/models/v3/k31.glb", mag: 6, rpm: 55, fire: "bolt", damage: 34, range: 380, adsFov: 52, bloom: 0.18, rc: 1.20, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.48, oal: 1.110 },
    /* ---- 精确射手 / DMR（主武器 · 7） ---- */
        { slug: "svd", name: "SVD 德拉贡诺夫狙击步枪", cat: "long", model: "assets/models/v3/svd.glb", mag: 10, rpm: 300, fire: "semi", damage: 33.5, range: 420, adsFov: 20, bloom: 0.18, rc: 1.30, reloadT: 2.55, reloadE: 3.15, scaleLen: 0.48, oal: 1.220 },
        { slug: "sr25", name: "Knight's SR-25 精确步枪", cat: "long", model: "assets/models/v3/sr25.glb", mag: 20, rpm: 300, fire: "semi", damage: 34, range: 410, adsFov: 22, bloom: 0.17, rc: 1.25, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.48, oal: 1.050 },
        { slug: "m110", name: "M110 SASS 精确步枪", cat: "long", model: "assets/models/v3/m110.glb", mag: 20, rpm: 300, fire: "semi", damage: 32.3, range: 400, adsFov: 22, bloom: 0.16, rc: 1.20, reloadT: 2.45, reloadE: 3.05, scaleLen: 0.47, oal: 1.029 },
        { slug: "mk11", name: "MK11 精确步枪（8× 光学）", cat: "long", model: "assets/models/v3/mk11.glb", mag: 20, rpm: 280, fire: "semi", damage: 34, range: 430, adsFov: 20, bloom: 0.18, rc: 1.30, reloadT: 2.55, reloadE: 3.15, scaleLen: 0.48, oal: 1.049 },
        { slug: "m110t", name: "M110 战术型（8× 光学）", cat: "long", model: "assets/models/v3/m110t.glb", mag: 20, rpm: 280, fire: "semi", damage: 33.6, range: 420, adsFov: 20, bloom: 0.17, rc: 1.25, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.47, oal: 1.029 },
        { slug: "sa58", name: "SA58 SPR 精确步枪", cat: "long", model: "assets/models/v3/sa58.glb", mag: 20, rpm: 280, fire: "semi", damage: 34, range: 400, adsFov: 20, bloom: 0.18, rc: 1.30, reloadT: 2.55, reloadE: 3.15, scaleLen: 0.46, oal: 1.010 },
        { slug: "tavor7", name: "IWI Tavor 7 无托精确步枪", cat: "long", model: "assets/models/v3/tavor7.glb", mag: 20, rpm: 280, fire: "semi", damage: 34, range: 360, adsFov: 22, bloom: 0.17, rc: 1.22, reloadT: 2.45, reloadE: 3.05, scaleLen: 0.45, oal: 0.663 },
    /* ---- 狙击 · 栓动（主武器 · 9） ---- */
        { slug: "trg42", name: "Sako TRG-42 栓动狙击", cat: "long", model: "assets/models/v3/trg42.glb", mag: 5, rpm: 45, fire: "bolt", damage: 120, range: 650, adsFov: 18, bloom: 0.38, rc: 2.05, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.58, oal: 1.199 },
        { slug: "mrad", name: "Barrett MRAD 栓动狙击", cat: "long", model: "assets/models/v3/mrad.glb", mag: 5, rpm: 50, fire: "bolt", damage: 108, range: 600, adsFov: 18, bloom: 0.36, rc: 1.85, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.56, oal: 1.189 },
        { slug: "m40a5", name: "M40A5 消音狙击步枪", cat: "long", model: "assets/models/v3/m40a5.glb", mag: 5, rpm: 52, fire: "bolt", damage: 98, range: 540, adsFov: 20, bloom: 0.33, rc: 1.65, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.53, oal: 1.130 },
        { slug: "tac50", name: "McMillan TAC-50 反器材狙击", cat: "long", model: "assets/models/v3/tac50.glb", mag: 5, rpm: 45, fire: "bolt", damage: 116, range: 620, adsFov: 18, bloom: 0.38, rc: 2, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.58, oal: 1.467 },
        { slug: "aw50", name: "AW50 反器材步枪（8× 光学）", cat: "long", model: "assets/models/v3/aw50.glb", mag: 5, rpm: 45, fire: "bolt", damage: 114, range: 630, adsFov: 18, bloom: 0.37, rc: 2, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.58, oal: 1.440 },
        { slug: "m95", name: "Barrett M95 无托反器材", cat: "long", model: "assets/models/v3/m95.glb", mag: 5, rpm: 45, fire: "bolt", damage: 118, range: 600, adsFov: 18, bloom: 0.37, rc: 2, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.56, oal: 1.153 },
        { slug: "kar98k", name: "Kar98k 栓动步枪", cat: "long", model: "assets/models/v3/kar98k.glb", mag: 5, rpm: 50, fire: "bolt", damage: 97.6, range: 430, adsFov: 20, bloom: 0.32, rc: 1.60, reloadT: 2.80, reloadE: 3.40, scaleLen: 0.52, oal: 1.110 },
        { slug: "mosin", name: "Mosin-Nagant PU 狙击步枪", cat: "long", model: "assets/models/v3/mosin.glb", mag: 5, rpm: 65, fire: "bolt", damage: 92, range: 480, adsFov: 22, bloom: 0.30, rc: 1.60, reloadT: 2.80, reloadE: 3.40, scaleLen: 0.53, oal: 1.230 },
        { slug: "k31zfk", name: "K31 狙击型（ZfK 4× 光学）", cat: "long", model: "assets/models/v3/k31zfk.glb", mag: 6, rpm: 50, fire: "bolt", damage: 99, range: 440, adsFov: 22, bloom: 0.30, rc: 1.60, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.52, oal: 1.110 },
    /* ---- 冲锋枪 / PDW（主武器 · 9） ---- */
        { slug: "augpara", name: "AUG A3 Para 冲锋枪", cat: "long", model: "assets/models/v3/augpara.glb", mag: 25, rpm: 780, fire: "auto", damage: 21.2, range: 140, adsFov: 52, bloom: 0.14, rc: 0.70, reloadT: 2, reloadE: 2.60, scaleLen: 0.34, oal: 0.665 },
        { slug: "mpx", name: "SIG MPX 冲锋枪", cat: "long", model: "assets/models/v3/mpx.glb", mag: 30, rpm: 850, fire: "auto", damage: 20, range: 165, adsFov: 52, bloom: 0.12, rc: 0.62, reloadT: 2.10, reloadE: 2.70, scaleLen: 0.36, oal: 0.673 },
        { slug: "mpxc", name: "SIG MPX 战术冲锋枪", cat: "long", model: "assets/models/v3/mpxc.glb", mag: 30, rpm: 900, fire: "auto", damage: 20.3, range: 170, adsFov: 52, bloom: 0.12, rc: 0.64, reloadT: 2.05, reloadE: 2.65, scaleLen: 0.33, oal: 0.673 },
        { slug: "m1a1", name: "Thompson M1A1 冲锋枪", cat: "long", model: "assets/models/v3/m1a1.glb", mag: 30, rpm: 725, fire: "auto", damage: 23.3, range: 160, adsFov: 52, bloom: 0.16, rc: 0.78, reloadT: 2.30, reloadE: 2.80, scaleLen: 0.38, oal: 0.810 },
        { slug: "ppsh41", name: "PPSh-41 冲锋枪", cat: "long", model: "assets/models/v3/ppsh41.glb", mag: 71, rpm: 1000, fire: "auto", damage: 15, range: 150, adsFov: 52, bloom: 0.16, rc: 0.72, reloadT: 2.30, reloadE: 2.80, scaleLen: 0.37, oal: 0.843 },
        { slug: "apc9sd", name: "B&T APC9 SD 消音冲锋枪", cat: "long", model: "assets/models/v3/apc9sd.glb", mag: 30, rpm: 900, fire: "auto", damage: 16, range: 150, adsFov: 52, bloom: 0.12, rc: 0.60, reloadT: 2, reloadE: 2.60, scaleLen: 0.33, oal: 0.610 },
        { slug: "rattler", name: "SIG MCX Rattler PDW", cat: "long", model: "assets/models/v3/rattler.glb", mag: 30, rpm: 800, fire: "auto", damage: 18.5, range: 130, adsFov: 52, bloom: 0.14, rc: 0.70, reloadT: 2, reloadE: 2.60, scaleLen: 0.30, oal: 0.570 },
        { slug: "rattlerf", name: "SIG MCX Rattler 战术型", cat: "long", model: "assets/models/v3/rattlerf.glb", mag: 30, rpm: 800, fire: "auto", damage: 18.8, range: 135, adsFov: 52, bloom: 0.14, rc: 0.72, reloadT: 2.05, reloadE: 2.65, scaleLen: 0.31, oal: 0.570 },
        { slug: "sten", name: "Sten Mk II 冲锋枪", cat: "long", model: "assets/models/v3/sten.glb", mag: 32, rpm: 550, fire: "auto", damage: 22.6, range: 145, adsFov: 52, bloom: 0.15, rc: 0.72, reloadT: 2.20, reloadE: 2.80, scaleLen: 0.36, oal: 0.762 },
    /* ---- 霰弹枪（主武器 · 9） ---- */
        { slug: "rem870", name: "雷明顿 M870 霰弹枪", cat: "long", model: "assets/models/v3/rem870.glb", mag: 6, rpm: 60, fire: "semi", damage: 95, range: 38, adsFov: 52, bloom: 0.20, rc: 1.45, reloadT: 2.80, reloadE: 3.50, scaleLen: 0.45, oal: 1.070 },
        { slug: "versamax", name: "雷明顿 Versa Max 战术霰弹枪", cat: "long", model: "assets/models/v3/versamax.glb", mag: 7, rpm: 110, fire: "semi", damage: 72, range: 45, adsFov: 52, bloom: 0.22, rc: 1.55, reloadT: 2.90, reloadE: 3.60, scaleLen: 0.45, oal: 1.105 },
        { slug: "saiga12", name: "Saiga-12 弹匣霰弹枪", cat: "long", model: "assets/models/v3/saiga12.glb", mag: 8, rpm: 120, fire: "semi", damage: 70, range: 42, adsFov: 52, bloom: 0.24, rc: 1.60, reloadT: 3, reloadE: 3.80, scaleLen: 0.45, oal: 1.145 },
        { slug: "vepr12", name: "Molot Vepr-12 战术霰弹枪", cat: "long", model: "assets/models/v3/vepr12.glb", mag: 8, rpm: 125, fire: "semi", damage: 71, range: 43, adsFov: 52, bloom: 0.24, rc: 1.65, reloadT: 3.10, reloadE: 3.90, scaleLen: 0.45, oal: 1.120 },
        { slug: "ksg", name: "Kel-Tec KSG 无托泵动霰弹枪", cat: "long", model: "assets/models/v3/ksg.glb", mag: 7, rpm: 70, fire: "semi", damage: 92, range: 40, adsFov: 52, bloom: 0.20, rc: 1.35, reloadT: 2.70, reloadE: 3.40, scaleLen: 0.45, oal: 0.663 },
        { slug: "ksgf", name: "Kel-Tec KSG 战术型（全息瞄）", cat: "long", model: "assets/models/v3/ksgf.glb", mag: 7, rpm: 72, fire: "semi", damage: 93, range: 41, adsFov: 52, bloom: 0.21, rc: 1.38, reloadT: 2.75, reloadE: 3.45, scaleLen: 0.45, oal: 0.663 },
        { slug: "citori", name: "Browning Citori 上下双管霰弹枪", cat: "long", model: "assets/models/v3/citori.glb", mag: 2, rpm: 50, fire: "semi", damage: 100, range: 44, adsFov: 52, bloom: 0.18, rc: 1.50, reloadT: 2.60, reloadE: 3.45, scaleLen: 0.45, oal: 1.156 },
        { slug: "stevens311", name: "Stevens 311 平双管霰弹枪", cat: "long", model: "assets/models/v3/stevens311.glb", mag: 2, rpm: 48, fire: "semi", damage: 99, range: 42, adsFov: 52, bloom: 0.18, rc: 1.50, reloadT: 2.60, reloadE: 3.45, scaleLen: 0.45, oal: 1.156 },
        { slug: "sawnoff", name: "截短双管霰弹枪", cat: "long", model: "assets/models/v3/sawnoff.glb", mag: 2, rpm: 75, fire: "semi", damage: 100, range: 35, adsFov: 52, bloom: 0.24, rc: 1.70, reloadT: 2.60, reloadE: 3.60, scaleLen: 0.32, oal: 0.500 },
];
