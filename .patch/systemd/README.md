# systemd user timer: 週 1 件の自動投稿（金曜 21:00 JST）

`write-next.sh` を **毎週金曜 21:00** に自動で叩く systemd user timer の本体。

このディレクトリは **版管理用のコピー**。実体は `~/.config/systemd/user/` に置く。

## なぜ金曜 21:00 か（Beacon の判断）

- エンジニア向けガジェット記事は「週末の購買検討」フローで読まれる → 金〜土が窓
- 金曜夜は X/Twitter のエンジニア層が最もアクティブ（仕事終わり→週末モード）
- はてブ / Zenn 経由の流入も平日 21 時台がピーク
- 土曜 10:00 がサブピーク（Google Discover 経由の腰据え読み）。切り替えるなら `OnCalendar=Sat *-*-* 10:00:00`

## 構成

| ファイル | 役割 |
|---------|------|
| `gear108-write-next.service` | oneshot サービス。`.patch/scripts/write-next.sh` を呼ぶ |
| `gear108-write-next.timer` | 金曜 21:00 起動定義（`Persistent=true` で missed run も拾う） |

## インストール

```bash
# 1. unit ファイルを user dir に配置
cp .patch/systemd/gear108-write-next.{service,timer} ~/.config/systemd/user/

# 2. systemd に読み込ませる
systemctl --user daemon-reload

# 3. timer を起動 + 自動起動有効化
systemctl --user enable --now gear108-write-next.timer

# 4. 動作確認
systemctl --user list-timers gear108-write-next.timer
systemctl --user status gear108-write-next.timer
```

`loginctl show-user $USER | grep Linger` が `Linger=yes` なら、ログアウト中も timer が動く。`no` の場合は `sudo loginctl enable-linger $USER` で有効化。

## 手動実行（テスト用）

```bash
systemctl --user start gear108-write-next.service
journalctl --user -u gear108-write-next.service -f
# あるいは
tail -f .patch/reports/cron.log
```

## 停止

```bash
systemctl --user disable --now gear108-write-next.timer
```

## 前提条件

1. **`claude` CLI が PATH 上にあり、OAuth でログイン済み**であること
   - service ファイルの `Environment=PATH=...` に `claude` の置き場所を含める
   - 認証切れに気づかず空振りする可能性があるので、cron.log を週次で目視確認
2. **`gh` CLI が認証済み**であること（feature → dev → main の PR 自動作成に必要）
3. **`articles.yml` の pending が枯渇していない**こと（枯渇時はレポートに記録して終了）

## 既知の制約

- timer が走るのは 金曜 21:00 + ランダム遅延 0〜5 分。記事生成は通常 5〜15 分かかるので、土曜に跨ぐことはほぼない
- ビルド失敗時は draft 化して終了。**翌週まで投稿空白**になるので cron.log の週次目視は必須
- main の branch protection（CI build-check pass 必須）が満たされないと PR は止まる
- 週 1 ペースなら articles.yml 残 26 本で約半年（〜2026-11 まで）持つ。月次で weekly-review.sh による refill 想定
