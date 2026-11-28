/**
 * 公式以外で、運営者が「信頼して使ってよい」と認めた情報源（2026-11-28 運営者の指示）。
 * ここにない販売店・レビューサイトの数値は使わない。
 * 画面では、公式の記載と区別して「販売店の記載」「メディアの記載」と表示する。
 */
export type SourceType = "official" | "retailer" | "media";

export const TRUSTED_SOURCES: { name: string; type: Exclude<SourceType, "official">; hosts: string[]; pathPrefix?: string }[] = [
  { name: "ステップスポーツ", type: "retailer", hosts: ["step-sports.co.jp", "www.step-sports.co.jp"] },
  { name: "ステップスポーツ（楽天市場店）", type: "retailer", hosts: ["item.rakuten.co.jp"], pathPrefix: "/step-sports/" },
  { name: "アルペン", type: "retailer", hosts: ["store.alpen-group.jp", "alpen-group.jp", "www.alpen-group.jp"] },
  { name: "アルペン（楽天市場店）", type: "retailer", hosts: ["item.rakuten.co.jp"], pathPrefix: "/alpen/" },
  { name: "ヒマラヤ", type: "retailer", hosts: ["himaraya.co.jp", "www.himaraya.co.jp", "store.himaraya.co.jp"] },
  { name: "ラントリップ", type: "media", hosts: ["runtrip.jp", "www.runtrip.jp", "store.runtrip.jp"] },
];

/** URL が承認済みの情報源なら、その名前と種類を返す */
export function trustedSource(url: string): { name: string; type: Exclude<SourceType, "official"> } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const hit = TRUSTED_SOURCES.find((s) => s.hosts.includes(u.hostname) && (!s.pathPrefix || u.pathname.startsWith(s.pathPrefix)));
  return hit ? { name: hit.name, type: hit.type } : null;
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  official: "メーカー公式の記載",
  retailer: "販売店の記載",
  media: "ランニングメディアの記載",
};
