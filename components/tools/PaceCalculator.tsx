"use client";

import { useId, useMemo, useState } from "react";
import { RACE_DISTANCES, formatClock, formatJa, parseClock, splits, timeFromPace } from "@/lib/pace";

type Mode = "time" | "pace";

export function PaceCalculator() {
  const [mode, setMode] = useState<Mode>("time");
  const [distId, setDistId] = useState<string>("half");
  const [customKm, setCustomKm] = useState("15");
  const [timeText, setTimeText] = useState("2:30:00");
  const [paceText, setPaceText] = useState("7:00");
  const id = useId();

  const km = distId === "custom" ? Number(customKm) : RACE_DISTANCES.find((d) => d.id === distId)!.km;
  const kmValid = Number.isFinite(km) && km > 0 && km <= 300;

  const result = useMemo(() => {
    if (!kmValid) return { error: "距離を正しく入力してください。" } as const;
    if (mode === "time") {
      const t = parseClock(timeText);
      if (!t) return { error: "目標タイムは「2:30:00」のように、時:分:秒で入力してください。" } as const;
      const pace = t / km;
      return { pace, total: t } as const;
    }
    const p = parseClock(paceText);
    if (!p) return { error: "ペースは「7:00」のように、分:秒で入力してください。" } as const;
    return { pace: p, total: timeFromPace(p, km) } as const;
  }, [mode, timeText, paceText, km, kmValid]);

  const every = km > 25 ? 5 : km > 10 ? 2.5 : 1;

  return (
    <div className="pace">
      <div className="segmented" role="radiogroup" aria-label="計算のしかた">
        <button type="button" role="radio" aria-checked={mode === "time"} onClick={() => setMode("time")}>
          タイムからペース
        </button>
        <button type="button" role="radio" aria-checked={mode === "pace"} onClick={() => setMode("pace")}>
          ペースからタイム
        </button>
      </div>

      <fieldset className="field">
        <legend className="field__label">距離</legend>
        <div className="chips">
          {RACE_DISTANCES.map((d) => (
            <label key={d.id} className="chip">
              <input type="radio" name={`${id}-dist`} value={d.id} checked={distId === d.id} onChange={() => setDistId(d.id)} />
              <span>{d.label}</span>
            </label>
          ))}
          <label className="chip">
            <input type="radio" name={`${id}-dist`} value="custom" checked={distId === "custom"} onChange={() => setDistId("custom")} />
            <span>その他</span>
          </label>
        </div>
        {distId === "custom" ? (
          <label className="field__inline">
            <input
              className="input num"
              inputMode="decimal"
              value={customKm}
              onChange={(e) => setCustomKm(e.target.value)}
              aria-label="距離（km）"
            />
            <span>km</span>
          </label>
        ) : null}
      </fieldset>

      {mode === "time" ? (
        <label className="field">
          <span className="field__label">目標タイム（時:分:秒）</span>
          <input className="input input--big num" inputMode="numeric" value={timeText} onChange={(e) => setTimeText(e.target.value)} placeholder="2:30:00" />
        </label>
      ) : (
        <label className="field">
          <span className="field__label">1kmあたりのペース（分:秒）</span>
          <input className="input input--big num" inputMode="numeric" value={paceText} onChange={(e) => setPaceText(e.target.value)} placeholder="7:00" />
        </label>
      )}

      <div className="pace__result" aria-live="polite">
        {"error" in result ? (
          <p className="pace__error">{result.error}</p>
        ) : (
          <>
            <dl className="pace__main">
              <div>
                <dt>1kmあたり</dt>
                <dd className="num">{formatClock(result.pace)}</dd>
              </div>
              <div>
                <dt>ゴールタイム</dt>
                <dd className="num">{formatClock(result.total, true)}</dd>
              </div>
            </dl>
            <p className="pace__sub">
              {formatJa(result.total)}で{kmValid ? `${+km.toFixed(3)}km` : ""}。100mあたり約{(result.pace / 10).toFixed(0)}秒です。
            </p>
            <div className="table-wrap" tabIndex={0}>
              <table className="splits">
                <caption>同じペースで走ったときの通過タイム</caption>
                <thead>
                  <tr>
                    <th scope="col">地点</th>
                    <th scope="col">通過タイム</th>
                  </tr>
                </thead>
                <tbody>
                  {splits(result.pace, km, every).map((s) => (
                    <tr key={s.km}>
                      <th scope="row" className="num">
                        {Number.isInteger(s.km) ? s.km : s.km.toFixed(s.km === km ? 3 : 1)}km
                      </th>
                      <td className="num">{formatClock(s.sec, s.sec >= 3600)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
