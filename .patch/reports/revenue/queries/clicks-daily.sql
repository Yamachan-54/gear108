-- 日次クリック数推移（過去30日）
-- 急増・急減の検知に使う

SELECT
    toStartOfDay(timestamp) AS day,
    SUM(_sample_interval) AS clicks
FROM gear108_affiliate_clicks
WHERE timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY day
ORDER BY day DESC;
