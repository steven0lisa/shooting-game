# v3 音效资产构建清单（WP1b 产出）

> 构建日期 2026-11-13。来源 **FreeFirearmsSFXLibrary**（github.com/buddingmonkey/FreeFirearmsSFXLibrary，**CC0-1.0**，无需署名）。
> 产物：`assets/audio/v3/` 167 个 wav（39MB）+ 数据表 `src/game/08c-sounddata.js`（23 键 + fallback 六项）。
> 规格：44.1kHz / 16bit / 立体声（源为 96~192kHz/24bit，降采样+裁边转码，枪声截 1.2s、机构声按类截 0.9~4.5s）。
> 件件经 ffmpeg astats 实证：时长 >0.15s、峰值 >-40dB（裁边阈值 -46dB，真峰值余量 ≥12dB，无削波风险）。
>
> **语义标注纠错**：调研笔记（gun-sfx-params-survey.md 表 A）的 reload 列按编号区间猜错了几处——如 AK-47 的 C_0-2 实为拉滑机（pull slide）不是换弹。本表语义一律以 `Master Sheet.xlsx` 的 Description 原文为准。
> **左轮无弹匣**：sw642（S&W 642）/ rugersinglesix（Ruger Single Six）没有换弹匣类音效（枪械原理决定），reload 用甩弹巢开合/装退弹壳声替代。
> **下载通路**（排障记录）：raw.githubusercontent 直连 ~13KB/s 不可用；jsdelivr 对单文件 >20MB（Prepared 全部、多数 Master）拒 403；**gh-proxy.com + Range 前 6~12MB** 为最终方案（枪声瞬态都在文件前段）。

## 1. 逐枪套件表（23 把 FFSL 源枪）

