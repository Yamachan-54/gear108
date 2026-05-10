# Playbook: release（feature → dev → main の正規ルート）

> このファイルは Patch / Rudder の運用配線。
> gear108 の **すべての変更**は、このルートを通して main に到達する。直接 commit / push は禁止。

## 三段の役割

| 枝 | 役割 | デプロイ |
|----|------|---------|
| `feature/<topic>` | 個別作業 | Cloudflare Pages preview（`<branch>.gear108.pages.dev`） |
| `dev` | 統合検証ステージ | preview（`dev.gear108.pages.dev`） |
| `main` | 本番 | 本番（`gear108.pages.dev`） |

## 1. 作業開始 — feature ブランチを切る

```bash
cd /home/yamachan/Public/Project/gear108

# 最新の dev を起点にする（main からではない）
git checkout dev
git pull

# 作業内容に応じた名前で feature を切る
git checkout -b feature/<topic>
```

トピック名は **小文字ハイフン区切り**：
- `feature/add-monitor-review-batch`（記事追加）
- `feature/lighthouse-perf-tuning`（性能改善）
- `feature/fix-mobile-nav-overflow`（バグ修正）

## 2. 作業 — 戒律と verifier を守る

- Patch の戒律：書く前に `~/.claude/projects/-home-yamachan--claude/openclaw/patch/SOUL.md` を読む
- 領域別の戒律：
  - 記事執筆 → `.patch/playbooks/write-article.md`（Beacon ゲート込み）
  - デザイン変更 → `.patch/playbooks/design-review.md`（Margin）
  - 既存記事更新 → `.patch/playbooks/refresh-article.md`
- **commit する前**に必ず `git diff` で自分の差分を読む

## 3. ローカルで build を通す

```bash
npm run build
```

通らないものを **push しない**。

## 4. commit & push（feature ブランチ）

```bash
git add <変更ファイル>   # `git add -A` は使わない（秘匿ファイルの混入防止）
git commit -m "<type>(<scope>): <subject>"
git push -u origin feature/<topic>
```

commit message の type：`feat / fix / chore / docs / perf / refactor / test / style`

## 5. feature → dev の PR

```bash
gh pr create \
  --base dev \
  --head feature/<topic> \
  --title "<type>(<scope>): <subject>" \
  --body "$(cat <<'EOF'
## 目的

<なぜこの変更が必要か>

## 変更内容

- <要点 1>
- <要点 2>

## 検証

- [ ] `npm run build` 通過
- [ ] 視覚スモーク（該当ページ確認）
- [ ] Sieve の verification-loop で検証済み（該当する場合）
EOF
)"
```

CI（build-check.yml）が PR に対して自動で走る。**通らないものを merge しない**。

merge：

```bash
gh pr merge --squash --delete-branch
```

`--squash` で feature の中間 commit を 1 つに圧縮。dev の履歴を読みやすく保つ。
`--delete-branch` で feature ブランチを掃除。

## 6. dev preview で検証

merge 後、Cloudflare Pages が dev branch を自動デプロイする。

```
https://dev.gear108.pages.dev
```

または最新コミット URL：

```bash
# 最新の dev デプロイ URL を gh で取りたい場合（actions 経由なら）
gh run list --branch=dev --limit=1
```

検証項目：

- 該当ページが想定通り表示される
- Lighthouse（時間があれば）：mobile 4 カテゴリ 80 以上
- Sieve の戒律：「動く」と「テストが通る」を区別、再現手順を要求

## 7. dev → main の PR（最終ゲート）

dev に複数の feature が積まれてから、まとめて main に上げる（推奨：週次 or リリース単位）。

```bash
git checkout dev
git pull

gh pr create \
  --base main \
  --head dev \
  --title "release: <YYYY-MM-DD> <要約>" \
  --body "$(cat <<'EOF'
## 含まれる変更

<このリリースに含まれる feature の一覧>

## 検証済み

- [ ] dev preview で全機能動作確認
- [ ] Lighthouse mobile 4 カテゴリ 80 以上
- [ ] Sieve の verification-loop 通過

## 既知の未検証領域

- <あれば>
EOF
)"
```

CI 通過を確認してから：

```bash
gh pr merge --merge   # main は履歴を残すため --squash ではなく --merge
```

（`--squash` でも良いが、複数 feature の履歴を残したいなら `--merge`）

main にマージされた瞬間、Cloudflare Pages が本番デプロイを実行する。

## 8. リリース後

- `.patch/reports/YYYY-MM-DD.md` に「release: <要約>」を追記
- dev は main と同じ状態になっているはずなので、次の feature は最新 dev から派生
- 異常が出たら（本番が壊れたら）`git revert <merge-commit>` で main に打ち消し PR を立てる

## 緊急時の hotfix

main の本番が壊れたとき、dev を経由していると遅い。緊急時のみ：

```bash
git checkout main
git pull
git checkout -b hotfix/<topic>
# ...修正...
git commit -m "fix: <subject>"
git push -u origin hotfix/<topic>

gh pr create --base main --head hotfix/<topic> --title "hotfix: <subject>" --body "..."
gh pr merge --squash
```

hotfix が main に入ったら、**必ず dev にも cherry-pick** して整合を取る：

```bash
git checkout dev
git pull
git cherry-pick <hotfix-commit>
git push
```

hotfix は 1 ヶ月に 1 回を超えたら異常。**dev の検証が機能していない**証拠。

## やってはいけないこと

- ❌ main に直接 commit / push
- ❌ main に直接 merge（gh pr 経由を必ず通す）
- ❌ dev に直接 commit（feature 経由）
- ❌ force push（特に dev / main へ。`--force-with-lease` でも事前確認）
- ❌ branch protection の bypass

## 関連

- 戒律：`~/.claude/projects/-home-yamachan--claude/openclaw/rudder/SOUL.md`（工程）
- 戒律：`~/.claude/projects/-home-yamachan--claude/openclaw/sieve/SOUL.md`（検証）
- CI：`.github/workflows/build-check.yml`（PR で自動実行）
- branch protection：`https://github.com/Yamachan-54/gear108/settings/branches`
