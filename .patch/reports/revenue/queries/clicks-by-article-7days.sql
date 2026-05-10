-- 過去7日間で一番クリックされた記事ランキング
-- 「どの記事が金になっているか」が一目で分かる

SELECT
    blob4 AS page,
    blob1 AS store,
    SUM(_sample_interval) AS clicks
FROM gear108_affiliate_clicks
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY page, store
ORDER BY clicks DESC
LIMIT 50;
