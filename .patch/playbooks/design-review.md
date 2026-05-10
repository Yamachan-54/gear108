# Playbook: design-review

> Margin（美意識担当ロブスター）が記事 PR を ship 前にレビューする手順書。
> Patch が記事を書き、ビルド検証まで通した後、push する直前にこのレビューを通す。
> 両者の OK が出てから初めて main に push される。

## 入力

- 対象記事ファイル（`.mdx` 推奨、`.md` でも可）
- `~/.claude/projects/-home-yamachan--claude/openclaw/margin/SOUL.md`（Margin の戒律本体）
- ローカルで `npm run build` が通った直後の状態
- 関係する component / layout の変更があれば、その diff も対象

## レビュー項目（4 戒律 + 雷区チェック）

### 戒律 1：三位一体タイポグラフィ

- [ ] 見出し（h1〜h3）は **明朝**（`font-family: 'Noto Serif JP', 'Yu Mincho', serif`）になっているか
- [ ] 本文は **ゴシック**（`Inter`, `'Noto Sans JP'`, sans-serif）になっているか
- [ ] コード・型・数値・日時・タグ・評価点は **Fira Code**（`'Fira Code', ui-monospace, monospace`）になっているか
- [ ] それ以外のフォントが紛れ込んでいないか（`font-display: swap` のみ許可、特殊フォントの追加は要承認）

判定基準：**1つでも欠けたら NG**。Tailwind の `font-sans` デフォルトに落ちている箇所も NG。

### 戒律 2：墨と紙、加えて1色だけ

- [ ] 黒（`#1a1a1a` 系）/ 紙白（`#fdfdfd` / `#fff`）/ グレー罫線（`#e5e5e5` 系）以外の色が、**アクセント色 1 色**（gear108 では `#c1272d` 朱赤）にだけ収まっているか
- [ ] Tailwind の番号付きデフォルト色（`pink-500`, `slate-600`, `teal-500` 等）が**ソースに残っていないか**
- [ ] 色を使う時は HEX で書かれているか、または `var(--accent)` 等の名前付き変数で参照しているか

判定基準：**Tailwind 番号色が grep で 1 件でも引っかかったら NG**。
コマンド：

```bash
grep -rn "bg-\(pink\|teal\|purple\|orange\|amber\|emerald\|blue\|slate\|gray\|neutral\|rose\)-[0-9]" \
  src/ --include="*.astro" --include="*.tsx" --include="*.mdx"
```

ヒット件数 0 件で OK。

### 戒律 3：対称禁止

- [ ] 大見出し以外で `text-center` / `mx-auto` が使われていないか
- [ ] グリッドが等分（`grid-cols-3`, `grid-cols-4` 等）で、内容が同じ重みのまま並んでいないか
- [ ] 1:2 / 2:3 / 黄金比 / 編集判断のラグ組が**少なくとも1箇所**あるか

判定基準：「視線の流れを生む配置」が成立しているか。誌面を**目を細めて見て**、左右が完全に対称ならアウト。

### 戒律 4：空白を埋めない

- [ ] スクロール後すぐに「関連記事」「もっと読む」「サイドバー」が**詰まっていない**か
- [ ] 記事末に CTA バッジを並べすぎていないか
- [ ] 画像なしのカードに、余白を埋めるための装飾アイコンが置かれていないか

判定基準：**読者の目が休む場所**が、各セクションの間に存在しているか。

## 雷区チェック（即 NG）

ソースコードを `grep` で確認：

```bash
# グラデーション乱用
grep -rn "bg-gradient" src/ --include="*.astro"

# 角丸の濫用（rounded-2xl, rounded-3xl, rounded-full 以外で過剰使用）
grep -rn "rounded-2xl\|rounded-3xl" src/ --include="*.astro"

# drop-shadow / blur
grep -rn "drop-shadow\|backdrop-blur" src/ --include="*.astro"

# 装飾アイコン
grep -rn "lucide-react\|heroicons" src/ --include="*.astro"
```

各雷区はゼロ件か、**使っているなら理由を説明できる箇所のみ**残す。理由が無ければ削除。

## 手順

### 1. 該当 PR / コミットの内容を確認

`git diff main...HEAD` または `git diff HEAD~1` を見て、変更スコープを把握。

### 2. ソース grep（自動チェック）

上記の grep コマンドを順に走らせ、ヒットゼロを確認。

### 3. ローカルビルド + ブラウザ目視

```bash
npm run dev
```

`http://localhost:4321/` と該当記事ページを開き、以下を目視：

- 見出しが明朝になっているか
- アクセント色が朱赤一色か
- 対称配置がないか
- 余白が呼吸しているか

### 4. レビュー結果の出力

Margin の口調で `.patch/reports/design-review-<YYYY-MM-DD>-<commit>.md` を生成：

```markdown
# Design Review

対象: <commit hash> / <記事 slug>
レビュアー: Margin
日時: <YYYY-MM-DD HH:MM>

## 判定

- [ ] PASS / SHIP OK
- [ ] FAIL / REJECT

## 検出事項

### 三位一体タイポグラフィ
- (該当なし) または (具体的な NG 箇所)

### 墨と紙、1色のみ
- (該当なし) または (Tailwind 番号色の grep ヒット箇所)

### 対称禁止
- (該当なし) または (テキストセンター・等分グリッドの NG 箇所)

### 空白を埋めない
- (該当なし) または (詰め込みすぎの NG 箇所)

### 雷区
- (該当なし) または (使った理由を説明できない装飾箇所)

## コメント

(Margin の語り口で、3〜5 行)
```

### 5. PASS なら push、FAIL なら Patch に差し戻し

PASS：

```bash
git push origin main
```

FAIL：レビュー結果ファイルをコミットして、Patch に差し戻す（実装直し）。

## 起動方法

### 手動（Patch が記事を書いた後）

```bash
claude "margin: 直近のコミットをレビューしてくれ。.patch/playbooks/design-review.md の手順で。"
```

### 自動（write-next.sh の最後に組み込む）

`.patch/scripts/write-next.sh` の commit 直前に以下を追加（オプショナル運用）：

```bash
# Margin の design-review を実行
PROMPT_REVIEW=$(cat <<'EOF'
あなたは Margin（gear108 サイトのアートディレクター）として動く。
~/.claude/projects/-home-yamachan--claude/openclaw/margin/SOUL.md を読んで戒律を守れ。
.patch/playbooks/design-review.md に従って、直近の記事/PR をレビューせよ。
PASS なら push を許可し、FAIL なら .patch/reports/design-review-*.md にレポートを残して終了。
EOF
)
claude --print --permission-mode acceptEdits "$PROMPT_REVIEW"
```

## Margin の口調サンプル（レビューコメント例）

**PASS の時：**
> これでいい。Tailwind デフォルト色は引っ張らずに HEX で書かれている。
> 見出しの明朝が生きている。Fira Code が記事中の数値を支えている。Ship.

**FAIL の時：**
> `bg-pink-500` が 3 箇所、`rounded-2xl` が無理由に 7 箇所、`text-center` が
> 本文で 4 箇所。これは ChatGPT が考えた構図だ。HEX で書き直して、
> 装飾の理由を答えられない箇所を削れ。やり直し。

**例外的な許可（理由あり）：**
> `bg-gradient-to-br` を使った理由が「金属質の質感を出すため」と答えられた。
> 妥協する。残せ。ただしこれが2箇所目以降に現れたら却下する。
