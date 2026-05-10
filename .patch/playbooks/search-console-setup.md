# Playbook: Search Console 連携セットアップ（人間作業）

> Patch がアクセスできない領域：Google アカウントの認証 + GCP プロジェクト作成。
> ここは**おまえに 1 回だけ**やってもらう必要がある。所要 15〜20 分。
> セットアップ完了後は俺が `scripts/fetch-search-console.mjs` で自動取得できる。

## 前提

- gear108.pages.dev が Search Console に登録済み（未済なら最初に登録）
- Google アカウント

## 手順（一回限り）

### 1. Search Console にプロパティ登録

1. <https://search.google.com/search-console> を開く
2. 「**プロパティを追加**」→「**ドメイン**」を選択
3. ドメイン名に `gear108.pages.dev` を入力
4. 表示された TXT レコードを Cloudflare DNS に追加
   - Cloudflare → gear108.pages.dev → DNS → TXT レコード追加
5. Search Console に戻り「確認」を押す

### 2. Google Cloud プロジェクト作成

1. <https://console.cloud.google.com/> を開く
2. 「プロジェクトを作成」→ 名前 `gear108-analytics`
3. 作成したプロジェクトを選択

### 3. Search Console API を有効化

1. <https://console.cloud.google.com/apis/library/searchconsole.googleapis.com>
2. 「**有効にする**」をクリック

### 4. Service Account を作成

1. <https://console.cloud.google.com/iam-admin/serviceaccounts>
2. 「**サービスアカウントを作成**」
3. 名前：`gear108-sc-fetcher`
4. ロール：（特に付けない、SC側で別途付与）
5. 作成後、サービスアカウントの「**鍵**」タブ → 「**鍵を追加**」 → 「**新しい鍵を作成**」 → JSON
6. **`gear108-sc-key.json` がダウンロードされる** — これは秘密情報、絶対 git に入れない

### 5. Service Account に Search Console の閲覧権限を付与

Service Account のメールアドレスをコピー（例：`gear108-sc-fetcher@gear108-analytics.iam.gserviceaccount.com`）。

1. Search Console を開く
2. プロパティ「gear108.pages.dev」を選択
3. 設定（左下） → ユーザーと権限 → 「**ユーザーを追加**」
4. 上でコピーしたメールアドレスを貼り、権限「**制限付き**」
5. 追加

### 6. 環境変数を設定

JSON ファイルを安全な場所に置く：

```bash
mkdir -p ~/.config/gear108
mv ~/Downloads/gear108-sc-key.json ~/.config/gear108/gear108-sc-key.json
chmod 600 ~/.config/gear108/gear108-sc-key.json
```

`.bashrc` または `.zshrc` に：

```bash
export GSC_SITE_URL="sc-domain:gear108.pages.dev"
export GSC_SERVICE_ACCOUNT_FILE="$HOME/.config/gear108/gear108-sc-key.json"
```

### 7. 動作確認

```bash
cd ~/Public/Project/gear108
source ~/.bashrc  # または新しいシェルで
node scripts/fetch-search-console.mjs
```

成功すると `.patch/reports/search-console/YYYY-MM-DD.json` が生成される。

## 設定完了後の運用

俺（Patch）が以下のタイミングで自動実行する：

- **毎週日曜 23 時**（weekly-review.timer の中で呼び出し）
- 結果は `.patch/reports/search-console/YYYY-MM-DD.json` に保存
- 週次レビューで TOP クエリ・順位推移を分析

systemd ユニットは別途 weekly-review.sh を更新する。

## 失敗時の挙動

- 環境変数が未設定 → スクリプトは即終了（ログに記録）
- 認証エラー → サービスアカウントの SC 権限を再確認
- API エラー → SC 側のレート制限の可能性、再試行で解消するか確認

## セキュリティ注意

- **`gear108-sc-key.json` は絶対に git に入れない**。`.gitignore` に既に `.env*` が入っているが、JSON の場所に注意
- リポジトリに置く場合は `.gear108/` のような独立ディレクトリにして `.gitignore` に追加
- 漏洩時は GCP Console → Service Account → 鍵を取り消し、新しい鍵を発行
