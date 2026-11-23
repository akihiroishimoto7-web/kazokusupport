import { curated, purposeKeywords, shoeKeywords } from "../content/ameblo-links.ts";
import type { ShoePurposeId } from "./types.ts";

export type LinkedEntry = { title: string; url: string; date: string; image?: string; shoes: string[]; purposes: ShoePurposeId[] };

const has = (title: string, words: string[]) => {
  const t = title.normalize("NFKC").toLowerCase();
  return words.some((w) => {
    const k = w.normalize("NFKC").toLowerCase();
    // 数字だけの型番（1080 など）は、前後が数字でないときだけ一致
    return /^\d+$/.test(k) ? new RegExp(`(^|\\D)${k}(\\D|$)`).test(t) : t.includes(k);
  });
};

/** アメブロ記事に、関係するシューズと用途のしるしを付ける（純粋関数） */
export function linkEntries(entries: { title: string; url: string; date: string; image?: string }[]): LinkedEntry[] {
  const auto = entries.map((e) => ({
    ...e,
    shoes: Object.entries(shoeKeywords).filter(([, w]) => has(e.title, w)).map(([s]) => s),
    purposes: (Object.entries(purposeKeywords) as [ShoePurposeId, string[]][]).filter(([, w]) => has(e.title, w)).map(([p]) => p),
  }));
  const extra = curated
    .filter((c) => !auto.some((a) => a.url === c.url))
    .map((c) => ({ ...c, shoes: c.shoes ?? [], purposes: c.purposes ?? [] }));
  return [...auto, ...extra];
}

/** 診断の結果に添える記事：候補のシューズに直接関係する記事 → 用途が合う記事、の順に最大n件 */
export function pickForResult(linked: LinkedEntry[], shoeSlugs: string[], purpose: ShoePurposeId, n = 3): LinkedEntry[] {
  const direct = linked.filter((e) => e.shoes.some((s) => shoeSlugs.includes(s)));
  const byPurpose = linked.filter((e) => !direct.includes(e) && e.purposes.includes(purpose));
  return [...direct, ...byPurpose].slice(0, n);
}
