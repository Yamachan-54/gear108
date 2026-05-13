# Beacon 検証: m4-macbook-air-vs-mac-mini

## 検索意図

「在宅エンジニア／フリーランス開発者が、2026 年春時点で開発機を **MacBook Air M4** にするか **Mac mini M4** にするかを決める前夜に、**形態（持ち運び / 据え置き）・周辺機器込みの総額・熱設計・メモリ選び・型落ちタイミング**で迷っているときに刺さる」

## 数字

- Trends: 横ばい〜やや上昇（M5 MacBook Air 発売直後で M4 値引き需要が増えた、Mac mini M5 待ちでの繋ぎ需要）
- 競合上位:
  - https://www.apple.com/jp/mac/compare/
  - https://note.com/welkomiger/n/n2fdc291c1c1b
  - https://www.app-hideaway.com/archives/4834
  - https://masyus.work/articles/switched-from-m2-macbook-air-to-mac-mini-m4
  - https://note.com/ownmono/n/nee1b6e3c523a
- 公式:
  - https://www.apple.com/jp/shop/buy-mac/mac-mini
  - https://www.apple.com/jp/shop/buy-mac/macbook-air
  - https://support.apple.com/en-us/122209

## 一次情報

- ゴリミー / note 系の M2/M1 から M4 Mac mini に乗り換えたフリーランス体験談（持ち運び不要なら mini 一択、という結論が複数）
- ASCII / 価格.com マガジン記事：M4 MacBook Air 16GB が値引きされ 14% オフで実売 12 万円台
- Apple 公式 2026-05-01：Mac mini M4 の 256GB SSD モデル販売終了。最低構成は 16GB / 512GB / 124,800 円に変更
- Mac mini M5 噂（Macworld / TechRepublic）：2026 秋〜年末 or 2027 初頭にずれ込む可能性。M5 MacBook Air は既に 2026 年春に発売
- 開発者の不満（Reddit / X）：
  - Air ファンレス：Docker や `cargo build` 連発で thermal throttle に入る
  - Mac mini ベース 16GB：Docker フル運用は厳しく 24GB 推奨という声が複数
  - Mac mini フロント USB-C が 2 個しかない（既存レビューでも指摘）

## 冒頭 200 字（試筆）

> 悪い知らせから言う。今日（2026-05-13）の時点で **M5 MacBook Air はすでに発売済み**だ。M4 MacBook Air を新品で買うのは「値下がりした型落ち」を意識的に拾う選択になる。一方 M4 Mac mini は現行最新で、M5 Mac mini は早くて 2026 秋から 2027 年初頭の見込みだ。同じ「M4 で比較」でも、片方は中古市場に流れ始めていて、もう片方は買い控えの最中──ここを織り込まないと、値段で齟齬が出る。

書けた。

## 判定

- 検索意図の特定: pass
- 数字: 横ばい〜上昇（M5 Air 発売直後 + M4 値引きで関心が再上昇）
- 一次情報: 5 件以上（公式 / レビュー / 乗り換え体験談 / 不満点）
- 冒頭 200 字: 書けた
- 競合の星 1 / 星 5: Air ファンレス問題と Mac mini 周辺機器コスト、両極の声を確認

### Beacon の判定: **Go**

理由：「M5 MacBook Air は発売済み・M5 Mac mini は未発売という非対称な状況下で、形態（モバイル / 据え置き）と総額の罠を整理する記事は競合のメーカー仕様比較記事より読者の判断を早く着地させられる。既存 [M4 Mac mini レビュー](../../../src/content/reviews/m4-mac-mini-dev-machine.mdx) と内部リンクで束ねられる」
