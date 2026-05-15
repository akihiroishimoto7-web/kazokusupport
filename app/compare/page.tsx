import Link from "next/link";
import { notFound } from "next/navigation";
import { OPTIONS } from "@/lib/data";
import CompareShareButtons from "@/components/CompareShareButtons";

type Props = { searchParams: { a?: string; b?: string; c?: string } };

// 比較テーブルの行定義
const ROWS = [
  { emoji: "👥", label: "どんな人向け？", key: "forWhom" as const },
  { emoji: "💴", label: "費用のめやす",   key: "cost"     as const },
  { emoji: "💪", label: "リハビリ",       key: "rehab"    as const },
  { emoji: "🩺", label: "医療対応",       key: "medical"  as const },
  { emoji: "🚪", label: "入りやすさ",     key: "ease"     as const },
];

export default function ComparePage({ searchParams }: Props) {
  const slugs = [searchParams.a, searchParams.b, searchParams.c].filter(Boolean) as string[];
  if (slugs.length < 2) return notFound();

  const options = slugs
    .map((s) => OPTIONS.find((o) => o.slug === s))
    .filter(Boolean) as typeof OPTIONS;

  if (options.length < 2) return notFound();

  const colClass = options.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <main className="min-h-screen px-4 sm:px-8 py-8 sm:py-12 max-w-5xl mx-auto">
      <nav className="no-print mb-6">
        <Link href="/" className="text-accent text-base inline-flex items-center">
          <span className="mr-1">←</span> もどる
        </Link>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-8 tracking-tight">
        比較してみましょう
      </h1>

      {/* ヘッダー行 */}
      <div className={`grid ${colClass} gap-3 sm:gap-4 mb-4`}>
        {options.map((opt) => (
          <div
            key={opt.slug}
            className={`rounded-2xl bg-gradient-to-b ${opt.accent} p-5 sm:p-6 text-center
                        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]`}
          >
            <div className="text-4xl sm:text-5xl mb-2" aria-hidden>{opt.emoji}</div>
            <h2 className="text-lg sm:text-xl font-semibold text-ink">{opt.title}</h2>
          </div>
        ))}
      </div>

      {/* 比較行 */}
      <div className="space-y-3 sm:space-y-4 mb-8">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className={`grid ${colClass} gap-3 sm:gap-4`}
          >
            {options.map((opt) => (
              <div
                key={opt.slug}
                className="rounded-2xl bg-white p-5 sm:p-6
                           shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="text-xs text-sub mb-2 flex items-center gap-1">
                  <span aria-hidden>{row.emoji}</span> {row.label}
                </div>
                <p className="text-base sm:text-lg text-ink leading-relaxed">{opt[row.key]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* よいところ */}
      <div className={`grid ${colClass} gap-3 sm:gap-4 mb-3 sm:mb-4`}>
        {options.map((opt) => (
          <div
            key={opt.slug}
            className="rounded-2xl bg-white p-5 sm:p-6
                       shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
          >
            <div className="text-xs text-sub mb-3 flex items-center gap-1">
              <span aria-hidden>✨</span> よいところ
            </div>
            <ul className="space-y-2">
              {opt.pros.map((p, i) => (
                <li key={i} className="flex gap-2 text-base text-ink leading-relaxed">
                  <span className="text-emerald-500 shrink-0 mt-0.5">●</span>{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 気をつけたいこと */}
      <div className={`grid ${colClass} gap-3 sm:gap-4 mb-10`}>
        {options.map((opt) => (
          <div
            key={opt.slug}
            className="rounded-2xl bg-white p-5 sm:p-6
                       shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
          >
            <div className="text-xs text-sub mb-3 flex items-center gap-1">
              <span aria-hidden>📝</span> 気をつけたいこと
            </div>
            <ul className="space-y-2">
              {opt.cautions.map((p, i) => (
                <li key={i} className="flex gap-2 text-base text-ink leading-relaxed">
                  <span className="text-amber-500 shrink-0 mt-0.5">●</span>{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <CompareShareButtons titles={options.map((o) => o.title)} />

      <p className="no-print mt-8 text-center text-sub text-sm">
        ※ 内容は一般的な目安です。実際の費用・条件は施設にご確認ください。
      </p>
    </main>
  );
}
