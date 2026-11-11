# AGENTS.md — 项目结构与开发守则

> 本文件给后续 agent/开发者看：目录结构、模块地图、构建方式、修改守则。
> 游戏背景与重要发现见 [README.md](README.md)；逐模块深解析见 `notes/`。

## 目录结构

```
shooting-game/
├── index.html                 # 入口壳：canvas#view + #ui + #boot，引 css/ui.css 与 dist/game.js
├── css/
│   └── ui.css                 # 全部 UI/HUD 样式（从原文 <style> 原样抽出）
├── src/
│   ├── 00-runtime-head.js     # IIFE 开头（100B）：esbuild 助手 _M/br，勿动
│   ├── vendor/
│   │   └── three.min.js       # three.js r180 压缩版（713KB，MIT，vendored）
│   ├── game/                  # ★ 游戏源码（格式化产物 = 构建源，见下方模块表）
│   │   ├── raw/               # 原压缩分片（保真对照；build.sh raw 模式用）
│   │   ├── 02-render.js … 09-game-ui.js
│   │   └── 99-entry.js        # IIFE 尾（40B）：QC().catch(...)，启动调用
│   └── …
├── shaders/                   # 从包内抽出的 GLSL 22 个（只读参考，不进构建）
├── notes/                     # 逐模块解析笔记（9 份）——改代码前先读对应笔记
├── scripts/
│   └── build.sh               # 拼接构建：src → dist/game.js（src/raw 双模式）
├── dist/
│   └── game.js                # 构建产物（勿手改）
└── refers/
    └── 几猫国产3A大作_V1.html   # 原始单文件（只读，拆分来源）
```

## 模块地图（按构建顺序，顺序不可调换）

所有分片共享**同一个 IIFE 作用域**（跨分片直接引用彼此的短名标识符），构建=按固定顺序拼接。

| # | 文件 | esbuild 命名空间（导出） | 实际职责 | 笔记 |
|---|---|---|---|---|
| — | 00-runtime-head.js | — | IIFE 开头、esbuild 导出助手 | — |
| — | vendor/three.min.js | `lt`（422 导出） | three.js r180 | notes/00-three.md |
| 02 | 02-render.js | `Vg` (create: Hg, showcase: sA) | 渲染管线：天空/软阴影补丁/14-pass 后处理/动态分辨率/质量档/PMREM 环境 | notes/02-render.md |
| 03 | 03-textures.js | `qg` (applyPatch: h3, create: Gg, showcase: wA) | 程序化纹理 MRT 烘焙、48 条材质、36 条中文标牌、applyPatch 材质补丁 | notes/03-textures.md（含 03-props） |
| 03b | 03-props.js | `$g` (PROP_SIZES, create: Yg, register: _i, showcase: AA) | 36 种道具 builder（集装箱/叉车/货架…） | 同上 |
| 04 | 04-level.js | `cv` (create: C1, showcase: mR) | 关卡装配：zones/中继/出生点/掩体/碰撞/撤离点/合批/标签图集 | notes/04-level.md |
| 05 | 05-backdrop.js | `mv` (create: pv, showcase: MR) | 背景：岸桥吊机/货轮/小艇/天际线/海鸥顶点动画/几何工具箱（⚠️ 原命名 materials，实为 backdrop） | notes/05-backdrop.md |
| 06 | 06-sea.js | `vv` (create: O1, showcase: BR) | 海面 Gerstner 波/平面反射/湿地 apron/雨系统（室内剔除）/thunder 事件 | notes/06-sea.md |
| 07 | 07-player-fx.js | `Sv` (create: Cf, showcase: JR) | 输入三重降级/玩家控制器/战斗判定/粒子 FX 池/弹壳物理/WebAudio 合成引擎（⚠️ 名字只覆盖一半） | notes/07-player-fx.md |
| 08 | 08-weapons.js | `Xv` (create: dm, showcase: PC) | 武器视模（几猫九式步枪+HX-2 瞄具）/手臂骨骼/铭牌/风化 | notes/08-weapons.md |
| 09 | 09-game-ui.js | `ex` (TUNE: Ui, create: Em, showcase: VC) | 游戏主控：状态机/任务目标/敌人 AI（hound/gull）/rig 骨骼/HUD/菜单/结算 + 启动器主循环 `QC` | notes/09-game-ui.md |
| — | 99-entry.js | — | IIFE 尾：`QC().catch(...)` 启动调用 | — |

