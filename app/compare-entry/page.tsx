"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OPTIONS } from "@/lib/data";

export default function CompareEntryPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < 3) {
        next.add(slug);
      }
      return next;
    });
  };

  const goCompare = () => {
    const slugs = [...selected];
    const params = slugs.map((s, i) => `${String.fromCharCode(97 + i)}=${s}`).join("&");
    router.push(`/compare?${params}`);
  };

  return (
    <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-3xl mx-auto pb-32">
      <header className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          比較したい選択肢を選んでください
        </h1>
        <p className="mt-3 text-sub text-base">最大3つまで選べます</p>
      </header>

      <div className="space-y-3 mb-10">
        {OPTIONS.map((opt) => {
          const isSelected = selected.has(opt.slug);
          const isDisabled = !isSelected && selected.size >= 3;
          return (
            <button
              key={opt.slug}
              onClick={() => toggle(opt.slug)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-5 rounded-2xl px-6 py-5 text-left
                          transition-all duration-200
                          ${isSelected
                            ? "bg-accent/10 border-2 border-accent shadow-[0_0_0_0px]"
                            : isDisabled
                              ? "bg-white border-2 border-transparent opacity-35 cursor-not-allowed"
                              : "bg-white border-2 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] hover:border-accent/40"
                          }`}
            >
              {/* チェック */}
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                              transition-colors
                              ${isSelected ? "bg-accent border-accent" : "border-line"}`}>
                {isSelected && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5l3 3L11 3" stroke="white" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              <span className="text-3xl" aria-hidden>{opt.emoji}</span>

              <div>
                <p className="text-lg font-semibold text-ink">{opt.title}</p>
                <p className="text-sm text-sub leading-relaxed mt-0.5">{opt.lead}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 比較ボタン（2つ以上選んだら出現） */}
      <div className={`fixed bottom-20 left-0 right-0 flex justify-center px-5
                       transition-all duration-300
                       ${selected.size >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <button
          onClick={goCompare}
          className="flex items-center gap-3 bg-ink text-white px-8 py-4 rounded-full
                     text-base font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                     hover:opacity-90 transition-opacity"
        >
          {selected.size}件を比較する →
        </button>
      </div>
    </main>
  );
}
