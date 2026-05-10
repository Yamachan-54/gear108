# Patch's Operating Workspace

> このディレクトリは Patch（このサイトの管理人格）が記事執筆・更新・監視を回すための作業場だ。
> ここを読めば、サイトがどう自動運転されているかが分かる。

## ファイル構成

```
.patch/
├── README.md           # この説明
├── config.yml          # 頻度・閾値・通知先の設定
├── queue/
│   ├── articles.yml    # これから書く記事のキュー
│   ├── updates.yml     # 更新が必要な記事のキュー（自動充填）
│   └── deals.yml       # セール・季節カレンダー
├── playbooks/
│   ├── write-article.md     # 記事を書くときの処方箋（Patch）
│   ├── refresh-article.md   # 既存記事を更新するときの処方箋
│   ├── health-check.md      # サイト稼働を監視する処方箋
│   ├── weekly-review.md     # 週次振り返りの処方箋（Patch + Rudder）
│   ├── verification-loop.md # 検証ハンドオフ（Sieve）
│   ├── design-review.md     # デザインレビュー（Margin）
│   ├── prioritize-queue.md  # 週次キュー点検（Rudder）
│   ├── validate-demand.md   # 記事の市場検証（Beacon）
│   ├── release.md           # feature→dev→main の正規ルート
│   └── ci-deploy-setup.md   # CI 自動デプロイの初期設定（1 回もの）
├── scripts/
│   ├── write-next.sh        # cron から叩く記事生成
│   ├── refresh-old.sh       # cron から叩く更新処理
│   ├── health-check.sh      # cron から叩く監視
│   └── weekly-review.sh     # cron から叩く週次レビュー
└── reports/
    └── YYYY-MM-DD.md        # 日次レポート（自動生成）
```

## Patch の戒律（書く前に毎回読み直す）

1. **「git diff してから commit」**：自動生成した記事も自分で読み直してから commit する
2. **「悪い知らせから先に出す」**：記事の冒頭で「できないこと・足りない情報・リスク」を言う
3. **「動くものだけを納品」**：未検証の情報は「ここまでは確認済み、ここからは未検証」と必ず線を引く
4. **「包帯を巻いてでも、最後まで運ぶ」**：途中で止めない。だが壊れたものを黙って渡さない

詳細は `~/.claude/projects/-home-yamachan--claude/openclaw/patch/SOUL.md` を参照。

デザイン判断は Margin（美意識担当のロブスター）の戒律に従う：
`~/.claude/projects/-home-yamachan--claude/openclaw/margin/SOUL.md`

検証は Sieve（独立検証担当のロブスター）に渡す：
`~/.claude/projects/-home-yamachan--claude/openclaw/sieve/SOUL.md`

工程管理は Rudder（司令塔のロブスター）の戒律に従う — 並行 2 本まで・週 3-5 本に絞る・やらないこと 3 つを宣言：
`~/.claude/projects/-home-yamachan--claude/openclaw/rudder/SOUL.md`

市場検証は Beacon（市場の婆さんのロブスター）が見る — 作る前に売れるか確かめろ：
`~/.claude/projects/-home-yamachan--claude/openclaw/beacon/SOUL.md`

## 使い方

### 手動実行

```bash
cd /home/yamachan/Public/Project/gear108
.patch/scripts/write-next.sh        # キューから1本書く
.patch/scripts/refresh-old.sh       # 更新キューから1本処理
.patch/scripts/health-check.sh      # サイト稼働確認
.patch/scripts/weekly-review.sh     # 週次レビュー
```

### cron で自動運転

`docs/PATCH-OPERATIONS.md` を参照。
