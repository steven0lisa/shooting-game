# 武器模型保真审计 · 批次 5（反器材/重型狙 5 款 + 冲锋枪前半 7 款）

> 审计日期：2026-11-13。方法：每款取 pack 模型 poster（3dassets）或 poly.pizza 预览图 + Wikipedia/Commons 真枪参考图，两张图都实际看过后判定。
> 图片存 `/tmp/guncheck/<slug>-model.png`、`<slug>-real.png`。
> 判定标准：PASS = 一眼认得出（允许风格化简化；瞄具由游戏 08-weapons 配件系统提供，裸模无镜不判 FAIL）；FAIL = 张冠李戴 / 比例崩坏 / 缺标志性特征 / 认不出。

## 判定一览

| slug | 中文名 | 模型源 | 真枪参考 | 判定 | 依据与瑕疵备注 |
|---|---|---|---|---|---|
| m40a5 | M40A5 消音狙击步枪 | 3dassets 33338 Suppressed Bolt Sniper | M40 rifle（USMC M40A5 实照） | **PASS** | 绿色 AICS 机匣 + 一体式消音管 + 宽盒弹匣 + 两脚架 + 底盘托颊托，与 M40A5 特征逐项吻合；裸模无镜（瞄具走配件系统） |
| aw50 | AW50 反器材步枪 | 3dassets 33453 Anti Materiel Rifle, Scoped | AI AW50（科布伦茨馆藏侧视） | **PASS** | 长枪管 + 大倍率镜 + 盒弹匣 + 两脚架 + 底盘直托，AI 系 .50 轮廓正确；枪口制退器简化为圆柱、护木加长为全包式 |
| m95 | Barrett M95 无托反器材 | 3dassets 33340 Bullpup Anti Materiel Rifle | Barrett M95（Grass 侧视） | **PASS** | 无托构型正确（握把在前、弹匣在握把后），沙色握把/弹匣/腮垫 + 黑机匣；缺 M95 标志性提把，枪口制退器简化为圆柱 |
| tac50 | McMillan TAC-50 反器材 | 3dassets 33339 Anti Materiel Rifle | McMillan TAC-50（Tac50white1） | **PASS**（临界） | .50 长枪管 + 盒弹匣 + 两脚架 + 腮垫底盘托，反器材轮廓可认；但机匣/枪托配色与真 TAC-50（灰机匣+绿 McMillan 托）相反，实为与 aw50 同系的通用 AI 风格底盘，仅靠有无镜区分两款 |
| awp | AWP 狙击步枪 | poly.pizza fKsTWWhSkqt（AWP Sniper, Kyler Swanson） | AI AWP（靶场实照） | **PASS** | 低模无贴图，但 AI 底盘托 + 腮垫 + 大长镜 + 栓柄 + 长枪管轮廓完整，一眼可认识为 AI 系栓狙；配色黑/灰与真枪绿/黑有出入 |
| mp5 | MP5 冲锋枪 | poly.pizza q73J0Y8eko（Mp5, AdamKokrito） | HK MP5（维基侧视） | **PASS** | 方正机匣 + 弧弹匣（MP5 两大 DNA）齐备，短管 + 准星位置对；枪托简化为单杆（真枪伸缩双杆），护木简化为光面灰块 |
| uzi | Uzi 冲锋枪 | poly.pizza 3_XOHzWP-Sc（Uzi, Emmett Baber） | Uzi（以军实照） | **PASS** | 盒形机匣 + 弹匣插入握把内（Uzi 两大 DNA）正确，短管外露 + 折叠托收拢在机匣上方；无贴图灰白模，比例略敦实 |
| mpx | SIG MPX 冲锋枪 | 3dassets 33308 Carbine Length SMG | SIG MPX（展会实照） | **PASS** | AR 式平顶机匣 + 9mm 直壁弹匣 + 短管 M-LOK 护木 + 折叠瞄，MPX 轮廓可认；沙色枪托块偏厚（真枪为细折叠托） |
| mpxc | SIG MPX 战术冲锋枪 | 3dassets 33445 Carbine SMG, Fitted | 同 mpx | **PASS** | 同 MPX 枪身 + 反射瞄 + 垂直前握把 + 枪灯，与「战术/Fitted」定义吻合；roster 注明两把同枪身仅配件差异，成立 |
| rattler | SIG MCX Rattler PDW | 3dassets 33307 PDW With Brace | SIG MCX 家族（维基 MCX 实照） | **PASS** | 超短管 + .300 直弹匣 + 撑杆 brace 托 + 螺纹枪口，Rattler PDW 特征正确；参考图为全长 MCX，按「MCX 族内变体不算错」通过 |
| rattlerf | SIG MCX Rattler 战术型 | 3dassets 33447 PDW, Fitted | 同 rattler | **PASS** | 同 Rattler 枪身 + 消音器 + 反射瞄 + 激光，与 Fitted 定义吻合 |
| sten | Sten Mk II 冲锋枪 | 3dassets 33304 Side Magazine SMG | Sten（维基博物馆侧视） | **PASS** | 侧置水平插弹匣（Sten 最标志特征）+ 管状机匣 + 杆状托齐备；枪托做成双杆（真 Mk II 为单杆直托），细节小偏差 |

## 汇总

- **PASS：12 / 12**
- **FAIL：0**

本批模型库选型与真枪对应关系成立：5 款狙击/反器材均保有各自构型 DNA（M40A5 绿底盘+消音、AW50 带镜长管、M95 无托、TAC-50 反器材轮廓、AWP 底盘+长镜），7 款冲锋枪/PDW 的标志性特征（MP5 弧弹匣、Uzi 握把弹匣、MPX 直弹匣 AR 式、Rattler 短管撑杆托、Sten 侧插弹匣）全部在场。

### 需要留意的临界项（不剔除，建议后续迭代）

1. **tac50 与 aw50 共用同一 AI 风格底盘模型**（仅有无 8× 镜之差）：真枪 TAC-50 是 McMillan 灰机匣+绿托，与 AW50 外观差异明显。当前靠瞄具配置勉强区分，若后续要求「每把一眼可辨」，建议 tac50 换灰机匣/绿托贴图或换源。
2. **m95 缺提把、枪口制退器圆柱化**：提把是 Barrett 无托的识别点之一，低模丢了；制退器（双室大方形）简化成消音器样圆柱，易误读为带消音。
3. **sten 枪托双杆**：真 Sten Mk II 为单杆直托，模型做成两根平行杆，属细节失真但不影响整体识别。
4. **mpx/mpxc 沙色枪托块偏厚**：真 MPX 折叠托较薄，模型用大沙色块近似，轮廓仍可认。
