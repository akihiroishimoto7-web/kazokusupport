import Link from "next/link";
import type { Option } from "@/lib/data";

// トップ画面で表示する選択肢カード
export default function OptionCard({ option }: { option: Option }) {
  return (
    <Link
      href={`/options/${option.slug}`}
      className={`group block rounded-3xl bg-gradient-to-b ${option.accent} p-7 sm:p-8
                  shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]
                  transition-shadow duration-300 active:scale-[0.99]`}
    >
      <div className="text-5xl sm:text-6xl mb-4" aria-hidden>{option.emoji}</div>
      <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
        {option.title}
      </h3>
      <p className="mt-2 text-sub text-base leading-relaxed">{option.lead}</p>
      <div className="mt-6 inline-flex items-center text-accent text-base font-medium">
        くわしく見る
        <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}
