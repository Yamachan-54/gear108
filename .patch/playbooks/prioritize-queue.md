# Playbook: prioritize-queue（Rudder の戒律で週次キューを点検）

> このファイルは Rudder（工程管理担当ロブスター）の運用配線。
> 週頭または weekly-review の直後に呼ばれ、`articles.yml` の W◯ picks ブロックを Rudder のレンズで点検する。
> Rudder の SOUL.md：`~/.claude/projects/-home-yamachan--claude/openclaw/rudder/SOUL.md`

## 役割

Rudder は司令塔だ。書き手（Patch）が同時に何本も走らせて全部中途半端で終わるのを防ぐ。
Rudder の口癖：「**同時並行は最大 2 本まで**」「**今夜やらないことを 3 つ決めろ**」。

## いつ呼ばれるか

| トリガ | 入力 | 出力 |
|--------|------|------|
| 週頭（月曜朝） | 直近の weekly-review + articles.yml | 並び順点検 + 「やらないこと 3 つ」宣言 |
| weekly-review の最後 | 当週の数値サマリ | 来週の picks ブロックの工程レビュー |
| キュー枯渇時 | articles.yml の状態 | 補充 or 撤退の判断 |

## 入力

- `.patch/queue/articles.yml`（W◯ picks ブロック）
- `.patch/reports/weekly-YYYY-Www.md`（直近）
- `.patch/reports/YYYY-MM-DD.md`（直近 3 日）
- `~/.claude/projects/-home-yamachan--claude/openclaw/rudder/SOUL.md`（戒律）

## Rudder の戒律（この playbook で必ず適用するもの）

1. **同時並行は最大 2 本まで** — `status: in_progress` のエントリ数 + 当日着手予定が 2 を超えたら、超えた分を `priority: low` に戻すか翌週に送る
2. **今夜やらないことを 3 つ決める** — 必ず 3 つ宣言する。やらないことを決めずに着手すると、全部が中途半端になる
3. **凍結 / 廃棄を恐れない** — 3 週連続で着手されない pending は `status: archived` に落とす（後で `unarchive` 可能）
4. **「忙しい」は工程の失敗** — 1 週で 5 本以上 pending を抱えるのは、選定が甘い証拠。3 本に減らす

## 手順

### 1. 状態の把握

```bash
cd /home/yamachan/Public/Project/gear108
date +%Y-%m-%d
```

`articles.yml` から以下を抽出して頭の中に並べる：

- `status: in_progress` の数（**N_IP**）
- 当週の picks ブロックの本数（**N_PICK**）
- 3 週前から残っている pending の slug 一覧（**STALE**）

### 2. 戒律の照合

| 戒律 | チェック | 違反時の処置 |
|------|---------|-------------|
| 並行 2 本まで | `N_IP <= 2` | 超過分を pending に戻す |
| 週 3 本に絞る | `N_PICK <= 3`（理想）/ `<= 5`（許容上限） | 6 本以上なら下位を翌週へ |
| 3 週放置 = 凍結 | `STALE` が空 | 3 週超えは `status: archived` |
| やらないこと宣言 | 必ず 3 つ書く | 書けなければ着手禁止 |

### 3. 並び替えと宣言の出力

`.patch/reports/YYYY-MM-DD.md` に以下を追記する：

```markdown
## <時刻> Rudder: 週次キュー点検

### 在庫
- in_progress: <N_IP> 本（slug: <list>）
- W◯ picks: <N_PICK> 本
- 3 週超 pending: <STALE>

### 戒律照合
- 並行 2 本ルール: <pass / 違反 → 処置>
- 週 3 本ルール: <pass / 警告 / 違反>
- 凍結対象: <slug 一覧 / なし>

### Rudder の宣言「今週やらないこと 3 つ」

1. **やらない①**：<具体的な作業名> — 理由：<根拠>
2. **やらない②**：<具体的な作業名> — 理由：<根拠>
3. **やらない③**：<具体的な作業名> — 理由：<根拠>

### 並び替えの結果

`articles.yml` の W◯ picks ブロックを以下の順に修正：

1. <slug>（理由: ...）
2. <slug>（理由: ...）
3. <slug>（理由: ...）

繰越 / 凍結：
- <slug> → W◯+1 へ繰越
- <slug> → archived（理由: 3 週放置）
```

### 4. articles.yml の書き換え

並び順を確定したら、`articles.yml` の picks ブロックの順序を書き直す。
凍結対象は `status: archived` + `archived_at: YYYY-MM-DD` を追記する（削除はしない）。

### 5. コミット

```bash
git add .patch/queue/articles.yml .patch/reports/YYYY-MM-DD.md
git commit -m "chore(queue): Rudder の週次点検 — 並び替え + 凍結 + やらないこと 3 つ"
git push origin main
```

## 終了条件（Rudder が「OK」と言える状態）

- `status: in_progress` が **2 本以下**
- 当週 picks が **3〜5 本**
- 3 週超 pending が **0 件**（archived に落とすか着手）
- 「今週やらないこと 3 つ」が当日のレポートに**書かれている**

このうち 1 つでも欠けたら Rudder は「未完」と言う。書き手（Patch）に投げ返す。

## エラー時の挙動

- articles.yml が壊れていた → 直近のコミットから復元、原因調査
- 「やらないこと 3 つ」が書けない → **書き手の判断材料が足りない**証拠。weekly-review に戻って数値を見直す
- 在庫が 0（picks 空）→ Beacon の `validate-demand` を呼んで補充候補を出す

## 終了

レポートに必ず以下を残す：
- ✅ Rudder 点検 完了（または ⚠️ 未完 + 理由）
- 並行本数 / 週 picks 本数 / 凍結件数の確定値

「黙って通す」「読まずに次に行く」は Rudder の戒律に反する。