| slug | 文件 | 时长 | 大小 | 版本 | 源路径（仓库内） | 语义（Master Sheet Description） |
|---|---|---|---|---|---|---|
| **ak47** | `ak47_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/AK-47/C_28P.wav` | AK-47, rifle, fully automatic, semi automatic, machine gun, assault rifle, 7.62x39, g |
|  | `ak47_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/AK-47/C_31P.wav` | AK-47, rifle, fully automatic, semi automatic, machine gun, assault rifle, 7.62x39, g |
|  | `ak47_reload.wav` | 0.31s | 53KB | Master | `Master Tracks/AK-47/C_11.wav` | detach empty mag |
|  | `ak47_reload_2.wav` | 0.23s | 39KB | Master | `Master Tracks/AK-47/C_10.wav` | insert empty mag |
|  | `ak47_reload_3.wav` | 3.62s | 623KB | Master | `Master Tracks/AK-47/C_15.wav` | load round into mag |
|  | `ak47_bolt.wav` | 1.21s | 208KB | Master | `Master Tracks/AK-47/C_0.wav` | pull slide no mag |
|  | `ak47_bolt_2.wav` | 0.82s | 141KB | Master | `Master Tracks/AK-47/C_1.wav` | release slide no mag |
|  | `ak47_dry.wav` | 0.15s | 26KB | Master | `Master Tracks/AK-47/C_7.wav` | dry fire |
| **ar15** | `ar15_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/AR-15/D_32P.wav` | AR-15, M4, rifle, carbine, semi automatic, assault rifle, .223, 5.56x45, gunshot, nea |
|  | `ar15_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/AR-15/D_24P.wav` | AR-15, M4, rifle, carbine, semi automatic, assault rifle, .223, 5.56x45, gunshot, mid |
|  | `ar15_reload.wav` | 4.5s | 775KB | Master | `Master Tracks/AR-15/D_3.wav` | detach empty mag |
|  | `ar15_reload_2.wav` | 0.68s | 116KB | Master | `Master Tracks/AR-15/D_4.wav` | insert loaded mag |
|  | `ar15_reload_3.wav` | 3.24s | 558KB | Master | `Master Tracks/AR-15/D_0.wav` | load mag |
|  | `ar15_bolt.wav` | 0.8s | 138KB | Master | `Master Tracks/AR-15/D_6.wav` | pull back bolt no mag |
|  | `ar15_bolt_2.wav` | 0.16s | 28KB | Master | `Master Tracks/AR-15/D_7.wav` | release bolt no mag |
|  | `ar15_dry.wav` | 0.15s | 26KB | Master | `Master Tracks/AR-15/D_16.wav` | dry fire |
| **arisaka** | `arisaka_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Arisaka/E_25P.wav` | Arisaka, rifle, bolt action, .30-06, gunshot, near distance, front of shooter, left, |
|  | `arisaka_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Arisaka/E_18P.wav` | Arisaka, rifle, bolt action, .30-06, gunshot, mid distance, front of shooter, forward |
|  | `arisaka_reload.wav` | 4.5s | 775KB | Master | `Master Tracks/Arisaka/E_0.wav` | load mag |
|  | `arisaka_bolt.wav` | 0.25s | 43KB | Master | `Master Tracks/Arisaka/E_5.wav` | bolt back loaded mag |
|  | `arisaka_bolt_2.wav` | 0.67s | 115KB | Master | `Master Tracks/Arisaka/E_7.wav` | bolt forward loaded mag |
|  | `arisaka_dry.wav` | 0.15s | 26KB | Master | `Master Tracks/Arisaka/E_9.wav` | dry fire |
| **bersa380** | `bersa380_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Bersa/F_47P.wav` | Bersa, handgun, pistol, semi automatic, .380, gunshot, near distance, front of shoote |
|  | `bersa380_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Bersa/F_41P.wav` | Bersa, handgun, pistol, semi automatic, .380, gunshot, gunshot, mid distance, front o |
|  | `bersa380_reload.wav` | 0.45s | 78KB | Master | `Master Tracks/Bersa/F_5.wav` | detach mag loaded |
|  | `bersa380_reload_2.wav` | 0.16s | 28KB | Master | `Master Tracks/Bersa/F_4.wav` | insert mag loaded |
|  | `bersa380_reload_3.wav` | 4.5s | 775KB | Master | `Master Tracks/Bersa/F_0.wav` | load rounds into mag |
|  | `bersa380_bolt.wav` | 0.17s | 28KB | Master | `Master Tracks/Bersa/F_6.wav` | pull slide to rear |
|  | `bersa380_bolt_2.wav` | 2.5s | 430KB | Master | `Master Tracks/Bersa/F_9.wav` | release slide |
|  | `bersa380_dry.wav` | 0.52s | 90KB | Master | `Master Tracks/Bersa/F_23.wav` | SA dry fire |
| **carlgustavm45** | `carlgustavm45_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Carl Gustav M45/G_31P.wav` | Carl Gustav M45, Swedish K, rifle, fully automatic, machine gun, sub machine gun, 9mm |
|  | `carlgustavm45_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Carl Gustav M45/G_20P.wav` | Carl Gustav M45, Swedish K, rifle, fully automatic, machine gun, sub machine gun, 9mm |
|  | `carlgustavm45_reload.wav` | 0.9s | 154KB | Master | `Master Tracks/Carl Gustav M45_Swedish K/G_9.wav` | detach empty mag |
|  | `carlgustavm45_reload_2.wav` | 1.65s | 285KB | Master | `Master Tracks/Carl Gustav M45_Swedish K/G_8.wav` | insert empty mag |
|  | `carlgustavm45_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/Carl Gustav M45_Swedish K/G_2.wav` | lock back bolt no mag |
|  | `carlgustavm45_dry.wav` | 0.9s | 155KB | Master | `Master Tracks/Carl Gustav M45_Swedish K/G_3.wav` | dry fire no mag |
| **charlesdaly** | `charlesdaly_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/CD/H_21P.wav` | Charles Daly, CD, FTAW, shotgun, pump action, 12 gauge, gunshot, near distance, front |
|  | `charlesdaly_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/CD/H_16P.wav` | Charles Daly, CD, FTAW, shotgun, pump action, 12 gauge, gunshot, mid distance, front |
|  | `charlesdaly_reload.wav` | 4.5s | 775KB | Master | `Master Tracks/Charles Daly/H_3.wav` | load mag |
|  | `charlesdaly_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/Charles Daly/H_4.wav` | open action loaded mag |
|  | `charlesdaly_bolt_2.wav` | 0.24s | 40KB | Master | `Master Tracks/Charles Daly/H_5.wav` | close action loaded mag |
|  | `charlesdaly_dry.wav` | 0.15s | 26KB | Master | `Master Tracks/Charles Daly/H_8.wav` | dry fire |
| **m1911** | `m1911_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/1911/A_42P.wav` | 1911, handgun, pistol, semi automatic, .45, gunshot, near distance, front of shooter, |
|  | `m1911_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/1911/A_34P.wav` | 1911, handgun, pistol, semi automatic, .45, gunshot, mid distance, front of shooter, |
|  | `m1911_reload.wav` | 0.36s | 62KB | Master | `Master Tracks/1911/A_5.wav` | detach loaded mag |
|  | `m1911_reload_2.wav` | 1.62s | 279KB | Master | `Master Tracks/1911/A_2.wav` | insert empty mag |
|  | `m1911_reload_3.wav` | 2.24s | 385KB | Master | `Master Tracks/1911/A_4.wav` | insert loaded mag |
|  | `m1911_bolt.wav` | 1.62s | 279KB | Master | `Master Tracks/1911/A_6.wav` | pull back slide |
|  | `m1911_bolt_2.wav` | 0.16s | 27KB | Master | `Master Tracks/1911/A_9.wav` | release slide |
|  | `m1911_dry.wav` | 0.17s | 29KB | Master | `Master Tracks/1911/A_19.wav` | dry fire |
| **marlin336** | `marlin336_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Marlin 336/I_22P.wav` | Marlin 336, rifle, carbine, lever action, .30-30, gunshot, near distance, front of sh |
|  | `marlin336_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Marlin 336/I_17P.wav` | Marlin 336, rifle, carbine, lever action, .30-30, gunshot, mid distance, front of sho |
|  | `marlin336_reload.wav` | 4.5s | 775KB | Master | `Master Tracks/Marlin 336/I_0.wav` | load mag |
|  | `marlin336_bolt.wav` | 0.79s | 136KB | Master | `Master Tracks/Marlin 336/I_2.wav` | lever down loaded mag |
|  | `marlin336_bolt_2.wav` | 0.62s | 107KB | Master | `Master Tracks/Marlin 336/I_4.wav` | lever up loaded mag |
|  | `marlin336_dry.wav` | 0.55s | 94KB | Master | `Master Tracks/Marlin 336/I_8.wav` | dry fire |
| **model12** | `model12_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Model 12/K_22P.wav` | Winchester, Model 12, shotgun, pump action, 12 gauge, gunshot, near distance, front o |
|  | `model12_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Model 12/K_17P.wav` | Winchester, Model 12, shotgun, pump action, 12 gauge, gunshot,  mid distance, front o |
|  | `model12_reload.wav` | 4.5s | 775KB | Master | `Master Tracks/Model 12/K_3.wav` | load mag |
|  | `model12_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/Model 12/K_4.wav` | open action loaded mag |
|  | `model12_bolt_2.wav` | 1.15s | 198KB | Master | `Master Tracks/Model 12/K_5.wav` | close action loaded mag |
|  | `model12_dry.wav` | 0.9s | 155KB | Master | `Master Tracks/Model 12/K_7.wav` | dry fire |
| **model1894** | `model1894_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Model 1894/L_23P.wav` | Winchester, Model 1894, rifle, lever action, .32 Winchester Special, gunshot, near di |
|  | `model1894_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Model 1894/L_17P.wav` | Winchester, Model 1894, rifle, lever action, .32 Winchester Special, gunshot, mid dis |
|  | `model1894_reload.wav` | 4.35s | 749KB | Master | `Master Tracks/Model 1894/L_0.wav` | load mag |
|  | `model1894_bolt.wav` | 2.13s | 367KB | Master | `Master Tracks/Model 1894/L_2.wav` | lever down loaded mag |
|  | `model1894_bolt_2.wav` | 2.5s | 430KB | Master | `Master Tracks/Model 1894/L_4.wav` | lever up loaded mag |
|  | `model1894_dry.wav` | 0.58s | 100KB | Master | `Master Tracks/Model 1894/L_9.wav` | dry fire |
| **mosinnagant** | `mosinnagant_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Mosin Nagant/M_21P.wav` | Mosin Nagant, rifle, bolt action, 7.62x54, gunshot, near distance, front of shooter, |
|  | `mosinnagant_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Mosin Nagant/M_26P.wav` | Mosin Nagant, rifle, bolt action, 7.62x54, gunshot, mid distance, front of shooter, f |
|  | `mosinnagant_reload.wav` | 3.51s | 604KB | Master | `Master Tracks/Mosin Nagant/M_1.wav` | load mag |
|  | `mosinnagant_bolt.wav` | 1.11s | 190KB | Master | `Master Tracks/Mosin Nagant/M_4.wav` | bolt back loaded mag |
|  | `mosinnagant_bolt_2.wav` | 1.05s | 180KB | Master | `Master Tracks/Mosin Nagant/M_6.wav` | bolt forward loaded mag |
|  | `mosinnagant_dry.wav` | 0.52s | 90KB | Master | `Master Tracks/Mosin Nagant/M_10.wav` | dry fire |
| **mossberg** | `mossberg_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Mossberg/N_30P.wav` | Mossberg, Model 190, shotgun, bolt action, 12 gauge, gunshot, near distance, front of |
|  | `mossberg_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Mossberg/N_26P.wav` | Mossberg, Model 190, shotgun, bolt action, 12 gauge, gunshot, mid distance, front of |
|  | `mossberg_reload.wav` | 4.5s | 775KB | Master | `Master Tracks/Mossberg/N_0.wav` | load mag |
|  | `mossberg_bolt.wav` | 0.71s | 122KB | Master | `Master Tracks/Mossberg/N_13.wav` | bolt back loaded mag |
|  | `mossberg_bolt_2.wav` | 0.27s | 46KB | Master | `Master Tracks/Mossberg/N_14.wav` | bolt forward loaded mag |
|  | `mossberg_dry.wav` | 0.9s | 155KB | Master | `Master Tracks/Mossberg/N_18.wav` | dry fire |
| **nova** | `nova_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Nova/O_21P.wav` | Benelli, Nova, shotgun, pump action, 12 gauge, gunshot, near distance, front of shoot |
|  | `nova_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Nova/O_17P.wav` | Benelli, Nova, shotgun, pump action, 12 gauge, gunshot, mid distance, front of shoote |
|  | `nova_reload.wav` | 0.7s | 121KB | Master | `Master Tracks/Nova/O_3.wav` | load mag |
|  | `nova_bolt.wav` | 0.97s | 166KB | Master | `Master Tracks/Nova/O_4.wav` | open action loaded mag |
|  | `nova_bolt_2.wav` | 0.29s | 50KB | Master | `Master Tracks/Nova/O_5.wav` | close action loaded mag |
|  | `nova_dry.wav` | 0.17s | 30KB | Master | `Master Tracks/Nova/O_8.wav` | dry fire |
| **ppsh41** | `ppsh41_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/PPSh/P_30P.wav` | PPSh, rifle, fully automatic, machine gun, sub machine gun, 7.62x25 Tokarev, gunshot, |
|  | `ppsh41_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/PPSh/P_16P.wav` | PPSh, rifle, fully automatic, machine gun, sub machine gun, 7.62x25 Tokarev, gunshot, |
|  | `ppsh41_reload.wav` | 0.57s | 98KB | Master | `Master Tracks/PPSh/P_7.wav` | detach empty mag |
|  | `ppsh41_reload_2.wav` | 2.42s | 416KB | Master | `Master Tracks/PPSh/P_6.wav` | insert empty mag |
|  | `ppsh41_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/PPSh/P_8.wav` | lock back bolt empty mag |
|  | `ppsh41_dry.wav` | 0.9s | 155KB | Master | `Master Tracks/PPSh/P_1.wav` | dry fire no mag |
| **ruger1022** | `ruger1022_shot.wav` | 1.2s | 206KB | Master | `Master Tracks/Ruger 10.22/Q_30.wav` | gunshot, near distance, front of shooter, left, right, stereo |
|  | `ruger1022_shot_2.wav` | 1.2s | 206KB | Master | `Master Tracks/Ruger 10.22/Q_21.wav` | gunshot, mid distance, front of shooter, forward, back, stereo |
|  | `ruger1022_reload.wav` | 0.41s | 71KB | Master | `Master Tracks/Ruger 10.22/Q_3.wav` | detach empty mag |
|  | `ruger1022_reload_2.wav` | 4.5s | 775KB | Master | `Master Tracks/Ruger 10.22/Q_2.wav` | insert empty mag |
|  | `ruger1022_bolt.wav` | 0.18s | 30KB | Master | `Master Tracks/Ruger 10.22/Q_4.wav` | pull back bolt no mag |
|  | `ruger1022_bolt_2.wav` | 0.16s | 27KB | Master | `Master Tracks/Ruger 10.22/Q_7.wav` | release bolt no mag |
|  | `ruger1022_dry.wav` | 0.52s | 90KB | Master | `Master Tracks/Ruger 10.22/Q_13.wav` | dry fire |
| **rugermarkiii** | `rugermarkiii_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Ruger Mark III/R_35P.wav` | Ruger Mark III, handgun, pistol, semi automatic, .22, gunshot, near distance, front o |
|  | `rugermarkiii_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Ruger Mark III/R_30P.wav` | Ruger Mark III, handgun, pistol, semi automatic, .22, gunshot, mid distance, front of |
|  | `rugermarkiii_reload.wav` | 2.17s | 373KB | Master | `Master Tracks/Ruger Mark III/R_4.wav` | detach mag |
|  | `rugermarkiii_reload_2.wav` | 0.22s | 37KB | Master | `Master Tracks/Ruger Mark III/R_3.wav` | insert mag |
|  | `rugermarkiii_reload_3.wav` | 1.65s | 283KB | Master | `Master Tracks/Ruger Mark III/R_2.wav` | load rounds into mag |
|  | `rugermarkiii_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/Ruger Mark III/R_7.wav` | pull slide to rear |
|  | `rugermarkiii_bolt_2.wav` | 0.21s | 36KB | Master | `Master Tracks/Ruger Mark III/R_10.wav` | release slide |
|  | `rugermarkiii_dry.wav` | 0.52s | 88KB | Master | `Master Tracks/Ruger Mark III/R_19.wav` | dry fire |
| **rugersinglesix** | `rugersinglesix_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Ruger Single Six/S_14P.wav` | Ruger Single Six, handgun, pistol, revolver, single action, .22, gunshot, near distan |
|  | `rugersinglesix_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Ruger Single Six/S_11P.wav` | Ruger Single Six, handgun, pistol, revolver, single action, .22, gunshot, mid distanc |
|  | `rugersinglesix_reload.wav` | 0.75s | 130KB | Master | `Master Tracks/Ruger Single Six/S_0.wav` | open loading gate |
|  | `rugersinglesix_reload_2.wav` | 4.5s | 775KB | Master | `Master Tracks/Ruger Single Six/S_2.wav` | insert shells/turn cylinder |
|  | `rugersinglesix_reload_3.wav` | 4.5s | 775KB | Master | `Master Tracks/Ruger Single Six/S_3.wav` | extract shells |
|  | `rugersinglesix_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/Ruger Single Six/S_6.wav` | 0-full cock |
|  | `rugersinglesix_dry.wav` | 0.9s | 155KB | Master | `Master Tracks/Ruger Single Six/S_8.wav` | fire on empty (dry fire) |
| **savage10** | `savage10_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Savage 10 .300 Blackout/T_27P.wav` | Savage Model 10, rifle, bolt action, .300 AAC Blackout, 7.62x35, gunshot, near distan |
|  | `savage10_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Savage 10 .300 Blackout/T_17P.wav` | Savage Model 10, rifle, bolt action, .300 AAC Blackout, 7.62x35, gunshot, mid distanc |
|  | `savage10_reload.wav` | 3.89s | 670KB | Master | `Master Tracks/Savage 10 .300 Blackout/T_0.wav` | load mag |
|  | `savage10_bolt.wav` | 0.72s | 124KB | Master | `Master Tracks/Savage 10 .300 Blackout/T_3.wav` | bolt back loaded mag |
|  | `savage10_bolt_2.wav` | 0.38s | 66KB | Master | `Master Tracks/Savage 10 .300 Blackout/T_5.wav` | bolt forward loaded mag |
|  | `savage10_dry.wav` | 0.9s | 155KB | Master | `Master Tracks/Savage 10 .300 Blackout/T_7.wav` | dry fire |
| **sks** | `sks_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/SKS/U_14P.wav` | Norinco SKS, rifle, carbine, semi automatic, 7.62x39, gunshot, near distance, front o |
|  | `sks_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/SKS/U_19P.wav` | Norinco SKS, rifle, carbine, semi automatic, 7.62x39, gunshot, mid distance, front of |
|  | `sks_reload.wav` | 0.39s | 66KB | Master | `Master Tracks/SKS/U_0.wav` | load mag |
|  | `sks_bolt.wav` | 0.41s | 70KB | Master | `Master Tracks/SKS/U_3.wav` | pull back slide loaded mag |
|  | `sks_bolt_2.wav` | 0.18s | 31KB | Master | `Master Tracks/SKS/U_4.wav` | release slide loaded mag |
|  | `sks_dry.wav` | 0.15s | 25KB | Master | `Master Tracks/SKS/U_6.wav` | dry fire |
| **springfield1917** | `springfield1917_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/1917/B_24P.wav` | Springfield 1917, rifle, bolt action, .30-06, gunshot, near distance, front of shoote |
|  | `springfield1917_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/1917/B_16P.wav` | Springfield 1917, rifle, bolt action, .30-06, gunshot, mid distance, front of shooter |
|  | `springfield1917_reload.wav` | 4.23s | 728KB | Master | `Master Tracks/1917/B_0.wav` | load mag |
|  | `springfield1917_bolt.wav` | 0.73s | 125KB | Master | `Master Tracks/1917/B_3.wav` | bolt back loaded mag |
|  | `springfield1917_bolt_2.wav` | 1.08s | 185KB | Master | `Master Tracks/1917/B_5.wav` | bolt forward loaded mag |
|  | `springfield1917_dry.wav` | 0.52s | 89KB | Master | `Master Tracks/1917/B_9.wav` | dry fire |
| **sw642** | `sw642_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Smith & Wesson 642/V_27P.wav` | Smith & Wesson 642, handgun, pistol, revolver, double action, .38 Special, gunshot, n |
|  | `sw642_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Smith & Wesson 642/V_22P.wav` | Smith & Wesson 642, handgun, pistol, revolver, double action, .38 Special, gunshot, m |
|  | `sw642_reload.wav` | 0.17s | 30KB | Master | `Master Tracks/Smith & Wesson 642/V_0.wav` | Open cylinder |
|  | `sw642_reload_2.wav` | 3.07s | 529KB | Master | `Master Tracks/Smith & Wesson 642/V_2.wav` | insert shells |
|  | `sw642_reload_3.wav` | 0.24s | 42KB | Master | `Master Tracks/Smith & Wesson 642/V_3.wav` | extract shells |
|  | `sw642_bolt.wav` | 0.38s | 65KB | Master | `Master Tracks/Smith & Wesson 642/V_4.wav` | spin cylinder |
|  | `sw642_dry.wav` | 0.51s | 88KB | Master | `Master Tracks/Smith & Wesson 642/V_5.wav` | complete dry fire |
| **tikka** | `tikka_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Tikka/W_29P.wav` | Tikka Model T3, rifle, bolt action, .30-06, gunshot, near distance, front of shooter, |
|  | `tikka_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Tikka/W_24P.wav` | Tikka Model T3, rifle, bolt action, .30-06, gunshot, mid distance, front of shooter, |
|  | `tikka_reload.wav` | 0.46s | 79KB | Master | `Master Tracks/Tikka/W_5.wav` | detach loaded mag |
|  | `tikka_reload_2.wav` | 0.35s | 59KB | Master | `Master Tracks/Tikka/W_4.wav` | insert loaded mag |
|  | `tikka_reload_3.wav` | 4.5s | 775KB | Master | `Master Tracks/Tikka/W_0.wav` | load mag |
|  | `tikka_bolt.wav` | 2.5s | 430KB | Master | `Master Tracks/Tikka/W_9.wav` | bolt back loaded mag |
|  | `tikka_bolt_2.wav` | 2.5s | 430KB | Master | `Master Tracks/Tikka/W_12.wav` | bolt forward loaded mag |
|  | `tikka_dry.wav` | 0.53s | 90KB | Master | `Master Tracks/Tikka/W_13.wav` | dry fire |
| **waltherppq** | `waltherppq_shot.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Walther PPQ/X_39P.wav` | Walther PPQ, handgun, pistol, semi automatic, striker, 9mm, gunshot, near distance, f |
|  | `waltherppq_shot_2.wav` | 1.2s | 206KB | Prepared | `Prepared SFX/Walther PPQ/X_31P.wav` | Walther PPQ, handgun, pistol, semi automatic, striker, 9mm, gunshot, mid distance, fr |
|  | `waltherppq_reload.wav` | 1.12s | 192KB | Master | `Master Tracks/Walther PPQ/X_3.wav` | Detach mag |
|  | `waltherppq_reload_2.wav` | 0.17s | 30KB | Master | `Master Tracks/Walther PPQ/X_2.wav` | Insert mag |
|  | `waltherppq_reload_3.wav` | 3.29s | 566KB | Master | `Master Tracks/Walther PPQ/X_0.wav` | Load mag |
|  | `waltherppq_bolt.wav` | 2.33s | 401KB | Master | `Master Tracks/Walther PPQ/X_6.wav` | Pull back slide |
|  | `waltherppq_bolt_2.wav` | 1.91s | 329KB | Master | `Master Tracks/Walther PPQ/X_9.wav` | Release slide |
|  | `waltherppq_dry.wav` | 0.53s | 91KB | Master | `Master Tracks/Walther PPQ/X_18.wav` | Dry fire from full trigger position |

