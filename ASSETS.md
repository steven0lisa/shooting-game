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
