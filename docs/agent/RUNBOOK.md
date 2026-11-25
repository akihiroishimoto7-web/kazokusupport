# 定常業務の手順（エージェント用）

このサイトは「エージェントが動くほどデータがたまる」ように作っています。毎回の作業は、次の順で進めてください。

## 0. 守ること（運営者との約束）

- 情報を捏造しない。公式ページに書かれていない数値は入れない（未確認のまま）。
- 既存の機能を壊さない。`npm run check` と `npx next build` が通らない変更は出さない。
- 有料サービスの契約、本番公開（main へのマージ）、SNS・ブログへの投稿は、運営者の承認を得てから。
- 作業用ブランチで作業し、PR は draft で作る。
- 紹介料で順位・評価を変えない。「買わなくていい理由」を必ず書く。
- Instagram は世界観のみ。商品・セール・アフィリエイトは扱わない。

## 1. はじめに読む

1. `docs/agent/STATE.md` … これまでの作業、未完了、次にやること
2. `docs/agent/QUEUE.md` … データの点検結果（`npm run shoes:audit -- --write` で再生成）
3. `docs/business/ANALYSIS.md` … 収益の考え方と優先順位

## 2. 週1回：価格と仕様の収集

```bash
npm run shoes:collect          # 公式サイトから仕様・価格を集め、data/ に追記し db.ts を作り直す
npm run shoes:audit -- --write # 作業キューを更新
npm run check                  # 型・内容・テスト
```

- 取れなかった値は前回の値が残ります。`data/shoes/last-run.json` に失敗が記録されます。
- 価格の記録（`data/prices/*.json`）は追記のみ。過去の記録は消さないでください。
- 1ページずつ間隔を空けて取得しています。並列化しないでください。

## 3. モデルを増やす

1. メーカー公式（または公式オンラインストア）の、メンズ標準幅の商品ページを探す。
2. `data/shoes/targets.json` に追加（`series` は `content/shoes.ts` の slug、`lifecycle` は current か previous）。
   - 新しい世代が出たら、古い世代を `previous` に変え、新しい世代を `current` で追加する。
3. `npm run shoes:collect -- --only=<id>` → 取れた値と根拠の行（evidence）を目で確認する。
4. 新しい書式のサイトで値が取れないときは、`scripts/shoes/extract.mjs` を直し、`tests/shoe-db.test.mjs` に実際の書式を1つ足す。
5. 新しいシリーズ自体を足すときは、`content/shoes.ts` に outline を追加し、`content/ameblo-links.ts` にキーワードを足す。

### 自動取得できないメーカー（ASICS・adidas・HOKA・New Balance）

公式サイトがボット対策で拒否します（`targets.json` の `blocked`）。回避のための偽装はしないでください。手作業で確認する場合は、`data/shoes/models/<id>.json` を同じ形式で作り、`evidence` に公式ページの文言をそのまま、`officialUrl` に確認したURLを入れます。確認できない値は入れません。

## 4. アメブロの下書き

```bash
npm run ameblo:drafts                 # 値下がりまとめ（30%引き以上）＋まだないモデル記事
npm run ameblo:drafts -- --series=brooks-ghost   # 1シリーズを作り直す
```

出力は `drafts/ameblo/`。運営者が内容を確認し、Ameba Pick のリンクを貼って手作業で投稿します。エージェントは投稿しません。

## 5. 公開まで

1. 作業ブランチで commit → push → draft PR。
2. PR 本文に「何が変わったか」「確認したこと」「本番公開の承認が必要なこと」を書く。
3. 運営者の承認を得てからマージ。マージ後、本番（kazokusupport-u8zk.vercel.app）で表示を確認。

## 6. 作業の終わりに

`docs/agent/STATE.md` の「作業履歴」に1行追加し、「未完了」「次にやること」を更新してください。次のエージェントは、そこから再開します。
