# 商品情報の更新ルール

## 原則

1. **日本の公式を優先**：メーカーの日本公式サイト・公式オンラインストア → 日本法人のプレスリリース（PR TIMES 等） → 海外の公式サイト（地域と通貨を明記）
   - 公式で確認できないときだけ、運営者が承認した情報源を使ってよい（2026-11-28 運営者の指示）：**ステップスポーツ・アルペン・ヒマラヤ（販売店）、ラントリップ（ランニングメディア）**。一覧は `lib/trusted-sources.ts`。それ以外の販売店・レビューサイトの数値は使わない
   - 承認済み情報源の値には `sourceType: "retailer"`（または `"media"`）と `sourceUrl` を付ける。画面では「販売店の記載」と表示し、公式の値と区別する。テストが一覧外の URL を拒否する
   - 公式の値が後から確認できたら、公式の値に置き換える
2. **推測しない**：書かれていない値は空のまま（画面では「未確認」）
3. **原文を残す**：値ごとに、公式ページの該当行をそのまま `evidence` に入れる。テストが「根拠の行に値が含まれるか」「厚さの差とドロップが合うか」を確かめる
4. **確認日を残す**：すべての値に `checkedAt`
5. **計測サイズ**：重量はサイズで変わる。サイズの記載がなければ `size: null`（比較ページでは差を計算しない）

## 置き場所

| 何を | どこに |
| --- | --- |
| シリーズの編集情報（位置づけ、向く人・向かない人、買わなくていい理由） | `content/shoes.ts` |
| 自動で集めるモデル（URL） | `data/shoes/targets.json`（adapter: nike / on / mizuno / shopify） |
| 手作業で確認したモデル | `data/shoes/models/<id>.json`＋`targets.json` に adapter: manual |
| 価格の記録（追記のみ） | `data/prices/<id>.json` |
| サイトが読むまとめ（自動生成） | `data/shoes/db.ts`（`npm run shoes:db`） |

## モデルの項目

`price`（`officialPrice`：kind = store / msrp、通常価格・セール）、`weightG`、`stackHeelMm`、`stackForefootMm`、`dropMm`、`releaseJp`（日本の発売日）、`styleCode`（品番）、`changes`（前作からの変更・公式の原文）、用途・向く人・向かない人（シリーズ側）、出典 URL、確認日。

## 世代が変わったとき

1. 新しい世代の公式ページを `targets.json` に `lifecycle: "current"` で追加
2. それまでの現行を `lifecycle: "previous"` に変更（公式ストアに残っている間は価格を追い続ける）
3. `npm run shoes:collect -- --only=<新しいid>` → 取れた値と `evidence` を目で確認
4. 世代比較ページ（`/shoes/models/<旧>-vs-<新>`）は自動でできる

## 自動取得できないメーカー

ASICS・adidas・HOKA・New Balance の公式サイトはボット対策で自動取得を拒否する。**偽装して回避しない**。プレスリリース（PR TIMES）で確認できる値（価格・発売日・変更点）を manual で入れ、重量などはブラウザで公式ページを開いた人が確認して渡す。
