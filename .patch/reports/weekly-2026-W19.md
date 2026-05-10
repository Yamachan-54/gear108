# 週次レビュー 2026-W19

> 集計対象: 2026-05-04 〜 2026-05-10（W19 月〜日 / 7日間フル）
> 作成: 2026-05-09 / 改訂: 2026-05-10（W19 終端での再集計）/ 作成者: Patch
> 改訂理由: 05-09 版は土曜時点の途中報告。05-10 に 16 commit 分のインフラ本配線（Margin デザイン全面刷新 / Sieve 検証配線 / Cloudflare Web Analytics / アフィクリック計測 / Search Console 取得 / Lighthouse 80+ 全通過 / WCAG AA 改修 / WebP 化 / フォント非ブロッキング化）が入ったため、W19 全体像を取り直す。

## 悪い知らせから先に出す

1. **記事公開数は計画の 40%（2/5）**。`config.yml` の通知閾値（50% 下回り）を割っている。原因は怠慢ではなく、W19 の主戦場が「記事を増やす」ではなく「記事を載せる土台を作る」に振れたから。`notifications.log_only: true` のため外部通知は出していない。

2. **systemd / cron が依然として未配線**。write-next.sh は今週も人間トリガで2回手動起動した（05-09 00:24 と 00:48）。来週も自動起動はしない前提で計画を立てる。

3. **アフィリエイト ASP（Amazon / 楽天 / もしも）は申請未済**。クリック計測パイプラインは敷いた（後述）が、その先で計上される報酬は **0 円のまま**。配管はできた、水はまだ流れていない。

4. **GA4 はまだ入っていない**。代わりに Cloudflare Web Analytics を入れた（軽量・Cookieless）。これは GA4 の代替ではなく一次計測用。検索クエリは Search Console の API 経由で別途取る配線にした。

線を引く：

- **確認済み**：commit 履歴 / `.patch/reports/` / `articles.yml` / `src/content/` / Lighthouse JSON 4本 / health log / revenue テンプレ
- **未検証（W19 内では数値未確定）**：本番 PV / アフィクリック実数 / Search Console インプレッション・CTR（API 取得スクリプトはあるが、データが溜まっていない）

## 数値サマリ

| 項目 | 計画（週次） | 実績 | 達成率 | 備考 |
|------|------|------|--------|------|
| 新規記事（write-next.sh） | 5 | 2 | 40% | realforce-r3-vs-hhkb-pro-hybrid (05-09) / new-engineer-gear-2026 (05-09) |
| 更新記事（refresh-old.sh） | 1 | 0 | 0% | 90日超ゼロ。最古は flexispot-e7-review (05-04) で6日経過。次回判定は 2026-08-02 |
| ヘルスチェック OK | 168（毎時） | 1 | — | 05-08T15:15:27Z に1回。systemd timer 未配線で実質手動 |
| ビルド失敗 | 0 | 0 | — | ローカルビルドは pass を継続 |
| push 失敗 | 0（最終） | 1 → 解消 | — | 05-09 にハーネスから1回弾かれて手動復旧。aa2a48b 以降は通っている |
| Lighthouse 全カテゴリ 80+ | — | 達成 | — | 後述（W19 のハイライト） |

達成率 40% は通知閾値を割っているが、`notifications.log_only: true` のため外部通知は出さない。下記「W19 で本当に動いた量」で実態を補足する。

## 公開した記事（W19 全7日）

**週次運用枠**（write-next.sh 由来）：

- `roundups/realforce-r3-vs-hhkb-pro-hybrid.mdx`（keyboard, high）— 05-09 00:26 生成。「片方のみ実機経験あり」と冒頭で開示
- `guides/new-engineer-gear-2026.mdx`（pc, high）— 05-09 00:52 生成。約 7,230 文字、内部リンク7本。サイトの内部リンクハブとして設置

**サイト初期化の seed 記事**（commit `aeb411c`、週次枠ではない）：

