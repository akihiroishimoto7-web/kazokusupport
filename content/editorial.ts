/**
 * AI編集部の企画台帳と、媒体の振り分け
 * ------------------------------------------------------------------
 * 1つの企画を、無条件に全媒体へ展開しない。企画ごとに媒体を判断する。
 * 判断の基準は docs/EDITORIAL.md。`npm run channels` で一覧を確認できます。
 *
 * site      … "article"=HPに記事として掲載 / "feature"=写真・読み物として紹介 / "link"=アメブロ記事を紹介 / "none"
 * ameblo    … "publish" / "none"
 * instagram … "post" / "reel" / "none"
 * commercial … 商品・セール・アフィリエイトに関わる企画は true（Instagram は必ず "none"）
 */
export type PlanItem = {
  id: string;
  title: string;
  kind: "shoes" | "fuel" | "gear" | "scenery" | "mind" | "course" | "care" | "essay";
  commercial: boolean;
  site: "article" | "feature" | "link" | "none";
  ameblo: "publish" | "none";
  instagram: "post" | "reel" | "none";
  why: string;
  status: "idea" | "drafting" | "published";
};

export const editorialPlan: PlanItem[] = [
  {
    id: "naturalsaurus-gel-compare",
    title: "ナチュラルサウルスジェル比較",
    kind: "fuel",
    commercial: true,
    site: "link",
    ameblo: "publish",
    instagram: "none",
    why: "商品比較はアメブロで。HPは補給食の記事から紹介する。Instagramでは売らない。",
    status: "idea",
  },
  {
    id: "hiroshima-morning-run",
    title: "広島の朝のランニング風景",
    kind: "scenery",
    commercial: false,
    site: "feature",
    ameblo: "none",
    instagram: "post",
    why: "感性と世界観の投稿。HPでは写真・読み物として紹介する。",
    status: "idea",
  },
  {
    id: "lifting-meditation",
    title: "リフティング瞑想",
    kind: "mind",
    commercial: false,
    site: "feature",
    ameblo: "none",
    instagram: "reel",
    why: "心を整える独自のコンテンツ。短いリールが合う。必要がなければアメブロには載せない。",
    status: "idea",
  },
  {
    id: "running-shoes-compare",
    title: "ランニングシューズ比較",
    kind: "shoes",
    commercial: true,
    site: "link",
    ameblo: "publish",
    instagram: "none",
    why: "比較・レビューはアメブロ。HPのシューズ研究所から検索・比較できるように紹介する。",
    status: "idea",
  },
];
