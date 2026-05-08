#!/usr/bin/env bash
# health-check.sh
# サイト稼働の軽量チェック。AIなしで動く。
#
# 使い方:
#   ./.patch/scripts/health-check.sh
#
# cron 例:
#   0 * * * * cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/health-check.sh >> .patch/reports/health.log 2>&1
#
# GitHub Actions 推奨（無料 + ローカルマシン依存なし）。.github/workflows/health-check.yml 参照。
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# yq が無ければ簡易フォールバック（site.url を grep）
if command -v yq >/dev/null 2>&1; then
  SITE=$(yq '.site.url' .patch/config.yml | tr -d '"')
  ENDPOINTS=$(yq '.health_check.endpoints[]' .patch/config.yml | tr -d '"')
else
  SITE=$(grep -E '^\s*url:' .patch/config.yml | head -1 | sed 's/^[[:space:]]*url:[[:space:]]*//' | tr -d '"')
  ENDPOINTS=$(awk '/health_check:/,/^[a-z]/' .patch/config.yml | grep -E '^\s*-\s+/' | sed 's/^[[:space:]]*-[[:space:]]*//' | tr -d '"')
fi

if [ -z "$SITE" ]; then
  echo "[$(date -u +%FT%TZ)] FAIL: site.url が読めない" >&2
  exit 1
fi

DATE=$(date +%Y-%m-%d)
HEALTH_DIR=".patch/reports/health"
HEALTH_LOG="$HEALTH_DIR/$DATE.log"
mkdir -p "$HEALTH_DIR"

ERRORS=0
TS=$(date -u +%FT%TZ)

while IFS= read -r path; do
  [ -z "$path" ] && continue
  url="${SITE}${path}"
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
  echo "[$TS] $status $url" | tee -a "$HEALTH_LOG"
  if [ "$status" != "200" ]; then
    ERRORS=$((ERRORS + 1))
  fi
done <<< "$ENDPOINTS"

# TLS 証明書の残日数
host="${SITE#https://}"
host="${host%%/*}"
exp_raw=$(echo | openssl s_client -servername "$host" -connect "${host}:443" 2>/dev/null \
  | openssl x509 -noout -enddate 2>/dev/null \
  | sed 's/^notAfter=//')

if [ -n "$exp_raw" ]; then
  exp_epoch=$(date -d "$exp_raw" +%s 2>/dev/null || echo "0")
  now_epoch=$(date +%s)
  days_left=$(( (exp_epoch - now_epoch) / 86400 ))
  echo "[$TS] TLS expires in $days_left days ($exp_raw)" | tee -a "$HEALTH_LOG"
  if [ "$days_left" -lt 14 ]; then
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "[$TS] TLS check skipped (openssl unavailable)" | tee -a "$HEALTH_LOG"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "[$TS] HEALTH CHECK FAILED: $ERRORS errors" | tee -a "$HEALTH_LOG"
  exit 1
fi

echo "[$TS] HEALTH CHECK OK" | tee -a "$HEALTH_LOG"
