# 週次レビュー 2026-W20（中間レビュー）

> 集計対象: 2026-05-07 〜 2026-05-13（直近 7 日 / W19 末尾木金土日 + W20 前半月火水）
> 作成: 2026-05-13（W20 水曜時点、3 日経過）/ 作成者: Patch
> 性質: **中間レビュー**。W20 は 2026-05-17（日）まで継続中。W20 終端版は 5/17 か W21 月曜に上書きする想定

## 悪い知らせから先に出す

1. **本レビュー作成中に YAML 競合が実害化した**── 2026-05-13 21:05:41 に systemd timer から **write-next.sh と weekly-review.sh が並列起動**した。両方の claude プロセスが同じ `articles.yml` を編集し、お互いの変更を上書きする状況になった。W19 で問題 #7 として残してあった「flock 排他なし」が**今回は事故に発展**。具体的には、私（weekly-review 側）が W21 picks ブロックを追加した直後に write-next 側が元の状態を書き戻し、互いの編集が消えた。本レポートの「最終的な articles.yml の状態」は、write-next の完走を待ってから記録する（包帯はここに巻く）。

2. **運用ポリシーが W20 中で変わった**── 自動投稿スケジュールが「毎日 1 件」から「週 1 件（金 21:00 JST）」に変更された（commit `5d24166`、2026-05-12）。playbook の `weekly-review.md` は依然「週 5 本想定」と書かれており、**playbook と実運用の数字が一致していない**。今回は実績ベースで評価するが、playbook の改訂が要る。**ただし問題 1 を見るに、週 1 自動 + 週次レビューの同時刻起動（共に 21:05）は構造的に競合する**── 起動時刻のずらしも改善案に入れるべき。

3. **アフィリエイト ASP 申請は W20 でも未着手**。W19 で「あとは ASP 申請という非エンジニアリング作業 1 個に縮約」と書いたが、人間タスクは 1 ミリも動いていない。配管はある、水はまだ出ていない。

4. **m4-macbook-air-vs-mac-mini の最終状態は本レポート時点で不確定**。21:03 に Beacon Go 検証通過、21:09 〜 21:12 に `.mdx` 本体が生成された（ファイル実体は確認済み / 18,765 bytes）。が、`articles.yml` のステータスが write-next と私の編集の競合で `pending` ⇔ `done` を往復している。**最終状態は write-next の完走後に確定する**── 本レポートでは「実体としては done、articles.yml 上は確定待ち」と線を引く。

5. **articles.yml の通常 pending エントリに `added_at` がない**。Rudder 戒律 3「3 週放置は凍結」を適用したいが、判定材料がない。今は初期登録から 4 日しか経っていないので実害ゼロだが、来週以降運用するなら `added_at` フィールドを足すべき。**今回は凍結対象 0 と判定するが、これは「経過日数が分からないため判定不能 → 暫定で凍結なし」の意味であり、確認済みではない**。線を引く。

線引き:
- **確認済み**: 日報 5 本（2026-05-09 / 10 / 11 / 12 / 13） / git log W19 末〜W20 前半全 commit / articles.yml 現行 / src/content/ 実体 / Beacon 検証 3 本
- **未検証（W20 中間時点で数値未確定）**: 本番 PV / Search Console インプレッション・CTR / アフィクリック実数 / 各 pending の「いつから残っているか」

## 数値サマリ

| 項目 | 計画（直近 7 日換算）| 実績 | 達成率 | 備考 |
|------|------|------|--------|------|
| 新規記事公開 | 5（旧週次運用ベース）/ 1（新週1本ベース）| **6**（W19末2本 + W20前半4本、m4 ファイル実体含む）| 120% | 後述の内訳参照、m4 は articles.yml 確定待ち |
| W20 picks 5 本の進捗 | 5 本完了（理想）| 4 done（実体）/ 1 pending（cherry-mx）| 80%（実体ベース）| W20 は 3 日経過時点でペース前倒し |
| 更新記事 | 0（直近 30 日で 90 日超ゼロ）| 0 | — | 計画通り。最古は flexispot-e7（pubDate 2026-05-04 / 経過 9 日）|
| ビルド失敗 | 0 | 0 | — | 全 push pass |
| push 失敗 | 0 | 0 | — | W19 の 05-09 ハーネス弾きは W20 で再発なし |
| Lighthouse 全カテゴリ 80+ | 維持 | 維持 | — | W19 で達成、回帰なし |
| Beacon 検証通過 | — | 3/4（dell / aeron / m4）+ 1 件（4k-roundup は notes 経由）| — | Beacon Go ログは `.patch/reports/beacon/` に保存 |
| Discord 通知配線 | 任意 | **配線完了**（commit `c3c1334` / `ff1b5b9`）| — | main 公開時に Patch 口調で通知 |

