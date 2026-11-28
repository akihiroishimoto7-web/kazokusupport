import type { ShoeModel } from "./shoe-db-types";
import { comparisons } from "../data/shoes/comparisons.ts";

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


/** シリーズをまたいだ比較（data/shoes/comparisons.json）。両方のモデルがあるものだけ */
export function curatedPairs(models: ShoeModel[]): { a: ShoeModel; b: ShoeModel; why: string; slug: string }[] {
  const out: { a: ShoeModel; b: ShoeModel; why: string; slug: string }[] = [];
  for (const p of comparisons) {
    const a = models.find((m) => m.id === p.a);
    const b = models.find((m) => m.id === p.b);
    if (a && b) out.push({ a, b, why: p.why, slug: `${a.id}-vs-${b.id}` });
  }
  return out;
}

/** 2つのモデル（シリーズ違い）の数値の違い。確認できた値だけ、計測サイズが違えば差を計算しない */
export function crossNotes(a: ShoeModel, b: ShoeModel): string[] {
  const out: string[] = [];
  const norm = (s?: string | null) => (s ?? "").replace(/メンズ|サイズ|\.0|\s/g, "");
  const wa = a.specs.weightG;
  const wb = b.specs.weightG;
  if (wa && wb) {
    out.push(
      wa.size && norm(wa.size) === norm(wb.size)
        ? wa.value === wb.value
          ? `重量はどちらも${wa.value}g（${wa.size}）。`
          : `重量は${wa.value < wb.value ? a.name : b.name}のほうが${Math.abs(wa.value - wb.value)}g軽い（${wa.size}、${wa.value}g と ${wb.value}g）。`
        : `重量は${a.name}が${wa.value}g${wa.size ? `（${wa.size}）` : ""}、${b.name}が${wb.value}g${wb.size ? `（${wb.size}）` : ""}。計測サイズが同じでないため、単純には比べられません。`,
    );
  } else out.push("重量は、どちらかが確認できていません（未確認）。");
  const da = a.specs.dropMm;
  const db = b.specs.dropMm;
  if (da && db) out.push(da.value === db.value ? `ドロップはどちらも${da.value}mm。` : `ドロップは${a.name}が${da.value}mm、${b.name}が${db.value}mm。`);
  const ha = a.specs.stackHeelMm;
  const hb = b.specs.stackHeelMm;
  if (ha && hb) out.push(`かかとの厚さは${a.name}が${ha.value}mm、${b.name}が${hb.value}mm。`);
  const pa = a.officialPrice?.regularPriceJpy;
  const pb = b.officialPrice?.regularPriceJpy;
  if (pa && pb) out.push(pa === pb ? `定価（税込）はどちらも${pa.toLocaleString("ja-JP")}円。` : `定価（税込）は${a.name}が${pa.toLocaleString("ja-JP")}円、${b.name}が${pb.toLocaleString("ja-JP")}円。`);
  return out;
}
