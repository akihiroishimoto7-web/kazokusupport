"use client";
import Link from "next/link";
import type { Option } from "@/lib/data";

type Props = {
  option: Option;
  dimmed?: boolean;         // 要介護度フィルターで対象外のとき
  checked?: boolean;        // 比較選択済み
  onToggleCompare?: () => void;
};

export default function OptionCard({ option, dimmed, checked, onToggleCompare }: Props) {
  return (
    <div className={`relative transition-opacity duration-300 ${dimmed ? "opacity-30" : "opacity-100"}`}>
      {/* 比較チェックボックス */}
      {onToggleCompare && (
        <button
          onClick={onToggleCompare}
          aria-label={checked ? "比較から外す" : "比較に追加"}
          className={`no-print absolute top-4 right-4 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center
                      transition-colors ${checked
                        ? "bg-accent border-accent text-white"
                        : "bg-white border-line text-transparent"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <Link
        href={`/options/${option.slug}`}
        className={`group block rounded-3xl bg-gradient-to-b ${option.accent} p-7 sm:p-8
                    shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]
                    hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]
                    transition-shadow duration-300 active:scale-[0.99]`}
      >
        <div className="text-5xl sm:text-6xl mb-4" aria-hidden>{option.emoji}</div>
        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">{option.title}</h3>
        <p className="mt-2 text-sub text-base leading-relaxed">{option.lead}</p>
        <div className="mt-6 inline-flex items-center text-accent text-base font-medium">
          くわしく見る
          <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </Link>
    </div>
  );
}
