# systemd user timer: 毎日 1 件の自動投稿

`write-next.sh` を毎日 21:00 に自動で叩く systemd user timer の本体。

このディレクトリは **版管理用のコピー**。実体は `~/.config/systemd/user/` に置く。

## 構成

| ファイル | 役割 |
|---------|------|
| `gear108-write-next.service` | oneshot サービス。`.patch/scripts/write-next.sh` を呼ぶ |
| `gear108-write-next.timer` | 毎日 21:00 の起動定義（`Persistent=true` で missed run も拾う） |

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

- timer が走るのは 21:00 + ランダム遅延 0〜5 分。記事生成は通常 5〜15 分かかるので、深夜 0 時を跨ぐことはほぼない
- ビルド失敗時は draft 化して終了。次回 run で別の pending を選ぶ
- main の branch protection（CI build-check pass 必須）が満たされないと PR は止まる
