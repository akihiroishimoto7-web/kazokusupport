/**
 * 特集「GYAKUSOU」のデータ
 * ------------------------------------------------------------------
 * 写真を追加するとき:
 *   1. 掲載条件（撮影者の許可・肖像・ロゴの扱い）を確認する
 *   2. 画像を public/features/gyakusou/ に置く（長辺 2000px 程度の JPEG/WebP、位置情報などのEXIFは削除）
 *   3. 下の zoomFlySp.photos に1件ずつ追加する（alt・credit・caption・note・permission は必須）
 *   4. npm run check（テストが、ファイルの有無と必須項目を確認します）
 *
 * 想定しているカット: side（真横）／rear-quarter（斜め後ろ）／material（素材のアップ）
 * 1枚だけでもページは成り立ちます。0枚なら写真の枠は出ません。
 *
 * 公式サイト・SNS・ショップの画像は転載・直リンクしないこと。商品を再現した生成画像も使わないこと。
 */
import type { ISODate, Source } from "@/lib/types";

export type FeaturePhotoCut = "side" | "rear-quarter" | "material";

export type FeaturePhoto = {
  cut: FeaturePhotoCut;
  /** public/ からのパス（例: /features/gyakusou/zoom-fly-side.jpg） */
  src: string;
  width: number;
  height: number;
  /** 代替テキスト。写っているものを具体的に */
  alt: string;
  /** 撮影者のクレジット（例: 「写真：山田太郎」） */
  credit: string;
  /** 写真のすぐ下に出す短い一言 */
  caption: string;
  /** 写真を見たあとに読む、短い解説（2〜3文） */
  note: string;
  /** 掲載条件を確認した日と、その内容（画面には出しません。記録用） */
  permission: { confirmedAt: ISODate; detail: string };
};

export const CUT_LABEL: Record<FeaturePhotoCut, string> = {
  side: "真横",
  "rear-quarter": "斜め後ろ",
  material: "素材のアップ",
};

export type FeatureModel = {
  slug: string;
  /** 第◯弾 */
  issue: number;
  name: string;
  colorway: string;
  /** 公式写真への案内（テキストリンクのみ。画像は使わない） */
  officialUrl: string;
  /** 確認した製品情報（公式ページの記載・データから） */
  facts: { label: string; value: string }[];
  photos: FeaturePhoto[];
};

export const zoomFlySp: FeatureModel = {
  slug: "zoom-fly-sp",
  issue: 1,
  name: "Nike × Gyakusou ズーム フライ SP",
  colorway: "Black and Sail and Mineral Yellow",
  officialUrl: "https://www.nike.com/jp/launch/t/zoom-fly-gyakusou-black-sail-mineral-yellow",
  facts: [
    { label: "カラー", value: "Black and Sail and Mineral Yellow" },
    { label: "商品番号", value: "AR4349-001" },
    { label: "日本での販売開始", value: "2018年10月11日（Nike SNKRS の商品データ）" },
    { label: "アッパー", value: "トランスルーセント（半透明）に、リフレクティブ素材のディテール" },
    { label: "プレート", value: "カーボン混ナイロンプレート" },
    { label: "原産地", value: "ベトナム" },
  ],
  // 掲載条件を確認した実物写真だけを追加してください（上の手順）
  photos: [],
};

export const gyakusouFeature = {
  path: "/features/gyakusou",
  title: "GYAKUSOU",
  subtitle: "走る服に、なぜこんなに惹かれるのか",
  description:
    "Nike × UNDERCOVER の高橋盾によるランニングライン「GYAKUSOU」を、色・素材・走るときのシルエットからランナーの目で読む特集。第1弾は Nike × Gyakusou ズーム フライ SP。",
  publishedAt: "2026-11-25" as ISODate,
  updatedAt: "2026-11-25" as ISODate,
  models: [zoomFlySp],
  sources: [
    {
      title: "Nike Gyakusou Returns to Challenge What Performance Running Looks Like Next",
      url: "https://about.nike.com/en/newsroom/releases/nike-gyakusou-returns-to-challenge-what-performance-running-looks-like-next",
      publisher: "NIKE, Inc. Newsroom（2026年11月25日）",
      checkedAt: "2026-11-25",
    },
    {
      title: "ナイキ ズーム フライ Gyakusou 'Black and Sail and Mineral Yellow' 発売日",
      url: "https://www.nike.com/jp/launch/t/zoom-fly-gyakusou-black-sail-mineral-yellow",
      publisher: "Nike SNKRS",
      checkedAt: "2026-11-25",
    },
  ] satisfies Source[],
};
