import Link from "next/link";
import { notFound } from "next/navigation";
import InfoRow from "@/components/InfoRow";
import ShareButtons from "@/components/ShareButtons";
import { OPTIONS } from "@/lib/data";

// 静的書き出し用：全選択肢分のページを生成
export function generateStaticParams() {
  return OPTIONS.map((o) => ({ slug: o.slug }));
}

export default function OptionDetailPage({ params }: { params: { slug: string } }) {
  const option = OPTIONS.find((o) => o.slug === params.slug);
  if (!option) return notFound();

  return (
    <main className="min-h-screen px-5 sm:px-8 py-8 sm:py-12 max-w-3xl mx-auto">
      {/* 戻る */}
      <nav className="no-print mb-6">
        <Link href="/" className="text-accent text-base inline-flex items-center">
          <span className="mr-1">←</span> もどる
        </Link>
      </nav>

      {/* タイトル */}
      <header
        className={`print-page rounded-3xl bg-gradient-to-b ${option.accent} p-8 sm:p-10 mb-6
                    shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]`}
      >
        <div className="text-6xl mb-4" aria-hidden>{option.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          {option.title}
        </h1>
        <p className="mt-3 text-sub text-base sm:text-lg leading-relaxed">{option.lead}</p>
      </header>

      {/* 主な情報 */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-6
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <InfoRow emoji="👥" label="どんな人向け？" value={option.forWhom} />
        <InfoRow emoji="💴" label="費用のめやす"   value={option.cost} />
        <InfoRow emoji="💪" label="リハビリ"       value={option.rehab} />
        <InfoRow emoji="🩺" label="医療対応"       value={option.medical} />
        <InfoRow emoji="🚪" label="入りやすさ"     value={option.ease} />
      </section>

      {/* メリット */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-6
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <span aria-hidden>✨</span> よいところ
        </h2>
        <ul className="space-y-3">
          {option.pros.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-ink text-lg leading-relaxed">
              <span className="text-emerald-500 mt-1" aria-hidden>●</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* 注意点 */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-8
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <span aria-hidden>📝</span> 気をつけたいこと
        </h2>
        <ul className="space-y-3">
          {option.cautions.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-ink text-lg leading-relaxed">
              <span className="text-amber-500 mt-1" aria-hidden>●</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* 共有 */}
      <ShareButtons title={option.title} />

      <p className="no-print mt-10 text-center text-sub text-sm">
        ※ 内容は一般的な目安です。実際の費用や利用条件は施設にご確認ください。
      </p>
    </main>
  );
}
