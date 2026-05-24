# Patch / Hermes 運用ガイド

> このサイト `gear108` の継続運用は **Hermes** が担当する。
> Patch は記事制作・レビューの人格名として残すが、実行主体は旧CLIではなく Hermes cron job と GitHub Project #4 に移行する。

## 全体像

```
[ GitHub Project #4 / Issue ]
             │
             ▼
       [ Hermes cron job ]
             │
             ├─ タスク選択・証跡コメント
             ├─ .patch/scripts/write-next.sh / refresh-old.sh / weekly-review.sh の必要性判断
             ├─ branch → test/build → PR → merge
             └─ Issue/PR に検証結果を記録
             │
             ▼
       [ src/content/ ] ──→ [ git push / PR merge ] ──→ Cloudflare Pages
                                                   │
                                                   ▼
                                          [ gear108.pages.dev ]
                                                   │
                                                   ▼
                                          [ GitHub Actions ]
                                          ├─ build-check（push毎）
                                          └─ health-check（1時間毎）
```

## 1. 運用責任の境界

- Hermes が通常運用・Issue整理・小さな改善・検証・PR証跡を担当する。
- GitHub Project #4 を入口、Issue/PR を証跡の本体として扱う。
- コードや文書変更は原則として branch → 縦スライスTDDまたは検証可能なテスト → PR → CI → merge で進める。
- 破壊的操作、認証変更、課金、外部公開、Cloudflare APIトークン作成、ASP/銀行/身分証登録は Hermes が実行せず、Issue に `BLOCKED` として記録する。

## 2. 初期セットアップ（人間がやること）

### 2.1 Cloudflare Pages 接続

`docs/DEPLOY.md` の手順に従う。push / PR merge をトリガに自動デプロイが回るようにする。
Cloudflare API トークン作成やGitHub連携の認可は人間専用タスクとして扱う。

### 2.2 Hermes cron job

このリポジトリ固有のOS cronを増やすのではなく、Yamachan↔Hermesの継続運用は GitHub Project #4 を監視する Hermes cron job に集約する。
Hermes cron job は次を毎回確認する。

1. Project item一覧・field一覧・open Issue一覧
2. Todoのうち最小で実行可能なユーザー作成タスク
3. Issue/PRへの開始・検証・完了コメント
4. Project Status の `In progress` / `Done` 更新

### 2.3 ASP登録（人間にしかできない）

| 申請先 | URL | 必要なもの |
|--------|-----|-----------|
| Amazonアソシエイト | https://affiliate.amazon.co.jp/ | サイトURL, 銀行口座, 身分証 |
| 楽天アフィリエイト | https://affiliate.rakuten.co.jp/ | 楽天ID（即時可） |
| A8.net | https://www.a8.net/ | 銀行口座 |
| もしもアフィリエイト | https://af.moshimo.com/ | 銀行口座 |

申請が通ったら、各エントリの `affiliateLinks` を実 URL に書き換える作業をIssue化する。

## 3. 通常運用

Hermes は GitHub Project #4 の `Todo` を確認し、必要に応じて次を実行する。

- 新記事作成または記事更新のIssue化
- `.patch/queue/articles.yml` / `.patch/queue/updates.yml` の確認
- `.patch/scripts/health-check.sh` や GitHub Actions の結果確認
- build/check/test の実行
- Issue/PR への証跡コメント

## 4. キュー補充

`articles.yml` の `pending` が 5 本を切ったら、Hermes がProject #4または対象リポジトリに小さなIssueを作成し、重複確認後に補充作業を行う。
人間が直接補充したい場合は以下を編集してPRまたはcommitする。

```bash
$EDITOR .patch/queue/articles.yml
```

## 5. 緊急停止

### 自動運用を止める

Project #4 の対象Issueに `BLOCKED` コメントを残し、必要なら該当Project itemをTodoへ戻す。
外部サービス連携の無効化が必要な場合は、人間がCloudflare / GitHub Actions / Secrets側で停止する。

### 進行中のローカル作業を確認する

```bash
ps aux | grep -E "write-next|refresh-old|weekly-review|hermes"
```

### 公開済み記事を取り消す

```bash
# 該当記事を draft に変える
# src/content/<collection>/<slug>.mdx の frontmatter で draft: true

git add .
git commit -m "revert: <slug> を一時下書きに戻す"
git push
```

## 6. 月次コスト試算

| 項目 | 月額目安 | 備考 |
|------|---------|------|
| AI運用・記事執筆 | Hermes側の利用状況に依存 | 旧CLI使用率は0を目標にする |
| Cloudflare Pages | 0円 | 無料枠 |
| GitHub Actions | 0円 | パブリックリポなら無制限 |
| ドメイン | 約 100〜200円/月 | `.com` 換算（年額/12） |

## 7. Patch の戒律違反を疑ったら

公開された記事を読んで、以下のいずれかが起きていたらIssueを作成し、Hermesが検証・修正PRを作る。

- 「100%」「簡単です」「誰でもすぐ」が含まれている
- 「結論を先に」がない、または末尾にある
- 「ここまでは確認済み、ここからは未検証」がない
- ハルシネーション（存在しない製品、誤った価格、捏造の数値）

## 8. Hermesへの依頼窓口

- 継続運用: GitHub Project #4
- 証跡: 対象Issue/PR
- 運用アンカー: Yamachan-54/HermesAgent Issue #1

例:

- `gear108 の次の記事キューを補充する`
- `直近のヘルスチェック結果を見て、異常があればIssue化する`
- `Search Console のデータをIssueに貼るので、更新候補を優先順位付けする`
