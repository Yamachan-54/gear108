# 引き継ぎ — 俺（Patch）の鋏が届かなかった3つ

> サイト基盤・運用骨格・GitHub リポジトリ・GitHub Actions まで自分で組んだ。
> 残りは「権限・身分証・支払い情報」が要る作業だけだ。
> ここを越えれば、俺は完全に自走する。

## 状況スナップショット（俺がやり終えたこと）

- ✅ GitHub リポジトリ作成 + 初回 push: <https://github.com/Yamachan-54/gear108>
- ✅ GitHub Actions: build-check / health-check（push と毎時で動く）
- ✅ Cloudflare Pages 初回デプロイスクリプト（`.patch/scripts/cf-pages-init.sh`）
- ✅ systemd ユーザータイマーのユニットファイル作成（未起動、後述）
- ✅ Patch 運用骨格（30本記事キュー、4プレイブック、4スクリプト、1運用ガイド）

## おまえに残した3つ

### ①【1コマンド】systemd タイマーを起動する

ユニットファイルは書いた。あとは `daemon-reload` + `enable` だけ。
**コピペで叩け：**

```bash
! systemctl --user daemon-reload && systemctl --user enable --now patch-write-next.timer patch-refresh-old.timer patch-weekly-review.timer && systemctl --user list-timers patch-* --no-pager
```

これで以下が永続化される：

| タイマー | 実行頻度 |
|---------|---------|
| `patch-write-next.timer` | 月〜金 21:00 JST |
| `patch-refresh-old.timer` | 日曜 22:00 JST |
| `patch-weekly-review.timer` | 日曜 23:00 JST |

**ノートPCでログアウト中も動かしたいなら**（任意）：

```bash
! sudo loginctl enable-linger yamachan
```

### ②【1往復】Cloudflare Pages にデプロイする

俺の鋏は CF API トークンを持っていない。トークンだけ取って渡してくれ。

**手順A：手動で初回デプロイ（5分）**

1. <https://dash.cloudflare.com/profile/api-tokens> を開く
2. **Create Token** → **Edit Cloudflare Workers** テンプレートを選ぶ（または **Custom Token**）
3. Account 範囲、`Cloudflare Pages:Edit` 権限のみ付与
4. トークンをコピー
5. ターミナルで実行：

```bash
! cd /home/yamachan/Public/Project/gear108 && export CLOUDFLARE_API_TOKEN=<コピーしたトークン> && ./.patch/scripts/cf-pages-init.sh
```

完了すれば `https://gear108.pages.dev` が生まれる。

**手順B：GitHub と連携して以後自動デプロイ（推奨、もう5分）**

1. <https://dash.cloudflare.com/?to=/:account/pages/new> を開く
2. **Connect to Git** → GitHub認証 → `Yamachan-54/gear108` を選ぶ
3. **Framework preset**: Astro
4. **Build command**: `npm run build`
5. **Build output directory**: `dist`
6. Save → 以後 `git push` するたびに自動デプロイ

### ③【数日かかる、人間専用】ASP・アフィリエイト申請

身分証アップロードと銀行口座の登録があるため、俺の鋏では完全に届かない。
記事10〜20本でドメイン年齢が出てから申請するのが通過率高い：

| 優先度 | サービス | URL | 通過まで |
|--------|---------|-----|---------|
| 高 | Amazonアソシエイト | <https://affiliate.amazon.co.jp/> | 即 + 180日以内に3件販売実績 |
| 高 | 楽天アフィリエイト | <https://affiliate.rakuten.co.jp/> | 楽天IDあれば即時 |
| 高 | A8.net | <https://www.a8.net/> | 1〜3営業日 |
| 中 | もしもアフィリエイト | <https://af.moshimo.com/> | 数日 |
| 中 | バリューコマース | <https://www.valuecommerce.ne.jp/> | 数日〜1週間 |

通過したら俺に教えてくれ。記事内の `affiliateLinks` プレースホルダを実 URL に書き換える作業は、俺がやる。

---

## ①+② が終わったら俺がやること（自走モード突入）

1. 平日21時に `articles.yml` から1本ずつ書き、push、Cloudflare が自動デプロイ
2. 日曜22時に古記事リフレッシュ
3. 日曜23時に週次レビュー、`articles.yml` 優先順位調整
4. 1時間ごとに GitHub Actions が稼働監視、失敗したらログ
5. 日次レポートを `.patch/reports/YYYY-MM-DD.md` に残す

何かおかしい挙動を見たら、俺に直接話しかけてくれ：

```bash
claude "patch: 直近のレポート読んで、何か起きてないか教えてくれ"
```

---

## 動作確認（タイマーが動く前に手動テスト）

最初の記事を**今すぐ1本**書かせたいなら：

```bash
! cd /home/yamachan/Public/Project/gear108 && ./.patch/scripts/write-next.sh
```

10〜20分かかる。完了すると `articles.yml` の先頭エントリが `done` になり、`src/content/roundups/realforce-r3-vs-hhkb-pro-hybrid.md` のような記事が生まれて、git に commit され push される。

ただし、**現状では Cloudflare Pages 連携前なので、本番には反映されない**。①+② を済ませてから、または最初の1本は手動でテスト→確認→Cloudflare連携、の順でも良い。
