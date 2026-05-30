"use client";
import { useEffect, useState } from "react";
import { CHECKLIST, type CheckItem } from "@/lib/data";

const STORAGE_KEY  = "kazoku-checklist";
const DISCHARGE_KEY = "kazoku-discharge-date";

function group(items: CheckItem[]) {
  return items.reduce<Record<string, CheckItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

// 退院予定日(YYYY-MM-DD)と「退院の何日前」から、期限の表示情報を作る
function dueInfo(dischargeISO: string, daysBefore: number) {
  const discharge = new Date(dischargeISO + "T00:00:00");
  if (isNaN(discharge.getTime())) return null;

  const due = new Date(discharge);
  due.setDate(due.getDate() - daysBefore);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due.getTime() - today.getTime()) / 86400000);

  const label = `${due.getMonth() + 1}/${due.getDate()}まで`;
  let tone: "overdue" | "soon" | "normal" = "normal";
  if (daysLeft < 0) tone = "overdue";
  else if (daysLeft <= 3) tone = "soon";

  return { label, tone, daysLeft };
}

export default function ChecklistClient({ items }: { items?: CheckItem[] }) {
  const activeItems = items ?? CHECKLIST;
  const grouped = group(activeItems);

  const [checked, setChecked]       = useState<Set<string>>(new Set());
  const [discharge, setDischarge]   = useState("");
  const [loaded, setLoaded]         = useState(false);

  // ページ表示時に保存済みの状態を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(new Set(JSON.parse(saved) as string[]));
      const savedDate = localStorage.getItem(DISCHARGE_KEY);
      if (savedDate) setDischarge(savedDate);
    } catch {
      // localStorage が使えない環境では無視
    }
    setLoaded(true);
  }, []);

  const changeDischarge = (value: string) => {
    setDischarge(value);
    try {
      if (value) localStorage.setItem(DISCHARGE_KEY, value);
      else localStorage.removeItem(DISCHARGE_KEY);
    } catch { /* ignore */ }
  };

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch { /* ignore */ }
      return next;
    });
  };

  const resetAll = () => {
    setChecked(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const total = activeItems.length;
  const done  = activeItems.filter((i) => checked.has(i.id)).length;
  const pct   = Math.round((done / total) * 100);

  if (!loaded) return null; // SSR時のハイドレーション不一致を防ぐ

  return (
    <div>
      {/* 退院予定日の入力 */}
      <div className="no-print mb-4 rounded-2xl bg-white p-5
                      shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
        <label className="text-base font-medium text-ink block mb-2">
          📅 退院予定日（入力すると目安の期限が出ます）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={discharge}
            onChange={(e) => changeDischarge(e.target.value)}
            className="border border-line rounded-xl px-4 py-3 text-base text-ink
                       focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {discharge && (
            <button
              onClick={() => changeDischarge("")}
              className="text-sm text-sub hover:text-ink transition-colors underline underline-offset-2"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mb-6 rounded-2xl bg-white p-5
                      shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-ink">{done} / {total} 完了</span>
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-accent">{pct}%</span>
            {done > 0 && (
              <button
                onClick={resetAll}
                className="text-sm text-sub hover:text-ink transition-colors underline underline-offset-2"
              >
                リセット
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-line rounded-full h-2.5">
          <div
            className="bg-accent h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* チェックリスト本体 */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-sub uppercase tracking-wider mb-2 px-1">
              {category}
            </h3>
            <div className="rounded-2xl bg-white overflow-hidden
                            shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
              {items.map((item, idx) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer
                              ${idx < items.length - 1 ? "border-b border-line" : ""}
                              hover:bg-gray-50 transition-colors`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                                transition-colors ${checked.has(item.id)
                                  ? "bg-accent border-accent"
                                  : "border-line bg-white"}`}
                  >
                    {checked.has(item.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="sr-only"
                  />
                  <span className={`flex-1 text-lg leading-relaxed transition-colors
                                    ${checked.has(item.id) ? "text-sub line-through" : "text-ink"}`}>
                    {item.text}
                  </span>
                  {discharge && !checked.has(item.id) && (() => {
                    const info = dueInfo(discharge, item.daysBefore);
                    if (!info) return null;
                    const tone =
                      info.tone === "overdue" ? "bg-rose-100 text-rose-600"
                      : info.tone === "soon"  ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-sub";
                    return (
                      <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${tone}`}>
                        {info.tone === "overdue" ? "⚠ " : ""}{info.label}
                      </span>
                    );
                  })()}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done === total && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-lg font-semibold text-emerald-700">すべての準備が整いました</p>
          <p className="text-sub text-base mt-1">安心して退院を迎えられます。</p>
        </div>
      )}
    </div>
  );
}