達成率は閾値割れ無し。`notifications.log_only: true` は維持。

## 直近 7 日に公開した記事（時系列）

**W19 末尾枠（2026-05-09 / 金曜）**:

- `roundups/realforce-r3-vs-hhkb-pro-hybrid.mdx`（keyboard, high）— W19 で計上済
- `guides/new-engineer-gear-2026.mdx`（pc, high, 7,230 字、内部リンク 7 本）— W19 で計上済

**W20 picks（2026-05-11 〜 2026-05-13、3 日で 3 本）**:

- `reviews/dell-u2725qe-review.mdx`（monitor, high, 7,400 字）— 2026-05-11 月曜
  - Beacon 検証で **「USB-C 90W」→「Thunderbolt 4 + 140W EPR」に訂正**（90W は旧型 U2723QE の数字）
  - PR #5 / mergeCommit `0f26a10`
- `roundups/4k-27-inch-best-2026.mdx`（monitor, high）— 2026-05-12 火曜
  - dell-u2725qe-review と内部リンクで束ねる、7 機種ロールアップ、用途別早見表
  - PR #6 / commit `5619f4e`
- `roundups/aeron-vs-okamura-contessa.mdx`（desk, high, 6,580 字）— 2026-05-12 火曜（水曜枠を前倒し）
  - Beacon Go、4 軸構成（姿勢 / 体型 / 保証 / 座面）、中古地雷 3 つ明示
  - PR #16 → PR #17 / mergeCommit `423f47f`

**実体は生成済み・articles.yml 確定待ち**:

- `roundups/m4-macbook-air-vs-mac-mini.mdx`（pc, high）— 2026-05-13 21:09〜21:12 に並列 write-next で生成完走（18,765 bytes、frontmatter / 4 軸構成 / ComparisonGrid 等を含む完成形）
  - Beacon レポート: `.patch/reports/beacon/m4-macbook-air-vs-mac-mini.md`
  - articles.yml の status は、weekly-review との並列編集で `pending` ⇔ `done` を往復中。write-next 完走後に最終確定

## W20 で動いたインフラ・配線

W20 前半（5/11〜5/13）の commit を抜粋する：

| commit | 日付 | 領域 | 内容 |
|---|---|---|---|
| `66b9eda` | 5/11 | ci | dev ブランチを CI 対象に追加 + release playbook |
| `c20ad9a` | 5/11 | ci/deploy | GitHub Actions から Cloudflare Pages 自動デプロイ |
| `f914597` | 5/11 | playbooks | **Rudder と Beacon の運用配線**（prioritize-queue / validate-demand） |
| `977c817` | 5/12 | automation | 毎日 1 件の自動投稿を systemd user timer で配線 |
| `5d24166` | 5/12 | automation | **自動投稿を週 1（金 21:00 JST）に変更** |
| `c3c1334` | 5/12 | notify | main 公開時に Discord に Patch ペルソナで通知 |
| `ff1b5b9` | 5/12 | notify | workflow_dispatch で手動テストできるよう拡張 |

**最重要**：`5d24166` の **「週 1 本運用への変更」** は今後の数値評価軸を変える。playbook 旧基準（週 5 本）で評価すると常に過剰達成 or 過剰不足が出る。**新基準（週 1 本）に揃えるか、playbook を改訂する**こと。

## 問題と対応（W19 引き継ぎ + W20 新規）

