#!/usr/bin/env node
// gen-og-images.mjs
// 全記事の frontmatter を読み、各記事の OGP/ヒーロー画像を SVG→PNG で生成する。
// Style B（ガジェット雑誌風）：カテゴリ別グラデ + 大きい数字 + 装飾線。

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');
const OUT = join(ROOT, 'public', 'og');

const COLLECTIONS = ['reviews', 'roundups', 'news', 'guides', 'deals'];

// カテゴリ別のグラデーション + アクセントカラー（雑誌の特集ページ風）
const CATEGORY_THEME = {
  keyboard:   { from: '#0e3a4f', to: '#0d2030', accent: '#2dd4bf', label: 'KEYBOARD' },
  monitor:    { from: '#2a1547', to: '#1a0a2e', accent: '#c084fc', label: 'MONITOR' },
  pc:         { from: '#1a1a1a', to: '#0a0a0a', accent: '#e5e7eb', label: 'PC / NOTE' },
  desk:       { from: '#3d2818', to: '#1a0f08', accent: '#fb923c', label: 'DESK' },
  peripheral: { from: '#0e3320', to: '#06180e', accent: '#86efac', label: 'PERIPHERAL' },
  storage:    { from: '#0c2e5c', to: '#061226', accent: '#60a5fa', label: 'STORAGE' },
  audio:      { from: '#3b0f3a', to: '#1a0418', accent: '#f472b6', label: 'AUDIO' },
  power:      { from: '#4a1a0a', to: '#1f0a04', accent: '#fbbf24', label: 'POWER' },
};

const COLLECTION_LABEL = {
  reviews: 'REVIEW',
  roundups: 'COMPARE',
  news: 'NEWS',
  guides: 'GUIDE',
  deals: 'DEAL',
};

// テキストを SVG に流し込む前にエスケープ
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 文字幅を概算（半角=0.5、全角=1.0）
function approxWidth(str) {
  let w = 0;
  for (const ch of str) {
    w += /[\x00-\x7F]/.test(ch) ? 0.5 : 1.0;
  }
  return w;
}

// 全角換算で perLine ぶん詰める。半角は 0.5、全角は 1.0 として扱う
function wrapTitle(title, perLine = 13, maxLines = 3) {
  const lines = [];
  let buf = '';
  let bufW = 0;
  let consumed = 0;
  let truncated = false;

  for (const ch of title) {
    const w = /[\x00-\x7F]/.test(ch) ? 0.5 : 1.0;
    if (bufW + w > perLine) {
      lines.push(buf);
      buf = '';
      bufW = 0;
      // すでに最大行数に達していたら、これ以上文字を消費しない
      if (lines.length >= maxLines) {
        truncated = true;
        break;
      }
    }
    buf += ch;
    bufW += w;
    consumed++;
  }

  // ループ抜けた時点で buf に残りがあれば最終行として確定
  if (!truncated && buf.length > 0 && lines.length < maxLines) {
    lines.push(buf);
  }

  // タイトル全体を消費しきれていない（=途中で切った）場合は末尾を省略
  if (consumed < title.length || truncated) {
    if (lines.length > 0) {
      const last = lines[lines.length - 1];
      lines[lines.length - 1] = last.slice(0, -1) + '…';
    }
  }
  return lines;
}

// 大きく目立たせる数字を決める（雑誌っぽさの源）
// コレクション種別ごとに「意味のある」数字／ラベルを選ぶ。誤爆を避けるため曖昧な正規表現は避ける。
function pickHeadlineStat(d, collection) {
  const title = String(d.title || '');

  if (collection === 'reviews') {
    if (typeof d.rating === 'number') {
      return { value: d.rating.toFixed(1), label: 'RATING / 5' };
    }
    return { value: 'NEW', label: 'REVIEW' };
  }

  if (collection === 'roundups') {
    // 「7選」「5選」「TOP 10」など明示的なものだけ拾う
    const m = title.match(/(\d+)\s*選|TOP\s*(\d+)|ベスト\s*(\d+)/i);
    if (m) return { value: m[1] || m[2] || m[3], label: 'PICKS' };
    // 「A vs B」系
    if (/\s+vs\.?\s+/i.test(title) || /：.*vs/.test(title)) {
      return { value: 'VS', label: '' };
    }
    return { value: 'TOP', label: 'PICKS' };
  }

  if (collection === 'news') {
    return { value: 'NEW', label: 'JUST IN' };
  }

  if (collection === 'deals') {
    if (typeof d.discountPercent === 'number') {
      return { value: `${d.discountPercent}%`, label: 'OFF' };
    }
    return { value: 'SALE', label: '' };
  }

  if (collection === 'guides') {
    // 明示的なシリーズ番号がある場合だけ拾う（誤爆防止）
    const chapterMatch = title.match(/Vol\.?\s*(\d+)|第\s*(\d+)\s*章|\bGUIDE\s*(\d+)/i);
    if (chapterMatch) {
      return { value: chapterMatch[1] || chapterMatch[2] || chapterMatch[3], label: 'CHAPTER' };
    }
    return { value: 'HOW', label: 'GUIDE' };
  }

  return { value: '108', label: 'GEAR' };
}

