-- アフィクリック集計（ストア別、月次）
-- Cloudflare Dashboard → Workers & Pages → Analytics Engine → Query で実行
-- データセット: gear108_affiliate_clicks
--
-- blobs レイアウト:
--   blobs[0]=store / blobs[1]=slug / blobs[2]=url / blobs[3]=page
--   blobs[4]=country / blobs[5]=referrer

SELECT
    blob1 AS store,
    SUM(_sample_interval) AS clicks
FROM gear108_affiliate_clicks
WHERE timestamp >= toStartOfMonth(NOW())
GROUP BY store
ORDER BY clicks DESC;
