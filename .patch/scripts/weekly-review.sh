#!/usr/bin/env bash
# weekly-review.sh
# 週次レビュー。Patchが過去7日のレポートを読み、来週の方針を立てる。
#
# 使い方:
#   ./.patch/scripts/weekly-review.sh
#
# cron 例:
#   0 23 * * 0 cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/weekly-review.sh >> .patch/reports/cron.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DATE=$(date +%Y-%m-%d)
WEEK=$(date +%G-W%V)
TIME=$(date +%H:%M:%S)
REPORT_FILE=".patch/reports/$DATE.md"
mkdir -p "$(dirname "$REPORT_FILE")"

if [ ! -f "$REPORT_FILE" ]; then
  printf '# %s — Patch 日報\n\n' "$DATE" > "$REPORT_FILE"
fi

printf '\n## %s weekly-review 起動\n\n' "$TIME" >> "$REPORT_FILE"

if ! command -v claude >/dev/null 2>&1; then
  printf '- ❌ claude CLI が見つからない\n' >> "$REPORT_FILE"
  exit 1
fi

PROMPT=$(cat <<EOF
あなたは Patch（gear108 サイトの管理人格）として動く。
~/.claude/projects/-home-yamachan--claude/openclaw/SOUL.md を読め。

.patch/playbooks/weekly-review.md を読み、その手順に従って
過去7日（${DATE}までの直近7日）の運用を振り返り、
.patch/reports/weekly-${WEEK}.md を作成し、
articles.yml の優先順位を調整せよ。
EOF
)

claude --print --permission-mode acceptEdits "$PROMPT" 2>&1 | tee -a "$REPORT_FILE" || {
  printf '\n- ❌ claude 実行失敗（exit %s）\n' "$?" >> "$REPORT_FILE"
  exit 1
}

printf '\n- ✅ weekly-review 完了\n' >> "$REPORT_FILE"
