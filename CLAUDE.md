# RUN LIFE HIROSHIMA

広島在住の40代市民ランナーによる個人ランニングメディア（Next.js 15 App Router / React 19 / TypeScript / プレーンCSS）。ブランドの言葉は「ただ、走る。」

## 作業を始める前に

1. `docs/status.md`（進捗・未完了・承認待ち）と `docs/backlog.md`（優先順位付きの課題）を読む
2. `docs/strategy.md`（事業戦略）と `docs/agent/RUNBOOK.md`（定常業務の手順）に従う
3. 自動生成の点検結果：`docs/agent/QUEUE.md`（データ）、`docs/seo/report.md`（SEO）、`docs/reports/`（週次）
4. 手順書：`docs/ops/` — 商品情報の更新（product-data）、記事と事実確認（editorial）、SEO（seo）、週次分析（weekly）、計測（analytics）、自動化（automation）

作業の終わりに `docs/status.md` を更新すること。調べものは、可能ならサブエージェントで並列に（依頼の型は `docs/ops/editorial.md`）。受け取った値は公開前に自分で原文を確かめる。

## 編集思想

- 高い一足より、合う一足。購入する必要がない場合は、その理由も伝える
- 実体験と調査情報を明確に区別する（体験は運営者から提供されたものだけ）
- 上質で静かな誌面。Apple のような情報設計と、品のある美しさ。過剰な広告・煽り文句・派手な装飾はしない

## 運営者との約束

- 情報を捏造しない。未確認の値は「未確認」「要確認」と表示し、推測で埋めない
- 商品ページには必ず「買わなくていい理由」。アフィリエイトリンクには広告表記。紹介料で順位を変えない
- Instagram は世界観のみ（商品・セール・アフィリエイトは扱わない）。アメブロは実用と収益。HPはその中心
- **本番公開は毎回最後までやる**（2026-11-25 運営者の指示）：確認（`npm run check`・`npx next build`・表示確認）→ PR → main へマージ → 本番（https://kazokusupport-u8zk.vercel.app）で表示を確認、まで自動で進めてよい。その回の依頼で運営者が「今回は公開しないで」などと明示した場合だけ、それに従う
- それでも事前に承認が必要なもの：有料サービスの契約、取り消せないデータの削除、SNS・ブログへの投稿
- 既存機能を壊さない：`npm run check` と `npx next build` を通す
- デザイン：オフホワイト・チャコール・グレーに紺のアクセント。飾りの英語や意味のない数字は使わない。スマートフォン優先

## よく使うコマンド

```bash
npm run check                    # 型・内容の検証・テスト
npx next build                   # 本番ビルド
npm run shoes:collect            # 公式サイトから仕様・価格を収集（Playwright 必要）
npm run shoes:audit -- --write   # データの点検 → docs/agent/QUEUE.md
npm run ameblo:drafts            # アメブロ記事の下書き → drafts/ameblo/
npm run seo:audit -- --write     # SEO の点検 → docs/seo/report.md
npm run weekly:report            # 週次レポート → docs/reports/
```

## データの場所

- シリーズの編集情報：`content/shoes.ts`
- モデル世代の公式仕様：`data/shoes/models/*.json`（収集対象は `data/shoes/targets.json`）
- 価格の記録：`data/prices/*.json`（追記のみ）
- サイトが読むまとめ：`data/shoes/db.ts`（自動生成。`npm run shoes:db`）
- 記事：`content/articles/*.md`
- 収益の記録：`data/revenue/log.csv`（実績のみ）
- 計測イベント：`lib/track.ts`（診断）、`components/Analytics.tsx`（外部リンク）
