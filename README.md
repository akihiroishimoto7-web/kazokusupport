# RUN LIFE HIROSHIMA

「ただ、走る。」
広島在住の市民ランナーが運営する、個人ランニングメディアです。

- Next.js 15（App Router）／TypeScript／素のCSS（Tailwind等は不使用）
- 全ページを静的生成。外部サービス・データベース不要
- 依存パッケージは next / react / gray-matter / marked / server-only のみ

## 起動

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # 型チェック + コンテンツ検証 + テスト
npm run build
```

下書き記事も表示して確認したいときは `SHOW_DRAFTS=1 npm run dev`。

## Vercel で公開する

このリポジトリの一番上がそのままサイトなので、特別な設定はいりません。

1. Vercel の「Add New → Project」でこのリポジトリを選び、そのまま「Deploy」
2. 本番URLが決まったら、Environment Variables に `NEXT_PUBLIC_SITE_URL=https://（本番URL）` を追加して再デプロイ（OGP・sitemap・canonical に使います）
3. 公開準備が整うまで検索エンジンに載せたくない場合は `NEXT_PUBLIC_NOINDEX=1` を追加

以後は GitHub にプッシュするたびに自動でデプロイされ、ブランチごとにプレビューURLが発行されます。

## どこを編集すればいいか

| やりたいこと | 編集するファイル |
| --- | --- |
| 記事を追加・修正 | `content/articles/*.md`（書き方は `content/articles/README.md`） |
| シューズを追加・スペック確認 | `content/shoes.ts` |
| 道具・場面別ガイド | `content/gear.ts` |
| 広島のコース | `content/courses.ts`（GPXは `public/gpx/`） |
| 写真の差し替え | `public/photos/` と `content/photos.ts` |
| アフィリエイトID | `content/affiliate.ts` |
| セール情報 | `content/sales.ts` |
| プロフィール・SNS・アメブロのURL | `content/site.ts` |
| トップの「何から始めよう？」 | `content/home.ts` |
| カテゴリーの説明・扱うテーマ | `content/categories.ts` |
| 診断・ツールの一覧 | `content/tools.ts` |
| 大会持ち物リスト | `content/checklist.ts` |

編集したら `npm run check` を実行してください。存在しない記事・写真・商品への参照があるとエラーで教えてくれます。

### 写真の差し替え

1. 画像を `public/photos/` に置く（長辺1920px程度のJPEGで十分。表示時に自動で最適化されます）
2. `content/photos.ts` に登録（`src`・`width`・`height`・`alt`・`place`・`credit`）
   - 自分で撮った写真は `credit: { kind: "self" }`
   - 撮影地が広島の特定の場所でない写真は `isHiroshima: false`（コースには使えないよう検証されます）
3. 記事なら frontmatter の `hero`、コースなら `photo` に写真IDを書く

写真がない場所は、文字と線だけの面が自動で表示されます。

### 商品リンク（アフィリエイト）

`content/affiliate.ts` に楽天のアフィリエイトID、Amazonのトラッキングタグ、バリューコマースの sid/pid を入れるだけで、サイト中の購入リンクがすべて切り替わり、「広告」表示と `rel="sponsored"` が自動で付きます。未設定の間はふつうの検索リンクです。

### シューズのレビューを公開する

`content/shoes.ts` 冒頭のコメントの手順どおりに、スペックを公式で確認して `verified: true` と出典を入れ、`status: "review"` にします。スペック未確認の「シリーズ概要」ページは検索エンジンに登録されません（noindex）。

### コースを「走って確認済み」にする

`content/courses.ts` の facts を埋め、GPXを `public/gpx/` に置いて `gpx` にファイル名を書き、`runReport` に感想、`status: "surveyed"`。距離・累積標高・ルート図・高低図はGPXから自動計算されます。

## AIエージェントに頼むときの例

- 「content/articles/README.md のルールに従って、〇〇の記事を下書き（status: draft）で書いて。体験談は書かないで」
- 「content/shoes.ts の asics-novablast を、公式サイトで確認したスペックで更新して。出典と確認日も入れて」
- 「新しい写真 public/photos/xxx.jpg を content/photos.ts に登録して、中央公園のコースに使って」

最後に必ず `npm run check` と `npm run build` を実行してもらってください。

## 編集ルール（このサイトの約束）

- 体験と調査を分ける（`:::experience` と `:::research`）
- 確認していない数値は書かず「未確認」と表示する
- 「買わなくてもいい理由」を必ず書く
- 紹介料で順位や評価を変えない
- 医療的な診断・治療効果を断定しない
