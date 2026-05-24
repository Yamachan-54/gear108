# 引き継ぎ — Hermes 運用移行メモ

> `gear108` の継続運用は旧CLIではなく Hermes が担当する。
> Patch は記事品質・語り口の人格名として残すが、実行・証跡・Project更新は Hermes の責務とする。

## 状況スナップショット

- ✅ GitHub リポジトリ: <https://github.com/Yamachan-54/gear108>
- ✅ GitHub Actions: build-check / health-check
- ✅ Cloudflare Pages 初回デプロイスクリプト: `.patch/scripts/cf-pages-init.sh`
- ✅ Patch 運用骨格: 記事キュー、プレイブック、スクリプト、運用ガイド
- ✅ Hermes移行後の入口: GitHub Project #4 と対象Issue/PR

## 人間に残る作業

### ① Cloudflare Pages の認可・接続

Cloudflare API トークン作成、GitHub連携、Pagesプロジェクト作成は認証と外部公開を伴うため人間専用。

1. <https://dash.cloudflare.com/?to=/:account/pages/new> を開く
2. **Connect to Git** → GitHub認証 → `Yamachan-54/gear108` を選ぶ
3. **Framework preset**: Astro
4. **Build command**: `npm run build`
5. **Build output directory**: `dist`
6. Save → 以後 `git push` / PR merge で自動デプロイ

### ② ASP・アフィリエイト申請

身分証アップロードと銀行口座の登録があるため、人間専用。
記事内の `affiliateLinks` プレースホルダを実URLに差し替える作業は、申請通過後にIssue化すればHermesが対応する。

| 優先度 | サービス | URL | 通過まで |
|--------|---------|-----|---------|
| 高 | Amazonアソシエイト | <https://affiliate.amazon.co.jp/> | 即 + 180日以内に3件販売実績 |
| 高 | 楽天アフィリエイト | <https://affiliate.rakuten.co.jp/> | 楽天IDあれば即時 |
| 高 | A8.net | <https://www.a8.net/> | 1〜3営業日 |
| 中 | もしもアフィリエイト | <https://af.moshimo.com/> | 数日 |
| 中 | バリューコマース | <https://www.valuecommerce.ne.jp/> | 数日〜1週間 |

## Hermes がやること

1. GitHub Project #4 のTodoを確認する。
2. `gear108` のIssueを証跡本体として扱う。
3. 必要な場合はブランチを切り、テスト・build・PR・mergeで小さく完了する。
4. CloudflareやASPなど人間認証が必要な作業は `BLOCKED` としてIssueへ記録する。
5. サイト正常稼働は GitHub Actions と `npm run build` / `npm run check` / `npm test` の結果で確認する。

## 動作確認

記事生成やキュー処理を変更する前に、以下を確認する。

```bash
npm test
npm run check
npm run build
```

Hermes は結果をIssue/PRに記録し、Project Statusを更新する。
