# Discord 通知のセットアップ

`main` ブランチに新規記事 (`src/content/**/*.md` または `.mdx`) が追加されると、GitHub Actions が Discord webhook 経由で **Patch ペルソナ**として通知を投げる。

## 配線図

```
write-next.sh (毎週金 21:00)
   ↓
feature → dev → main の三段運用 (release.md)
   ↓
main push 検知 → .github/workflows/notify-discord.yml
   ↓
.github/scripts/notify-discord.mjs
   ↓
Discord webhook (repo secret DISCORD_WEBHOOK_URL)
   ↓
Discord チャンネルに記事カード投稿
```

## セットアップ（人間がやる、初回 1 回のみ）

### 1. Discord 側で webhook を作る

1. 通知先にしたい Discord サーバーを開く
2. サーバー設定 → 連携サービス → ウェブフック → **新しいウェブフック**
3. 名前は何でもいい（例: `gear108 / Patch`）
4. **アバター**は `https://gear108.pages.dev/avatars/patch.png` を保存して設定（任意、webhook 側のデフォルトを上書きしたい場合）
5. 投稿先チャンネルを選ぶ
6. **「ウェブフック URL をコピー」**を押す

> webhook URL は秘密情報。コミットしない・チャットに貼らない・スクショに写さない。

### 2. GitHub repo secret に登録

```bash
cd /home/yamachan/Public/Project/gear108
gh secret set DISCORD_WEBHOOK_URL
# プロンプトが出るので、コピーした webhook URL を貼り付けて Enter
```

または GitHub Web UI: Settings → Secrets and variables → Actions → New repository secret
- Name: `DISCORD_WEBHOOK_URL`
- Value: コピーした webhook URL

### 3. 動作確認

#### A. 既存の記事をテスト通知する場合

```bash
gh workflow run notify-discord.yml --ref main
```

ただし `on: push` トリガーなので `workflow_run` では発火しない。手動テストするには次のいずれか：

- **B. 次回の自動投稿（金曜 21:00）を待つ** — 一番確実
- **C. ローカルで直接スクリプトを叩く**:

```bash
cd /home/yamachan/Public/Project/gear108
DISCORD_WEBHOOK_URL='<webhook url>' \
BEFORE_SHA=$(git rev-parse HEAD~1) \
AFTER_SHA=$(git rev-parse HEAD) \
node .github/scripts/notify-discord.mjs
```

直近の commit で `src/content/**` に追加された記事があれば、その記事が Discord に飛ぶ。無ければ "No new content files" で正常終了する。

## 通知の中身（embed 仕様）

| フィールド | 値 |
|-----------|----|
| username | `Patch` |
| avatar | `https://gear108.pages.dev/avatars/patch.png` |
| content | `📚 新しい記事を上げた。` |
| embed title | 記事の `title` (frontmatter) |
| embed description | 記事の `description` (frontmatter) |
| embed url | `https://gear108.pages.dev/<collection>/<slug>/` |
| embed image | `https://gear108.pages.dev/og/<slug>.png` (OG 画像) |
| embed color | `#c1272d` (Patch ブランド色) |
| field 1 | カテゴリ（日本語ラベル） |
| field 2 | コレクション（日本語ラベル） |
| footer | `gear108 — Patch` |

## 飛ばない条件（仕様）

通知は **以下の全部を満たすときだけ**飛ぶ：

1. `main` ブランチへの push である
2. push の差分に `src/content/**/*.md` または `.mdx` の **新規追加（`A` ステータス）** が含まれる
3. そのファイルが `_placeholder.md` ではない
4. frontmatter の `draft` が `true` ではない

**飛ばないケース**：
- 既存記事の更新（編集のみ）→ refresh-old.sh の運用は対象外
- draft 状態での push
- 記事以外の変更（CSS, 設定, README 等）

## トラブルシューティング

### 通知が来ない

```bash
# 1. workflow が走ったか確認
gh run list --workflow notify-discord.yml --limit 5

# 2. ログを見る
gh run view <run-id> --log

# 3. secret が登録されているか
gh secret list | grep DISCORD_WEBHOOK_URL
```

### Discord 側でエラー

webhook 失敗は `gh run view` のログに残る。よくあるパターン：
- `401 Unauthorized` → webhook URL が間違っているか、削除された
- `404 Not Found` → 同上
- `429 Too Many Requests` → 1 回の push で大量の記事を追加した場合のレート制限。連続投稿は控える

### 一時的に止めたい

- 最も簡単: repo secret `DISCORD_WEBHOOK_URL` を削除（スクリプトが unset を検知して何もせず終了）
- ワークフロー自体を無効化: GitHub Web UI → Actions → notify-discord → 右上の "..." → Disable workflow
