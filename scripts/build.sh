#!/usr/bin/env bash
# 构建：把 src/ 分片按 esbuild 打包顺序拼接为 dist/game.js
# 顺序不可调换——所有分片共享同一个 IIFE 作用域（含跨分片引用）。
# 用法：
#   bash scripts/build.sh        # 用格式化源码 src/game/*.js 构建（默认）
#   bash scripts/build.sh raw    # 用原压缩分片 src/game/raw/*.raw.js 构建（回退对照）
set -e
cd "$(dirname "$0")/.."

MODE="${1:-src}"
mkdir -p dist

if [ "$MODE" = "raw" ]; then
  GAME="src/game/raw/02-render.raw.js src/game/raw/03-textures.raw.js src/game/raw/03-props.raw.js src/game/raw/04-level.raw.js src/game/raw/05-backdrop.raw.js src/game/raw/06-sea.raw.js src/game/raw/07-player-fx.raw.js src/game/raw/08-weapons.raw.js src/game/raw/09-game-ui.raw.js"
  ENTRY="src/game/raw/99-entry.raw.js"
else
  GAME="src/game/02-render.js src/game/03-textures.js src/game/03-props.js src/game/04-level.js src/game/05-backdrop.js src/game/06-sea.js src/game/07-player-fx.js src/game/08b-gundata.js src/game/08c-sounddata.js src/game/08-weapons.js src/game/09-game-ui.js"
  ENTRY="src/game/99-entry.js"
fi

cat src/00-runtime-head.js src/vendor/three.min.js $GAME $ENTRY > dist/game.js

# 硬判据：产物存在且语法通过（不用管道，直看退出码）
node --check dist/game.js
test -f dist/game.js
echo "BUILD_OK mode=$MODE bytes=$(wc -c < dist/game.js)"
