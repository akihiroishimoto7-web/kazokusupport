"use client";
import { useState } from "react";
import ChecklistClient from "@/components/ChecklistClient";
import { CHECKLIST } from "@/lib/data";

const TABS = [
  { label: "全員",         value: "both"     as const },
  { label: "自宅に帰る方", value: "home"     as const },
  { label: "施設へ入る方", value: "facility" as const },
];

export default function ChecklistWithTabs() {
  const [tab, setTab] = useState<"both" | "home" | "facility">("both");

  const filtered =
    tab === "both"
      ? CHECKLIST
      : CHECKLIST.filter((item) => item.target === tab || item.target === "both");

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${tab === t.value
                ? "bg-ink text-white"
                : "bg-white text-sub border border-line hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ChecklistClient items={filtered} />
    </>
  );
}
