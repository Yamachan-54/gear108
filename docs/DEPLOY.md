# デプロイと外部連携の手順

## Cloudflare Pages デプロイ

### 前提

- GitHub アカウント
- Cloudflare アカウント（無料プランで OK）

### 手順

1. **GitHub リポジトリを作る**

```bash
cd /home/yamachan/Public/Project/gear108
git init
git add .
git commit -m "feat: initial scaffold"
gh repo create gear108 --public --source=. --remote=origin --push
```

2. **Cloudflare Pages で接続**

- Cloudflare ダッシュボード → Workers & Pages → Create application → Pages → Connect to Git
- リポジトリ `gear108` を選択
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- 環境変数（後述）を設定

3. **独自ドメインを設定**

- Pages のプロジェクト → Custom domains → Add custom domain
- ドメインは事前に取得しておく（`.com` / `.dev` 推奨）
- DNS は Cloudflare に委任すると最速

## 環境変数

| 変数 | 用途 | 設定先 |
|------|------|--------|
| `PUBLIC_GA_ID` | GA4 測定 ID（`G-XXXXXXXXXX`） | Cloudflare Pages 環境変数 |
| `PUBLIC_AMAZON_TAG` | Amazonアソシエイトタグ | 任意（記事フロントマターに埋めるなら不要） |

`PUBLIC_*` プレフィックスはクライアントに露出するため、**秘匿情報には使わない**。

### GA4 を有効化する

`src/layouts/BaseLayout.astro` の GA4 ブロックのコメントを外し、以下のように差し替える：

```astro
{import.meta.env.PUBLIC_GA_ID && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA_ID}`}></script>
    <script is:inline define:vars={{ gaId: import.meta.env.PUBLIC_GA_ID }}>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', gaId);
    </script>
  </>
)}
```

## Google Search Console

1. https://search.google.com/search-console にアクセス
2. プロパティタイプ「ドメイン」を選択（DNS 認証推奨）
3. Cloudflare DNS に TXT レコードを追加
4. サイトマップ `https://<your-domain>/sitemap-index.xml` を送信
   - サイトマップは `@astrojs/sitemap` 統合で自動生成される
   - 反映には数日かかる

## ASP（アフィリエイトサービス）登録順序

サイト公開直後ではなく、**記事 10〜20 本でドメイン年齢が出てから**申請する方が通過率が高い。

### 必須（サイト立ち上げ後すぐ）

1. **Amazonアソシエイト**
   - https://affiliate.amazon.co.jp/
   - 申請後 180 日以内に 3 件以上の販売実績が必要
   - 紹介料率は商品カテゴリで異なる（PC・周辺機器は 2〜3%）

2. **楽天アフィリエイト**
   - https://affiliate.rakuten.co.jp/
   - 楽天IDがあれば即時利用可能
   - 紹介料率 1〜4%

### 記事 20 本以降

3. **A8.net** — 国内最大手、案件数最多
4. **もしもアフィリエイト** — Amazon/楽天/Yahoo を一括管理できる「かんたんリンク」が便利
5. **バリューコマース** — Yahoo!ショッピングの公式アフィリエイト

### 記事 50 本以降（高単価案件向け）

6. **アクセストレード** — プログラミングスクール案件が強い
7. **JANet** — 法人向けSaaS案件

## Google AdSense

- 申請条件: 独自ドメイン、記事10〜20本以上、プライバシーポリシー設置
- 申請: https://www.google.com/adsense/
- 通過後、`<script>` を `BaseLayout.astro` に追加し、自動広告 or 個別広告ユニットを配置

## アフィリエイトリンクの記事埋め込み

各記事フロントマターの `affiliateLinks` に各ECのリンクを書くと、`PriceComparison` コンポーネントが自動表示する：

```yaml
affiliateLinks:
  amazon: "https://www.amazon.co.jp/dp/B0XXXXXXX?tag=YOURTAG-22"
  rakuten: "https://hb.afl.rakuten.co.jp/..."
  yodobashi: "https://www.yodobashi.com/..."
```

## チェックリスト（公開前）

- [ ] `npm run build` が通る
- [ ] サイトマップが生成される（`dist/sitemap-index.xml`）
- [ ] OGP 画像が表示される（[Open Graph Tester](https://opengraph.dev/) で確認）
- [ ] モバイル表示が崩れない（Chrome DevTools のレスポンシブモード）
- [ ] プライバシーポリシー / 運営者情報ページを設置
- [ ] アフィリエイト表記をフッターまたは記事末に明記
- [ ] Search Console にサイトマップを送信
- [ ] GA4 で実トラフィックが計測されているか確認
