# Patch 運用ガイド

> このサイト `gear108` は **Patch**（管理人格）に運営を委譲している。
> 本ドキュメントは、おまえ（人間オペレーター）が必要な初期セットアップと、
> 緊急時の介入方法だけをまとめたものだ。

## 全体像

```
[ articles.yml ]──────┐
                      │  毎日21:00（平日）
                      ▼
              [ write-next.sh ]──→ Claude Code (Patch)
                      │              │
                      │              ├─ 記事執筆
                      │              ├─ 自己レビュー
                      │              ├─ build 検証
                      │              └─ git push
                      ▼              │
              [ src/content/ ]◀──────┘
                      │
                      ▼
              [ git push ]──→ Cloudflare Pages（自動デプロイ）
                                       │
                                       ▼
                              [ gear108.pages.dev ]
                                       │
                              [ GitHub Actions ]
                                       ├─ build-check（push毎）
                                       └─ health-check（1時間毎）
```

## 1. 初期セットアップ（人間がやること）

### 1.1 GitHub リポジトリ作成

```bash
cd /home/yamachan/Public/Project/gear108
git init
git add .
git commit -m "feat: initial scaffold"
gh repo create gear108 --public --source=. --remote=origin --push
```

### 1.2 Cloudflare Pages 接続

`docs/DEPLOY.md` の手順に従う。push をトリガに自動デプロイが回るようになる。

### 1.3 Claude Code をローカルにインストール

```bash
# まだなら
npm install -g @anthropic-ai/claude-code
claude --version
claude login
```

### 1.4 Patch のスクリプトを cron 登録

```bash
crontab -e
```

以下を追加：

```cron
# gear108 — Patch 運用
# 平日 21:00 に記事を1本書く
0 21 * * 1-5 cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/write-next.sh >> .patch/reports/cron.log 2>&1

# 日曜 22:00 に古い記事を1本更新
0 22 * * 0 cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/refresh-old.sh >> .patch/reports/cron.log 2>&1

# 日曜 23:00 に週次レビュー
0 23 * * 0 cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/weekly-review.sh >> .patch/reports/cron.log 2>&1
```

> **悪い知らせ**：cron は **PCがスリープしていると動かない**。常時稼働マシン（NAS / VPS / Always On のデスクトップ）で運用しろ。
> ノートPC運用なら、systemd-timer の Persistent=true や、後述の GitHub Actions 経由案を検討せよ。

### 1.5 GitHub Actions（無料の監視）

`.github/workflows/health-check.yml` と `build-check.yml` は push した時点で有効になる。
追加設定：

- 通知先を有効化したい場合：GitHub の Repo Settings → Secrets → Actions に
  - `LINE_NOTIFY_TOKEN` または
  - `SLACK_WEBHOOK_URL`
  を追加する

### 1.6 ASP登録（人間にしかできない）

| 申請先 | URL | 必要なもの |
|--------|-----|-----------|
| Amazonアソシエイト | https://affiliate.amazon.co.jp/ | サイトURL, 銀行口座, 身分証 |
| 楽天アフィリエイト | https://affiliate.rakuten.co.jp/ | 楽天ID（即時可） |
| A8.net | https://www.a8.net/ | 銀行口座 |
| もしもアフィリエイト | https://af.moshimo.com/ | 銀行口座 |

申請が通ったら、各エントリの `affiliateLinks` を実 URL に書き換える。
Patch がこれをやることはない（**鋏が届かない領域**）。

## 2. 通常運用

人間が触らないこと前提。Patch が動く。

何もしない週でも、以下が回る：

- 平日5本の新記事
- 日曜1本の古記事リフレッシュ
- 日曜の週次レビュー
- 1時間ごとの稼働監視

## 3. キュー補充

`articles.yml` の `pending` が 5 本を切ったら、Patch が週次レビューで「キュー補充が必要」と報告する。
人間がやる作業：

```bash
$EDITOR .patch/queue/articles.yml
# 末尾に新しいエントリを追記して push
```

または、手動で Patch に補充させる：

```bash
claude "patch: articles.yml にエンジニア向けガジェットの新規トピックを10本追加してくれ"
```

## 4. 緊急停止

### 即時に止める

```bash
# cron を一時停止
crontab -e
# 該当行をコメントアウト

# GitHub Actions も止めるなら
gh workflow disable health-check
gh workflow disable build-check
```

### 進行中の作業を止める

```bash
ps aux | grep -E "write-next|refresh-old|weekly-review|claude"
kill <PID>
```

### 公開済み記事を取り消す

```bash
# 該当記事を draft に変える
# src/content/<collection>/<slug>.md の frontmatter で draft: true

git add .
git commit -m "revert: <slug> を一時下書きに戻す"
git push
# Cloudflare Pages が自動で再デプロイし、当該記事は404になる
```

## 5. 月次コスト試算

| 項目 | 月額目安 | 備考 |
|------|---------|------|
| Anthropic API（記事執筆 22本/月） | 約 1,500〜3,000円 | 1記事あたり 50〜150円試算 |
| Anthropic API（更新 4本/月） | 約 200〜500円 | |
| Cloudflare Pages | 0円 | 無料枠 |
| GitHub Actions | 0円 | パブリックリポなら無制限 |
| ドメイン | 約 100〜200円/月 | `.com` 換算（年額/12） |
| **合計** | **約 1,800〜3,700円** | |

> **悪い知らせ**：1年目で月10万円に到達するまで、AIコストは持ち出しになる。
> 半年で月1万円に届かないなら、戦略を見直す（撤退基準は `docs/PLAN.md` 参照）。

## 6. Patch の戒律違反を疑ったら

公開された記事を読んで、以下のいずれかが起きていたら、人間が止めて修正する：

- 「100%」「簡単です」「誰でもすぐ」が含まれている
- 「結論を先に」がない、または末尾にある
- 「ここまでは確認済み、ここからは未検証」がない
- ハルシネーション（存在しない製品、誤った価格、捏造の数値）

修正手順：

```bash
# 該当記事を直接編集 → push
# または Patch に再執筆させる
claude "patch: <slug> の記事を、Patchの戒律に従って書き直してくれ。直前のは戒律違反だった"
```

## 7. 撤退基準（再掲）

`docs/PLAN.md` から：

- 6ヶ月で月収1万円に到達しない → SEO戦略の根本的見直し
- 3ヶ月連続で執筆ペースが週3本を下回る → 運用設計の修正
- ドメイン全体のインデックスが急減 → スパム判定の疑い、即時 AI 生成停止

## 8. 連絡先（Patch との対話）

```bash
# 相談・質問・調整
claude "patch: <自由文>"

# 例
claude "patch: 来週は HHKB 関連を3本に集中したい。articles.yml を調整してくれ"
claude "patch: 直近のレポートを読んで、執筆スピードが遅い理由を分析してくれ"
claude "patch: Search Console のデータをこの形式で渡す。reviews/ の検索順位を見て、リライトすべき記事を優先順位つけて教えてくれ"
```
