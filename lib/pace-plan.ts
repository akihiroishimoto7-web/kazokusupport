/** マラソンのペース配分（純粋関数。tests でテストしています） */

export type Strategy = "even" | "negative" | "positive";

export const STRATEGY_LABEL: Record<Strategy, string> = {
  even: "イーブン",
  negative: "後半上げ（ネガティブスプリット）",
  positive: "前半貯金",
};

/**
 * 1kmごとのペース（秒/km）を作る。合計が必ず目標タイムになるように調整します。
 * spread … 前半と後半のペース差（秒/km）。even では 0。
 * 最後の端数区間（例: 42.195km の 0.195km）もその地点のペースで計算します。
 */
export function buildPlan(totalSec: number, km: number, strategy: Strategy, spread = 10) {
  const segs: number[] = [];
  for (let d = 0; d < km - 1e-9; d += 1) segs.push(Math.min(1, km - d));
  const n = segs.length;
  const shape = segs.map((_, i) => {
    if (strategy === "even") return 0;
    // 前半 +spread/2、後半 -spread/2 へなめらかに変化（後半上げ）。前半貯金はその逆
    const t = n === 1 ? 0 : i / (n - 1);
    const v = spread / 2 - spread * t;
    return strategy === "negative" ? v : -v;
  });
  const avg = totalSec / km;
  // 区間の長さで重みづけした平均がゼロになるよう補正
  const bias = shape.reduce((a, v, i) => a + v * segs[i]!, 0) / km;
  const pace = shape.map((v) => avg + v - bias);
  let t = 0;
  let d = 0;
  const rows = pace.map((p, i) => {
    t += p * segs[i]!;
    d += segs[i]!;
    return { km: +d.toFixed(3), pace: p, elapsed: t };
  });
  return { avg, rows };
}

/** 指定距離を通過する時刻（線形補間） */
export function timeAt(rows: { km: number; elapsed: number }[], target: number): number {
  let prevKm = 0;
  let prevT = 0;
  for (const r of rows) {
    if (r.km >= target - 1e-9) return prevT + ((target - prevKm) / (r.km - prevKm)) * (r.elapsed - prevT);
    prevKm = r.km;
    prevT = r.elapsed;
  }
  return rows.at(-1)?.elapsed ?? 0;
}
