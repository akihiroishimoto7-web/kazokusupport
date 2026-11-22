/** 手入力のランニング記録の集計（純粋関数） */
export type Run = { id: string; date: string; km: number; sec: number; hr?: number; vo2?: number };

/** 月曜はじまりの週の開始日（YYYY-MM-DD） */
export function weekStart(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export function weekly(runs: Run[], weeks: number, today: string) {
  const out: { week: string; km: number }[] = [];
  const start = new Date(`${weekStart(today)}T00:00:00Z`);
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const w = d.toISOString().slice(0, 10);
    out.push({ week: w, km: +runs.filter((r) => weekStart(r.date) === w).reduce((a, r) => a + r.km, 0).toFixed(1) });
  }
  return out;
}

/** 今週の距離が、直前3週の平均よりどれだけ多いか（%）。直前3週に記録がなければ null */
export function loadChange(w: { km: number }[]): number | null {
  if (w.length < 4) return null;
  const prev = w.slice(-4, -1).map((x) => x.km);
  const avg = prev.reduce((a, b) => a + b, 0) / 3;
  if (avg <= 0) return null;
  return Math.round(((w.at(-1)!.km - avg) / avg) * 100);
}
