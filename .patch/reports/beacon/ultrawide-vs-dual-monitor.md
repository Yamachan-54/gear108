# Beacon 検証: ultrawide-vs-dual-monitor

## 検索意図の特定

「**4K 27インチ単一モニターでブラウザ+IDE+ターミナルを並べきれなくなった在宅エンジニア** が **次のディスプレイ更新を発注する前夜** に **34"ウルトラワイドに移行するか、もう1枚足してデュアルにするかの判断軸** を探して検索したときに刺さる」

書けた → pass。

## 数字

- Trends: 横ばい〜上昇（"ultrawide vs dual monitor" 系は 2024-2026 で安定検索、5K2K ウルトラワイド機の登場で記事増）
- 競合上位:
  - https://www.rtings.com/monitor/reviews/best/by-usage/programming-and-coding
  - https://www.viewsonic.com/library/tech/compared/ultrawide-vs-dual-monitors/
  - https://www.curatingtech.com/blog/maximize-coding-productivity-ultrawide-monitor-vs-dual-monitors
  - https://mediator-net.jp/ultra-wide-monitor/
  - https://my-best.com/31185
- 公式: LG 40WP95C-W / Dell U4025QW / Dell U3425WE / Samsung Odyssey OLED G9 5120×2160

## 一次情報

### SNS / レビューの生の声

- 「HDMI 接続では 5K2K 72Hz 出ない（HDMI 2.0 制限）。Type-C で繋がないと本領発揮しない」（LG 40WP95C-W kakaku.com / NewsCoffee レビュー）
- 「34インチで 2560×1080 はピクセル密度が粗い。仕事用なら 3440×1440 以上必須」（複数日本語ブログ）
- 「Switch / PS5 はウルトラワイド非対応で左右黒帯。仕事兼ゲーム機運用に注意」（mouse LABO / Lenovo 記事）
- 「視線移動距離が増え、ピント調整頻度が上がって目が疲れた」（kino-tsuyo / maipyon ブログ）

### 撤退の死骸（金鉱 vs 墓場 判定）

- 「私は34インチ曲面ウルトラワイドモニタをやめた」（rankerd.hateblo.jp 2020）── デュアルに戻した記録あり。墓場ではないが「やめた人」も実在する → 金鉱寄り、ただし条件付き

### 星 1 / 星 5 の両方

- 星 5 決め手: 「縦の情報密度を犠牲にせず、横を広げられる。ターミナル+IDE+ブラウザ+チャットが同時表示できる」
- 星 1 不満: 「設置スペース不足でデスク買い替え必要だった」「ウルトラワイド対応していないゲーム/動画で黒帯」「初期不良の交換コスト（40インチ級は宅配返送が重い）」

## 冒頭 200 字（書けるかテスト）

> 悪い知らせから言う。「ウルトラワイドにすればデュアルより快適」も「デュアルこそ最強」も、どちらも嘘だ。どちらを選んでもデメリットは確実に残る。本記事は、コードを書くエンジニアという前提で、移行後に泣かないための判断軸を 4 つに絞って整理する。前提が違えば結論も変わる。「自分はどちら寄りか」を読み終えるまでに掴んでくれ。

書けた → pass。

## 判定

- 検索意図の特定: pass
- 数字: 横ばい〜上昇
- 一次情報: 4 件以上
- 冒頭 200 字: 書けた
- 星1/星5: 両方読んだ

### Beacon の判定: **Go**

理由（一文）：「34" ウルトラワイドへの移行を考える 4K27 ユーザーは確実にいて（kakaku 上位レビュー / 日本語ブログの再投下が続く）、競合上位は『ウルトラワイド推し』に寄っているため、**『どちらにもデメリットが残る』を悪い知らせから出す逆張り構造**が独自軸として成立する」。
