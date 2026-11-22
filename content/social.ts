/**
 * Instagram・アメブロとの連携設定
 * ------------------------------------------------------------------
 * 3つの媒体の役割（docs/EDITORIAL.md も参照）
 *   Instagram   … 感性と世界観。売らない。商品紹介・セール・アフィリエイト誘導はしない
 *   アメブロ     … 専門性と収益。シューズレビュー・比較・セール・補給食・用品
 *   ホームページ … 両方をつなぐブランドの中心
 *
 * 設定したいもの
 *   amebaId           … アメブロのID（https://ameblo.jp/〇〇〇/ の〇〇〇）
 *   instagramUsername … Instagramのユーザーネーム（@なし）
 * どちらも null の間は、その連携セクションは表示されません（空の枠や偽の投稿は出しません）。
 */
export const social = {
  ameblo: {
    amebaId: "tougyou-0111" as string | null,
    /** ブログ名（表示用） */
    title: "ランニングシューズ研究所",
    /** 何件表示するか */
    limit: 6,
  },
  instagram: {
    username: "akihiroishimoto" as string | null,
    /**
     * 自動取得（公式API）を使う場合は、Vercel の環境変数に
     *   INSTAGRAM_ACCESS_TOKEN（長期アクセストークン）
     * を設定してください。ソースコードには書きません。
     * 設定がない場合は、content/instagram.ts に手で登録した投稿を表示します。
     */
    limit: 9,
  },
};

export const amebloUrl = () => (social.ameblo.amebaId ? `https://ameblo.jp/${social.ameblo.amebaId}/` : null);
export const instagramUrl = () =>
  social.instagram.username ? `https://www.instagram.com/${social.instagram.username}/` : null;
