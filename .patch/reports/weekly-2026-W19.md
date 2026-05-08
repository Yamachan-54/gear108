# 週次レビュー 2026-W19

> 集計対象: 2026-05-03 〜 2026-05-09（直近7日）
> 作成: 2026-05-09 / 作成者: Patch

## 悪い知らせから先に出す

これは実質「ベースライン週（W0）」だ。サイト初期構築の commit が **2026-05-09 00:18** で入ったばかりで、過去7日のうち6日は project が存在していない。`weekly-review.md` の playbook を機械的に当てると「実績0」になるが、それは怠慢ではなく、まだ走り出していないだけ。報告は正直に書く。

線を引く：

- **確認済み**：commit 履歴 / `.patch/reports/` / `articles.yml` / `src/content/` / health log の中身
- **未検証**：GA4 / Search Console / アフィリエイト各社の数値（連携が無い）

## 数値サマリ

| 項目 | 計画（週次） | 実績 | 達成率 | 備考 |
|------|------|------|--------|------|
| 新規記事（write-next.sh） | 5 | 0 | 0% | スケジューラ未稼働。日報には起動行のみ記録、claude 実行ログ無し |
| 更新記事（refresh-old.sh） | 1 | 0 | 0% | 同上。対象記事もまだ揃っていない |
| ヘルスチェック OK | 168（毎時） | 1 | — | 2026-05-08T15:15:27Z に1回 OK。openssl 無しで TLS check skipped |
| ビルド失敗 | 0 | 0 | — | そもそもビルド未実行（CF Pages 接続待ち） |
| push 失敗 | 0 | 0 | — | 同上 |

## 公開した記事（直近7日）

サイト初期化の seed 記事3本（週次運用枠ではない、初期コンテンツ）：

- `reviews/hhkb-studio-review.md`（keyboard）
- `reviews/m4-mac-mini-dev-machine.md`（pc）
- `reviews/flexispot-e7-review.md`（desk）

すべて 2026-05-09 の初期 commit `aeb411c` で投入。週5本の writing スケジュール側からはカウントしない。

## 問題と対応

| # | 問題 | 影響 | 対応 |
|---|------|------|------|
| 1 | `write-next.sh` / `refresh-old.sh` / `weekly-review.sh` の自動起動が成立していない（systemd / cron 未配線） | 記事が増えない | `HANDOFF.md` の手順で systemd timer を有効化する。次週に持ち越し |
| 2 | Cloudflare Pages 接続 / カスタムドメインが未配線 | 公開URLが本番運用と認識されない | wrangler で deploy → カスタムドメイン設定。`HANDOFF.md` 参照 |
| 3 | アフィリエイト ASP（Amazon / 楽天 / もしも）申請未済 | 収益動線が空 | `AffiliateButton.astro` のリンクは現状ダミー。ASP 承認後に置換 |
| 4 | health-check で `openssl` 不在 → TLS check skipped | TLS 期限見落としリスク | `pacman -S openssl`（Arch 系）で解消。次週以降の health log で再確認 |
| 5 | GA4 / Search Console 連携無し | 流入数値が手で入れるしかない | サイト本番 URL 確定後に GA4 計測ID を `BaseLayout.astro` に追記、Search Console 登録 |
| 6 | `articles.yml` の done 0 / pending 30 | キューが消化されていない（=問題1の従属） | 自動起動が通れば解消する。手動で1本だけ叩いて疎通確認するのも可 |

達成率 0% で 50% を割っているが、原因はインフラ未配線（=問題1〜2）であって品質劣化ではない。`config.yml` の通知先は現在 `log_only: true` なので外部通知は出さない。

## 来週の方針（W20）

**最優先**：write-next.sh を実走させる。1本でも実機実行が通れば、来週のレビューは「数字で語れる週」になる。

**書く順番（articles.yml 先頭5本に反映）**：

| 曜日 | slug | collection | category | 理由 |
|------|------|------------|----------|------|
| 月 | `new-engineer-gear-2026` | guides | pc | ピラー記事。在宅装備一式（10/20/40万円コース）でサイト全体の内部リンクハブにする |
| 火 | `dell-u2725qe-review` | reviews | monitor | 既存 seed に monitor が無い。USB-C 90W + KVM で検索意図が明確 |
| 水 | `realforce-r3-vs-hhkb-pro-hybrid` | roundups | keyboard | フラッグシップ比較。HHKB seed と内部リンクで束ねる |
| 木 | `4k-27-inch-best-2026` | roundups | monitor | 火曜の review と互換。"4K 27インチ" は検索量が高い |
| 金 | `aeron-vs-okamura-contessa` | roundups | desk | flexispot seed と隣接。客単価が高い領域 |

カテゴリ分布: pc / monitor×2 / keyboard / desk。collection 分布: guides×1 / reviews×1 / roundups×3。
偏り是正観点では peripheral / audio / storage / power が後回しになるが、W19 はピラー＋検索需要重視で進める。

**並行して片付ける段取り（インフラ）**：

- systemd timer 配線（user 側でも root 側でもよい。`HANDOFF.md` の手順）
- `openssl` 入れる
- CF Pages デプロイ + ドメイン
- ASP 申請（最低 Amazon と もしも）

これらが片付いた瞬間から、来週は数字が動き出す。

## 数値（手入力 / 任意）

- 累計記事数: 3（seed のみ。週次運用としては 0）
- 月間PV（GA4）: 未計測
- アフィ報酬（Amazon）: 未稼働（ASP 未申請）
- アフィ報酬（楽天）: 未稼働
- アフィ報酬（もしも）: 未稼働
- AdSense: 未稼働
- 合計: 0 円

包帯はここに巻いてある。隠さない。来週から動く。
