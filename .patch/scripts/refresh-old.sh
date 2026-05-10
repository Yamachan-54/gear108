#!/usr/bin/env bash
# refresh-old.sh
# 古くなった記事を1本更新する。
#
# 使い方:
#   ./.patch/scripts/refresh-old.sh
#
# cron 例:
#   0 22 * * 0 cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/refresh-old.sh >> .patch/reports/cron.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)
REPORT_FILE=".patch/reports/$DATE.md"
mkdir -p "$(dirname "$REPORT_FILE")"

if [ ! -f "$REPORT_FILE" ]; then
  printf '# %s — Patch 日報\n\n' "$DATE" > "$REPORT_FILE"
fi

printf '\n## %s refresh-old 起動\n\n' "$TIME" >> "$REPORT_FILE"

if ! command -v claude >/dev/null 2>&1; then
  printf '- ❌ claude CLI が見つからない\n' >> "$REPORT_FILE"
  exit 1
fi

PROMPT=$(cat <<'EOF'
あなたは Patch（gear108 サイトの管理人格）として動く。
~/.claude/projects/-home-yamachan--claude/openclaw/patch/SOUL.md を読み、Patchの戒律を守れ。

.patch/playbooks/refresh-article.md を読み、その手順に従って
古くなった記事を1本更新せよ。

更新が不要なら「更新対象なし」と日報に記録して終了する。
EOF
)

claude --print --permission-mode acceptEdits "$PROMPT" 2>&1 | tee -a "$REPORT_FILE" || {
  printf '\n- ❌ claude 実行失敗（exit %s）\n' "$?" >> "$REPORT_FILE"
  exit 1
}

printf '\n- ✅ refresh-old 完了\n' >> "$REPORT_FILE"