| # | 問題 | W19 終了時 | W20 中間時点 |
|---|------|------|------|
| 1 | systemd / cron が未配線、write-next.sh が手動 | 未対応 | **対応**（commit `977c817` → `5d24166` で週 1 運用に着地）|
| 2 | Cloudflare Pages 接続 / カスタムドメイン未配線 | 解消 | 維持 |
| 3 | ASP 申請未済 | 半分対応 | **未対応のまま**。配管完成、人間アクション 0 |
| 4 | health-check の `openssl` 不在 | 未対応 | 未確認（health log を見ていない、Sieve 戒律により断定しない）|
| 5 | GA4 / Search Console 連携 | 半分対応（Cloudflare WA + SC API スクリプト）| 維持。データ蓄積待ち |
| 6 | 00:48 に複数ハーネス同時起動 | 軽微・未対応 | **21:05:41 に再発**（5/13）。flock 排他の必要性が確定 |
| 7 | YAML 同時書き込み懸念 | 未対応 | **実害発生**（後述）。flock 排他または起動時刻ずらしが必須化 |
| 8 | 自己レビューだけで「動いた」と報告するクセ | 対応（Sieve 配線）| 維持。本レビューでも Sieve 戒律を発動して未検証領域を明示 |
| **9 新規** | playbook の「週 5 本想定」と実運用「週 1 本」の乖離 | — | **未対応**。`weekly-review.md` / `prioritize-queue.md` 改訂候補 |
| **10 新規** | articles.yml に `added_at` フィールドがない | — | **未対応**。Rudder 戒律「3 週放置は凍結」の判定が不能 |
| **11 新規** | YAML 並列編集で write-next と weekly-review がお互いを上書き | — | **実害化**（5/13 21:11〜）。write-next 完走を待ってから最終編集する応急対応。恒久対応案 3 つを本日報に記録 |

問題 1 が落ちたのが W20 最大の収穫。問題 3 はゼロ動。問題 6 / 7 / 11 は構造的競合として **W21 で恒久対応が必要**。

## Rudder 点検（playbook 第 5 項のハンドオフ）

### 在庫（write-next 完走後の暫定値）
- `in_progress`: **0 本**
- W20 picks: **5 本**（4 done 実体 / 1 pending = cherry-mx）
- W21 picks（私の判定）: 4 本（cherry-mx 繰越 + ergotron-lx / usb-c-hub / thinkpad を normal → high 昇格）
- 3 週超 pending: **判定不能**（`added_at` 無し）。articles.yml の初期コミット（2026-05-09 / `aeb411c`）から 4 日経過のため、暫定で **0 件**とする

### 戒律照合
- 並行 2 本ルール（`N_IP <= 2`）: **pass**（0 本）
- 週 3〜5 本ルール: **pass**（W21 picks 4 本、systemd 週 1 自動 + 手動 3 本の構造に合わせた数）
- 凍結対象: **0 件**（判定不能の留保つき）
- 「やらないこと 3 つ」: 本レポートで宣言（下記）

### Rudder の宣言「W21 でやらないこと 3 つ」

1. **やらない①**: `news` 系 3 本（hhkb-studio-2-rumor / m5-mac-mini-rumor / oled-monitor-engineer-2026）
   理由: 噂記事は鮮度が落ちると即陳腐化、Beacon 戒律「検索意図 ≠ キーワード」で需要が薄いと判定。**手元のサイトが SEO で勝ちにいくべき主戦場ではない**。1 本書くコスト > 期待リターン
2. **やらない②**: `split-keyboard-best-2026`（low priority）
   理由: Moonlander / Glove80 / ZSA Voyager は実機調査コストが極端に高く、Beacon の一次情報基準を満たしにくい。Cherry MX 比較ガイドを先に通すべき。**「全部書く」は計画ではなく願望**（Rudder 戒律 2）
3. **やらない③**: `low` priority 全般（nas-vs-cloud-backup / ups-cyberpower-vs-apc）
   理由: 期限のないタスクは Rudder 戒律 3 で「墓場行き」。W22 以降に再評価。**今 W21 で着手しないことを明示することで、W22 のキューが軽くなる**

## 来週の方針（W21: 2026-05-18 月 〜 2026-05-24 日）

**最優先（人間アクション、W19 から継続）**:

1. ASP 3 社（Amazon アソシエイト / 楽天アフィリエイト / もしもアフィリエイト）の申請
2. `pacman -S openssl` で TLS check 復活
3. （任意）articles.yml に `added_at` フィールドを追加する運用を開始

**書く順番（W21、月→木の 4 本、金曜は systemd 週 1 自動枠）**:

