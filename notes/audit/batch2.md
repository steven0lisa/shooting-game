# 武器模型保真审计 · 批次 2（左轮 4 + AK/M16/M4 系 8）

> 审计日期：2026-11-13。方法：3dassets 模型海报图 vs Wikipedia 真枪图，两图均实际目视比对后判定。
> 图片存档：`/tmp/guncheck/<slug>-model.png`、`/tmp/guncheck/<slug>-real.png`。

## 判定表

| slug | 中文名 | 模型图来源 | 真枪图来源 | 判定 | 一句话理由 |
|---|---|---|---|---|---|
| python | Colt Python 左轮 | cdn.3dassets.dev/assets/33297/v1/poster.webp | en.wikipedia "Colt Python"（Colt-Python.jpg） | PASS | 长枪管+外露转轮+顶/底导轨的战术化简化，但 Python 的长管转轮轮廓一眼可辨 |
| sw686 | S&W 686 左轮 | assets/33295/v1/poster.webp | "Smith & Wesson Model 686"（Flickr S&W686 图） | PASS | 中等枪管+转轮结构齐全，与 686 比例相符；方块握把/导轨属套件级简化 |
| coltsaa | Colt SAA 单动左轮 | assets/33300/v1/poster.webp | "Colt Single Action Army"（1956prime2.jpg） | PASS | 长细枪管+木握把+转轮，西部单动轮廓成立；缺外露击锤、带战术导轨为简化 |
| sw642 | S&W 642 短管左轮 | assets/33298/v1/poster.webp | "Smith & Wesson Model 642"→重定向 Smith & Wesson Centennial（S&W642.jpg） | PASS | 极短枪管+紧凑转轮框架，snub 比例正确，可认出短管左轮 |
| ak47 | AK-47 突击步枪 | assets/33322/v1/poster.webp | "AK-47"（AK-47_type_II_noBG.png） | PASS | 木托+木护木+前低后高机匣+弧形弹匣+AK 准星座，AK-47 族特征齐；导气管散热孔简化为实心护木 |
| akms | AKMS 折叠托突击步枪 | assets/33323/v1/poster.webp | "AKM"（Armémuseum bothsides.png） | PASS | 金属丝折叠托+肩板与 AKMS 结构对应，弯弹匣/导气块齐全；沙色聚合物家具是配色偏差非形制错误 |
| ak74 | AK-74 突击步枪 | assets/33318/v1/poster.webp | "AK-74"（Ak74l.png） | PASS | 全黑聚合物家具+长枪管+小口径弧度弹匣，AK-74 后期型轮廓成立；标志性大圆柱消焰器简化为细枪口件 |
| ak74n | AK-74N 巡逻型 | assets/33439/v1/poster.webp | "AK-74"（同 ak74，族内差异不计错） | PASS | 在 AK-74 本体上加棱镜瞄具+前握把+枪灯，正是 74N 侧轨瞄具巡逻配置；枪族特征与 ak74 一致 |
| aks74u | AKS-74U 短突击步枪 | assets/33327/v1/poster.webp | "AKS-74U"（AKS74U_noBG.jpg） | PASS | 短枪管+折叠丝托+缩短护木，krinkov 紧凑比例成立；枪管略长于真 10.5in 但族特征完整 |
| m16a1 | M16A1 步枪 | assets/33329/v1/poster.webp | "M16 rifle"（M16A2_noBG.jpg，同族参考） | PASS | 提把（简化为顶置方盒）+三角护木肋条+直-微弧弹匣+固定托，M16 轮廓成立；机匣绿色为配色偏差 |
| m16a4 | M16A4 步枪 | assets/33320/v1/poster.webp | "M16 rifle"（同 m16a1，M16A2 图作族参考） | PASS | 平顶机匣无提把+全长皮卡汀尼护木+20in 长枪管+固定托，正是 A4 特征组合 |
| m4a1 | M4A1 卡宾枪 | assets/33316/v1/poster.webp | "M4 carbine"（PEO_M4_Carbine_RAS_M68.png） | PASS | 短枪管+可伸缩托+RAS 导轨护木+准星座，M4 卡宾比例成立；托简化为方块但轮廓正确 |

## 汇总

- **PASS：12 / 12**
- **FAIL：0**

### 备注（非剔除级偏差，供后续换模参考）

1. 四款左轮共用同一套「战术化方块机匣+导轨」套件模型：转轮与管长比例都对（Python 长 / 686 中 / SAA 长+木握把 / 642 短），但均缺真枪的圆润烤蓝轮廓，Python 的核下凸耳（full underlug）与 SAA 的外露击锤未表现。
2. ak47 护木做成实心圆锥（无散热孔/上下片分缝），导气管特征弱；ak74 标志性大圆柱消焰器被简化。
3. m16a1 机匣为橄榄绿（真枪黑色），提把做成竖直方盒——形制在、配色错。
4. m16a1/m16a4 真枪参考图为维基 M16 主条目 M16A2 图（A1/A4 无独立首图），按 M16 族比对；A4 的平顶+导轨特征与模型吻合，A1 的提把特征与模型吻合。
