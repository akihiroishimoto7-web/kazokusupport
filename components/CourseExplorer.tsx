"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import type { RoutePoint } from "@/lib/course-stats";

type Props = {
  name: string;
  map: { src: string; width: number; height: number };
  points: RoutePoint[];
  summary: string;
};

/**
 * 地図と高低図を連動させる。高低図を指でなぞる（またはスライダーを動かす）と、
 * 地図上の位置と、その地点の距離・標高が表示されます。
 * 位置は GPX と地図画像の投影から計算しているので、地図と正確に重なります。
 */
export function CourseExplorer({ name, map, points, summary }: Props) {
  const total = points.at(-1)?.km ?? 0;
  const [i, setI] = useState(0);
  const id = useId();
  const p = points[i]!;
  const eles = points.map((q) => q.ele).filter((e): e is number => e !== null);
  const min = Math.min(...eles);
  const max = Math.max(...eles);
  const range = Math.max(max - min, 15);

  const profile = useMemo(() => {
    if (!eles.length) return null;
    const pts = points.map((q) => `${((q.km / total) * 1000).toFixed(1)},${(190 - (((q.ele ?? min) - min) / range) * 160).toFixed(1)}`);
    return { line: `M${pts.join("L")}`, area: `M0,200L${pts.join("L")}L1000,200Z` };
  }, [points, total, min, range, eles.length]);

  const routeLine = useMemo(() => points.map((q) => `${q.x},${q.y * (map.height / map.width)}`).join(" "), [points, map]);
  const vbH = 100 * (map.height / map.width);

  const pick = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const km = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * total;
    let best = 0;
    for (let k = 1; k < points.length; k++) if (Math.abs(points[k]!.km - km) < Math.abs(points[best]!.km - km)) best = k;
    setI(best);
  };

  return (
    <figure className="cx-explorer">
      <div className="cx-explorer__map">
        <Image src={map.src} alt={`${name}の想定ルートの地図。${summary}`} width={map.width} height={map.height} sizes="(min-width: 960px) 760px, 100vw" />
        <svg viewBox={`0 0 100 ${vbH}`} className="cx-explorer__overlay" aria-hidden="true" preserveAspectRatio="none">
          <polyline points={routeLine} className="cx-explorer__done" style={{ strokeDasharray: undefined }} />
          <circle cx={p.x} cy={p.y * (map.height / map.width)} r="1.6" className="cx-explorer__dot" />
        </svg>
      </div>
      {profile ? (
        <div
          className="cx-explorer__profile"
          onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
          onPointerMove={(e) => (e.buttons || e.pointerType === "mouse") && pick(e.clientX, e.currentTarget)}
        >
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
            <path d={profile.area} className="cx-explorer__area" />
            <path d={profile.line} className="cx-explorer__line" />
            <line x1={(p.km / total) * 1000} x2={(p.km / total) * 1000} y1="0" y2="200" className="cx-explorer__cursor" />
          </svg>
        </div>
      ) : null}
      <label className="sr-only" htmlFor={id}>
        ルート上の位置
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={points.length - 1}
        value={i}
        onChange={(e) => setI(Number(e.target.value))}
        className="cx-explorer__range"
        aria-valuetext={`${p.km.toFixed(2)}km地点、標高${p.ele?.toFixed(0) ?? "不明"}m`}
      />
      <p className="cx-explorer__readout" aria-live="polite">
        <span>
          <span className="num">{p.km.toFixed(2)}</span>
          <small>km地点</small>
        </span>
        <span>
          標高 <span className="num">{p.ele !== null ? p.ele.toFixed(0) : "—"}</span>
          <small>m</small>
        </span>
        <span className="cx-explorer__range-label">
          {min.toFixed(0)}〜{max.toFixed(0)}m
        </span>
      </p>
      <figcaption className="cx-explorer__hint">高低図を指でなぞると、地図上の位置が動きます。</figcaption>
    </figure>
  );
}
