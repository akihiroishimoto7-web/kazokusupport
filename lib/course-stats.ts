import "server-only";
import fs from "node:fs";
import path from "node:path";
import { haversine, parseGpx, summarizeGpx, type GpxSummary } from "./gpx";
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

/** 山道など上りの多いルートの歩行時間の目安（ネイスミスの法則：時速5km＋上り600mごとに1時間） */
export function hikeMinutes(km: number, gainM: number): [number, number] {
  const base = (km / 5) * 60 + (gainM / 600) * 60;
  return [Math.max(5, Math.floor(base / 5) * 5), Math.ceil((base * 1.25) / 5) * 5];
}

export type RoutePoint = { x: number; y: number; km: number; ele: number | null };

/** 地図画像（Webメルカトル・地理院タイル）上の位置（%）に、GPXの各点を変換します */
export function routeOnMap(c: Course): RoutePoint[] | null {
  if (!c.route) return null;
  const file = path.join(process.cwd(), "public", "gpx", path.basename(c.route.gpx));
  if (!fs.existsSync(file)) return null;
  const pts = parseGpx(fs.readFileSync(file, "utf8"));
  const { zoom, bbox, width: W, height: H } = c.route.map;
  const tile = (lat: number, lon: number) => {
    const n = 2 ** zoom;
    const x = ((lon + 180) / 360) * n;
    const y = ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n;
    return [x * 256, y * 256] as const;
  };
  const [x0, y1] = tile(bbox[0], bbox[1]);
  const [x1, y0] = tile(bbox[2], bbox[3]);
  const left = (x0 + x1) / 2 - W / 2;
  const top = (y0 + y1) / 2 - H / 2;
  let km = 0;
  return pts.map((p, i) => {
    if (i) km += haversine(pts[i - 1]!, p) / 1000;
    const [x, y] = tile(p.lat, p.lon);
    return { x: +(((x - left) / W) * 100).toFixed(2), y: +(((y - top) / H) * 100).toFixed(2), km: +km.toFixed(3), ele: p.ele };
  });
}
