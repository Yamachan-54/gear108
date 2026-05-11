#!/usr/bin/env node
// notify-discord.mjs
// main への push で src/content/** に新規追加されたファイルを検出し、
// Discord webhook に Patch ペルソナで通知する。
//
// 入力 (env):
//   BEFORE_SHA           push 前の SHA (github.event.before)
//   AFTER_SHA            push 後の SHA (github.event.after / github.sha)
//   DISCORD_WEBHOOK_URL  Discord webhook URL (repo secret)
//
// 終了コード:
//   0 — 正常完了 (通知 0 件含む)
//   1 — Discord 投稿で 1 件以上失敗

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';

const { BEFORE_SHA, AFTER_SHA, DISCORD_WEBHOOK_URL } = process.env;

if (!DISCORD_WEBHOOK_URL) {
  console.log('⚠️  DISCORD_WEBHOOK_URL not set, skipping notification');
  process.exit(0);
}

if (!AFTER_SHA) {
  console.error('AFTER_SHA env var required');
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

const addedFiles = diffOutput
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('\t')[1])
  .filter((p) => p && !p.endsWith('_placeholder.md'));

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
    content: `📚 新しい記事を上げた。`,
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
