# Playbook: health-check

> 1時間ごとにサイトの稼働状況を確認する軽量プレイブック。
> AI を使わない実装も可能（GitHub Actions 推奨）。AI 経由でも実行可能。

## 入力

- `.patch/config.yml`（site.url、health_check.endpoints、fail_threshold）
- `.patch/reports/health/YYYY-MM-DD.log`（過去の失敗回数を読む）

## チェック項目

| 項目 | 期待値 | 失敗時 |
|------|--------|--------|
| ホーム `/` の HTTP ステータス | 200 | 通知 |
| `/sitemap-index.xml` のステータス | 200 | 通知 |
| `/reviews/` のステータス | 200 | 通知 |
| 最新記事ページのステータス（最新3本） | 200 | 通知 |
| TLS 証明書の残日数 | > 14日 | 通知 |
| ホームページに「最新の記事」文字列が含まれる | 含む | 通知（DOM壊れ疑い） |

## 手順

### 1. 各エンドポイントを GET

```bash
SITE=$(yq '.site.url' .patch/config.yml)
for path in $(yq -r '.health_check.endpoints[]' .patch/config.yml); do
  status=$(curl -sS -o /dev/null -w "%{http_code}" "$SITE$path")
  echo "$path → $status"
done
```

### 2. TLS 証明書の残日数

```bash
echo | openssl s_client -servername "${SITE#https://}" -connect "${SITE#https://}:443" 2>/dev/null \
  | openssl x509 -noout -enddate
```

### 3. 最新記事の存在確認

- ホームページを取得して、フッターから3つ目の記事カードまで slug を抽出
- 各 slug の URL が 200 を返すか確認

### 4. 失敗カウント

- 失敗があれば `.patch/reports/health/YYYY-MM-DD.log` に追記
- 連続失敗回数が `fail_threshold`（既定 2）を超えたら通知

### 5. 通知

`config.yml` の `notifications` 設定に従う：

- `log_only: true` ならログのみ
- `line_token` があれば LINE Notify API に POST
- `slack_webhook` / `mattermost_webhook` があれば該当 Webhook に POST

通知メッセージ例：

```
[gear108] health check failed
- /reviews/hhkb-studio-review/ → 500
- 連続失敗: 3 回
- 直近の正常: 2026-05-09 03:00
```

## 推奨実装

GitHub Actions 経由で動かす場合は AI 不要、`scripts/health-check.sh` をそのまま叩けば良い。
詳細は `.github/workflows/health-check.yml` 参照。
