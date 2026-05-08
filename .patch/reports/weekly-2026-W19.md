# 週次レビュー 2026-W19

> 集計対象: 2026-05-03 〜 2026-05-09（直近7日 / W18-Sun〜W19-Sat）
> 作成: 2026-05-09 / 作成者: Patch
> 改訂: 2026-05-09 (cf-pages-init 修正 / push 成功 / 00:48 再起動の追記)

## 悪い知らせから先に出す

これは実質「ベースライン週」だ。サイト初期構築の commit が **2026-05-09 00:18** で入ったばかりで、過去7日のうち6日は project が存在していない。`weekly-review.md` の playbook を機械的に当てると「ほぼ実績ゼロ」になる。これは怠慢ではなく、まだ走り出していないだけ。報告は正直に書く。

線を引く：

- **確認済み**：commit 履歴 / `.patch/reports/` / `articles.yml` / `src/content/` / health log の中身。write-next.sh が1本書き上げたこと、aa2a48b 以降の commit が `origin/main` に push 済みであること
- **未検証**：Cloudflare Pages の本番デプロイ（cf-pages-init.sh は修正済みだが、人間がローカルから1回叩く必要あり）、GA4 / Search Console / アフィリエイト各社の数値（連携が無い）

## 数値サマリ

| 項目 | 計画（週次） | 実績 | 達成率 | 備考 |
|------|------|------|--------|------|
| 新規記事（write-next.sh） | 5 | 1 | 20% | `realforce-r3-vs-hhkb-pro-hybrid` を 00:26 に生成 |
| 更新記事（refresh-old.sh） | 1 | 0 | 0% | 90日超の記事ゼロ。playbook 規定通り「対象なしで終了」 |
| ヘルスチェック OK | 168（毎時） | 1 | — | 2026-05-08T15:15:27Z に1回 OK。openssl 不在で TLS check skipped |
| ビルド失敗 | 0 | 0 | — | ローカルビルドは pass、本番デプロイは未配線 |
| push 失敗 | 0（最終） | 1 → 解消 | — | 一度ハーネスに弾かれ手動復旧。aa2a48b 以降は通っている |

達成率 20% は `config.yml` の通知閾値（50%下回り）を割っているが、原因はインフラ未配線（後述問題1〜2）であって品質劣化ではない。`notifications.log_only: true` のため外部通知は出さない。

## 公開した記事（直近7日）

**週次運用枠**（write-next.sh 由来）：

- `roundups/realforce-r3-vs-hhkb-pro-hybrid.md`（keyboard, high）— 2026-05-09 00:26 生成。Patch 戒律に沿っている（「悪い知らせから出す」「ここまでは確認済み、ここからは未検証」を実装）

**サイト初期化の seed 記事**（commit `aeb411c`、週次枠ではない）：

- `reviews/hhkb-studio-review.md`（keyboard）
- `reviews/m4-mac-mini-dev-machine.md`（pc）
- `reviews/flexispot-e7-review.md`（desk）

`src/content/` を `find` した実態は seed 3本 + 週次1本 = 計4本。news / guides / deals / roundups は `_placeholder.md` のみ（roundups は realforce で実体1本）。

## 今週中に追加で動いたこと（aa2a48b 以降）

| commit | 内容 | 意味 |
|---|---|---|
| `2325573` | cf-pages-init: wrangler login 済みなら API トークン不要で進める | 「API トークン取得→export」のステップを skip 可能に。手間を1段削った |
| `fbb1669` | cf-pages-init: project create を統合してデプロイで一発作成 | `wrangler pages project create` の compatibility-date 問題を回避し、`wrangler pages deploy` 1本で作成＋デプロイ |

つまり問題2（CF Pages 未配線）は **スクリプト側は完成**。あとは人間がターミナルで `./.patch/scripts/cf-pages-init.sh` を叩くだけ。包帯はここまで巻いた。

## 問題と対応

