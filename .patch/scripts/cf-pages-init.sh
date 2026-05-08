#!/usr/bin/env bash
# cf-pages-init.sh
# Cloudflare Pages プロジェクトの初回作成 + 初回デプロイ。
#
# 前提:
#   - CLOUDFLARE_API_TOKEN が環境変数に設定されている
#     取得: https://dash.cloudflare.com/profile/api-tokens
#     必要な権限: Account:Cloudflare Pages:Edit
#   - npm run build が通る状態
#
# 使い方:
#   export CLOUDFLARE_API_TOKEN=xxxxx
#   ./.patch/scripts/cf-pages-init.sh
#
# 2回目以降のデプロイは git push origin main で自動（GitHub連携後）。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# 認証チェック: 環境変数 CLOUDFLARE_API_TOKEN または wrangler login のどちらかで認証済みであれば OK
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  if ! npx wrangler whoami >/dev/null 2>&1; then
    echo "ERROR: Cloudflare に未認証。以下のいずれかで認証してから再実行:"
    echo ""
    echo "  方法A（対話・推奨）: npx wrangler login"
    echo ""
    echo "  方法B（CI/cron用）: API トークンを設定"
    echo "    https://dash.cloudflare.com/profile/api-tokens"
    echo "    で 'Cloudflare Pages:Edit' トークンを作成"
    echo "    export CLOUDFLARE_API_TOKEN=<トークン>"
    echo ""
    exit 1
  fi
  echo "==> wrangler login 済みの認証情報を使用"
else
  echo "==> CLOUDFLARE_API_TOKEN を使用"
fi

PROJECT_NAME="gear108"

echo "==> npm run build"
npm run build

echo "==> Cloudflare Pages にプロジェクトを作成（既存ならスキップ）"
npx wrangler pages project create "$PROJECT_NAME" \
  --production-branch=main \
  --compatibility-date="$(date +%Y-%m-%d)" 2>&1 || \
  echo "  （既存の可能性あり、続行）"

echo "==> 初回デプロイ"
npx wrangler pages deploy dist --project-name="$PROJECT_NAME" --branch=main

echo ""
echo "==> 完了。本番URL:"
echo "    https://${PROJECT_NAME}.pages.dev"
echo ""
echo "次に GitHub と Pages を連携する場合は手動で:"
echo "  https://dash.cloudflare.com/?to=/:account/pages/new"
echo "  → Connect to Git → Yamachan-54/gear108 を選択"
echo "  → Framework: Astro / Build cmd: npm run build / Output: dist"