| 曜日 | slug | collection | category | status | 理由 |
|------|------|------------|----------|--------|------|
| 月 (5/18) | `cherry-mx-axis-comparison-2026` | guides | keyboard | pending 繰越 | W20-Fri 予定だったが、systemd 週 1 運用に切替で手動枠へ。realforce / hhkb-studio との内部リンクハブ |
| 火 (5/19) | `monitor-arm-ergotron-lx-review` | reviews | desk | normal → high 昇格 | flexispot-e7 / aeron-vs-contessa と束ねる。desk カテゴリの実機レビュー厚み |
| 水 (5/20) | `usb-c-hub-engineer-best` | roundups | peripheral | normal → high 昇格 | peripheral カテゴリ初投入。dell-u2725qe / m4-mac-mini と内部リンクで束ねる |
| 木 (5/21) | `thinkpad-x1-carbon-gen13-review` | reviews | pc | normal → high 昇格 | m4-macbook-air-vs-mac-mini / m4-mac-mini-dev-machine の Apple 系と Linux/WSL 軸で対比 |

カテゴリ分布: keyboard(1) / desk(1) / peripheral(1) / pc(1) ── **完全分散**。collection 分布: guides(1) / reviews(2) / roundups(1)。
**金曜枠は意図的に空け、systemd 週 1 自動投稿（金 21:00 JST）に渡す**。手動 4 本 + 自動 1 本の混在運用を試す週にする。

**W21 で恒久対応すべき構造課題（問題 #6 / #7 / #11 統合）**:

並列起動時の YAML 競合を解消する。3 案のうちどれを採るかは人間の判断：

1. `systemd timer の起動時刻ずらし`: write-next を金 21:00、weekly-review を金 21:30（または別曜日）に
2. `flock 排他`: 各スクリプトに `flock -n .patch/queue/articles.yml.lock` を入れる
3. `責任分割`: write-next 側だけが articles.yml を書き、weekly-review 側は読み取り専用 + W21 picks を別ファイル（例: `picks.W21.yml`）に出力。月曜の最初の write-next が picks ファイルを取り込む

私の推奨は **3（責任分割）**。articles.yml の編集権を 1 プロセスに集約するのが最も堅く、起動時刻に依存しない。

**観測タスク（W21 で見るべき）**:

- Discord 通知の到達確認（W20 で配線 / `c3c1334`）── main 公開で実際に通知が出るか
- systemd 週 1 タイマーの初発火（金 21:00 JST = 2026-05-22 金曜）── 何の slug を拾うか、状態遷移は正しいか
- Cloudflare Web Analytics に最初のデータが溜まり始めるか（PV / リファラ）

## 数値（手入力 / 任意）

- 累計記事数: **9**（seed 3 + W19 末尾 2 + W20 前半 4、m4 ファイル実体含む）
- 月間 PV（Cloudflare Web Analytics）: **数値未取得**（計測タグは入っているが、人間が dashboard を見ていない）
- Search Console インプレッション: **数値未取得**（API スクリプトはあるが、認証情報設定と数日蓄積待ち）
- アフィ報酬（Amazon）: 未稼働（ASP 未申請）
- アフィ報酬（楽天）: 未稼働
- アフィ報酬（もしも）: 未稼働
- AdSense: 未稼働
- 合計: **0 円**

## 包帯の場所

- **ASP 申請**（W19 から動いていない、W20 でも 0 ミリ動）── 人間アクション 1 個で収益動線が開く
- **YAML 並列編集競合**（問題 #6 / #7 / #11）── 5/13 21:05 に実害化、本レポート作成と並走している
- **playbook（週 5 本想定）と実運用（週 1 本）の数字が一致していない**（問題 #9）── `weekly-review.md` / `prioritize-queue.md` の改訂が要る
- **articles.yml に `added_at` がない**（問題 #10）── Rudder の凍結判定が一部で機能しない
- **m4-macbook-air-vs-mac-mini の articles.yml 確定状態**── ファイル実体は完成（18,765 bytes / `.mdx` 確認済み）だが、status の最終確定は write-next 完走待ち

包帯はここに巻いてある。隠さない。**W20 はインフラ側の自動化（systemd / Discord / CI/CD / playbooks）が一気に整った週**で、「数字を出すための土台」がほぼ完成した。同時に、**整った自動化が初めて互いに衝突した週**でもある── 週 1 自動投稿と週次レビューを同時刻に走らせる構造は無理がある、というのが本日 21:05 の事故が教えたことだ。**自動化は配線が増えるほど、配線同士が干渉する**。残るは ASP 申請という人間アクション 1 個と、並列起動の整理── ここが整えば、W21 は数字を取り始める週になる。
