# Playbook: validate-demand（Beacon の戒律で記事の市場検証）

> このファイルは Beacon（市場検証担当ロブスター）の運用配線。
> `write-article` の Step 2（pending 取得）と Step 3（リサーチ）の**間**に挿される。
> Beacon の SOUL.md：`~/.claude/projects/-home-yamachan--claude/openclaw/beacon/SOUL.md`

## 役割

Beacon は「作る前に売れるか確かめろ」と言う婆さんだ。
書き手（Patch）が「これ便利だから記事になるはず」と書き始めるのを止め、**市場の声を先に聞く**。

## いつ呼ばれるか

| トリガ | 入力 | 出力 |
|--------|------|------|
| `write-article` Step 2 直後 | 当日 pick の slug / topic / product | Go / No-Go / 修正 |
| weekly-review の前段 | W◯ picks 5 本 | 各 slug に検証メモ |
| 新規 slug の追加時 | articles.yml に追記する候補 | 追記の可否 |

## 入力

- `.patch/queue/articles.yml` の対象エントリ（slug / topic / product / category）
- `~/.claude/projects/-home-yamachan--claude/openclaw/beacon/SOUL.md`（戒律）

## Beacon の戒律（この playbook で必ず適用するもの）

1. **自分の頭で需要を作るな** — 「俺が欲しいから書く」は仮説。市場で確認するまで結論にしない
2. **検索意図 ≠ キーワード** — 同じキーワードでも初心者・運用者・管理職で意図が違う。**どの意図に書くか**を明示する
3. **競合が居ない市場は二種類** — (a) 金鉱、(b) 墓場。**死骸を見ずに飛び込まない**
4. **LP の文章を先に書け** — 書けないものは作るな（記事も同じ。**冒頭 200 字を先に書いて、書けなかったら没**）

## 手順

### 1. 検索意図の特定

`articles.yml` から topic を読み、以下を 1 行で書く：

> 「この記事は **[誰]** が **[いつ]** **[何のために]** 検索したときに刺さる」

例：
- 「**Mac から Windows に乗り換える在宅エンジニア** が **新しい PC を発注する前夜** に **キーボード選定の根拠** を探して検索したときに刺さる」

書けなかったら **No-Go**。記事の対象が曖昧。

### 2. 数字の側（検索ボリューム / トレンド）

WebFetch / WebSearch で以下を確認（exa MCP 使用可）：

- Google Trends の上昇 / 横ばい / 下落
- 検索ボリューム（ahrefs / ubersuggest が無ければ、Trends の絶対値で代替）
- 競合上位 5 件の URL
- 公式情報（製品レビューなら、メーカーの仕様ページ / 価格）

数字を `.patch/reports/beacon/<slug>.md` に保存：

```markdown
# Beacon 検証: <slug>

## 数字
- Trends: 上昇 / 横ばい / 下落
- 競合上位: <URL リスト 5 件>
- 公式: <URL>

## 一次情報
- SNS の生の声 3 件以上（X / Reddit / 5ch / Q&A）：
  - 「...」（出典）
  - 「...」（出典）
  - 「...」（出典）
- 競合の星 1 レビュー（不満点）：
  - 「...」
- 競合の星 5 レビュー（決め手）：
  - 「...」
```

### 3. 一次情報の側（SNS / Q&A）

数字だけでは判断しない。**生の声を 3 件以上**読む：

- X 検索で `<product> 買って後悔` / `<product> 比較` / `<product> 不満`
- Reddit / 5ch / 価格.com / Amazon レビューの**星 1 と星 5 の両方**
- Q&A サイト（Yahoo 知恵袋 / Quora / Stack Overflow / teratail）の繰り返される質問

### 4. 冒頭 200 字を先に書く

検証メモを基に、記事の**冒頭 200 字だけ**先に書いてみる：

- 検索者の悩みを冒頭で言い当てているか
- 「悪い知らせ」（できないこと / 限界）を 200 字内に入れられるか
- ありきたりな書き出しになっていないか（「皆さん、こんにちは」「最近話題の〜」は禁止）

書けなかったら **No-Go**。書けたら、それを記事の Hook として使う。

### 5. Go / No-Go 判定

`.patch/reports/beacon/<slug>.md` の末尾に判定を書く：

```markdown
## 判定

- 検索意図の特定: pass / fail
- 数字: <Trends 状況>
- 一次情報: <件数> 件
- 冒頭 200 字: 書けた / 書けなかった

### Beacon の判定: **Go / No-Go / 修正**

- Go の場合: write-article に進んで良い
- No-Go の場合: 該当 slug を `status: skipped` にし、archives ディレクトリに移動 or 削除
- 修正の場合: topic を書き直して再検証

理由（一文）：「...」
```

### 6. articles.yml への反映

判定が **No-Go** なら：

```yaml
- slug: <slug>
  ...
  status: skipped
  skipped_at: YYYY-MM-DD
  skipped_reason: "Beacon No-Go: <一文>"
```

判定が **修正** なら、topic を書き直して再キュー。

### 7. 終了

`.patch/reports/YYYY-MM-DD.md` に追記：

```markdown
## <時刻> Beacon 検証: <slug>

- 検索意図: <一文>
- Trends: <状況>
- 一次情報: <件数> 件
- 判定: **Go / No-Go / 修正**
- 詳細: .patch/reports/beacon/<slug>.md

- ✅ Beacon 検証 完了
```

## エラー時の挙動

- WebSearch が空振り → 検索クエリを 3 通り変えて再試行。それでもゼロなら「市場が薄い」と判定
- 一次情報が 1 件しか集まらない → **数字 + 1 件は危険**。No-Go か修正
- 競合が 0 件 → **金鉱 or 墓場**。撤退した競合の死骸（古いブログ / 放棄ドメイン）を必ず探す。見つからなければ修正

## 終了条件（Beacon が「Go」と言える状態）

- 検索意図が 1 行で書けた
- Trends で上昇 or 横ばい
- 一次情報が 3 件以上
- 競合の星 1 / 星 5 の両方を読んだ
- 冒頭 200 字が書けた

5 つ全て pass で **Go**。1 つでも欠けたら **修正 or No-Go**。

## 連携

- **write-article**: Beacon が Go を出すまで Step 3（リサーチ）に進めない
- **prioritize-queue**: Rudder が picks を選ぶ前に、各候補の Beacon メモがあるか確認する
- **weekly-review**: 当週公開した記事の Beacon メモを引き、検証の精度を振り返る
