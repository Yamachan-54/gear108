# Playbook: ci-deploy-setup（GitHub Actions から Cloudflare Pages へデプロイ）

> このファイルは **1 回だけ** やる初期設定。
> Secrets を入れた後は `.github/workflows/deploy.yml` が main / dev への push を拾って自動デプロイする。

## 背景

これまで Cloudflare Pages は **Direct Upload**（ローカル `wrangler pages deploy`）で運用していた。
GitHub に push しても CF Pages は動かず、production が古いままになる事故が起きた（2026-05-11 23時頃）。

GitHub Actions から `cloudflare/wrangler-action@v3` で自動デプロイする構成に切り替える。
**dashboard 側の設定変更は不要**（Direct Upload のまま、トリガを Actions に渡すだけ）。

## 必要な Secrets

| 名前 | 何を入れる | 取得元 |
|------|-----------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token（Pages:Edit 権限） | https://dash.cloudflare.com/profile/api-tokens |
| `CLOUDFLARE_ACCOUNT_ID` | アカウント ID | https://dash.cloudflare.com/ の右サイドバー or `wrangler whoami` |

## 手順

### 1. API Token 発行

`https://dash.cloudflare.com/profile/api-tokens` にアクセス。

- **Create Token** → **Custom token** → **Create Custom Token**
- Name: `gear108-pages-deploy`
- Permissions:
  - `Account` → `Cloudflare Pages` → `Edit`
- Account Resources:
  - `Include` → `<おまえのアカウント>`
- Zone Resources: All zones（or 不要）
- TTL: 無期限 or 1 年（推奨：1 年で更新リマインダーを建てる）
- **Continue to summary** → **Create Token**

発行された Token を**一度だけしか見られない**のでコピーする。

### 2. Account ID の取得

```bash
# CLI（ローカル）
npx wrangler whoami | grep -i "Account ID" || true

# または dashboard
# https://dash.cloudflare.com/ → 右上のアカウント名クリック → Account ID
```

### 3. GitHub Secrets に登録

```bash
# Token
gh secret set CLOUDFLARE_API_TOKEN -R Yamachan-54/gear108 -b "<paste-token-here>"

# Account ID
gh secret set CLOUDFLARE_ACCOUNT_ID -R Yamachan-54/gear108 -b "<account-id>"
```

確認：

```bash
gh secret list -R Yamachan-54/gear108
# 期待される出力:
# CLOUDFLARE_ACCOUNT_ID  Updated <date>
# CLOUDFLARE_API_TOKEN   Updated <date>
```

### 4. 動作テスト

```bash
# dev へ空 commit を流して動作確認
git checkout dev
git pull
git commit --allow-empty -m "test: trigger CI deploy"
git push origin dev

# Actions ページで deploy.yml が走るのを確認
gh run watch
```

成功すれば `dev.gear108.pages.dev` が更新される。
失敗すれば `gh run view <id> --log-failed` でログを確認。

### 5. 確認後の片付け

```bash
# テスト commit を打ち消す（任意）
git revert HEAD --no-edit
git push origin dev
```

## トラブルシューティング

| エラー | 原因 | 対処 |
|--------|------|------|
| `Authentication error [code: 10000]` | Token 権限不足 | Pages:Edit が付いてるか確認 |
| `Could not find project` | Account ID か project name が違う | `wrangler pages project list` で確認 |
| `Branch protection blocking` | main 直 push しようとした | feature → PR フローで通す |

## やってはいけない

- ❌ Token を README / commit / Slack に貼る（漏洩したら CF dashboard で revoke）
- ❌ 既存の Direct Upload deploy を残したまま放置（履歴が混ざる。Actions に統一）
- ❌ 「Actions が動いてるか毎回確認」を省略（**沈黙の失敗が一番危険**）

## 関連

- `.github/workflows/deploy.yml`：実際のワークフロー
- `.github/workflows/build-check.yml`：PR の build 検証（deploy.yml と独立）
- `.patch/playbooks/release.md`：feature → dev → main の正規ルート
