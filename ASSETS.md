# 外部素材署名清单

> 沙漠之鹰武器 2 引入的第三方素材。均为免费许可素材，按各自条款署名。

## 3D 模型

| 文件 | 作品 | 作者 | 来源 | 许可 |
|---|---|---|---|---|
| `assets/models/desert-eagle.glb` | Rigged Desert Eagle | PuKkBuMXDD | [poly.pizza/m/e9k4dwOzCX](https://poly.pizza/m/e9k4dwOzCX) | CC BY 3.0（需署名） |

- 游戏内用途：第一人称手枪视模（加载后程序化重着色为暗色枪金属 + 烘焙朝向/缩放，见 `src/game/08-weapons.js` `dgGlb`）。
- 许可全文：https://creativecommons.org/licenses/by/3.0/

## 音效（全部 CC0 1.0，来自 OpenGameArt）

| 文件 | 作品 | 作者 | 来源 | 许可 |
|---|---|---|---|---|
| `assets/audio/oga-22magnum.wav` | Gunshots | kurt（页面标注"无需署名"） | [opengameart.org/content/gunshots](https://opengameart.org/content/gunshots) | CC0 |
| `assets/audio/oga-22pistol.wav` | Gunshots | kurt（同上） | 同上 | CC0 |
| `assets/audio/oga-reload.wav` | Handgun reload sound effect | zer0_sol | [opengameart.org/content/handgun-reload-sound-effect](https://opengameart.org/content/handgun-reload-sound-effect) | CC0 |
| `assets/audio/gun_reload.1.ogg` / `gun_reload.2.ogg` | 2 Gun Reloads | StarNinjas | [opengameart.org/content/2-gun-reloads](https://opengameart.org/content/2-gun-reloads) | CC0 |
| `assets/audio/oga-reload-click.mp3` | Gun reload lock or click sound | pauliuw | [opengameart.org/content/gun-reload-lock-or-click-sound](https://opengameart.org/content/gun-reload-lock-or-click-sound) | CC0 |
| `assets/audio/oga-gunshot.mp3` | Gunshot sound effect | hingydunyas | [opengameart.org/content/gunshot-sound-effect](https://opengameart.org/content/gunshot-sound-effect) | CC0 |

- 游戏内映射（`08-weapons.js` `dgAudio` 注册进合成音频引擎 `Go`）：
  - `pistol_shot` = 22magnum（主）/ 22pistol（变体）
  - `pistol_magout` = gun_reload.1.ogg；`pistol_magin` = gun_reload.2.ogg
  - `pistol_bolt` / `pistol_dry` / `pistol_click` = reload-click
  - oga-reload.wav / oga-gunshot.mp3 为备用素材（未挂入播放表）

## 武器 2 扩展素材（AWP / MP5 / Uzi）

> AWP / MP5 / Uzi 三把新枪引入的第三方素材。模型均 CC-BY（**需署名**），音效均 CC0。

### 3D 模型（poly.pizza）

| 文件 | 作品 | 作者 | 来源 | 许可 |
|---|---|---|---|---|
| `assets/models/awp.glb` | AWP Sniper | Kyler Swanson | [poly.pizza/m/fKsTWWhSkqt](https://poly.pizza/m/fKsTWWhSkqt) | CC BY 3.0（**需署名**） |
| `assets/models/mp5.glb` | Mp5 | AdamKokrito（ArtStation: adamkokrito） | [poly.pizza/m/q73J0Y8eko](https://poly.pizza/m/q73J0Y8eko) | CC BY 3.0（**需署名**） |
| `assets/models/uzi.glb` | Uzi | Emmett "TawpShelf" Baber | [poly.pizza/m/3_XOHzWP-Sc](https://poly.pizza/m/3_XOHzWP-Sc) | CC BY 3.0（**需署名**） |

- 枪型核对（预览图）：AWP = 带瞄准镜 + 拉栓柄的栓动狙击枪；MP5 = MP5 轮廓（弧形弹匣、伸缩托、环形准星）；Uzi = Uzi 轮廓（盒式机匣、弹匣置于握把内）。
- 许可全文：https://creativecommons.org/licenses/by/3.0/

### 音效（全部 CC0 1.0，来自 Free Firearms SFX Library）

| 文件 | 作品 | 作者 | 来源 | 许可 |
|---|---|---|---|---|
| `assets/audio/awp_shot.wav` | Free Firearms SFX Library — Tikka T3（栓动 .30-06）近距枪声 `Prepared SFX/Tikka/W_29P.wav` | Ben Jaszczak | [仓库](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary) / [源文件](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary/blob/main/Prepared%20SFX/Tikka/W_29P.wav) | CC0 1.0 |
| `assets/audio/awp_bolt.wav` | 同库 — Tikka T3 拉栓全循环（full cycle loaded mag）`Master Tracks/Tikka/W_16.wav` | Ben Jaszczak | [源文件](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary/blob/main/Master%20Tracks/Tikka/W_16.wav) | CC0 1.0 |
| `assets/audio/mp5_shot.wav` | 同库 — Carl Gustav M45（9mm 冲锋枪）近距枪声 `Prepared SFX/Carl Gustav M45/G_31P.wav` | Ben Jaszczak | [源文件](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary/blob/main/Prepared%20SFX/Carl%20Gustav%20M45/G_31P.wav) | CC0 1.0 |
| `assets/audio/mp5_reload.wav` | 同库 — Carl Gustav M45 插入空弹匣 `Master Tracks/Carl Gustav M45_Swedish K/G_8.wav` | Ben Jaszczak | [源文件](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary/blob/main/Master%20Tracks/Carl%20Gustav%20M45_Swedish%20K/G_8.wav) | CC0 1.0 |
| `assets/audio/uzi_shot.wav` | 同库 — PPSh（冲锋枪）近距枪声 `Master Tracks/PPSh/P_30.wav` | Ben Jaszczak | [源文件](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary/blob/main/Master%20Tracks/PPSh/P_30.wav) | CC0 1.0 |
| `assets/audio/uzi_reload.wav` | 同库 — PPSh 插入空弹匣 `Master Tracks/PPSh/P_6.wav` | Ben Jaszczak | [源文件](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary/blob/main/Master%20Tracks/PPSh/P_6.wav) | CC0 1.0 |

- 仓库即 [Free Firearms SFX Library KickStarter（Ben Jaszczak）](https://www.kickstarter.com/projects/bjjaszcz/the-firearm-sound-library/description) 的镜像，`LICENSE` 为 CC0 1.0，原始录音以 Master Tracks（未处理干声）与 Prepared SFX（处理版）发布。
- 处理：六个文件仅做**首尾静音裁剪**（保留约 30 ms 头部余量），未改音高/时长/响度，源文件均可按上表 URL 取回。
- 游戏内按文件名注册（契约见 `notes/weapons-v2-spec.md` §6）：`awp_shot` / `awp_bolt` / `mp5_shot` / `mp5_reload` / `uzi_shot` / `uzi_reload`。

## 武器 3 扩展素材（v3 全量收录 60 把，2026-11-13）

| 类别 | 作品 | 作者/来源 | 许可 |
|---|---|---|---|
| 3D 模型 ×60（assets/models/v3/） | Mega Weapon Pack | 3dassets.dev/packs/mega-weapon-pack | **CC0 1.0**（manifest 明示 attributionRequired: false，无需署名） |
| 音效 ×167（assets/audio/v3/） | Free Firearms SFX Library | github.com/buddingmonkey/FreeFirearmsSFXLibrary（Ben Jaszczak/Kickstarter 镜像） | **CC0 1.0** |
| 机构声备选 | adatechnology-game-kit 音频 | github.com/Andersonfrfilho/adatechnology-game-kit | CC0 子集（CREDITOS.md 逐文件标注） |

- 武器数值参数参考（未含素材文件）：PF Gun List（gist DET171，无许可声明——仅取事实数值，文案全部重写）与 adatechnology-game-kit（MIT）物理参数。
- 逐枪明细见 notes/roster-built.md（模型/参数）与 notes/sound-built.md（音效/借音矩阵）。
