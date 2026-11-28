/** data/shoes/db.ts（自動生成）の型 */
export type SpecValue = {
  value: number;
  /** 重量の計測サイズ（例: 27cm） */
  size?: string | null;
  /** 公式ページ上の該当行（そのまま） */
  evidence: string;
  checkedAt: string;
  /** 商品ページ以外（プレスリリース・海外の公式サイトなど）で確認した場合の出典 */
  sourceUrl?: string;
  sourceTitle?: string;
};

/** 公式資料の原文をそのまま記録したもの */
export type QuotedFact = { text: string; sourceUrl: string; sourceTitle: string; checkedAt: string };

export type ShoeModel = {
  id: string;
  /** content/shoes.ts のシリーズ slug */
  series: string;
  brand: string;
  name: string;
  nameJa: string;
  generation: number;
  lifecycle: "current" | "previous";
  officialUrl: string;
  pageTitle: string;
  specs: Partial<Record<"weightG" | "dropMm" | "stackHeelMm" | "stackForefootMm", SpecValue>>;
  officialPrice?: PriceObservationCore & {
    checkedAt: string;
    /** store: 公式ストアの販売価格 / msrp: プレスリリース等のメーカー希望小売価格 */
    kind?: "store" | "msrp";
    evidence?: string;
    sourceUrl?: string;
    sourceTitle?: string;
  };
  /** 日本での発売日（公式資料の原文つき） */
  releaseJp?: { value: string; evidence: string; sourceUrl: string; sourceTitle: string; checkedAt: string };
  /** 品番など */
  styleCode?: string;
  /** 前作からの変更（公式の原文。要約・言い換えはしない） */
  changes?: QuotedFact[];
  checkedAt: string;
};

export type PriceObservationCore = {
  priceJpy: number;
  /** 通常価格。セール中で通常価格が表示されていない場合は null */
  regularPriceJpy: number | null;
  onSale: boolean;
};

export type PriceObservation = PriceObservationCore & { date: string; store: "official" | string; url: string };

export type ShoeDb = { models: ShoeModel[]; prices: Record<string, PriceObservation[]> };
