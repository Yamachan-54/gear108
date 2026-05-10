// /api/click
// アフィリエイトボタンのクリックを Cloudflare Analytics Engine に記録する。
// クライアントは navigator.sendBeacon('/api/click', JSON) で叩く。
//
// 記録レイアウト:
//   blobs[0] = store     ('amazon' | 'rakuten' | 'yodobashi' | 'biccamera' | 'official')
//   blobs[1] = slug      (記事の slug, 任意)
//   blobs[2] = url       (アウトバウンド URL, 任意)
//   blobs[3] = page      (記事のパス, 任意)
//   blobs[4] = country   (CF 推定の国コード)
//   blobs[5] = referrer  (任意)
//   doubles[0] = 1       (count、SUM で集計可能に)
//   indexes[0] = store   (主キー、CF が高速集計するための index)
//
// SQL（Cloudflare Dashboard → Analytics Engine → Query）:
//   SELECT blobs[0] AS store, COUNT() AS clicks
//   FROM gear108_affiliate_clicks
//   WHERE timestamp > NOW() - INTERVAL '7' DAY
//   GROUP BY blobs[0]
//   ORDER BY clicks DESC

interface Env {
  AFFILIATE_CLICKS: AnalyticsEngineDataset;
}

interface ClickPayload {
  store?: string;
  slug?: string;
  url?: string;
  page?: string;
}

const ALLOWED_STORES = new Set(['amazon', 'rakuten', 'yodobashi', 'biccamera', 'official']);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let payload: ClickPayload;
  try {
    payload = await request.json<ClickPayload>();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // 入力バリデーション（Patch の戒律：未検証データを記録しない）
  const store = String(payload.store ?? '').toLowerCase();
  if (!ALLOWED_STORES.has(store)) {
    return json({ ok: false, error: 'invalid_store' }, 400);
  }

  const slug = String(payload.slug ?? '').slice(0, 200);
  const url = String(payload.url ?? '').slice(0, 500);
  const page = String(payload.page ?? '').slice(0, 200);
  const country = (request.cf as { country?: string } | undefined)?.country ?? 'unknown';
  const referrer = (request.headers.get('referer') ?? '').slice(0, 200);

  env.AFFILIATE_CLICKS.writeDataPoint({
    blobs: [store, slug, url, page, country, referrer],
    doubles: [1],
    indexes: [store],
  });

  return json({ ok: true });
};

// /api/click を GET で叩いた時に簡単な ping を返す（疎通確認用）
export const onRequestGet: PagesFunction<Env> = async () =>
  json({ ok: true, service: 'gear108-affiliate-click-tracker', method: 'POST' });
