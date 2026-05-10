#!/usr/bin/env bash
# write-next.sh
# 次の記事を1本書く。Claude Code（patch ペルソナ）に write-article プレイブックを実行させる。
#
# 使い方:
#   ./.patch/scripts/write-next.sh
#
# cron 例:
#   0 21 * * 1-5 cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/write-next.sh >> .patch/reports/cron.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)
REPORT_DIR=".patch/reports"
REPORT_FILE="$REPORT_DIR/$DATE.md"
mkdir -p "$REPORT_DIR"

if [ ! -f "$REPORT_FILE" ]; then
  printf '# %s — Patch 日報\n\n' "$DATE" > "$REPORT_FILE"
fi

printf '\n## %s write-next 起動\n\n' "$TIME" >> "$REPORT_FILE"

# Claude Code がインストールされていることを前提とする。
# 環境変数 ANTHROPIC_API_KEY または OAuth login が済んでいること。
if ! command -v claude >/dev/null 2>&1; then
  printf '- ❌ claude CLI が見つからない。https://claude.com/claude-code を参照\n' >> "$REPORT_FILE"
  exit 1
fi

PROMPT=$(cat <<'EOF'
あなたは Patch（gear108 サイトの管理人格）として動く。
~/.claude/projects/-home-yamachan--claude/openclaw/patch/SOUL.md を読み、Patchの戒律を守れ。

次に .patch/playbooks/write-article.md を読み、その手順に厳密に従って次の記事を1本書ききれ。
人間の確認は要らない。完了まで自走せよ。

ただし以下は禁止：
- 検証していない情報を「確認済み」と書く
- 「簡単です」「100%」「誰でもすぐに」を使う
- 実機写真がない記事に heroImage フロントマターを設定する
- ビルドが通らないコミット

完了後、.patch/reports/ の今日の日報に作業ログを追記せよ。
EOF
)

# Claude Code を non-interactive で叩く
# --print: 結果を stdout に出して終了
# --dangerously-skip-permissions: スクリプト用。本番は --permission-mode acceptEdits 推奨
claude --print --permission-mode acceptEdits "$PROMPT" 2>&1 | tee -a "$REPORT_FILE" || {
  printf '\n- ❌ claude 実行失敗（exit %s）\n' "$?" >> "$REPORT_FILE"
  exit 1
}

printf '\n- ✅ write-next 完了\n' >> "$REPORT_FILE"
