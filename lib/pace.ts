/** ペース計算（すべて秒・キロメートル単位） */

export const RACE_DISTANCES = [
  { id: "5k", label: "5km", km: 5 },
  { id: "10k", label: "10km", km: 10 },
  { id: "half", label: "ハーフマラソン", km: 21.0975 },
  { id: "full", label: "フルマラソン", km: 42.195 },
] as const;

export function paceFromTime(totalSec: number, km: number): number {
  return totalSec / km;
}

export function timeFromPace(paceSecPerKm: number, km: number): number {
  return paceSecPerKm * km;
}

/** "4:30" → 270、"1:05:00" → 3900。不正なら null */
export function parseClock(text: string): number | null {
  const t = text.trim().replace(/：/g, ":");
  if (!/^\d{1,3}(:\d{1,2}){0,2}$/.test(t)) return null;
  const parts = t.split(":").map(Number);
  if (parts.slice(1).some((p) => p >= 60)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

export function formatClock(sec: number, withHours = false): string {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h || withHours ? 2 : 1, "0");
  const rr = String(r).padStart(2, "0");
  return h || withHours ? `${h}:${mm}:${rr}` : `${mm}:${rr}`;
}

/** 日本語表記: 1時間05分00秒 / 5分30秒 */
export function formatJa(sec: number): string {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}時間${String(m).padStart(2, "0")}分${String(r).padStart(2, "0")}秒` : `${m}分${String(r).padStart(2, "0")}秒`;
}

/** 区間ごとの通過タイム（イーブンペース） */
export function splits(paceSecPerKm: number, km: number, every = 5): { km: number; sec: number }[] {
  const out: { km: number; sec: number }[] = [];
  for (let d = every; d < km; d += every) out.push({ km: d, sec: paceSecPerKm * d });
  out.push({ km, sec: paceSecPerKm * km });
  return out;
}
