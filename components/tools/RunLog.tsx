"use client";

import { useEffect, useMemo, useState } from "react";
import { formatClock, parseClock } from "@/lib/pace";
import { loadChange, weekly, type Run } from "@/lib/runlog";

const KEY = "rlh-runlog-v1";
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

export function RunLog() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ date: "", km: "", time: "", hr: "", vo2: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setRuns(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      /* 読めない場合は空のまま */
    }
    setForm((f) => ({ ...f, date: today() }));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(runs));
    } catch {
      /* 保存できない環境でも画面上は使える */
    }
  }, [runs, ready]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const km = Number(form.km);
    const sec = parseClock(form.time);
    if (!form.date || !(km > 0 && km < 300) || !sec) {
      setError("日付・距離（km）・タイム（例 45:30 や 1:05:00）を入力してください。");
      return;
    }
    const hr = form.hr ? Number(form.hr) : undefined;
    const vo2 = form.vo2 ? Number(form.vo2) : undefined;
    setRuns((r) => [...r, { id: crypto.randomUUID(), date: form.date, km, sec, hr, vo2 }].sort((a, b) => (a.date < b.date ? 1 : -1)));
    setForm({ date: form.date, km: "", time: "", hr: "", vo2: "" });
    setError("");
  };

  const w = useMemo(() => weekly(runs, 12, today()), [runs]);
  const change = loadChange(w);
  const maxW = Math.max(...w.map((x) => x.km), 10);
  const recent = runs.slice(0, 20).reverse();
  const paceMin = Math.min(...recent.map((r) => r.sec / r.km));
  const paceMax = Math.max(...recent.map((r) => r.sec / r.km));
  const vo2s = runs.filter((r) => r.vo2).slice(0, 20).reverse();
  const total4 = w.slice(-4).reduce((a, x) => a + x.km, 0);

  return (
    <div className="rl">
      <form className="rl-form" onSubmit={add}>
        <label className="field">
          <span className="field__label">日付</span>
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <div className="rl-form__row">
          <label className="field">
            <span className="field__label">距離（km）</span>
            <input className="input num" inputMode="decimal" placeholder="5" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} />
          </label>
          <label className="field">
            <span className="field__label">タイム</span>
            <input className="input num" inputMode="numeric" placeholder="35:00" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </label>
        </div>
        <details className="rl-more">
          <summary>心拍数・VO2maxも記録する（任意）</summary>
          <div className="rl-form__row">
            <label className="field">
              <span className="field__label">平均心拍数</span>
              <input className="input num" inputMode="numeric" placeholder="145" value={form.hr} onChange={(e) => setForm({ ...form, hr: e.target.value })} />
            </label>
            <label className="field">
              <span className="field__label">VO2max（時計の表示）</span>
              <input className="input num" inputMode="decimal" placeholder="45" value={form.vo2} onChange={(e) => setForm({ ...form, vo2: e.target.value })} />
            </label>
          </div>
        </details>
        {error ? <p className="pace__error">{error}</p> : null}
        <button type="submit" className="btn btn--solid">
          記録する
        </button>
        <p className="rl-privacy">記録はこの端末のブラウザにだけ保存されます。サーバーには送りません。</p>
      </form>

      {runs.length ? (
        <>
          <dl className="ps-main">
            <div>
              <dt>最近4週の距離</dt>
              <dd className="num">
                {total4.toFixed(1)}
                <small>km</small>
              </dd>
            </div>
            <div>
              <dt>今週</dt>
              <dd className="num">
                {w.at(-1)!.km}
                <small>km</small>
              </dd>
            </div>
          </dl>
          {change !== null && change >= 30 ? (
            <p className="rl-flag">
              今週の距離は、直前3週の平均より{change}%多くなっています。距離を急に増やすと、からだに負担がかかりやすいと言われています。疲れや痛みがないか確かめながら。
            </p>
          ) : null}

          <figure className="rl-chart">
            <figcaption className="rl-chart__title">週ごとの距離（12週）</figcaption>
            <svg viewBox="0 0 1200 160" preserveAspectRatio="none" role="img" aria-label="週ごとの距離のグラフ">
              {w.map((x, i) => (
                <rect key={x.week} x={i * 100 + 12} width="76" y={150 - (x.km / maxW) * 140} height={(x.km / maxW) * 140} className={i === w.length - 1 ? "rl-bar rl-bar--now" : "rl-bar"} />
              ))}
            </svg>
            <div className="rl-chart__axis">
              <span>{w[0]!.week.slice(5).replace("-", "/")}週</span>
              <span>今週</span>
            </div>
          </figure>

          {recent.length >= 2 ? (
            <figure className="rl-chart">
              <figcaption className="rl-chart__title">ペースの移り変わり（最近20回）</figcaption>
              <svg viewBox="0 0 1000 140" preserveAspectRatio="none" role="img" aria-label="ペースの推移">
                <polyline
                  className="rl-line"
                  points={recent
                    .map((r, i) => `${(i / (recent.length - 1)) * 1000},${20 + ((r.sec / r.km - paceMin) / (paceMax - paceMin || 1)) * 100}`)
                    .join(" ")}
                />
              </svg>
              <div className="rl-chart__axis">
                <span>速い {formatClock(paceMin)}/km</span>
                <span>遅い {formatClock(paceMax)}/km</span>
              </div>
            </figure>
          ) : null}

          {vo2s.length >= 2 ? (
            <figure className="rl-chart">
              <figcaption className="rl-chart__title">VO2max（時計の表示値）</figcaption>
              <svg viewBox="0 0 1000 120" preserveAspectRatio="none" role="img" aria-label="VO2maxの推移">
                {(() => {
                  const v = vo2s.map((r) => r.vo2!);
                  const lo = Math.min(...v) - 1;
                  const hi = Math.max(...v) + 1;
                  return <polyline className="rl-line" points={vo2s.map((r, i) => `${(i / (vo2s.length - 1)) * 1000},${110 - ((r.vo2! - lo) / (hi - lo)) * 100}`).join(" ")} />;
                })()}
              </svg>
              <p className="ps-note">
                腕時計のVO2maxは、心拍数とペースからの推定値です。機種や条件で変わるため、数値そのものより、長い期間の傾向として見るのがおすすめです。
              </p>
            </figure>
          ) : null}

          <ul role="list" className="rl-list">
            {runs.slice(0, 30).map((r) => (
              <li key={r.id}>
                <span className="rl-list__date num">{r.date.slice(5).replace("-", "/")}</span>
                <span className="num">{r.km}km</span>
                <span className="num">{formatClock(r.sec, r.sec >= 3600)}</span>
                <span className="num rl-list__pace">{formatClock(r.sec / r.km)}/km</span>
                <button type="button" className="link-button" onClick={() => setRuns((x) => x.filter((y) => y.id !== r.id))} aria-label={`${r.date}の記録を消す`}>
                  消す
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : ready ? (
        <p className="rl-empty">最初の記録を入れると、週ごとの距離とペースのグラフが表示されます。</p>
      ) : null}
    </div>
  );
}
