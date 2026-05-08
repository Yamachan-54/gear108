# 週次レビュー 2026-W19

> 集計対象: 2026-05-03 〜 2026-05-09（直近7日）
> 作成: 2026-05-09 / 作成者: Patch

## 悪い知らせから先に出す

これは実質「ベースライン週」だ。サイト初期構築の commit が **2026-05-09 00:18** で入ったばかりで、過去7日のうち6日は project が存在していない。`weekly-review.md` の playbook を機械的に当てると「ほぼ実績ゼロ」になる。これは怠慢ではなく、まだ走り出していないだけ。報告は正直に書く。

線を引く：

- **確認済み**：commit 履歴 / `.patch/reports/` / `articles.yml` / `src/content/` / health log の中身。レビュー実行と並列に走った write-next.sh が1本書き上げたこと
- **未検証**：GA4 / Search Console / アフィリエイト各社の数値（連携が無い）。本番デプロイは未配線

## 数値サマリ

| 項目 | 計画（週次） | 実績 | 達成率 | 備考 |
|------|------|------|--------|------|
| 新規記事（write-next.sh） | 5 | 1 | 20% | この weekly-review と並列に走った write-next が `realforce-r3-vs-hhkb-pro-hybrid` を 00:26 に生成 |
| 更新記事（refresh-old.sh） | 1 | 0 | 0% | 起動行のみ。完了ログ無し。対象記事もまだ揃っていない |
| ヘルスチェック OK | 168（毎時） | 1 | — | 2026-05-08T15:15:27Z に1回 OK。openssl 不在で TLS check skipped |
| ビルド失敗 | 0 | 0 | — | そもそもビルド未実行（CF Pages 未接続） |
| push 失敗 | 0 | 0 | — | 同上 |

達成率 20% は `config.yml` の通知閾値（50%下回り）を割っているが、原因はインフラ未配線（後述問題1〜2）であって品質劣化ではない。`notifications.log_only: true` のため外部通知は出さない。

## 公開した記事（直近7日）

**週次運用枠**（write-next.sh 由来）：

- `roundups/realforce-r3-vs-hhkb-pro-hybrid.md`（keyboard, high）— 2026-05-09 00:26 生成。中身は Patch 戒律に沿っている（「悪い知らせから出す」「ここまでは確認済み、ここからは未検証」を実装）

**サイト初期化の seed 記事**（週次枠ではない、commit `aeb411c` で投入）：

- `reviews/hhkb-studio-review.md`（keyboard）
- `reviews/m4-mac-mini-dev-machine.md`（pc）
- `reviews/flexispot-e7-review.md`（desk）

## 問題と対応

| # | 問題 | 影響 | 対応 |
|---|------|------|------|
| 1 | systemd / cron が未配線で、write-next.sh が今回は手動起動 1 回だけ走った | 自動週5本に届かない | `HANDOFF.md` の手順で systemd timer を有効化。次週から自動起動 |
| 2 | Cloudflare Pages 接続 / カスタムドメインが未配線 | 公開URLが本番と認識されない | wrangler で deploy → カスタムドメイン設定。`HANDOFF.md` 参照 |
| 3 | アフィリエイト ASP（Amazon / 楽天 / もしも）申請未済 | 収益動線が空 | `AffiliateButton.astro` のリンクは現状ダミー。ASP 承認後に置換 |
| 4 | health-check で `openssl` 不在 → TLS check skipped | TLS 期限見落としリスク | `pacman -S openssl` で解消。次週の health log で再確認 |
| 5 | GA4 / Search Console 連携無し | 流入数値が手入力以外で取れない | サイト本番 URL 確定後に GA4 計測ID を `BaseLayout.astro` に追記、Search Console 登録 |
| 6 | refresh-old.sh が「起動」行だけで完了行無し | 古い記事の更新ループが回っていない | 対象が age_threshold_days=90 で、現状 0 日のサイトでは正常動作（=対象0件で即終了が想定される）。ただし日報に「対象なしで終了」を明示するログを script 側に足したい。次週の課題 |

## 来週の方針（W20）

**最優先**：systemd timer を入れて write-next.sh の自動週5本を成立させる。1週間連続で5本書ければ、来週のレビューは「数字で語れる週」になる。

**書く順番（articles.yml 先頭5本に反映済み）**：

| 曜日 | slug | collection | category | 理由 |
|------|------|------------|----------|------|
| 月 | `new-engineer-gear-2026` | guides | pc | ピラー記事。在宅装備一式（10/20/40万円コース）でサイト全体の内部リンクハブにする |
| 火 | `dell-u2725qe-review` | reviews | monitor | 既存 seed に monitor が無い。USB-C 90W + KVM で検索意図が明確 |
| 水 | `4k-27-inch-best-2026` | roundups | monitor | 火曜の review と内部リンクで束ねる。"4K 27インチ" は検索量が高い |
| 木 | `aeron-vs-okamura-contessa` | roundups | desk | flexispot seed と隣接。客単価が高い領域 |
| 金 | `m4-macbook-air-vs-mac-mini` | roundups | pc | seed の m4-mac-mini-dev-machine と軸違い（形態の選び方）で補完 |

カテゴリ分布: pc(2) / monitor(2) / desk(1)。collection 分布: guides(1) / reviews(1) / roundups(3)。
keyboard は今週 realforce で1本入ったので W20 は外す。peripheral / audio / storage / power は W21 以降に持ち越し（偏り是正は2週単位で見る）。

**並行して片付ける段取り（インフラ）**：

- systemd timer 配線（user 側でも root 側でもよい。`HANDOFF.md` の手順）
- `openssl` 入れる
- CF Pages デプロイ + カスタムドメイン
- ASP 申請（最低 Amazon と もしも）

これらが片付いた瞬間から、来週は数字が動き出す。

## 数値（手入力 / 任意）

- 累計記事数: 4（seed 3 + 週次運用 1）
- 月間PV（GA4）: 未計測
- アフィ報酬（Amazon）: 未稼働（ASP 未申請）
- アフィ報酬（楽天）: 未稼働
- アフィ報酬（もしも）: 未稼働
- AdSense: 未稼働
- 合計: 0 円

包帯はここに巻いてある。隠さない。来週から動く。
