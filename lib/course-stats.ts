import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseGpx, summarizeGpx, type GpxSummary } from "./gpx";
import type { Course } from "./types";

/** コースのGPXから距離・累積標高・高低図を計算（ビルド時） */
export function courseStats(c: Course): GpxSummary | null {
  if (!c.route) return null;
  const file = path.join(process.cwd(), "public", "gpx", path.basename(c.route.gpx));
  if (!fs.existsSync(file)) return null;
  return summarizeGpx(parseGpx(fs.readFileSync(file, "utf8")));
}

/** ゆっくり走ったときの所要時間（1kmあたり7〜8分で計算） */
export function jogMinutes(km: number): [number, number] {
  const lo = Math.max(5, Math.floor((km * 7) / 5) * 5);
  const hi = Math.max(lo + 5, Math.ceil((km * 8) / 5) * 5);
  return [lo, hi];
}

export const ROUTE_KIND_LABEL = { loop: "周回", "out-and-back": "往復", "one-way": "片道" } as const;
