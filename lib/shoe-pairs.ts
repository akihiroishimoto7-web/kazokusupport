import type { Shoe } from "./types";

/**
 * 「A と B の比較」ページの組み合わせと、数値の差の説明をつくる純粋関数。
 * ------------------------------------------------------------------
 * - 公式仕様を確認できたシリーズ同士で、用途が2つ以上重なるものだけを組み合わせます（無理な比較をしない）。
 * - 重量は、計測サイズが同じときだけ差を計算します。サイズが違う・不明なら「単純には比べられない」と書きます。
 * - 価格の安さや紹介料で、どちらかを勝たせることはしません。
 */

export const pairSlug = (a: string, b: string) => (a < b ? `${a}-vs-${b}` : `${b}-vs-${a}`);

export function parsePairSlug(slug: string): [string, string] | null {
  const m = slug.split("-vs-");
  return m.length === 2 && m[0] && m[1] ? [m[0], m[1]] : null;
}

export function comparablePairs(shoes: Shoe[], isReady: (s: Shoe) => boolean): [Shoe, Shoe][] {
  const ready = shoes.filter(isReady).sort((a, b) => a.slug.localeCompare(b.slug));
  const out: [Shoe, Shoe][] = [];
  for (let i = 0; i < ready.length; i++)
    for (let j = i + 1; j < ready.length; j++) {
      const a = ready[i]!;
      const b = ready[j]!;
      if (a.brand === b.brand && a.series === b.series) continue;
      const shared = a.purposes.filter((p) => b.purposes.includes(p));
      if (shared.length >= 2) out.push([a, b]);
    }
  return out;
}

const normSize = (s?: string) => (s ? s.replace(/メンズ|サイズ|\s/g, "").replace(/\.0cm$/, "cm") : null);

export type PairNote = { label: string; text: string };

export function pairNotes(a: Shoe, b: Shoe, name: (s: Shoe) => string): PairNote[] {
  const notes: PairNote[] = [];
  const wa = a.specs.weightG;
  const wb = b.specs.weightG;
  if (wa.value != null && wb.value != null) {
    const sa = normSize(wa.size);
    const sb = normSize(wb.size);
    if (sa && sb && sa === sb) {
      const d = wa.value - wb.value;
      notes.push({
        label: "重量",
        text:
          d === 0
            ? `公式の重量は同じ${wa.value}g（${sa}）です。`
            : `公式の重量は、${name(d < 0 ? a : b)}のほうが${Math.abs(d)}g軽い（${sa}、${wa.value}g と ${wb.value}g）。`,
      });
    } else {
      notes.push({
        label: "重量",
        text: `${name(a)}は${wa.value}g（${sa ?? "計測サイズの記載なし"}）、${name(b)}は${wb.value}g（${sb ?? "計測サイズの記載なし"}）。計測サイズが${sa && sb ? "違う" : "わからない"}ため、単純には比べられません。`,
      });
    }
  }
  const da = a.specs.dropMm.value;
  const db = b.specs.dropMm.value;
  if (da != null && db != null) {
    notes.push({
      label: "ドロップ",
      text:
        da === db
          ? `ドロップ（かかととつま先の高さの差）はどちらも${da}mmです。`
          : `ドロップは${name(a)}が${da}mm、${name(b)}が${db}mm。差が大きいほど、かかと寄りの着地を受け止めやすい作りと言われます。`,
    });
  }
  const pa = a.specs.priceJpy.value;
  const pb = b.specs.priceJpy.value;
  if (pa != null && pb != null) {
    notes.push({
      label: "価格",
      text:
        pa === pb
          ? `公式の通常価格はどちらも${pa.toLocaleString("ja-JP")}円（税込）です。`
          : `公式の通常価格（税込）は${name(a)}が${pa.toLocaleString("ja-JP")}円、${name(b)}が${pb.toLocaleString("ja-JP")}円で、${(Math.abs(pa - pb)).toLocaleString("ja-JP")}円の差があります。`,
    });
  }
  const traitsA = new Set(a.traits);
  const traitsB = new Set(b.traits);
  if (traitsA.has("stability") !== traitsB.has("stability")) {
    const st = traitsA.has("stability") ? a : b;
    notes.push({ label: "支え", text: `${name(st)}は、足首の倒れ込みを抑える安定性（スタビリティ）タイプです。もう一方は、支えを強めていないニュートラルタイプです。` });
  }
  return notes;
}
