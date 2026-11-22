"use client";

import { useId, useMemo, useState } from "react";
import { buildPlan, STRATEGY_LABEL, timeAt, type Strategy } from "@/lib/pace-plan";
import { formatClock, parseClock } from "@/lib/pace";

const DIST = [
  { id: "full", label: "フル", km: 42.195 },
  { id: "half", label: "ハーフ", km: 21.0975 },
  { id: "10k", label: "10km", km: 10 },
] as const;

export function PaceSimulator() {
  const id = useId();
  const [dist, setDist] = useState<(typeof DIST)[number]["id"]>("full");
  const [time, setTime] = useState("4:30:00");
  const [strategy, setStrategy] = useState<Strategy>("negative");
  const [spread, setSpread] = useState(10);
  const km = DIST.find((d) => d.id === dist)!.km;
  const total = parseClock(time);

  const plan = useMemo(() => (total ? buildPlan(total, km, strategy, strategy === "even" ? 0 : spread) : null), [total, km, strategy, spread]);

  if (!plan || !total) {
    return (
      <Shell>
        <p className="pace__error">目標タイムは「4:30:00」のように、時:分:秒で入力してください。</p>
      </Shell>
    );
  }

  const paces = plan.rows.map((r) => r.pace);
  const lo = Math.min(...paces) - 6;
  const hi = Math.max(...paces) + 6;
  const y = (p: number) => 10 + ((p - lo) / (hi - lo || 1)) * 140; // 遅いほど下
  const half = km / 2;
  const tHalf = timeAt(plan.rows, half);
  const checkpoints = [...Array.from({ length: Math.floor(km / 5) }, (_, i) => (i + 1) * 5), km].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <Shell>
      <div className="ps-controls">
        <fieldset className="field">
          <legend className="field__label">距離</legend>
          <div className="segmented segmented--3" role="radiogroup">
            {DIST.map((d) => (
              <button key={d.id} type="button" role="radio" aria-checked={dist === d.id} onClick={() => setDist(d.id)}>
                {d.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span className="field__label">目標タイム（時:分:秒）</span>
          <input className="input input--big num" inputMode="numeric" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <fieldset className="field">
          <legend className="field__label">配分</legend>
          <div className="segmented segmented--3" role="radiogroup">
            {(Object.keys(STRATEGY_LABEL) as Strategy[]).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={strategy === s} onClick={() => setStrategy(s)}>
                {s === "negative" ? "後半上げ" : STRATEGY_LABEL[s]}
              </button>
            ))}
          </div>
        </fieldset>
        {strategy !== "even" ? (
          <label className="field" htmlFor={`${id}-spread`}>
            <span className="field__label">
              前半と後半の差　<span className="num">{spread}</span>秒/km
            </span>
            <input id={`${id}-spread`} type="range" min={2} max={30} step={1} value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="cx-explorer__range" />
          </label>
        ) : null}
      </div>

      <dl className="ps-main" aria-live="polite">
        <div>
          <dt>平均ペース</dt>
          <dd className="num">{formatClock(plan.avg)}</dd>
        </div>
        <div>
          <dt>中間点の通過</dt>
          <dd className="num">{formatClock(tHalf, true)}</dd>
        </div>
        <div>
          <dt>最初の1km</dt>
          <dd className="num">{formatClock(plan.rows[0]!.pace)}</dd>
        </div>
        <div>
          <dt>最後の1km</dt>
          <dd className="num">{formatClock(plan.rows.at(-2)?.pace ?? plan.rows[0]!.pace)}</dd>
        </div>
      </dl>

      <figure className="ps-chart">
        <svg viewBox="0 0 1000 160" role="img" aria-label={`1kmごとのペースのグラフ。${STRATEGY_LABEL[strategy]}`} preserveAspectRatio="none">
          <line x1="0" x2="1000" y1={y(plan.avg)} y2={y(plan.avg)} className="ps-chart__avg" />
          {plan.rows.map((r, i) => {
            const x0 = ((i === 0 ? 0 : plan.rows[i - 1]!.km) / km) * 1000;
            const x1 = (r.km / km) * 1000;
            return <rect key={i} x={x0 + 1} width={Math.max(x1 - x0 - 2, 1)} y={y(r.pace)} height={160 - y(r.pace)} className="ps-chart__bar" />;
          })}
          <line x1={(half / km) * 1000} x2={(half / km) * 1000} y1="0" y2="160" className="ps-chart__half" />
        </svg>
        <figcaption className="ps-chart__cap">
          <span>スタート</span>
          <span>中間点</span>
          <span>ゴール</span>
        </figcaption>
        <p className="ps-chart__note">棒が高いほど速いペース。横線は平均ペースです。</p>
      </figure>

      <div className="table-wrap" tabIndex={0}>
        <table className="splits">
          <caption>通過タイムの目安</caption>
          <thead>
            <tr>
              <th scope="col">地点</th>
              <th scope="col">通過タイム</th>
              <th scope="col">その区間のペース</th>
            </tr>
          </thead>
          <tbody>
            {checkpoints.map((c, i) => {
              const t = timeAt(plan.rows, c);
              const prevC = i ? checkpoints[i - 1]! : 0;
              const prevT = i ? timeAt(plan.rows, prevC) : 0;
              return (
                <tr key={c}>
                  <th scope="row" className="num">
                    {Number.isInteger(c) ? c : c.toFixed(c === km ? 3 : 1)}km
                  </th>
                  <td className="num">{formatClock(t, t >= 3600)}</td>
                  <td className="num">{formatClock((t - prevT) / (c - prevC))}/km</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ps-note">
        どの配分でも、ゴールタイムは目標タイムと同じになるように計算しています。坂や給水、気温によって実際のペースは変わります。はじめてのフルマラソンなら、前半は抑えめの「後半上げ」が走りやすいと言われています。
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="ps">{children}</div>;
}
