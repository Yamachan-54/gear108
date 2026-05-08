# gear108

エンジニア向け最新ガジェットのレビュー・比較・ニュース・選び方ガイドを毎日届ける情報サイト。

- **目標**: 1年で月10万円の収益
- **ペース**: 平均週5本（年間 260 本）
- **マネタイズ**: Amazon/楽天アフィ + 高単価ASP + AdSense
- **スタック**: Astro 5 + Tailwind CSS 4 + MDX + Cloudflare Pages

## クイックスタート

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

## ディレクトリ構成

```
src/
├── components/      # UI 部品（AffiliateButton, PriceComparison, ProductCard）
├── layouts/         # レイアウト（BaseLayout, BlogPostLayout）
├── content/         # 記事ソース（5コレクション）
│   ├── reviews/     # 実機レビュー
│   ├── roundups/    # まとめ・比較
│   ├── news/        # 新製品・速報
│   ├── guides/      # 選び方ガイド
│   └── deals/       # セール情報
├── pages/           # ルーティング
├── styles/          # global.css（Tailwind v4 + prose-gear）
└── content.config.ts  # コレクションスキーマ + ラベル
```

## コンテンツの追加方法

### レビュー記事

`src/content/reviews/<slug>.md` または `.mdx` を作成：

```yaml
---
title: "製品名 レビュー：見出しに刺さる一文"
description: "1〜2文の要約（メタディスクリプション）"
pubDate: 2026-05-08
heroImage: /images/<slug>.png
category: keyboard      # keyboard|monitor|pc|desk|peripheral|storage|audio|power
tags: [HHKB, PFU]
productName: "HHKB Studio"
productPrice: 44000
rating: 4.5
pros: ["長所1", "長所2"]
cons: ["短所1"]
affiliateLinks:
  amazon: "https://www.amazon.co.jp/dp/...?tag=YOURTAG-22"
  rakuten: "https://search.rakuten.co.jp/search/mall/..."
  yodobashi: "https://www.yodobashi.com/..."
draft: false
---
```

### その他のコレクション

各コレクションのスキーマは `src/content.config.ts` を参照。
基本のフロントマターは共通で、コレクション固有のフィールドが追加される。

## カテゴリ

| slug | 表示名 |
|------|--------|
| `keyboard` | キーボード |
| `monitor` | モニター |
| `pc` | PC・ノート |
| `desk` | デスク・椅子 |
| `peripheral` | 周辺機器 |
| `storage` | ストレージ |
| `audio` | オーディオ |
| `power` | 電源・ケーブル |

## 関連ドキュメント

- [docs/PLAN.md](docs/PLAN.md) — 1年ロードマップと収益化戦略
- [docs/DEPLOY.md](docs/DEPLOY.md) — Cloudflare Pages デプロイ + GA4/Search Console 設定
- [docs/CONTENT-WORKFLOW.md](docs/CONTENT-WORKFLOW.md) — 週5本ペースの執筆フロー
