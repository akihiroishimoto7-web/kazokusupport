"use client";
import Link from "next/link";
import type { BadgeColor, Option } from "@/lib/data";

type Props = {
  option: Option;
  dimmed?: boolean;
  checked?: boolean;
  onToggleCompare?: () => void;
};

// バッジの色マップ（Tailwindのsafelist対策でオブジェクトで定義）
const BADGE_STYLES: Record<BadgeColor, string> = {
  sky:     "bg-sky-100     text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber:   "bg-amber-100   text-amber-700",
  rose:    "bg-rose-100    text-rose-700",
  violet:  "bg-violet-100  text-violet-700",
};

export default function OptionCard({ option, dimmed, checked, onToggleCompare }: Props) {
  return (
    <div className={`relative transition-opacity duration-300 ${dimmed ? "opacity-30" : "opacity-100"}`}>

      {/* 比較チェックボタン */}
      {onToggleCompare && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(); }}
          aria-label={checked ? "比較から外す" : "比較に追加"}
          className={`no-print absolute top-3 right-3 z-10 w-11 h-11 rounded-full border-2
                      flex items-center justify-center transition-colors
                      ${checked ? "bg-accent border-accent text-white" : "bg-white border-line text-transparent"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* バッジ */}
        <div className="mt-4 flex flex-wrap gap-2">
          {option.badges.map((badge) => (
            <span
              key={badge.label}
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                          ${BADGE_STYLES[badge.color]}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div className="mt-5 inline-flex items-center text-accent text-base font-medium">
          くわしく見る
          <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </Link>
    </div>
  );
}
