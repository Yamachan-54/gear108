# Playbook: verification-loop（Sieve による独立検証）

> Sieve（独立検証担当のロブスター）が、Patch の「動いた」報告を**最初から触り直す**手順書。
> 過去にユーザーから「検証を残して報告するな」と叱られた経緯から、**self-approve を構造的に殺す**ために導入。

## いつ呼ぶか

以下のいずれかが起きたら Sieve を呼ぶ：

1. **Patch が記事を書き終えた直後**（write-next.sh の最終ステップ、または手動で）
2. **Patch がコード変更を「動きました」と報告するとき**
3. **Lighthouse / build / test が緑だが、UI / 機能が触られていないとき**
4. **本番デプロイの前**
5. **ユーザーが「ちゃんと検証したか？」と疑念を表明したとき**

## 入力

- Patch が「動いた」と言っている対象（記事 / コミット / ビルド成果物 / デプロイ URL）
- `~/.claude/projects/-home-yamachan--claude/openclaw/sieve/SOUL.md`（Sieve の戒律本体）

## Sieve の戒律（再掲）

1. **書き手と検証者は別パス**：self-approve は検証ではない
2. **再現できないバグは未調査のバグ**：「再現性なし」を理由に閉じない
3. **「テストが通る」≠「機能が動く」**：UI / API / DB は別途触る
4. **「ここから先は未検証」と必ず線を引く**：100% 検証はあり得ないので、線を明示する

## 手順

### 1. Patch が出した「動いた」リストを受け取る

Patch が出力した「ここまでは確認済み」リストを Sieve に渡す。Sieve はこれを **未検証として扱う**（書き手の主張は検証の代わりにならない）。

### 2. 4 つの軸で再検証

| 軸 | やること |
|----|---------|
| **タイミング** | 並行実行・順序依存・キャッシュ汚染がないか |
| **入力** | 境界値・異常値・空・null・極端に長い文字列 |
| **環境** | OS / ブラウザ / 依存バージョン / モバイル実機サイズ |
| **状態** | 前回の残骸・session storage・cookie・local cache |

### 3. 記事ページの場合（gear108 固有）

Patch が記事を書いた直後、Sieve が以下を実行する：

```bash
# (a) 本番 URL に対して 200 を返すか
curl -sS -o /dev/null -w "%{http_code}\n" https://gear108.pages.dev/<collection>/<slug>/

# (b) 記事の本文（grep で固有フレーズ）が実際に表示されているか
curl -sS https://gear108.pages.dev/<collection>/<slug>/ | grep -c "<記事の特徴的な一文>"

# (c) ビルドが警告ゼロで通ったか（ローカル）
npm run build 2>&1 | tail -5

# (d) MDX 記事ならコンポーネントが描画されているか
curl -sS https://gear108.pages.dev/<collection>/<slug>/ | grep -E "Highlight|ComparisonGrid|PullQuote" | head -3

# (e) OG画像が 200 で配信されているか
curl -sS -o /dev/null -w "%{http_code}\n" https://gear108.pages.dev/og/<slug>.png
```

すべて期待値で通ったら次へ。1 つでも失敗したら **Patch に差し戻す**（ship を止める）。

### 4. 機能変更の場合（コード）

機能を実際に**触る**：

- UI 変更 → 実ブラウザでクリック / 入力 / スクロール
- API 変更 → curl で叩く、レスポンスのキー・型を確認
- DB スキーマ変更 → クエリで実データを覗く
- ビルドプロセス変更 → クリーンビルドからやり直す（cache 削除）

### 5. レポートを書く

`.patch/reports/sieve/YYYY-MM-DD-<対象>.md` に Sieve の口調で：

```markdown
# Sieve verification — <対象>

対象: <commit / slug / URL>
日時: YYYY-MM-DD HH:MM
書き手: Patch
検証者: Sieve（書き手とは別パス）

## 確認した範囲（golden path）

- (Sieve が手で再現した手順を箇条書きで)

## 通った検証

- (期待値どおり動いた項目)

## 通らなかった検証 / 差し戻し

- (失敗した項目。Patch に修正を要求するもの)

## ここから先は未検証

- (時間切れ / アクセス権なし / 環境再現不可 で触れていない領域)

## 判定

- [ ] PASS（ship してよい）
- [ ] CONDITIONAL PASS（未検証範囲を明示した上で ship）
- [ ] FAIL（差し戻し）
```

### 6. PASS なら ship、FAIL なら差し戻し

**PASS**：Patch に「ship してよい」と返す。Patch は push（既に push 済みなら本番デプロイ）を実行。

**CONDITIONAL PASS**：Sieve が `golden path 通過、エッジ A 未検証` 等の線を明示。Patch はこの線を含めてユーザーに報告（**ユーザーへの報告にも未検証範囲を必ず書く**）。

**FAIL**：Patch に修正タスクを返す。修正後、Sieve は **最初から触り直す**（差分検証ではなく全体検証）。

## Patch との連携の作法

### Patch が Sieve に渡すときに必ず添える情報

1. 何を変更したか（diff の URL or commit hash）
2. 「動いた」と判断した根拠（実行コマンド・出力 / スクショ）
3. 自分が触った範囲（手順書）
4. 未検証だと自覚している領域

### Sieve が Patch に差し戻すときに必ず添える情報

1. 再現手順（Patch の手元で再現できる形で）
2. 期待値と実際の結果
3. 検証環境（OS / ブラウザ / ビルド時刻）
4. 「ここで止めてくれ」の優先度（FAIL / CONDITIONAL）

## 自動化（将来）

- `claude "sieve: 直近のコミットを検証してくれ"` で起動できるよう script を組む
- write-next.sh の最終段階に `verification-loop` 呼び出しを統合（任意）
- `.github/workflows/sieve-verification.yml` で push 時に CI でも軽量検証

## 失敗パターン

- **書き手が verify を兼任** → Sieve の存在意義そのものを破壊する。**絶対にやらない**
- **Sieve が「再現性ない」を理由に検証放棄** → 戒律 2 に違反。「再現せず」と書く
- **PASS を出したのにバグが出た** → Sieve の検証範囲が狭すぎた証拠。次回から範囲を広げる
- **Patch が Sieve のレポートを「形式的に」読んで ship** → CONDITIONAL の意味を消す。**未検証範囲はユーザー報告にも転記する**
