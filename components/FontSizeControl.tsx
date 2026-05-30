"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kazoku-font-scale";

const SCALES = [
  { label: "標準", size: "16px" },
  { label: "大",   size: "18px" },
  { label: "特大", size: "20px" },
];

export default function FontSizeControl() {
  const [index, setIndex]   = useState(0);
  const [loaded, setLoaded] = useState(false);

  // 起動時に保存済みのサイズを適用
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const i = saved ? Math.min(Math.max(parseInt(saved, 10), 0), SCALES.length - 1) : 0;
      setIndex(i);
      document.documentElement.style.fontSize = SCALES[i].size;
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const cycle = () => {
    const next = (index + 1) % SCALES.length;
    setIndex(next);
    document.documentElement.style.fontSize = SCALES[next].size;
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
  };

  if (!loaded) return null;

  return (
    <button
      onClick={cycle}
      aria-label={`文字サイズを変える（現在：${SCALES[index].label}）`}
      className="no-print fixed top-3 right-3 z-50 flex items-center gap-1.5
                 rounded-full bg-white/90 backdrop-blur-md border border-line
                 px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                 hover:bg-white transition"
    >
      <span className="text-ink font-semibold leading-none" style={{ fontSize: "1rem" }}>あ</span>
      <span className="text-xs text-sub leading-none">{SCALES[index].label}</span>
    </button>
  );
}
