#!/usr/bin/env node
// fetch-search-console.mjs
// Google Search Console API から検索クエリ・順位データを取得し、
// .patch/reports/search-console/YYYY-MM-DD.json として保存する。
//
// 必要な環境変数（.env.local 推奨、git 管理外）:
//   GSC_SITE_URL          ：例 'sc-domain:gear108.pages.dev' または 'https://gear108.pages.dev/'
//   GSC_SERVICE_ACCOUNT_KEY：JSON 文字列（Service Account の private_key 含む）
//
// または:
//   GSC_SERVICE_ACCOUNT_FILE：JSON ファイルへのパス（より安全）
//
// 使い方:
//   GSC_SITE_URL=sc-domain:gear108.pages.dev \
//   GSC_SERVICE_ACCOUNT_FILE=/path/to/sa.json \
//   node scripts/fetch-search-console.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSign } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SITE = process.env.GSC_SITE_URL;
if (!SITE) {
  console.error('ERROR: GSC_SITE_URL 環境変数が必要');
  process.exit(1);
}

const keyJson = process.env.GSC_SERVICE_ACCOUNT_KEY
  ?? (process.env.GSC_SERVICE_ACCOUNT_FILE
    ? readFileSync(process.env.GSC_SERVICE_ACCOUNT_FILE, 'utf-8')
    : null);

if (!keyJson) {
  console.error('ERROR: GSC_SERVICE_ACCOUNT_KEY または GSC_SERVICE_ACCOUNT_FILE が必要');
  process.exit(1);
}

const credentials = JSON.parse(keyJson);

// Service Account JWT を作って access_token を取得
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${b64(header)}.${b64(payload)}`;
  const sign = createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = sign.sign(credentials.private_key, 'base64url');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function querySearchConsole(token, startDate, endDate) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 1000,
      orderBy: [{ dimension: 'CLICKS', sortOrder: 'DESCENDING' }],
    }),
  });
  if (!res.ok) {
    throw new Error(`SC query failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() - 3); // SC は3日のラグがある
  const start = new Date(end);
  start.setDate(start.getDate() - 7); // 直近7日

  console.log(`Fetching ${SITE} from ${fmt(start)} to ${fmt(end)}`);

  const token = await getAccessToken();
  const data = await querySearchConsole(token, fmt(start), fmt(end));

  const outDir = join(ROOT, '.patch', 'reports', 'search-console');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${fmt(end)}.json`);
  writeFileSync(outFile, JSON.stringify(data, null, 2));

  const rows = data.rows ?? [];
  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + (r.clicks ?? 0),
      impressions: acc.impressions + (r.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );

  console.log(`✓ ${outFile}`);
  console.log(`  rows: ${rows.length}`);
  console.log(`  total clicks: ${totals.clicks}`);
  console.log(`  total impressions: ${totals.impressions}`);
  console.log('');
  console.log('Top 5 queries:');
  for (const r of rows.slice(0, 5)) {
    console.log(`  ${r.clicks}× / ${r.impressions} imp / pos=${r.position?.toFixed(1)} / "${r.keys?.[0]}"`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
