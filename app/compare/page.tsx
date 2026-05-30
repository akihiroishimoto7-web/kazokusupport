import Link from "next/link";
import { notFound } from "next/navigation";
import { OPTIONS } from "@/lib/data";
import CompareShareButtons from "@/components/CompareShareButtons";
import CostBar from "@/components/CostBar";

type Props = { searchParams: { a?: string; b?: string; c?: string } };

// テキスト1行で表せる比較行
const ROWS = [
  { emoji: "👥", label: "どんな人向け？", key: "forWhom"  as const },
  { emoji: "💪", label: "リハビリ",       key: "rehab"    as const },
  { emoji: "🩺", label: "医療対応",       key: "medical"  as const },
  { emoji: "🚪", label: "入りやすさ",     key: "ease"     as const },
  { emoji: "🧠", label: "認知症対応",     key: "dementia" as const },
  { emoji: "🛏️", label: "居室タイプ",    key: "roomType" as const },
  { emoji: "🕊️", label: "看取り対応",    key: "looking"  as const },
];

// 左端の項目名セル（横スクロール時も固定）
const labelCell =
  "sticky left-0 z-10 bg-[#f5f5f7] align-top px-3 py-3 w-28 sm:w-36 " +
  "text-xs sm:text-sm text-sub font-medium";

// データセル
const dataCell = "align-top px-3 py-3 min-w-[140px] sm:min-w-0";

export default function ComparePage({ searchParams }: Props) {
  const slugs = [searchParams.a, searchParams.b, searchParams.c].filter(Boolean) as string[];
  if (slugs.length < 2) return notFound();

  const options = slugs
    .map((s) => OPTIONS.find((o) => o.slug === s))
    .filter(Boolean) as typeof OPTIONS;

  if (options.length < 2) return notFound();

  return (
    <main className="min-h-screen px-4 sm:px-8 py-8 sm:py-12 max-w-5xl mx-auto">
      <nav className="no-print mb-6">
        <Link href="/" className="text-accent text-base inline-flex items-center">
          <span className="mr-1">←</span> もどる
        </Link>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-3 tracking-tight">
        比較してみましょう
      </h1>
      <p className="no-print text-sub text-sm mb-6">
        横にスクロールすると、項目名は左に固定されたままご覧いただけます。
      </p>

      <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
        <table className="border-separate border-spacing-2 sm:border-spacing-3 w-full">
          <tbody>

            {/* ヘッダー行（選択肢名） */}
            <tr>
              <th className={`${labelCell} bg-[#f5f5f7]`} />
              {options.map((opt) => (
                <th
                  key={opt.slug}
                  scope="col"
                  className={`${dataCell} rounded-2xl bg-gradient-to-b ${opt.accent} text-center`}
                >
                  <div className="text-3xl sm:text-4xl mb-1" aria-hidden>{opt.emoji}</div>
                  <div className="text-base sm:text-lg font-semibold text-ink">{opt.title}</div>
                </th>
              ))}
            </tr>

            {/* 費用行（バーグラフつき） */}
            <tr>
              <th scope="row" className={labelCell}>
                <span aria-hidden>💴</span><br />費用のめやす
              </th>
              {options.map((opt) => (
                <td key={`cost-${opt.slug}`} className={`${dataCell} rounded-2xl bg-white`}>
                  <p className="text-sm sm:text-base text-ink leading-relaxed">{opt.cost}</p>
                  <CostBar level={opt.costLevel} compact />
                </td>
              ))}
            </tr>

            {/* テキスト比較行 */}
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row" className={labelCell}>
                  <span aria-hidden>{row.emoji}</span><br />{row.label}
                </th>
                {options.map((opt) => (
                  <td key={`${row.key}-${opt.slug}`} className={`${dataCell} rounded-2xl bg-white`}>
                    <p className="text-sm sm:text-base text-ink leading-relaxed">{opt[row.key]}</p>
                  </td>
                ))}
              </tr>
            ))}

            {/* よいところ */}
            <tr>
              <th scope="row" className={labelCell}>
                <span aria-hidden>✨</span><br />よいところ
              </th>
              {options.map((opt) => (
                <td key={`pros-${opt.slug}`} className={`${dataCell} rounded-2xl bg-white`}>
                  <ul className="space-y-1.5">
                    {opt.pros.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
                        <span className="text-emerald-500 shrink-0 mt-0.5">●</span>{p}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* 気をつけたいこと */}
            <tr>
              <th scope="row" className={labelCell}>
                <span aria-hidden>📝</span><br />気をつけたいこと
              </th>
              {options.map((opt) => (
                <td key={`cautions-${opt.slug}`} className={`${dataCell} rounded-2xl bg-white`}>
                  <ul className="space-y-1.5">
                    {opt.cautions.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
                        <span className="text-amber-500 shrink-0 mt-0.5">●</span>{p}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

      <div className="mt-8 mb-10" />

      <CompareShareButtons titles={options.map((o) => o.title)} />

      <p className="no-print mt-8 text-center text-sub text-sm">
        ※ 内容は広島県内の一般的な目安です。実際の費用・条件は施設にご確認ください。
      </p>
    </main>
  );
}
