"use client";

import { useEffect, useState } from "react";
import { raceChecklist } from "@/content/checklist";

const KEY = "rlh-race-checklist-v1";

function load(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function RaceChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChecked(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(checked));
    } catch {
      /* 保存できない環境（プライベートブラウズ等）でも、画面上のチェックは使えます */
    }
  }, [checked, ready]);

  const total = raceChecklist.reduce((n, g) => n + g.items.length, 0);
  const done = raceChecklist.reduce((n, g) => n + g.items.filter((i) => checked[`${g.id}.${i.id}`]).length, 0);

  return (
    <div className="checklist">
      <p className="checklist__progress" aria-live="polite">
        <span>
          <span className="num">{done}</span> / <span className="num">{total}</span> 確認済み
        </span>
        <span className="checklist__bar" aria-hidden="true">
          <span style={{ width: `${(done / total) * 100}%` }} />
        </span>
      </p>
      {raceChecklist.map((g) => (
        <fieldset key={g.id} className="checklist__group">
          <legend>{g.title}</legend>
          <ul role="list">
            {g.items.map((it) => {
              const k = `${g.id}.${it.id}`;
              return (
                <li key={k}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[k])}
                      onChange={(e) => setChecked((c) => ({ ...c, [k]: e.target.checked }))}
                    />
                    <span className="check__box" aria-hidden="true" />
                    <span className="check__text">
                      <span className="check__label">{it.label}</span>
                      {"note" in it && it.note ? <span className="check__note">{it.note}</span> : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
      <div className="checklist__actions">
        <button type="button" className="link-button" onClick={() => window.print()}>
          印刷する
        </button>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            if (window.confirm("チェックをすべて外しますか？")) setChecked({});
          }}
        >
          チェックをすべて外す
        </button>
      </div>
      <p className="muted small">チェックの状態は、この端末のブラウザにだけ保存されます。</p>
    </div>
  );
}
