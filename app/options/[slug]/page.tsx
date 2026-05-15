import Link from "next/link";
import { notFound } from "next/navigation";
import InfoRow from "@/components/InfoRow";
import CostBar from "@/components/CostBar";
import ShareButtons from "@/components/ShareButtons";
import { OPTIONS } from "@/lib/data";

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

      {/* タイトルカード */}
      <header className={`print-page rounded-3xl bg-gradient-to-b ${option.accent} p-8 sm:p-10 mb-5
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]`}>
        <div className="text-6xl mb-4" aria-hidden>{option.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">{option.title}</h1>
        <p className="mt-3 text-sub text-base sm:text-lg leading-relaxed">{option.lead}</p>
      </header>

      {/* 基本情報 */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-5
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <InfoRow emoji="👥" label="どんな人向け？" value={option.forWhom} />
        {/* 費用行：テキスト＋バーグラフ */}
        <div className="flex gap-4 sm:gap-5 py-5 border-b border-line">
          <div className="text-3xl shrink-0" aria-hidden>💴</div>
          <div className="w-full">
            <div className="text-sm text-sub mb-1">費用のめやす</div>
            <div className="text-lg sm:text-xl text-ink leading-relaxed">{option.cost}</div>
            <CostBar level={option.costLevel} />
          </div>
        </div>
        <InfoRow emoji="💪" label="リハビリ"       value={option.rehab} />
        <InfoRow emoji="🩺" label="医療対応"       value={option.medical} />
        <InfoRow emoji="🚪" label="入りやすさ"     value={option.ease} />
      </section>

      {/* よいところ・注意点 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
        <section className="print-page rounded-3xl bg-white p-6 sm:p-7
                            shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
            <span aria-hidden>✨</span> よいところ
          </h2>
          <ul className="space-y-3">
            {option.pros.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-ink text-base leading-relaxed">
                <span className="text-emerald-500 shrink-0 mt-1" aria-hidden>●</span>{p}
              </li>
            ))}
          </ul>
        </section>

        <section className="print-page rounded-3xl bg-white p-6 sm:p-7
                            shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
            <span aria-hidden>📝</span> 気をつけたいこと
          </h2>
          <ul className="space-y-3">
            {option.cautions.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-ink text-base leading-relaxed">
                <span className="text-amber-500 shrink-0 mt-1" aria-hidden>●</span>{p}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ━━━ ここから追加コンテンツ ━━━ */}

      {/* 一日の流れ */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-5
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
          <span aria-hidden>🕐</span> 一日の流れ（イメージ）
        </h2>
        <ol className="relative space-y-0">
          {option.dayFlow.map((item, i) => (
            <li key={i} className="flex gap-4 sm:gap-5">
              {/* タイムライン縦線 */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-accent shrink-0 mt-1.5" />
                {i < option.dayFlow.length - 1 && (
                  <div className="w-px flex-1 bg-line my-1" />
                )}
              </div>
              <div className={`pb-5 ${i === option.dayFlow.length - 1 ? "" : ""}`}>
                <span className="text-sm font-semibold text-accent">{item.time}</span>
                <p className="text-base sm:text-lg text-ink leading-relaxed mt-0.5">{item.activity}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-sub">※ 施設・サービスにより異なります。あくまでイメージです。</p>
      </section>

      {/* 利用までの流れ */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-5
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
          <span aria-hidden>📋</span> 利用までの流れ
        </h2>
        <ol className="space-y-4">
          {option.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-ink text-white text-sm font-semibold
                              flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div className="pt-0.5">
                <p className="text-base font-semibold text-ink">{step.label}</p>
                <p className="text-base text-sub leading-relaxed mt-1">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* よく聞かれること */}
      <section className="print-page rounded-3xl bg-white overflow-hidden mb-8
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-ink px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center gap-2">
          <span aria-hidden>💬</span> よく聞かれること
        </h2>
        <div className="divide-y divide-line">
          {option.localFaqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between gap-4 cursor-pointer
                                  px-6 sm:px-8 py-4 list-none hover:bg-gray-50 transition-colors">
                <span className="text-base sm:text-lg font-medium text-ink">Q. {faq.q}</span>
                <span className="text-sub shrink-0 transition-transform group-open:rotate-180" aria-hidden>▼</span>
              </summary>
              <div className="px-6 sm:px-8 pb-5 pt-1 text-base sm:text-lg text-ink leading-relaxed
                              border-t border-line bg-gray-50/50">
                A. {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 共有ボタン */}
      <ShareButtons title={option.title} />

      <p className="no-print mt-10 text-center text-sub text-sm">
        ※ 内容は一般的な目安です。実際の費用や利用条件は施設にご確認ください。
      </p>
    </main>
  );
}
