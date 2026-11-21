# 記事の書き方

`content/articles/` に、1記事1ファイルの Markdown（`.md`）で置きます。
ファイル名がそのまま URL になります（例: `start-first-week.md` → `/articles/start-first-week`）。
ファイル名は半角英小文字・数字・ハイフンだけを使ってください。

## 先頭の設定（frontmatter）

```yaml
---
title: 記事のタイトル
description: 一覧や検索結果に出る説明（80〜120字）
lede: 記事の冒頭に大きく出るリード文（任意）
category: start   # start / shoes / gear / hiroshima / care / race / essay
tags: [初心者, 習慣]
status: draft     # 公開するときに published
publishedAt: 2026-11-18
updatedAt: 2026-11-18
hero: motomachi-riverside-path   # 写真ID（content/photos.ts）任意
seasons: [autumn, winter]        # 季節のおすすめに使う。省略すると通年
levels: [first, beginner]        # first / beginner / intermediate
series: { id: start-guide, order: 8 }  # 連載に入れる場合（任意）
related: [start-first-week]      # 関連記事のファイル名（任意）
medical: true                    # からだ・健康の記事は true（免責表示が付きます）
sources:                         # 参考にした情報（任意）
  - title: 資料の名前
    url: https://example.com/
    publisher: 発行元
    checkedAt: 2026-11-18
---
```

## 本文で使える書き方

通常の Markdown（見出しは `##` から）に加えて:

```
:::experience 見出し
運営者が実際に体験したこと（必ず本当に体験したことだけ）
:::

:::research 見出し
第三者のレビューや公式情報を調べたこと
:::

:::evidence 見出し
医学的・科学的な根拠（出典を sources に書く）
:::

:::note 見出し
補足
:::

:::caution 見出し
注意
:::

@shoe(asics-novablast)       シューズを埋め込む（content/shoes.ts の slug）
@gear(pouch)                 道具カテゴリーを埋め込む（content/gear.ts の slug）
@course(chuo-park)           コースを埋め込む（content/courses.ts の slug）
@article(start-first-week)   記事を埋め込む
@tool(shoe-finder)           ツールを埋め込む（content/tools.ts の id）
```

存在しない slug を書くと `npm run validate` でエラーになります。

## ルール

- 体験していないことを、体験したように書かない
- 確認していない数字（価格・距離・重量など）を書かない
- 医療的な診断や治療効果を断定しない
- 検索順位のためだけの記事を量産しない