- `reviews/hhkb-studio-review.mdx`（keyboard）
- `reviews/m4-mac-mini-dev-machine.mdx`（pc）
- `reviews/flexispot-e7-review.mdx`（desk）

`src/content/` 実体は seed 3本 + 週次2本 = **計5本**。news / deals は `_placeholder.md` のみ。roundups は realforce 1本のみ。

## W19 で本当に動いた量（インフラ・デザイン側）

05-10 の commit ログを抜粋する。**この一日で 16 commit、サイトの土台が別物になった**：

| commit | 領域 | 内容 |
|---|---|---|
| `57bc8f5` | persona | Margin（美意識担当ロブスター）追加 + ロブスター族のディレクトリ整理 |
| `046f568` | design | Margin の戒律でサイト全面再デザイン |
| `534f09c` | fix | モバイル + MDX + OG明朝 — 戒律違反の検証残しを潰す |
| `6af9b99` | a11y/perf | WCAG AA コントラスト + タッチ領域 + フォントウェイト削減 |
| `c15867a` | perf | Google Fonts を print onload で非ブロッキング化 |
| `d1f4d87` | reports | Lighthouse v3 計測（Performance 99 / A11y 92 / BP 100 / SEO 92） |
| `3f24218` | perf | hero画像を preload + fetchpriority=high で LCP 改善 |
| `cead863` | perf | hero画像を WebP 化（99KB→23KB、76%削減） |
| `a8064cf` | perf | hero を lazy decoding async + preload 撤回（LCP は title 固定に戻す） |
| `1064abc` | perf | Noto Serif JP の Web フォント取得を停止、システム明朝に依存 |
| `7fe2e7c` | reports | Lighthouse 最終結果（全ページ全カテゴリ 80+） |
| `f148f5c` | analytics | Cloudflare Web Analytics 計測タグ導入 |
| `4ad272d` | analytics | アフィクリック計測パイプライン（Phase 1） |
| `8f7637c` | analytics | Phase 2-3 — 収益記録テンプレ + Search Console 取得スクリプト |
| `6e42382` | verification | Sieve（独立検証担当ロブスター）の運用配線 |

それ以前（05-09）にも `7afef38`（Gizmodo スタイル多列グリッド）と `2c58c5b`（OG画像自動生成 + 視覚コンポーネント4種）が入っている。

### Lighthouse 最終スコア（gear108.pages.dev、本番計測）

実測値、JSON 原本は `.patch/reports/lighthouse/*-final.json` に保存：

| ページ | 環境 | Performance | Accessibility | Best Practices | SEO |
|--------|------|-------------|---------------|----------------|-----|
| home | desktop | 91 | 92 | 100 | 92 |
| home | mobile | 99 | 92 | 100 | 92 |
| article (hhkb-studio-review) | desktop | 92 | 94 | 100 | 92 |
| about | desktop | 100 | 92 | 100 | 92 |

全ページ全カテゴリ **80+ 達成**。Margin の戒律下で、「美意識のためにスコアを犠牲にしない」ラインは守った。

## 問題と対応（W18 までの引き継ぎを更新）

| # | 問題 | 影響 | W19 終了時の状態 |
|---|------|------|------|
| 1 | systemd / cron が未配線、write-next.sh が手動起動 | 週5本に届かない | **未対応**。`HANDOFF.md` の手順で systemd timer を有効化する必要あり。来週も手動継続見込み |
| 2 | Cloudflare Pages 接続 / カスタムドメイン未配線 | — | **解消**。本番 URL `https://gear108.pages.dev` で稼働中。Lighthouse もここで計測 |
| 3 | アフィリエイト ASP（Amazon / 楽天 / もしも）申請未済 | 収益動線が空 | **半分対応**。クリック計測パイプライン（commit `4ad272d`）と収益記録テンプレ（`8f7637c`）は配線済み。**残るは ASP 申請のみ**（人間タスク） |
| 4 | health-check で `openssl` 不在 → TLS check skipped | TLS 期限見落とし | **未対応**。`pacman -S openssl` で1分で解消する |
| 5 | GA4 / Search Console 連携無し | 流入数値が手入力以外で取れない | **方針変更 + 半分対応**。GA4 は採用せず Cloudflare Web Analytics に統一（commit `f148f5c`）。Search Console は API 取得スクリプトを敷いた（`8f7637c`）。あとは認証情報の設定と数日の溜まり待ち |
| 6 | 00:48 に write-next / refresh-old / weekly-review が同時起動 | ログ重複 | **軽微・未対応**。重複起動の検知ガードは W21 課題に持ち越し |
| 7 | write-next と weekly-review の並列実行で `articles.yml` への同時書き込み懸念 | YAML 破損リスク | **未対応**。flock 方式の排他は W21 課題 |
| 8 | 自己レビューだけで「動いた」と報告するクセ | 検証残しのリスク | **対応**。Sieve（独立検証担当）の運用配線（commit `6e42382`）。次回以降、実装完了報告の前に Sieve 戒律を発動 |

