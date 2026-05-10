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

// Margin の戒律「色は1色のみ」に従い、全カテゴリ共通の墨ベース + 朱赤一色。
// カテゴリの違いは label 文字でのみ示す（色では示さない）。
const SHARED_THEME = {
  bg_top:    '#1a1a1a',  // ink
  bg_bottom: '#0a0a0a',  // deep ink
  paper:     '#fdfdfd',  // 紙白（タイトル文字色に使用）
  akane:     '#c1272d',  // 朱赤 — 唯一のアクセント
};

const CATEGORY_LABEL = {
  keyboard:   'KEYBOARD',
  monitor:    'MONITOR',
  pc:         'PC / NOTE',
  desk:       'DESK',
  peripheral: 'PERIPHERAL',
  storage:    'STORAGE',
  audio:      'AUDIO',
  power:      'POWER',
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
  const t = SHARED_THEME;
  const catLabel = CATEGORY_LABEL[category] || String(category).toUpperCase();
  const collLabel = COLLECTION_LABEL[collection] || collection.toUpperCase();
  // 全角換算10.5で折る
  const lines = wrapTitle(title, 10.5, 3);

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
      <stop offset="0%" stop-color="${t.bg_top}"/>
      <stop offset="100%" stop-color="${t.bg_bottom}"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${t.akane}" stroke-width="0.5" opacity="0.05"/>
    </pattern>
    <style>
      .title {
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 700;
        font-size: 60px;
        fill: ${t.paper};
        letter-spacing: -0.5px;
      }
      .badge {
        font-family: 'Fira Code', ui-monospace, monospace;
        font-weight: 700;
        font-size: 20px;
        fill: ${t.akane};
        letter-spacing: 3px;
      }
      .stat-num {
        font-family: 'Noto Serif JP', serif;
        font-weight: 700;
        font-size: 200px;
        fill: ${t.akane};
        letter-spacing: -10px;
      }
      .stat-label {
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        font-size: 16px;
        fill: ${t.akane};
        letter-spacing: 4px;
      }
      .brand {
        font-family: 'Noto Serif JP', serif;
        font-weight: 700;
        font-size: 28px;
        fill: ${t.paper};
        letter-spacing: -0.5px;
      }
      .brand-sub {
        font-family: 'Fira Code', monospace;
        font-weight: 400;
        font-size: 13px;
        fill: ${t.paper};
        opacity: 0.55;
        letter-spacing: 3px;
      }
    </style>
  </defs>

  <!-- 紙の背景 -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- 上部アクセントライン（朱赤の細線） -->
  <rect x="0" y="0" width="1200" height="3" fill="${t.akane}"/>

  <!-- 左上：collection · category（朱赤） -->
  <g>
    <rect x="80" y="56" width="3" height="36" fill="${t.akane}"/>
    <text x="100" y="82" class="badge">${esc(collLabel)} · ${esc(catLabel)}</text>
  </g>

  <!-- タイトル（明朝・紙白） -->
  ${titleSvg}

  <!-- 右側に巨大な数字（明朝・朱赤） -->
  <g>
    <line x1="820" y1="100" x2="820" y2="480" stroke="${t.akane}" stroke-width="1" opacity="0.25"/>
    <text x="1140" y="340" class="stat-num" text-anchor="end">${esc(stat.value)}</text>
    ${stat.label ? `<text x="1140" y="378" class="stat-label" text-anchor="end">${esc(stat.label)}</text>` : ''}
  </g>

  <!-- 下部の細罫線（雑誌のキリトリ風） -->
  <line x1="80" y1="540" x2="320" y2="540" stroke="${t.akane}" stroke-width="1.5"/>

  <!-- 左下：ブランド -->
  <text x="80" y="585" class="brand">gear<tspan fill="${t.akane}">108</tspan></text>
  <text x="80" y="608" class="brand-sub">ENGINEER GEAR · UPTIME 108D</text>

  <!-- 右下：URL -->
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
        font: {
          fontFiles: [
            join(__dirname, 'fonts', 'NotoSerifJP-Bold.ttf'),
            join(__dirname, 'fonts', 'FiraCode-Regular.ttf'),
            join(__dirname, 'fonts', 'FiraCode-Bold.ttf'),
          ],
          loadSystemFonts: false,
          defaultFontFamily: 'Noto Serif JP',
        },
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
    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        fontFiles: [
          join(__dirname, 'fonts', 'NotoSerifJP-Bold.ttf'),
          join(__dirname, 'fonts', 'FiraCode-Regular.ttf'),
          join(__dirname, 'fonts', 'FiraCode-Bold.ttf'),
        ],
        loadSystemFonts: false,
        defaultFontFamily: 'Noto Serif JP',
      },
    }).render().asPng();
    await writeFile(join(OUT, 'default.png'), png);
    console.log('  ✓ default.png');
  }

  console.log(`\nOG image generation: ${generated} generated, ${skipped} skipped (drafts), ${total} scanned.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