| # | 問題 | 影響 | 状態 |
|---|------|------|------|
| 1 | systemd / cron が未配線で、write-next.sh が手動起動 1 回だけ走った | 自動週5本に届かない | 未対応。`HANDOFF.md` の手順で systemd timer を有効化。次週から自動起動 |
| 2 | Cloudflare Pages 接続 / カスタムドメインが未配線 | 公開URLが本番と認識されない | スクリプト側修正済（2325573, fbb1669）。**残作業は1コマンド実行のみ** |
| 3 | アフィリエイト ASP（Amazon / 楽天 / もしも）申請未済 | 収益動線が空 | 未対応。`AffiliateButton.astro` のリンクは現状ダミー |
| 4 | health-check で `openssl` 不在 → TLS check skipped | TLS 期限見落としリスク | 未対応。`pacman -S openssl` で解消する |
| 5 | GA4 / Search Console 連携無し | 流入数値が手入力以外で取れない | 未対応。サイト本番 URL 確定後に GA4 計測ID を `BaseLayout.astro` に追記 |
| 6 | 00:48 に write-next / refresh-old / weekly-review が同時起動して、refresh-old だけ完了行を残し、他は空ログ | ログがノイズで埋まる | 軽微。同一セッションで playbook を2回叩いた人為起因。レポートに「00:48 起動」が空エントリで残っている。daily-report 側で重複起動の検知（前回の起動から N 分以内なら skip）を script に足したい — W21 課題 |

## 並列実行の警告（このセッション固有）

このレビューを書いている瞬間、`weekly-review.sh` (PID 911867) と `write-next.sh` (PID 911870) が**同時に**走っている。前回 (00:24) と同じ並列パターン。具体的に確認できた事実：

- write-next が `new-engineer-gear-2026` を `status: in_progress` に切り替えた（articles.yml 先頭エントリ）
- これは **2026-05-09 同日中に書かれる2本目の記事**になる。realforce はすでに今日生成済み。`config.yml` の `writing.max_articles_per_day: 1` ガードが効いていないか、または scheduler 側で同日重複を見ていない
- このため、`articles.yml` のコメント "W19 picks" / "W19-Mon〜Fri" の **W20 への表記修正は、write-next との書き込み競合を避けるため、このセッションでは未実施**。次回 Patch（または人間）が手動で W19 → W20 + 日付付きに修正すること

**W21 以降の課題として積む**：

- (a) `write-next.sh` に「同日すでに articles に done が1本あれば skip」のガード
- (b) `weekly-review.sh` と `write-next.sh` の同時起動を排他にする lock（`flock /tmp/patch.lock` 等）
- (c) `articles.yml` を YAML としてではなく行ベースで write-next が編集している前提を見直す（マルチプロセスから安全に書ける形にする）

## 来週の方針（W20: 2026-05-11 月 〜 2026-05-17 日）

**最優先**：人間側 1 アクションでインフラを抜ける。

1. `./.patch/scripts/cf-pages-init.sh` を1回叩く（ローカル）→ 本番 URL 確立
2. `pacman -S openssl` → TLS check 復活
3. systemd timer を入れる（`HANDOFF.md` 参照）→ 翌日 21:00 から write-next.sh 自動化

これが片付けば、来週は「数字で語れる週」になる。

**書く順番（W20、月→金、`articles.yml` の先頭5本に反映済み）**：

| 曜日 | slug | collection | category | 理由 |
|------|------|------------|----------|------|
| 月 (5/11) | `new-engineer-gear-2026` | guides | pc | ピラー記事。在宅装備一式（10/20/40万円コース）でサイト全体の内部リンクハブにする |
| 火 (5/12) | `dell-u2725qe-review` | reviews | monitor | 既存 seed に monitor が無い。USB-C 90W + KVM で検索意図が明確 |
| 水 (5/13) | `4k-27-inch-best-2026` | roundups | monitor | 火曜の review と内部リンクで束ねる。"4K 27インチ" は検索量が高い |
| 木 (5/14) | `aeron-vs-okamura-contessa` | roundups | desk | flexispot seed と隣接。客単価が高い領域 |
| 金 (5/15) | `m4-macbook-air-vs-mac-mini` | roundups | pc | seed の m4-mac-mini-dev-machine と軸違い（形態の選び方）で補完 |

カテゴリ分布: pc(2) / monitor(2) / desk(1)。collection 分布: guides(1) / reviews(1) / roundups(3)。
keyboard は今週 realforce で1本入ったので W20 は外す。peripheral / audio / storage / power は W21 以降に持ち越し（偏り是正は2週単位で見る）。

## 数値（手入力 / 任意）

- 累計記事数: 4（seed 3 + 週次運用 1）
- 月間PV（GA4）: 未計測
- アフィ報酬（Amazon）: 未稼働（ASP 未申請）
- アフィ報酬（楽天）: 未稼働
- アフィ報酬（もしも）: 未稼働
- AdSense: 未稼働
- 合計: 0 円

包帯はここに巻いてある。隠さない。来週から動く。
