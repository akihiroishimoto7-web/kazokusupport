"use client";
import { useState } from "react";
import { CHECKLIST } from "@/lib/data";

// カテゴリごとにグループ化
const grouped = CHECKLIST.reduce<Record<string, typeof CHECKLIST>>((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {});

export default function ChecklistClient() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = CHECKLIST.length;
  const done  = checked.size;
  const pct   = Math.round((done / total) * 100);

  return (
    <div>
      {/* 進捗バー */}
      <div className="mb-6 rounded-2xl bg-white p-5
                      shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-ink">{done} / {total} 完了</span>
          <span className="text-base font-semibold text-accent">{pct}%</span>
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
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
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
                  <span className={`text-lg leading-relaxed transition-colors
                                    ${checked.has(item.id) ? "text-sub line-through" : "text-ink"}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done === total && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-lg font-semibold text-emerald-700">
            すべての準備が整いました
          </p>
          <p className="text-sub text-base mt-1">安心して退院を迎えられます。</p>
        </div>
      )}
    </div>
  );
}