## 2. 类共用回退（fallback，SOUNDDATA.fallback 六项 ×2 变体）

| slug | 文件 | 时长 | 大小 | 版本 | 源路径（仓库内） | 语义 |
|---|---|---|---|---|---|---|
| **fallback** | `fb_long_shot.wav` | 1.2s | 206KB | Master | `Master Tracks/AK-47/C_25.wav` | gunshot, near distance (7.62x39 AK-47 干声，步枪类回退) |
|  | `fb_long_shot_2.wav` | 1.2s | 206KB | Master | `Master Tracks/AR-15/D_31.wav` | gunshot, near distance (5.56 AR-15 干声) |
|  | `fb_pistol_shot.wav` | 1.2s | 206KB | Master | `Master Tracks/Walther PPQ/X_39.wav` | gunshot, near distance (9mm PPQ 干声) |
|  | `fb_pistol_shot_2.wav` | 1.2s | 206KB | Master | `Master Tracks/1911/A_41.wav` | gunshot, near distance (.45 1911 干声) |
|  | `fb_smg_shot.wav` | 1.2s | 206KB | Master | `Master Tracks/Carl Gustav M45_Swedish K/G_25.wav` | gunshot, near distance (9mm Swedish K 干声) |
|  | `fb_smg_shot_2.wav` | 1.2s | 206KB | Master | `Master Tracks/PPSh/P_24.wav` | gunshot, near distance (7.62x25 PPSh 干声) |
|  | `fb_sniper_shot.wav` | 1.2s | 206KB | Master | `Master Tracks/Mosin Nagant/M_24.wav` | gunshot, mid distance (7.62x54R Mosin 干声) |
|  | `fb_sniper_shot_2.wav` | 1.2s | 206KB | Master | `Master Tracks/Mosin Nagant/M_21.wav` | gunshot, near distance (7.62x54R Mosin 干声) |
|  | `fb_reload.wav` | 1.12s | 192KB | Master | `Master Tracks/Walther PPQ/X_3.wav` | detach mag（通用换弹） |
|  | `fb_reload_2.wav` | 0.31s | 53KB | Master | `Master Tracks/AK-47/C_11.wav` | detach empty mag（通用换弹） |
|  | `fb_bolt.wav` | 1.11s | 190KB | Master | `Master Tracks/Mosin Nagant/M_4.wav` | bolt back loaded mag（通用拉栓） |
|  | `fb_bolt_2.wav` | 1.62s | 279KB | Master | `Master Tracks/1911/A_6.wav` | pull back slide（通用上膛） |

