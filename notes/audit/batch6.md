# 武器模型保真审计·批次 6（冲锋枪后半 4 + 霰弹枪 9，共 13 款）

> 2026-11-13。方法：每款取 pack 模型图（`cdn.3dassets.dev/assets/<id>/v1/poster.webp`，stevens311 走 thumb 兜底）与真枪参考图（Wikipedia REST summary / Wikimedia Commons 搜索兜底）各一张，逐款看图比对。图档存 `/tmp/guncheck/<slug>-model.png`、`<slug>-real.png`。
> 判定标准：PASS=一眼认得出（允许简化；KSG 带瞄/不带瞄变体不算错）；FAIL=张冠李戴、比例崩坏、缺标志性特征、认不出。

## 判定一览

| # | slug | 中文名 | pack 模型 (id) | 真枪参考图 | 判定 | 依据 |
|---|---|---|---|---|---|---|
| 1 | `apc9sd` | B&T APC9 SD | Integrally Suppressed SMG (33302) | Wikipedia BT-36015.02.jpg | **FAIL** | 模型是 AR 布局：弹匣井前置+缓冲管固定托+圆形粗护木，一眼读成「带消音器的 AR-9 / Honey Badger」。真 APC9 标志性特征全缺：侧折骨架托、扁平机匣+侧置拉机柄、APC 系上机匣轮廓。张冠李戴。 |
| 2 | `augpara` | AUG A3 Para | Bullpup SMG (33305) | Wikipedia Steyr-AUG-A3-SF.webp | **FAIL** | 模型是通用无托（Tavor 风格）：管状护木+平顶轨+弹匣后置，但缺 AUG 的全部标志特征——一体聚合物壳体轮廓、前握把环（AUG 的辨识核心）、泪滴形枪托。认不出是 AUG。 |
| 3 | `ppsh41` | PPSh-41 | Drum Fed SMG (33309) | Wikipedia PPSh-41_from_soviet.jpg | PASS | 三大标志齐全：木质枪托+前护木、弹鼓、枪管散热套筒（枪口段带孔）。简化可接受，一眼认得出。 |
| 4 | `m1a1` | Thompson M1A1 | Classic Straight Magazine SMG (33306) | Wikipedia Campbell_Thompson.jpg | PASS | 木托+木竖前握把+直弹匣（M1A1 区别 M1928 弹鼓的关键）+枪管散热肋，全在。认得出。 |
| 5 | `rem870` | 雷明顿 M870 | Pump Shotgun (33311) | Commons Remington 870 Wingmaster | PASS | 木托泵动经典造型：泵动前托+下挂弹管+珠状准星+870 机匣轮廓，读成 870 Express 木托版无障碍。 |
| 6 | `versamax` | 雷明顿 Versa Max | Semi Automatic Shotgun (33310) | Commons Versa Max (Mohawk forend) | PASS | 黑色半自动战术霰弹枪：长肋条护木+手枪托+准星块，与 Versa Max Tactical 轮廓吻合（该枪本身无独占强特征，类别级相似成立）。 |
| 7 | `saiga12` | Saiga-12 | Magazine Fed Shotgun (33312) | Wikipedia Saiga_12_shotgun.jpg | PASS | AK 系布局全对：铆钉机匣+防尘盖肋条、弹匣前置（握把前）、聚合物托，典型的 Saiga-12 弹匣霰弹枪。 |
| 8 | `vepr12` | Molot Vepr-12 | Magazine Shotgun, Fitted (33451) | Wikipedia Vepr-12 ARMS&Hunting 2012 | PASS | RPK 强化机匣风格+弹匣前置，Fitted 配置（全息镜+枪灯+斜握把）= Vepr-12 战术型常见形态。吻合。 |
| 9 | `ksg` | Kel-Tec KSG | Bullpup Shotgun (33313) | Wikipedia Kel-tec_KSG1.jpg | PASS | 无托泵动布局：前泵动护木+枪管下双弹仓管+直线枪托，KSG 的短粗无托轮廓成立。 |
| 10 | `ksgf` | KSG 战术型（全息） | Bullpup Shotgun, Fitted (33446) | 同 ksg | PASS | 同枪身+全息瞄具，变体判同 ksg（带瞄/不带瞄不算错）。 |
| 11 | `citori` | Browning Citori | Over And Under Shotgun (33314) | Commons Bockdoppelflinte JB.jpg | PASS | 上下双管明确（膛口两孔垂直叠置）+折开式铰链+顶压杆+木托细前托，O/U 双管标志齐。 |
| 12 | `stevens311` | Stevens 311 平双管 | Side By Side Shotgun (33315) | Commons ShotgunAction.JPG（SxS 折开膛参考） | PASS | 平双管明确（两膛口水平并排）+折开式+双扳机区，平双管霰弹枪认得出。（注：Commons 无 Stevens 311 实拍，用通用 SxS 折开参考图，判定按类别特征。） |
| 13 | `sawnoff` | 截短双管 | Sawn Off Shotgun (33317) | Wikipedia Sawed-off_shotgun | PASS | 截短特征明确：超短双管+手枪握把无肩托+折开膛，短小比例对。 |

## 汇总

- **PASS 11 款**：ppsh41、m1a1、rem870、versamax、saiga12、vepr12、ksg、ksgf、citori、stevens311、sawnoff
- **FAIL 2 款**：
  - `apc9sd`（33302）——模型为 AR 弹匣前置+缓冲管托布局，与 APC9 侧折骨架托+APC 系机匣完全不符，一眼读成消音 AR-9。
  - `augpara`（33305）——通用无托造型，缺 AUG 一体壳体、前握把环等标志特征，更像 Tavor；认不出是 AUG Para。

## 备注

- 两条 FAIL 同属「pack 通用资产与指名真枪错配」：33302（Integrally Suppressed SMG）与 33305（Bullpup SMG）本就是泛型模型，装到 APC9 SD / AUG A3 Para 这两个外形极强的指名枪上即显失真。处理建议走剔除/换模型/改名任一路，由主会话定。
- 图源明细：模型图 13 张全部来自 cdn.3dassets.dev（poster.webp，stevens311 为 thumb.webp）；真枪图来自 Wikipedia REST API 与 Wikimedia Commons（rem870/versamax/citori/stevens311 四张 wiki 页面无主图，走 Commons 搜索兜底）。
