# Playbook: weekly-review

> 週に1回、Patch が過去7日の運用を振り返り、来週の方針を決める。

## 入力

- `.patch/reports/YYYY-MM-DD.md`（過去7日分）
- `.patch/queue/articles.yml`
- Search Console / GA4 のデータ（手動入力 or API、任意）

## 手順

### 1. 過去7日のレポートを読む

`.patch/reports/` から直近7日のファイルを読み込み、以下を集計：

- 公開した記事数（collection 別、category 別）
- 更新した記事数
- 失敗・スキップ件数
- ビルド失敗 / push 失敗の件数

### 2. 数値の評価

`.patch/config.yml` の writing.schedule_cron は週5本想定。
実績がそれを下回っていたら原因を特定する：

- キュー枯渇 → `articles.yml` の補充を提案
- 連続ビルド失敗 → 原因を調査して修正計画を立てる
- リサーチで情報が取れない → 記事タイプの見直し

### 3. 来週のキュー優先順位調整

`articles.yml` の status: pending を見て、来週書くべき5本を選定：

- セールカレンダー連動（あれば最優先）
- カテゴリの偏り是正（同じカテゴリに偏らせない）
- 検索需要の高そうなトピックを上に

並び替えた結果を `articles.yml` に反映。

### 4. 週次レポート生成

`.patch/reports/weekly-YYYY-WW.md` を作成：

```markdown
# 週次レビュー 2026-W19

## 数値サマリ

| 項目 | 計画 | 実績 | 達成率 |
|------|------|------|--------|
| 新規記事 | 5 | 5 | 100% |
| 更新記事 | 1 | 1 | 100% |
| ビルド失敗 | 0 | 0 | — |

## 公開した記事

- (リスト)

## 問題と対応

- (あれば箇条書き)

## 来週の方針

- (来週の重点トピック・優先記事)

## 数値（手入力 / 任意）

- 累計記事数: <N>
- 月間PV（GA4）: <N>
- アフィ報酬（Amazon）: <yen>
- アフィ報酬（楽天）: <yen>
- AdSense: <yen>
- 合計: <yen>
```

### 5. Rudder へのハンドオフ（必須）

来週の picks ブロックを並べ替えたら、**そのまま Rudder の `prioritize-queue` を呼ぶ**：

- 入力: 並べ替え直後の `articles.yml` + 当週レポート
- 期待される出力:
  - 並行 2 本ルール / 週 3-5 本ルール の照合
  - 「来週やらないこと 3 つ」の宣言
  - 3 週超 pending の凍結判断

Rudder の OK が出るまで commit しない。詳細：`.patch/playbooks/prioritize-queue.md`

### 6. コミット

```bash
git add .patch/reports/weekly-* .patch/queue/articles.yml
git commit -m "chore(patch): 週次レビュー <YYYY-WW> + Rudder 点検"
git push origin main
```

### 7. 異常時の通知

達成率が 50% を下回るか、ビルド失敗が3件を超えていたら、`config.yml` の通知先に警告を送る。