問題2が落ちたのが W19 最大の収穫。問題3は配管が通って **あとは ASP 申請という非エンジニアリング作業1個に縮約**された。

## 来週の方針（W20: 2026-05-11 月 〜 2026-05-17 日）

**最優先（人間アクション）**：

1. ASP 3社（Amazon アソシエイト / 楽天アフィリエイト / もしもアフィリエイト）の申請。`HANDOFF.md` 参照
2. `pacman -S openssl` を1回叩く → TLS check 復活
3. systemd timer 有効化（任意）。手動運用継続でも構わない

**書く順番（W20、月→金、`articles.yml` 先頭5本に反映済み）**：

| 曜日 | slug | collection | category | 理由 |
|------|------|------------|----------|------|
| 月 (5/11) | `dell-u2725qe-review` | reviews | monitor | 既存 seed に monitor 無し。USB-C 90W + KVM で検索意図明確（W19 から繰越） |
| 火 (5/12) | `4k-27-inch-best-2026` | roundups | monitor | 月曜 review と内部リンクで束ねる（W19 から繰越） |
| 水 (5/13) | `aeron-vs-okamura-contessa` | roundups | desk | flexispot seed と隣接。客単価高（W19 から繰越） |
| 木 (5/14) | `m4-macbook-air-vs-mac-mini` | roundups | pc | seed の m4-mac-mini-dev-machine と軸違いで補完（W19 から繰越） |
| 金 (5/15) | `cherry-mx-axis-comparison-2026` | guides | keyboard | realforce / hhkb-studio との内部リンクハブ。新規昇格 |

カテゴリ分布: monitor(2) / desk(1) / pc(1) / keyboard(1)。collection 分布: reviews(1) / roundups(3) / guides(1)。
W18-19 で keyboard が realforce 1本入っていたが、W20 末で1本追加して厚みを取る判断。peripheral / audio / storage / power は W21 以降に持ち越し。

**観測タスク（人間が見るべき指標、来週末から数値が動き始める想定）**：

- Cloudflare Web Analytics ダッシュボード（PV / 滞在 / リファラ）
- Search Console（インプレッション / CTR / 検索クエリ）— 配線スクリプトで日次取得
- アフィクリック数（`/r/` 経由のリダイレクトログ）— ASP 申請が通り次第

## 数値（手入力 / 任意）

- 累計記事数: **5**（seed 3 + 週次運用 2）
- 月間PV（Cloudflare Web Analytics）: 数値未取得（計測タグ導入が 05-10、データ未蓄積）
- アフィ報酬（Amazon）: 未稼働（ASP 申請未済）
- アフィ報酬（楽天）: 未稼働
- アフィ報酬（もしも）: 未稼働
- AdSense: 未稼働
- 合計: **0 円**

## 包帯の場所

- ASP 申請（人間しかできない）が、収益動線の最後の詰まり
- systemd timer（人間が1回叩けば自動運用に切り替わる）
- TLS check（pacman 1コマンド）

包帯はここに巻いてある。隠さない。来週は「数字が出始める週」になる準備が整った、というのが W19 の正味の意味だ。
