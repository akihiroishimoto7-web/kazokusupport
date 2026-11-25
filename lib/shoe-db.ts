import { db } from "../data/shoes/db.ts";
import type { PriceObservation, ShoeModel } from "./shoe-db-types.ts";
import type { Fact, Shoe, Source } from "./types";

/**
 * シューズデータベース（公式サイトから集めたモデル世代ごとの仕様と価格）
 * ------------------------------------------------------------------
 * 元データ: data/shoes/models/*.json・data/prices/*.json（npm run shoes:collect で更新）
 * シリーズ単位の編集情報（content/shoes.ts）に、現行モデルの公式仕様を重ねて使います。
 */

export const allModels = (): ShoeModel[] => db.models;

export function modelsOf(series: string): ShoeModel[] {
  return db.models.filter((m) => m.series === series).sort((a, b) => b.generation - a.generation);
}

export const currentModel = (series: string) => modelsOf(series).find((m) => m.lifecycle === "current") ?? null;
export const previousModels = (series: string) => modelsOf(series).filter((m) => m.lifecycle === "previous");
export const getModel = (id: string) => db.models.find((m) => m.id === id) ?? null;
export const priceHistory = (id: string): PriceObservation[] => db.prices[id] ?? [];

/** 公式ストアでの割引率（%）。通常価格が分からなければ null */
export function discountRate(m: ShoeModel): number | null {
  const p = m.officialPrice;
  if (!p || !p.onSale || !p.regularPriceJpy) return null;
  return Math.round((1 - p.priceJpy / p.regularPriceJpy) * 100);
}

/** いま公式ストアで買える最も安い価格（セール含む） */
export function lowestOfficialPrice(series: string): { model: ShoeModel; priceJpy: number } | null {
  let best: { model: ShoeModel; priceJpy: number } | null = null;
  for (const m of modelsOf(series)) {
    const p = m.officialPrice?.priceJpy;
    if (p && (!best || p < best.priceJpy)) best = { model: m, priceJpy: p };
  }
  return best;
}

const BRAND_STORE: Record<string, string> = {
  nike: "ナイキ公式オンラインストア",
  on: "On 公式オンラインストア",
  mizuno: "ミズノ公式オンライン",
  saucony: "サッカニー公式オンラインストア",
  brooks: "ブルックス公式オンラインストア",
};

export function modelSource(m: ShoeModel): Source {
  return { title: `${m.pageTitle}`, url: m.officialUrl, publisher: BRAND_STORE[m.brand] ?? "メーカー公式サイト", checkedAt: m.checkedAt };
}

const NOTE = "メーカー公式ページの記載";

function specFact(m: ShoeModel, key: keyof ShoeModel["specs"], prev: Fact<number>): Fact<number> & { size?: string } {
  const v = m.specs[key];
  if (!v) return prev;
  return {
    value: v.value,
    verified: true,
    source: { ...modelSource(m), checkedAt: v.checkedAt },
    note: `${NOTE}「${v.evidence}」`,
    ...(v.size ? { size: v.size.replace(/^メンズサイズ/, "メンズ") } : {}),
  };
}

/**
 * シリーズの編集情報に、データベースの現行モデルを重ねます。
 * - 値が取れていない項目は、もとの値（手作業で確認したもの、または未確認）を残します。
 * - 通常価格が分からない場合（セール中で通常価格の表示がないなど）は、価格を上書きしません。
 */
export function withModelData(shoe: Shoe): Shoe {
  const m = currentModel(shoe.slug);
  if (!m) return shoe;
  const regular = m.officialPrice?.regularPriceJpy ?? null;
  const priceJpy: Fact<number> =
    regular != null
      ? {
          value: regular,
          verified: true,
          source: { ...modelSource(m), checkedAt: m.officialPrice!.checkedAt },
          note: "メーカー公式オンラインストアの通常価格（税込）。セール時は変わります",
        }
      : shoe.specs.priceJpy;
  const source = modelSource(m);
  const sameModel = shoe.model === m.name;
  const query = `${shoe.brand === "newbalance" ? "ニューバランス " : ""}${m.name}`;
  return {
    ...shoe,
    model: m.name,
    checkedAt: m.checkedAt,
    updatedAt: m.checkedAt > shoe.updatedAt ? m.checkedAt : shoe.updatedAt,
    specs: {
      priceJpy,
      weightG: specFact(m, "weightG", sameModel ? shoe.specs.weightG : unknownFact()),
      stackHeelMm: specFact(m, "stackHeelMm", sameModel ? shoe.specs.stackHeelMm : unknownFact()),
      stackForefootMm: specFact(m, "stackForefootMm", sameModel ? shoe.specs.stackForefootMm : unknownFact()),
      dropMm: specFact(m, "dropMm", sameModel ? shoe.specs.dropMm : unknownFact()),
    },
    // 古い世代の出典は外し、現行モデルの公式ページを先頭に
    sources: [source, ...(sameModel ? shoe.sources.filter((s) => s.url !== source.url) : [])],
    links: { ...shoe.links, rakuten: query, amazon: query, yahoo: query, official: m.officialUrl },
  };
}

const unknownFact = (): Fact<number> => ({ value: null, verified: false });

/** 公式仕様（重量と価格）を確認できているか。検索エンジンに登録してよいかの判断に使います */
export function hasVerifiedSpecs(shoe: Shoe): boolean {
  return shoe.specs.weightG.verified && shoe.specs.weightG.value != null && shoe.specs.priceJpy.value != null;
}

/**
 * 検索エンジンに登録してよいシューズページか。
 * レビュー済み、または現行モデルの公式仕様（重量・価格）を出典つきで確認できたページだけを登録します。
 */
export const isIndexableShoe = (shoe: Shoe) => shoe.status === "review" || (shoe.status === "outline" && hasVerifiedSpecs(shoe));

/** 診断ツール用：シリーズごとの公式ストア価格（現行と前の世代） */
export function priceIndex(): Record<string, { model: string; priceJpy: number; lifecycle: "current" | "previous"; onSale: boolean; checkedAt: string }[]> {
  const out: ReturnType<typeof priceIndex> = {};
  for (const m of db.models) {
    if (!m.officialPrice) continue;
    (out[m.series] ??= []).push({
      model: m.name,
      priceJpy: m.officialPrice.priceJpy,
      lifecycle: m.lifecycle,
      onSale: m.officialPrice.onSale,
      checkedAt: m.officialPrice.checkedAt,
    });
  }
  return out;
}
