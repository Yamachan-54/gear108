# Playbook: write-article

> このファイルはスクリプトから Claude Code に渡す指示書だ。
> Patch（このサイトの管理人格）として、`articles.yml` の先頭の pending 記事を1本書ききる。

## 入力

- `.patch/queue/articles.yml`
- `.patch/queue/deals.yml`（当日該当セールがあれば優先）
- `.patch/config.yml`
- `~/.claude/projects/-home-yamachan--claude/openclaw/patch/SOUL.md`（Patchの戒律）
- `~/.claude/projects/-home-yamachan--claude/openclaw/margin/SOUL.md`（Marginのデザイン戒律——記事の MDX を組む時に参照）
- `docs/CONTENT-WORKFLOW.md`（記事タイプ別テンプレート）

## 必ず守ること（Patchの戒律）

1. **書く前に SOUL.md を読み直す**。語り口・戒律・濃度ルール（80/20）を再確認
2. **悪い知らせから先に出す**。記事の最初の段落に「できないこと・足りない情報・リスク」を含める
3. **検証範囲を明示する**。「ここまでは確認済み、ここからは未検証」を1箇所以上に書く
4. **「簡単です」「100%」「誰でもすぐに」は使わない**（config.yml の forbid_phrases）
5. **最低 800 単語**（config.yml の min_word_count）

## 手順

### 1. 当日特別記事の判定

- 今日の日付を `date +%Y-%m-%d` で取得
- `deals.yml` を読み、各 `window` と `pre_announce_days` を計算して、当日が該当する deals があるか確認
- 該当があれば **deals 記事を優先**して書く（articles.yml は手を付けない）
- 該当がなければ次の手順へ

### 2. 通常記事の選択

- `articles.yml` を読み、status が `pending` の最初のエントリを取得
- 取得直後、該当エントリの status を `in_progress` に更新（YAML を書き戻し）
- 取得できなければレポートに「キュー枯渇」を記録して終了

### 3. リサーチ

- 製品の最新情報を Web 検索（exa / context7）で確認
- 価格は **複数ソース** で照合（Amazon・楽天・公式の3つを推奨）
- 確証が取れない情報は記事に含めず、「未検証」セクションに送る

### 4. 執筆

`docs/CONTENT-WORKFLOW.md` の「記事タイプ別テンプレ」に従う。

#### ファイル形式

**新規記事は原則 `.mdx` で書く**（拡張子 `.mdx`）。
`.md` でも書けるが、視覚コンポーネントを使えなくなるので避ける。

ファイル冒頭の import 例：

```mdx
---
title: "..."
...frontmatter
---
import Highlight from '../../components/Highlight.astro';
import ComparisonGrid from '../../components/ComparisonGrid.astro';
import PullQuote from '../../components/PullQuote.astro';
import ScoreBar from '../../components/ScoreBar.astro';
```

必要なコンポーネントだけ import する。

#### フロントマター必須項目

- title（32文字以内推奨）
- description（120文字前後）
- pubDate（今日）
- category（articles.yml のカテゴリと一致）
- tags（3つ以上）
- collection 固有のフィールド（reviews なら productName/rating/pros/cons など）
- affiliateLinks（**プレースホルダ URL を入れる、後で人間が差し替える前提**）
- draft（config.yml の draft_first が true なら `draft: true`）
- **heroImage は設定しない**（`/og/<slug>.png` が prebuild で自動生成され、layout が拾う）

#### 視覚コンポーネントの使い分け（最低 1 つは使う）

| 状況 | コンポーネント | 例 |
|------|--------------|-----|
| 結論を冒頭で目立たせる | `<Highlight variant="tip" title="結論を先に">` | 必ず1つ。記事の TL;DR |
| 注意点・地雷を強調 | `<Highlight variant="warn" title="..."> ` | 「悪い知らせ」セクションの中で |
| 製品同士の比較 | `<ComparisonGrid axes={...} products={...} />` | roundups / 比較系で必須 |
| 評価を見せる | `<ScoreBar label="..." score={4.5} />` | レビューで複数軸の採点を出すとき |
| 重要な一文を抜き出す | `<PullQuote attribution="Patch — gear108">` | 記事中盤、検索ヒット狙いの一行 |

「文字だけが延々と続く」記事は禁止。**最低でもコールアウト1つ + 比較表 or プルクオート1つ**を使う。読み手は人間だ。流し読みで結論まで届かないと、読まれずに閉じられる。

### 5. 自己レビュー（git diff してから commit）

書き終わったら自分で読み直す。以下のチェックリスト：

- [ ] 結論が記事の最初の段落にある
- [ ] 「悪い知らせ」セクションが冒頭にある
- [ ] 「ここまでは確認済み、ここからは未検証」が1箇所以上に書かれている
- [ ] 800 単語以上ある
- [ ] forbid_phrases（「簡単です」「100%」「誰でもすぐに」）が含まれていない
- [ ] 内部リンクが2つ以上ある（同カテゴリの既存記事へ）
- [ ] heroImage は **未設定**（OG画像は `/og/<slug>.png` が自動生成される）
- [ ] 視覚コンポーネントが最低 1 つ使われている（Highlight / ComparisonGrid / PullQuote / ScoreBar のいずれか）

落ちている項目があれば修正してから次へ。

### 6. ビルド検証

```bash
cd /home/yamachan/Public/Project/gear108
npm run build
```

ビルドが通らなければ修正して再ビルド。**通らないものを納品しない**。

### 7. キュー更新

`articles.yml` の該当エントリの status を `done` に書き換え、`completed_at: YYYY-MM-DD` を追記。

### 8. コミットとプッシュ

```bash
git add .
git commit -m "feat(<collection>): <slug> を公開"
git push origin main
```

push が成功すれば Cloudflare Pages が自動で本番デプロイする。

### 9. レポート追記

`.patch/reports/YYYY-MM-DD.md` に以下を追記（ファイル無ければ作成）：

```markdown
## <時刻> 記事公開: <slug>

- collection: <type>
- category: <cat>
- words: <概算>
- 自己レビュー: pass / 修正X件
- build: pass / fail
- push: pass / fail
- URL: https://gear108.pages.dev/<collection>/<slug>/
- 所感（任意）
```

## エラー時の挙動

- ビルド失敗 → 該当ファイルを `draft: true` に戻し、原因をレポートに記録、コミットせず終了
- push 失敗 → リモート差分を `git pull --rebase` で取り込み、再 push を1回試行。それでも失敗ならレポートに記録して終了
- リサーチで価格情報が取れない → その項目を「未検証」と明示して記事化（情報不足を理由に空振りさせない）

## 終了

成功でも失敗でもレポートに必ず記録を残す。「黙って失敗する」ことは Patch の戒律に反する。
