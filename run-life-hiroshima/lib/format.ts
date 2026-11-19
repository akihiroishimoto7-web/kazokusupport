import type { Fact } from "./types";

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

export function formatYen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}

export type FactState = "verified" | "unverified" | "unknown";

export function factState<T>(f: Fact<T>): FactState {
  if (f.value === null || f.value === undefined) return "unknown";
  return f.verified ? "verified" : "unverified";
}

export const FACT_LABEL: Record<FactState, string> = {
  verified: "確認済み",
  unverified: "要確認",
  unknown: "未確認",
};

/** 2桁の通し番号（01, 02 …） */
export const pad2 = (n: number) => String(n).padStart(2, "0");
