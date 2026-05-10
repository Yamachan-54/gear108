#!/usr/bin/env node
// optimize-avatars.mjs
// アバター画像を Web 配信用に最適化する。
// 元画像は openclaw/{name}/avatar.png（Gemini 生成、6〜7MB）。
// 出力は public/avatars/{name}.png（512×512、品質 85）と {name}.webp（同サイズ）。
// HTML から <picture> で WebP 優先 + PNG フォールバック想定。

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(process.env.HOME ?? '/home/yamachan', '.claude/projects/-home-yamachan--claude/openclaw');
const OUT = join(ROOT, 'public', 'avatars');

await mkdir(OUT, { recursive: true });

const names = (await readdir(SRC, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
  .map((e) => e.name);

let totalIn = 0;
let totalOut = 0;

for (const name of names) {
  const srcPath = join(SRC, name, 'avatar.png');
  if (!existsSync(srcPath)) continue;

  const inSize = statSync(srcPath).size;
  totalIn += inSize;

  // 512×512 PNG（高品質）
  const pngOut = join(OUT, `${name}.png`);
  await sharp(srcPath)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(pngOut);

  // 512×512 WebP（より軽量、モダンブラウザ向け）
  const webpOut = join(OUT, `${name}.webp`);
  await sharp(srcPath)
    .resize(512, 512, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(webpOut);

  // 256 サムネイル（記事末署名用）
  const thumbOut = join(OUT, `${name}-thumb.webp`);
  await sharp(srcPath)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(thumbOut);

  const outSize = statSync(pngOut).size + statSync(webpOut).size + statSync(thumbOut).size;
  totalOut += outSize;

  const fmt = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(
    `  ✓ ${name}: ${fmt(inSize)} → ${fmt(statSync(pngOut).size)} (PNG) + ${fmt(statSync(webpOut).size)} (WebP) + ${fmt(statSync(thumbOut).size)} (thumb)`,
  );
}

console.log('');
console.log(`合計: ${(totalIn / 1024 / 1024).toFixed(2)} MB → ${(totalOut / 1024).toFixed(1)} KB`);
console.log(`削減率: ${((1 - totalOut / totalIn) * 100).toFixed(1)}%`);
