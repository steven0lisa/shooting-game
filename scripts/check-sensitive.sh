#!/usr/bin/env bash
# 敏感信息扫描（通用凭据/隐私类）——提交/推送前与 CI 发版前必跑。
# 公司专属禁词清单不入仓（见全局规范）：本地开发机存在
# ~/.zcode/secrets/sensitive-local-patterns.txt 时自动合并扫描。
# 用法：bash scripts/check-sensitive.sh [扫描根，默认 = git 跟踪文件]
set -e
cd "$(dirname "$0")/.."

LOCAL_LIST="$HOME/.zcode/secrets/sensitive-local-patterns.txt"

# 通用清单（凭据 / 本机路径 / 个人联系方式 / webhook），仅用 ERE
GEN_PATTERNS='sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}|BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY|hooks\.slack\.com|discord(app)?\.com/api/webhooks|qyapi\.weixin\.qq\.com|/Users/[A-Za-z0-9._-]+|/home/[A-Za-z0-9._-]+|C:\\\\Users|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'

FILES=$(git ls-files | grep -v -E '^(assets/|refers/)' || true)

# 匹配结果过滤：GitHub noreply 邮箱是安全身份形式，放行
filter_safe() {
  grep -v -E 'users\.noreply\.github\.com' || true
}

FAIL=0
scan() {
  local pat="$1" label="$2"
  local hits
  hits=$(grep -nE "$pat" $FILES 2>/dev/null | filter_safe | head -20)
  if [ -n "$hits" ]; then
    echo "[FAIL] $label"
    echo "$hits" | sed 's/^/    /'
    FAIL=1
  else
    echo "[ok]   $label"
  fi
}

echo "== 通用清单 =="
scan "$GEN_PATTERNS" "凭据/本机路径/邮箱/webhook"

if [ -f "$LOCAL_LIST" ]; then
  echo "== 本地禁词清单（$LOCAL_LIST）=="
  while IFS= read -r pat; do
    case "$pat" in ''|'#'*) continue ;; esac
    scan "$pat" "$pat"
  done < "$LOCAL_LIST"
else
  echo "[skip] 本地禁词清单不存在（仅 CI/他机场景）"
fi

# 提交历史扫描（含作者/提交者/提交信息/补丁文本）
echo "== git 历史 =="
HIST=$(git log --format='%an <%ae> %cn <%ce> %s' -p | grep -nE "$GEN_PATTERNS" | filter_safe | head -10)
if [ -n "$HIST" ]; then
  echo "[FAIL] 历史含敏感串"
  echo "$HIST" | sed 's/^/    /'
  FAIL=1
else
  echo "[ok]   历史干净"
fi

if [ "$FAIL" = 0 ]; then
  echo "SCAN_CLEAN"
else
  echo "SCAN_DIRTY"
  exit 1
fi
