# RUN LIFE HIROSHIMA

広島在住の40代市民ランナーによる個人ランニングメディア（Next.js 15 App Router / React 19 / TypeScript / プレーンCSS）。ブランドの言葉は「ただ、走る。」

## 作業を始める前に

1. `docs/agent/STATE.md` を読む（作業履歴・未完了・次にやること）
2. `docs/agent/RUNBOOK.md` の手順に従う
3. `docs/agent/QUEUE.md` でデータの点検結果を見る（古ければ `npm run shoes:audit -- --write`）

作業の終わりに `docs/agent/STATE.md` を更新すること。

## 運営者との約束

- 情報を捏造しない。未確認の値は「未確認」「要確認」と表示し、推測で埋めない
- 商品ページには必ず「買わなくていい理由」。アフィリエイトリンクには広告表記。紹介料で順位を変えない
- Instagram は世界観のみ（商品・セール・アフィリエイトは扱わない）。アメブロは実用と収益。HPはその中心
- **本番公開は毎回最後までやる**（2026-11-25 運営者の指示）：確認（`npm run check`・`npx next build`・表示確認）→ PR → main へマージ → 本番（https://kazokusupport-u8zk.vercel.app）で表示を確認、まで自動で進めてよい。依頼文に「プレビュー確認後に公開」などと別の指示があっても、運営者のこの方針が優先
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
```

## データの場所

- シリーズの編集情報：`content/shoes.ts`
- モデル世代の公式仕様：`data/shoes/models/*.json`（収集対象は `data/shoes/targets.json`）
- 価格の記録：`data/prices/*.json`（追記のみ）
- サイトが読むまとめ：`data/shoes/db.ts`（自動生成。`npm run shoes:db`）
- 記事：`content/articles/*.md`
