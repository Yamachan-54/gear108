# 月次収益記録 — YYYY-MM

> このファイルをコピーして月次の実績を入れる。
> 命名：`.patch/reports/revenue/2026-05.md` のように年月で。
> 集計は週次レビュー（playbook：weekly-review.md）が読み込んで達成率を算出する。

## 期間

- 開始：YYYY-MM-01
- 終了：YYYY-MM-末日
- 経過月：N ヶ月目（公開開始から）
- 累計記事：N 本

## 収益（ASP 各社の管理画面から手動転記）

| 収益源 | 月額 (JPY) | 取得元 | 備考 |
|--------|-----------|--------|------|
| Amazonアソシエイト | | <https://affiliate.amazon.co.jp/> → レポート | 紹介料率 2〜4%、商品カテゴリで変動 |
| 楽天アフィリエイト | | <https://affiliate.rakuten.co.jp/> → 成果レポート | |
| A8.net | | <https://www.a8.net/> → 確定レポート | |
| もしもアフィリエイト | | <https://af.moshimo.com/> → 成果報酬 | |
| バリューコマース | | <https://www.valuecommerce.ne.jp/> → 成果レポート | |
| Google AdSense | | <https://www.google.com/adsense/> | 月3〜5万PV で 1〜2万円目安 |
| その他 | | | |
| **合計** | **¥0** | | |

## トラフィック（Cloudflare Web Analytics から）

- 月間 PV：
- 月間訪問者（ユニーク）：
- 平均ページ/訪問：
- LCP (p75)：
- 主な流入元（上位3）：

## アフィクリック実績（Cloudflare Analytics Engine から）

> SQL: `.patch/reports/revenue/queries/clicks-by-store-month.sql` を CF Dashboard で実行

| ストア | クリック数 | CTR（PV比） | CV率（クリック→収益発生） |
|--------|----------|-----------|--------------------------|
| Amazon | | | |
| 楽天 | | | |
| ヨドバシ | | | |

## 達成率

| 指標 | 計画 | 実績 | 達成率 |
|------|------|------|--------|
| 累計記事 | （月別計画） | | |
| 月間 PV | （月別計画） | | |
| 月間収益 | （月別計画） | ¥| |

PLAN.md の 1 年ロードマップ：
- 月 1：¥0
- 月 4-6：¥1〜3万
- 月 7-9：¥3〜5万
- 月 10-12：¥7〜10万

## 所感（Patch / Margin の振り返り）

- 良かった点：
- 反省点：
- 来月の方針：

## 撤退基準のチェック

- [ ] 6ヶ月で月収1万円に到達したか（月7時点で未達なら戦略見直し）
- [ ] 執筆ペースが週3本を下回った月は3ヶ月連続にならなかったか
- [ ] Search Console のインデックス急減が起きていないか

3つすべて NO のときは、`docs/PLAN.md` の撤退基準に従って戦略を見直す。
