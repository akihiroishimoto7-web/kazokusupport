/**
 * GPX ファイルから、距離・累積標高・ルート図・高低図を計算します。
 * 依存ライブラリなしで動く、シンプルな実装です。
 */

export type GpxPoint = { lat: number; lon: number; ele: number | null };

export type GpxSummary = {
  points: number;
  distanceKm: number;
  elevationGainM: number | null;
  minEle: number | null;
  maxEle: number | null;
  /** viewBox 0 0 1000 H のSVGパス（北が上） */
  routePath: string;
  routeHeight: number;
  /** viewBox 0 0 1000 200 の高低図パス */
  profilePath: string | null;
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export function parseGpx(xml: string): GpxPoint[] {
  const pts: GpxPoint[] = [];
  const re = /<(?:trkpt|rtept)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:trkpt|rtept)>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const attrs = m[1] ?? "";
    const lat = Number(attrs.match(/lat="([^"]+)"/)?.[1]);
    const lon = Number(attrs.match(/lon="([^"]+)"/)?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const eleRaw = m[2]?.match(/<ele>([^<]+)<\/ele>/)?.[1];
    const ele = eleRaw !== undefined && Number.isFinite(Number(eleRaw)) ? Number(eleRaw) : null;
    pts.push({ lat, lon, ele });
  }
  return pts;
}

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversine(a: GpxPoint, b: GpxPoint): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 細かな標高のぶれを拾わないよう、しきい値（既定3m）を超えた上昇だけを累積します */
export function elevationGain(eles: number[], threshold = 3): number {
  if (eles.length < 2) return 0;
  let gain = 0;
  let ref = eles[0]!;
  for (const e of eles.slice(1)) {
    if (e - ref >= threshold) {
      gain += e - ref;
      ref = e;
    } else if (ref - e >= threshold) {
      ref = e;
    }
  }
  return gain;
}

export function summarizeGpx(points: GpxPoint[]): GpxSummary | null {
  if (points.length < 2) return null;
  let dist = 0;
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    dist += haversine(points[i - 1]!, points[i]!);
    cum.push(dist);
  }
  const eles = points.map((p) => p.ele).filter((e): e is number => e !== null);
  const hasEle = eles.length === points.length;

  // 正距円筒図法で平面に投影（コース程度の範囲なら十分）
  const lat0 = rad(points.reduce((s, p) => s + p.lat, 0) / points.length);
  const xs = points.map((p) => p.lon * Math.cos(lat0));
  const ys = points.map((p) => -p.lat);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const pad = 40;
  const scale = (1000 - pad * 2) / span;
  const w = (maxX - minX) * scale;
  const h = (maxY - minY) * scale;
  const offX = pad + (1000 - pad * 2 - w) / 2;
  const routeHeight = Math.round(h + pad * 2);
  const proj = (i: number) => ({
    x: +(offX + (xs[i]! - minX) * scale).toFixed(1),
    y: +(pad + (ys[i]! - minY) * scale).toFixed(1),
  });
  const routePath = points.map((_, i) => `${i ? "L" : "M"}${proj(i).x} ${proj(i).y}`).join("");

  let profilePath: string | null = null;
  let minEle: number | null = null;
  let maxEle: number | null = null;
  if (hasEle) {
    minEle = Math.min(...eles);
    maxEle = Math.max(...eles);
    const range = Math.max(maxEle - minEle, 20);
    const py = (e: number) => +(190 - ((e - minEle!) / range) * 170).toFixed(1);
    profilePath =
      `M0 200` +
      points.map((p, i) => `L${+((cum[i]! / dist) * 1000).toFixed(1)} ${py(p.ele!)}`).join("") +
      `L1000 200Z`;
  }

  return {
    points: points.length,
    distanceKm: dist / 1000,
    elevationGainM: hasEle ? Math.round(elevationGain(eles)) : null,
    minEle,
    maxEle,
    routePath,
    routeHeight,
    profilePath,
    start: proj(0),
    end: proj(points.length - 1),
  };
}
