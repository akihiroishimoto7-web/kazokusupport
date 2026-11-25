/** data/shoes/db.ts（自動生成）の型 */
export type SpecValue = {
  value: number;
  /** 重量の計測サイズ（例: 27cm） */
  size?: string | null;
  /** 公式ページ上の該当行（そのまま） */
  evidence: string;
  checkedAt: string;
};

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
  officialPrice?: PriceObservationCore & { checkedAt: string };
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