function buildSvg({ title, category, collection, stat }) {
  const theme = CATEGORY_THEME[category] || CATEGORY_THEME.peripheral;
  const collLabel = COLLECTION_LABEL[collection] || collection.toUpperCase();
  // 全角換算10.5で折る（64px font * 10.5 ≒ 672px、タイトル領域 x=80〜780 内に収まる）
  const lines = wrapTitle(title, 10.5, 3);

  // 行数別に縦位置調整（中央寄せ感）
  const titleStartY = lines.length === 1 ? 380 : lines.length === 2 ? 340 : 300;
  const titleLineH = 80;

  const titleSvg = lines
    .map((line, i) =>
      `<text x="80" y="${titleStartY + i * titleLineH}" class="title">${esc(line)}</text>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
    <linearGradient id="accentBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${theme.accent}" stroke-width="0.5" opacity="0.06"/>
    </pattern>
    <style>
      .title {
        font-family: -apple-system, "Hiragino Sans", "Yu Gothic UI", sans-serif;
        font-weight: 800;
        font-size: 64px;
        fill: #ffffff;
        letter-spacing: -1px;
      }
      .badge {
        font-family: ui-monospace, "Menlo", monospace;
        font-weight: 700;
        font-size: 22px;
        fill: ${theme.accent};
        letter-spacing: 2px;
      }
      .stat-num {
        font-family: -apple-system, sans-serif;
        font-weight: 900;
        font-size: 160px;
        fill: ${theme.accent};
        opacity: 0.95;
        letter-spacing: -6px;
      }
      .stat-label {
        font-family: ui-monospace, "Menlo", monospace;
        font-weight: 700;
        font-size: 16px;
        fill: ${theme.accent};
        letter-spacing: 3px;
      }
      .brand {
        font-family: -apple-system, sans-serif;
        font-weight: 800;
        font-size: 28px;
        fill: #ffffff;
        letter-spacing: -0.5px;
      }
      .brand-sub {
        font-family: ui-monospace, "Menlo", monospace;
        font-size: 14px;
        fill: #ffffff;
        opacity: 0.6;
        letter-spacing: 2px;
      }
    </style>
  </defs>

  <!-- bg -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- 上部アクセントライン -->
  <rect x="0" y="0" width="1200" height="6" fill="${theme.accent}"/>

  <!-- 左上バッジ -->
  <g>
    <rect x="80" y="60" width="14" height="34" fill="${theme.accent}"/>
    <text x="108" y="86" class="badge">${esc(collLabel)} · ${esc(theme.label)}</text>
  </g>

  <!-- タイトル -->
  ${titleSvg}

  <!-- 右側に巨大な数字（タイトル領域 x=780 から右、上半分にまとめる） -->
  <g>
    <line x1="820" y1="120" x2="820" y2="460" stroke="${theme.accent}" stroke-width="1" opacity="0.3"/>
    <text x="1140" y="320" class="stat-num" text-anchor="end">${esc(stat.value)}</text>
    ${stat.label ? `<text x="1140" y="358" class="stat-label" text-anchor="end">${esc(stat.label)}</text>` : ''}
  </g>

  <!-- 下部装飾線 -->
  <line x1="80" y1="540" x2="380" y2="540" stroke="${theme.accent}" stroke-width="2"/>
  <rect x="80" y="540" width="120" height="3" fill="${theme.accent}"/>

  <!-- 左下ブランド -->
  <text x="80" y="585" class="brand">gear<tspan fill="${theme.accent}">108</tspan></text>
  <text x="80" y="608" class="brand-sub">ENGINEER GEAR REVIEW · UPTIME 108D</text>

  <!-- 右下に小さなコールアウト -->
  <text x="1140" y="608" class="brand-sub" text-anchor="end">gear108.pages.dev</text>
</svg>`;
}

async function listMdFiles(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await listMdFiles(p)));
    } else if (/\.(md|mdx)$/.test(e.name) && !e.name.startsWith('_') && !e.name.startsWith('.')) {
      out.push(p);
    }
  }
  return out;
}

async function main() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

  let total = 0;
  let generated = 0;
  let skipped = 0;

  for (const collection of COLLECTIONS) {
    const dir = join(CONTENT, collection);
    if (!existsSync(dir)) continue;
    const files = await listMdFiles(dir);
    for (const file of files) {
      total++;
      const raw = await readFile(file, 'utf-8');
      const { data } = matter(raw);
      if (data.draft) {
        skipped++;
        continue;
      }
      const slug = basename(file, extname(file));
      const stat = pickHeadlineStat(data, collection);
      const svg = buildSvg({
        title: data.title || slug,
        category: data.category,
        collection,
        stat,
      });
      const png = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
        font: { loadSystemFonts: true },
      })
        .render()
        .asPng();
      const outPath = join(OUT, `${slug}.png`);
      await writeFile(outPath, png);
      generated++;
      console.log(`  ✓ ${collection}/${slug}.png`);
    }
  }

  // 既定 OG（記事に紐づかないページ用）
  {
    const svg = buildSvg({
      title: 'エンジニアの机の上を最適化する',
      category: 'pc',
      collection: 'reviews',
      stat: { value: '108', label: 'GEAR' },
    });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    await writeFile(join(OUT, 'default.png'), png);
    console.log('  ✓ default.png');
  }

  console.log(`\nOG image generation: ${generated} generated, ${skipped} skipped (drafts), ${total} scanned.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
