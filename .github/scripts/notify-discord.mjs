#!/usr/bin/env node
// notify-discord.mjs
// main への push で src/content/** に新規追加されたファイルを検出し、
// Discord webhook に Patch ペルソナで通知する。
// workflow_dispatch から手動起動時は最新記事 or 指定スラッグを再通知。
//
// 入力 (env):
//   GITHUB_EVENT_NAME    "push" | "workflow_dispatch"
//   BEFORE_SHA           push 前の SHA (push 時のみ)
//   AFTER_SHA            push 後の SHA / 手動時は HEAD
//   MANUAL_SLUG          手動起動時に指定したスラッグ (任意)
//   DISCORD_WEBHOOK_URL  Discord webhook URL (repo secret)
//
// 終了コード:
//   0 — 正常完了 (通知 0 件含む)
//   1 — Discord 投稿で 1 件以上失敗

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

const {
  GITHUB_EVENT_NAME,
  BEFORE_SHA,
  AFTER_SHA,
  MANUAL_SLUG,
  DISCORD_WEBHOOK_URL,
} = process.env;

if (!DISCORD_WEBHOOK_URL) {
  console.log('⚠️  DISCORD_WEBHOOK_URL not set, skipping notification');
  process.exit(0);
}

const isManual = GITHUB_EVENT_NAME === 'workflow_dispatch';

let addedFiles = [];

if (isManual) {
  if (MANUAL_SLUG && MANUAL_SLUG.trim()) {
    const trimmed = MANUAL_SLUG.trim();
    const candidates = ['md', 'mdx']
      .flatMap((ext) =>
        ['reviews', 'roundups', 'news', 'guides', 'deals'].map(
          (col) => `src/content/${col}/${trimmed}.${ext}`
        )
      )
      .filter((p) => existsSync(p));

    if (candidates.length === 0) {
      console.error(`Slug "${trimmed}" not found in src/content/`);
      process.exit(1);
    }
    addedFiles = [candidates[0]];
    console.log(`🔧 Manual test (slug=${trimmed}): ${candidates[0]}`);
  } else {
    const log = execSync(
      `git log --name-status --diff-filter=A --pretty=format:%H -- 'src/content/**/*.md' 'src/content/**/*.mdx'`,
      { encoding: 'utf8' }
    );
    const latest = log
      .split('\n')
      .map((l) => l.trim())
      .find(
        (l) =>
          l.startsWith('A\t') &&
          l.includes('src/content/') &&
          !l.endsWith('_placeholder.md')
      );
    if (!latest) {
      console.error('No content files found in history');
      process.exit(1);
    }
    addedFiles = [latest.split('\t')[1]];
    console.log(`🔧 Manual test (latest article): ${addedFiles[0]}`);
  }
} else {
  if (!AFTER_SHA) {
    console.error('AFTER_SHA env var required for push events');
    process.exit(1);
  }
  const NULL_SHA = '0000000000000000000000000000000000000000';
  const isInitialPush = !BEFORE_SHA || BEFORE_SHA === NULL_SHA;
  const diffRange = isInitialPush ? AFTER_SHA : `${BEFORE_SHA}..${AFTER_SHA}`;

  let diffOutput = '';
  try {
    diffOutput = execSync(
      `git diff ${diffRange} --name-status --diff-filter=A -- 'src/content/**/*.md' 'src/content/**/*.mdx'`,
      { encoding: 'utf8' }
    );
  } catch (err) {
    console.error(`git diff failed: ${err.message}`);
    process.exit(1);
  }

  addedFiles = diffOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t')[1])
    .filter((p) => p && !p.endsWith('_placeholder.md'));
}

if (addedFiles.length === 0) {
  console.log('ℹ️  No new content files in this push, skipping notification');
  process.exit(0);
}

const SITE = 'https://gear108.pages.dev';
const PATCH_AVATAR = `${SITE}/avatars/patch.png`;
const BRAND_COLOR = 0xc1272d;

const CATEGORY_LABELS = {
  keyboard: 'キーボード',
  monitor: 'モニター',
  pc: 'PC・ノート',
  desk: 'デスク・椅子',
  peripheral: '周辺機器',
  storage: 'ストレージ',
  audio: 'オーディオ',
  power: '電源・ケーブル',
};

const COLLECTION_LABELS = {
  reviews: 'レビュー',
  roundups: 'まとめ・比較',
  news: 'ニュース',
  guides: '選び方ガイド',
  deals: 'セール情報',
};

let failures = 0;

for (const file of addedFiles) {
  const match = file.match(/^src\/content\/([^/]+)\/(.+)\.(md|mdx)$/);
  if (!match) {
    console.warn(`Skipping unexpected path: ${file}`);
    continue;
  }
  const [, collection, slug] = match;

  let data;
  try {
    const raw = readFileSync(file, 'utf8');
    data = matter(raw).data;
  } catch (err) {
    console.error(`Failed to parse ${file}: ${err.message}`);
    failures += 1;
    continue;
  }

  if (data.draft) {
    console.log(`⏭  Skipping draft: ${file}`);
    continue;
  }

  const url = `${SITE}/${collection}/${slug}/`;
  const ogImage = `${SITE}/og/${slug}.png`;

  const payload = {
    username: 'Patch',
    avatar_url: PATCH_AVATAR,
    content: isManual
      ? '🧪 テスト通知（手動起動）。'
      : '📚 新しい記事を上げた。',
    embeds: [
      {
        title: data.title || slug,
        description: data.description || '',
        url,
        color: BRAND_COLOR,
        image: { url: ogImage },
        fields: [
          {
            name: 'カテゴリ',
            value: CATEGORY_LABELS[data.category] || data.category || '—',
            inline: true,
          },
          {
            name: 'コレクション',
            value: COLLECTION_LABELS[collection] || collection,
            inline: true,
          },
        ],
        footer: { text: 'gear108 — Patch' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`✗ Discord POST failed for ${slug}: ${res.status} ${body}`);
      failures += 1;
    } else {
      console.log(`✓ Notified: ${url}`);
    }
  } catch (err) {
    console.error(`✗ Discord POST threw for ${slug}: ${err.message}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`Done with ${failures} failure(s)`);
  process.exit(1);
}
console.log('All notifications sent successfully');
