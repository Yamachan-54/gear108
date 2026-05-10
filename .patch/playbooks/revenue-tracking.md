# Playbook: revenue-tracking

> 月次の収益記録を作成する手順書。
> 月初（前月分の確定後）に Patch が手動 or 半自動で実行する。

## いつ実行する

- **毎月 5 日（前月の各 ASP の成果が確定する目安）**
- 週次レビュー（日曜23時）の中でも前月分があれば参照

## 入力

- `.patch/reports/revenue/_TEMPLATE.md`（雛形）
- 各 ASP 管理画面（人間が手動でログイン → 数値転記）
- Cloudflare Web Analytics（PV / 訪問者）
- Cloudflare Analytics Engine（クリック数。SQL で集計）

## 手順

### 1. テンプレを当月用にコピー

```bash
cp .patch/reports/revenue/_TEMPLATE.md .patch/reports/revenue/$(date +%Y-%m).md
```

### 2. 各 ASP の数値を転記

人間が以下を開いて、前月分の確定額を表に転記する：

- Amazonアソシエイト：<https://affiliate.amazon.co.jp/> → レポート → 期間で前月
- 楽天アフィリエイト：<https://affiliate.rakuten.co.jp/> → 成果レポート
- A8.net：<https://www.a8.net/> → 確定レポート
- もしもアフィリエイト：<https://af.moshimo.com/> → 成果報酬
- バリューコマース：<https://www.valuecommerce.ne.jp/> → 成果レポート
- Google AdSense：<https://www.google.com/adsense/>

### 3. Cloudflare Web Analytics の数値を転記

<https://dash.cloudflare.com/?to=/:account/web-analytics>

→ プロパティ "gear108" → 期間で前月 → PV / 訪問者 / Core Web Vitals を転記。

### 4. Cloudflare Analytics Engine でクリック集計

Dashboard → Workers & Pages → Analytics Engine → Query エディタで以下を実行：

- 前月のストア別クリック合計：`queries/clicks-by-store-month.sql` を編集して期間を前月に
- 前月の記事別クリック数：`queries/clicks-by-article-7days.sql` を編集して期間を前月に

結果を `.patch/reports/revenue/YYYY-MM.md` の表に転記。

### 5. 達成率の計算

`docs/PLAN.md` の月別計画と比較：

| 月 | 計画収益 | 計画累計記事 |
|----|---------|------------|
| 月1 | ¥0 | 20 |
| 月2-3 | ¥0〜3千 | 70 |
| 月4-6 | ¥1〜3万 | 130 |
| 月7-9 | ¥3〜5万 | 200 |
| 月10-12 | ¥7〜10万 | 260 |

達成率 = 実績 / 計画。

### 6. 所感を書く

Patch の口調で、**3〜5行で**：
- 何が良かったか
- 何が想定外だったか
- 来月の方針

### 7. 撤退基準のチェック

`docs/PLAN.md` から：
- 6ヶ月で月収1万円未到達 → SEO 戦略の根本見直し
- 3ヶ月連続で執筆ペースが週3本を下回る → 運用設計の修正
- ドメイン全体のインデックスが急減 → スパム判定の疑い、即時 AI 生成停止

該当があればチェックを入れ、対応案を所感に書く。

### 8. コミット

```bash
git add .patch/reports/revenue/
git commit -m "chore(revenue): YYYY-MM 月次収益記録"
git push
```

## 自動化の余地（Phase 3 以降）

- Amazon PA-API / 楽天 API は **報酬データの取得不可**。各社確定レポートは手動転記が必須
- A8.net / もしも / バリューコマースには **API 提供あり**（要申請）。将来的にスクリプト化可能
- Google AdSense は **AdSense Management API** で自動取得可能（要 OAuth2 設定）

## 失敗パターン

- ASP のレポート画面の UI 変更で「数値が前月分か当月分か」混乱する → スクショを残す
- 確定額と未確定額の混同 → 必ず「確定」のレポートのみ転記
- 通貨の混同 → 全部 JPY、為替計算は ASP 側に任せる
