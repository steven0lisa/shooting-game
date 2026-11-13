# 武器模型保真审计汇总（2026-11-13）

> 方法：6 个并行执行体逐款比对「3D 模型渲染图 vs 真实枪支照片」（Wikipedia/Commons 实拍），
> 判定标准：张冠李戴 / 比例崩坏 / 缺标志性特征 = FAIL。逐款证据图在 /tmp/guncheck/，分批详报 batch1~6.md。

## 结论：73 款受检，PASS 65 / FAIL 8（+ pac9 程序化建模不参检）

## FAIL → 已移出游戏（模型在 assets/models/v3-backup/，注册表条目在 src/game/08b-gundata-rejected.js）

| slug | 名义 | 问题 |
|---|---|---|
| m17 | M17 执勤手枪 | 张冠李戴：实为 glock17 同模加配件（网格 md5 相同），缺 P320 全部特征 |
| galil | Galil ARM | 挂弹鼓（真枪无弹鼓型），缺提把/两脚架，读作 AK 弹鼓机枪 |
| apc9sd | B&T APC9 SD | 泛型消音 AR 模型，缺 APC9 侧折托/扁平机匣 |
| augpara | AUG A3 Para | 泛型无托模型，缺 AUG 一体壳体/前握把环 |
| sa58 | SA58 SPR | AR-10 壳子冒充 FAL 底盘（缺圆柱护木/导气箍/拉机柄） |
| fal | FAL 50.00 | 同 sa58 底盘（与批 3 判定冲突，经主会话目检实锤同为 AR-10 构型，从严同罚） |
| kar98k | Kar98k | 直拉机柄（应为下弯）+ 外露盒弹匣（应为内藏弹仓），与 K31/Mosin 共模板致辨识度丧失 |
| trg42 | Sako TRG-42 | 通用方块枪托，缺 TRG 深切角/可调托底/贴腮轨 |

## 保留的"弱 PASS"（认得出但有偏差，供后续迭代换模）

| slug | 偏差 |
|---|---|
| p365 | 套筒做成 Glock 平板式，只能认成"紧凑手枪" |
| mark4 | 细管上机匣/Luger 角握把简化，远看像加长 Glock |
| tac50 | 与 aw50 共用同系底盘，仅靠镜具区分（真 TAC-50 是 McMillan 托） |
| glock18 / glock18c | 枪管下多余方块凸起、18C 缺补偿口 |
| webley | 鸟头握把做成直板、缺枪绳环 |
| revolvers 4 款 | 共用方块战术化套件（简化） |

## 顺带发现

- Mega Weapon Pack 的精确射手/栓狙共用"黑色方机匣"骨架：AR-10 系（sr25/m110/m110t）天然吻合，非 AR 系（sa58/trg42）必然失真——换模优先级最高的线索。
- Glock 家族、AK74 族内变体大量共用网格（Loadout 手法），族内长相相近是设计使然。