# SEO チェック手順

## 週1回

```bash
npm run seo:audit -- --write   # 本番をたどって docs/seo/report.md を作る
```

見るもの：title・description・canonical・h1・noindex・構造化データ（JSON-LD）・内部リンク切れ・sitemap との食い違い・孤立ページ・alt 抜け。P1 から直す。

## 方針

- 公式の数値と出典がそろったページだけ検索登録（`lib/shoe-db.ts` の `isIndexableShoe`）。中身の薄いページは noindex
- title は内容がわかる短い言葉で（60字以内が目安）。釣り文句は使わない
- 比較ページは、用途が近い組み合わせだけ（`lib/shoe-pairs.ts`）と、同じシリーズの世代比較（`lib/model-pairs.ts`）
- 内部リンク：記事 → シューズ・比較・診断、シューズ → 比較・世代比較・アメブロ、診断結果 → シューズ・比較・世代比較

## 月1回

- Lighthouse（モバイル）：性能・アクセシビリティ・SEO。2026-11-28 時点で性能 89〜95、SEO 100
- Search Console：表示回数が多いのにクリック率が低いページの title と description を見直す