## 3. 借音说明（64 把收录枪怎么映射到本表）

SOUNDDATA 只有 **23 个逐枪键**（上表）——即 FFSL 有同枪套件的源枪。运行时查表顺序（spec §1/§7）：**同枪 slug → 同口径借音 → 类共用回退**。WP1a 的 GUNDATA slug 若不在本表 23 键内，按下列矩阵借；借不到的走 fallback 六项。

| 收录枪族（GUNDATA slug 例） | 同枪音 | 同口径借音 | 兜底 |
|---|---|---|---|
| ak47 / m1911 / sks / ppsh41 / mosinnagant / ar15(M4 系) / savage10(honeybadger) | 自带（7 把全链路） | — | — |
| 其余 5.56 步枪（hk416/scar_l/aug/g36/famas/l85/tar21/m16…） | — | `ar15` 件 | fallback long |
| 7.62x39 步枪（akm/ak103/groza/rpk） | — | `ak47` 件 | fallback long |
| 5.45 步枪（ak74/ak12/krinkov/aks74u） | — | `ak47`（微降 pitch）或 `ar15` | fallback long |
| 9mm 手枪（g17/m9/p226/cz75/usp/glock19…） | — | `waltherppq` 件 | fallback pistol |
| .45 手枪（m45a1/g21 亦可）/ .380（bersa 已收录） | — | `m1911`（.45）、`bersa380` | fallback pistol |
| .22 手枪（zip22） | — | `rugermarkiii` 件 | fallback pistol |
| 消音 .22（无套件枪） | — | `rugermarkiii`/`ruger1022` | fallback pistol |
| 9mm 冲锋枪（mp5/uzi/mp5k/scorpion_evo…） | — | `carlgustavm45` 件（连发感好） | fallback smg |
| .45 冲锋枪（ump45/mac10/tommy/krisstic…） | — | `m1911` shot + `carlgustavm45` burst 感 | fallback smg |
| 7.62x25（ppsh41 已收录）/ 5.7（p90/five-seven） | ppsh41 | 5.7 → `ppsh41` 高频段 | fallback smg |
| 栓动/狙击 .308/.30-06（rem700/aws/m24/sg44…） | tikka/savage10 | `tikka`（.30-06）或 `mosinnagant` | fallback sniper |
| 7.62x54R 半自动（svd/obrez） | — | `mosinnagant` 件（半自动节奏） | fallback sniper |
| 杠杆（win1894/marlin 已收录；henry4570） | — | `model1894`/`marlin336` 件 | fallback long |
| 霰弹（rem870/ksg/spas12…，若收录） | model12/nova/mossberg/charlesdaly | 泵动互借 | — |
| 左轮（mp412/1858/redhawk…） | sw642/singlesix | `sw642`（双动）/`rugersinglesix`（单动） | fallback pistol |