模块内还保留双入口约定：`create()` 供游戏启动，`showcase()` 是原生成管线的截图验收场景（`?bshow=` / `?shot` / `window.__setShot`）。

## 构建与运行

```bash
bash scripts/build.sh        # 默认：用格式化源码 src/game/*.js 构建
bash scripts/build.sh raw    # 对照：用原压缩分片构建（排障时比对行为）
python3 -m http.server 8931  # 静态服务后打开 index.html
```

- 构建 = `cat` 拼接（head → three → 02…09 → entry），无打包器、无 npm 依赖。
- 硬判据在脚本内：`node --check dist/game.js` + `test -f`。
- 启动约 10~20 s（程序化烘焙全部资产），boot 屏有进度条。

## 修改守则

1. **顺序敏感**：拼接顺序就是原 esbuild 依赖顺序，分片间存在跨文件短名引用（如 03 的死代码引用 04 的 `oi`、09 启动 07 的四个工厂）。不要调换顺序、不要把某片改成独立 `<script>` 标签加载。
2. **标识符是压缩短名**：改逻辑时沿用现有短名，不做全局重命名（跨分片引用会断）；语义看 `notes/` 对应笔记。
3. **格式化产物即源码**：`src/game/*.js`（非 raw）是日常修改对象；改动后跑 `node --check` + `bash scripts/build.sh` + 浏览器实测。`raw/` 只作保真对照，不再维护。
4. **dist/ 勿手改**，只由 build.sh 产出。
5. **shaders/ 是参考副本**：真正的 shader 在 JS 模板字符串里（尤其 02-render、03-textures、06-sea），改 shader 必须改 JS 内的源，再同步 `shaders/` 副本。
6. **css/ui.css 与 HUD DOM 结构耦合**在 09-game-ui（HUD 构建 `hM`）与 07-player-fx（触屏按钮 DOM），改 UI 需三方对齐。
7. 语法/行为验证链：`node --check` → `bash scripts/build.sh` → 浏览器实测关键交互（启动→菜单→开始行动→游玩）。仅构建通过不算完成。
8. 性能红线（原设计有意为之，别"优化"掉）：静态几何合批、标签图集、FX 池化、ORM 单图三用、海鸥顶点动画、动态分辨率。改这些先读对应 notes 的性能小节。

## notes/ 索引

| 文件 | 内容 |
|---|---|
| 00-three.md | three.js r180 版本判定依据、license、vendored 角色 |
| 02-render.md | 管线结构、14 pass 表、26 项 TUNE、质量/动态分辨率、软阴影补丁 |
| 03-textures.md | MRT 烘焙（albedo/ORM/height）、48 材质、36 标牌、applyPatch、$g 道具系统 |
| 04-level.md | 关卡骨架、中继布置、碰撞三规则、图集打包、合批分流 |
| 05-backdrop.md | 吊机/船/海鸥、blink/gull shader、风化顶点色、几何工具箱 |
| 06-sea.md | Gerstner 海面、平面反射、雨与室内剔除、puddle/wetness API |
| 07-player-fx.md | 键鼠/触屏映射、玩家控制器 API、FX 池、弹壳物理、音频引擎 |
| 08-weapons.md | 武器/瞄具、视模骨骼、动画状态、铭牌 |
| 09-game-ui.md | 状态机、任务目标、敌人 AI、rig 系统、HUD、TUNE 表、模块调用图 |
