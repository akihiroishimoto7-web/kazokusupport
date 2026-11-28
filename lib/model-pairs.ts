import type { ShoeModel } from "./shoe-db-types";

/**
 * 世代比較（例: Pegasus 41 と 42）の組み合わせ。
 * 同じシリーズの「現行」と「一つ前の世代」が両方データベースにあるときだけ作ります。
 */
export const modelPairSlug = (newer: ShoeModel, older: ShoeModel) => `${older.id}-vs-${newer.id}`;

export function generationPairs(models: ShoeModel[]): { older: ShoeModel; newer: ShoeModel }[] {
  const out: { older: ShoeModel; newer: ShoeModel }[] = [];
  const bySeries = new Map<string, ShoeModel[]>();
  for (const m of models) bySeries.set(m.series, [...(bySeries.get(m.series) ?? []), m]);
  for (const list of bySeries.values()) {
    const cur = list.find((m) => m.lifecycle === "current");
    if (!cur) continue;
    const prev = list.filter((m) => m.lifecycle === "previous" && m.generation < cur.generation).sort((a, b) => b.generation - a.generation)[0];
    if (prev) out.push({ older: prev, newer: cur });
  }
  return out.sort((a, b) => a.newer.id.localeCompare(b.newer.id));
}

/** 2つのモデルの数値の違いを、確認できた値だけで文章にする（推測しない） */
export function generationNotes(older: ShoeModel, newer: ShoeModel): string[] {
  const out: string[] = [];
  const w0 = older.specs.weightG;
  const w1 = newer.specs.weightG;
  if (w0 && w1) {
    const same = (w0.size ?? "").replace(/メンズ|サイズ|\.0/g, "") === (w1.size ?? "").replace(/メンズ|サイズ|\.0/g, "") && w0.size;
    out.push(
      same
        ? w1.value === w0.value
          ? `公式の重量は同じ${w1.value}g（${w1.size}）。`
          : `公式の重量は${w0.value}gから${w1.value}gへ（${w1.size}、${w1.value > w0.value ? "+" : ""}${w1.value - w0.value}g）。`
        : `公式の重量は${older.name}が${w0.value}g、${newer.name}が${w1.value}g。計測サイズの記載が同じでないため、単純には比べられません。`,
    );
  } else out.push("重量は、両方の公式資料で確認できていません（未確認）。");
  const d0 = older.specs.dropMm;
  const d1 = newer.specs.dropMm;
  if (d0 && d1) out.push(d0.value === d1.value ? `ドロップはどちらも${d1.value}mm。` : `ドロップは${d0.value}mmから${d1.value}mmへ。`);
  const p0 = older.officialPrice;
  const p1 = newer.officialPrice;
  if (p0?.regularPriceJpy && p1?.regularPriceJpy) {
    const diff = p1.regularPriceJpy - p0.regularPriceJpy;
    out.push(
      diff === 0
        ? `定価（税込）はどちらも${p1.regularPriceJpy.toLocaleString("ja-JP")}円。`
        : `定価（税込）は${p0.regularPriceJpy.toLocaleString("ja-JP")}円から${p1.regularPriceJpy.toLocaleString("ja-JP")}円へ（${diff > 0 ? "+" : ""}${diff.toLocaleString("ja-JP")}円）。`,
    );
  }
  if (p0?.onSale && p0.regularPriceJpy) {
    const off = Math.round((1 - p0.priceJpy / p0.regularPriceJpy) * 100);
    out.push(`${older.name}は、公式ストアで${p0.priceJpy.toLocaleString("ja-JP")}円（通常価格から${off}%引き、${p0.checkedAt.replaceAll("-", ".")}確認）。`);
  }
  return out;
}