既有 5 把（pac9/deagle/awp/mp5/uzi）继续用 `assets/audio/` 根目录 v2 音频，不查本表（spec §1「以既有实现为准」）。

## 4. 处理与验证记录

- **下载**：Prepared 成品用 jsdelivr 全文件；>20MB 的 Master 与 Prepared 用 `gh-proxy.com` + `Range: 0-6000000`（枪声瞬态在前段，机构声在 7s 内）。共 155+12 件。
- **转码**：`silenceremove`(±-46dB, 前后各留 50/80ms) 去源文件大段静音 → `-t` 按类截断（shot 1.2s / dry 0.9s / bolt 2.5s / reload 4.5s）→ 44.1kHz/16bit 立体声。
- **废片处置**（astats 不合格 → 处理）：
  1. `tikka_dry`、`waltherppq_dry`、`sks_dry`、`ak47_dry`、`arisaka_dry`、`charlesdaly_dry`、`model12_dry`、`nova_dry` 等 dry 件首轮裁后 <0.15s（干火就是极短瞬态）——放宽到 -55dB/前后留 0.25s 重裁（复用已下载 raw，未重下载），全部过 0.5s；
  2. `bersa380_reload`、`rugersinglesix_reload`、`sw642_reload_3`、`tikka_reload`、`waltherppq_reload`、`fb_reload` 同类重裁通过；
  3. `fb_sniper_shot`（Mosin M_19）Range 6MB 窗口没盖到枪声瞬态、裁后只剩 0.15s——**换源 M_24（mid distance 近干声）**，0.41→1.2s 正常；`fb_sniper_shot_2` 同文件窗口不足换 M_21；`ruger1022_shot_2`（Q_21 192k 干声）6MB 窗口截 0.3s——窗口放宽 12MB 后恢复 1.2s；
  4. 调研笔记预警的「近乎无声废片」本轮未遇到（所有件峰值 -0.001~-34dB）；
  5. 备用替换件（sw642 V_5→tikka_dry、Ruger10/22 Q_4→sks_bolt、SingleSix S_2 / S&W V_18→sw642_reload）已下载验证合格，未启用，留 `/tmp/wp1b/trim/alt*`。
- **验证**：167/167 `ffprobe` 解码通过 + `ffmpeg astats` 峰值/时长达标；`node --check src/game/08c-sounddata.js` 通过。
- **左轮说明**：sw642/rugersinglesix 的 reload 是「开/合弹巢 + 装退弹壳」的分段动作声，无弹匣插拔音——这是枪械原理，非库缺陷（survey §附-7）。
