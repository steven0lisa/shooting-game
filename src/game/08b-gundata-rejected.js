/* 武器库审计（2026-11-13，notes/audit/）剔除的枪：模型与真枪相差很远（张冠李戴/泛型错配）。
   条目原样保留备查，本文件不进构建序列；模型文件在 assets/models/v3-backup/。 */
var GUNDATA_REJECTED = [
        { slug: "m17", name: "M17 执勤手枪", cat: "pistol", model: "assets/models/v3/m17.glb", mag: 17, rpm: 270, fire: "semi", damage: 38, range: 130, adsFov: 52, bloom: 0.25, rc: 1.10, reloadT: 1.95, reloadE: 2.55, scaleLen: 0.29, oal: 0.203 },
        ,
        { slug: "galil", name: "Galil ARM 突击步枪", cat: "long", model: "assets/models/v3/galil.glb", mag: 35, rpm: 650, fire: "auto", damage: 32, range: 270, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.50, reloadE: 3.05, scaleLen: 0.43, oal: 0.979 },
        ,
        { slug: "apc9sd", name: "B&T APC9 SD 消音冲锋枪", cat: "long", model: "assets/models/v3/apc9sd.glb", mag: 30, rpm: 900, fire: "auto", damage: 16, range: 150, adsFov: 52, bloom: 0.12, rc: 0.60, reloadT: 2, reloadE: 2.60, scaleLen: 0.33, oal: 0.610 },
        ,
        { slug: "augpara", name: "AUG A3 Para 冲锋枪", cat: "long", model: "assets/models/v3/augpara.glb", mag: 25, rpm: 780, fire: "auto", damage: 21.2, range: 140, adsFov: 52, bloom: 0.14, rc: 0.70, reloadT: 2, reloadE: 2.60, scaleLen: 0.34, oal: 0.665 },
        ,
        { slug: "sa58", name: "SA58 SPR 精确步枪", cat: "long", model: "assets/models/v3/sa58.glb", mag: 20, rpm: 280, fire: "semi", damage: 34, range: 400, adsFov: 20, bloom: 0.18, rc: 1.30, reloadT: 2.55, reloadE: 3.15, scaleLen: 0.46, oal: 1.010 },
        ,
        { slug: "fal", name: "FAL 50.00 战斗步枪", cat: "long", model: "assets/models/v3/fal.glb", mag: 20, rpm: 700, fire: "auto", damage: 32.3, range: 320, adsFov: 52, bloom: 0.18, rc: 1.30, reloadT: 2.50, reloadE: 3.10, scaleLen: 0.46, oal: 1.090 },
,
        { slug: "kar98k", name: "Kar98k 栓动步枪", cat: "long", model: "assets/models/v3/kar98k.glb", mag: 5, rpm: 50, fire: "bolt", damage: 97.6, range: 430, adsFov: 20, bloom: 0.32, rc: 1.60, reloadT: 2.80, reloadE: 3.40, scaleLen: 0.52, oal: 1.110 },
        ,
        { slug: "trg42", name: "Sako TRG-42 栓动狙击", cat: "long", model: "assets/models/v3/trg42.glb", mag: 5, rpm: 45, fire: "bolt", damage: 120, range: 650, adsFov: 18, bloom: 0.38, rc: 2.05, reloadT: 2.90, reloadE: 3.50, scaleLen: 0.58, oal: 1.199 },
        
];
