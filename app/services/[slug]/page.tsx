import Link from "next/link";
import { notFound } from "next/navigation";
import CostBar from "@/components/CostBar";
import ShareButtons from "@/components/ShareButtons";
import QuickShareBar from "@/components/QuickShareBar";
import { SERVICES } from "@/lib/data";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = SERVICES.find((s) => s.slug === params.slug);
  if (!service) return notFound();

  return (
    <main className="min-h-screen px-5 sm:px-8 py-8 sm:py-12 max-w-3xl mx-auto">

      {/* 戻る */}
      <nav className="no-print mb-4">
        <Link href="/services" className="text-accent text-base inline-flex items-center">
          <span className="mr-1">←</span> サービス一覧へ
        </Link>
      </nav>

      {/* 上部クイック共有バー */}
      <QuickShareBar title={service.name} />

      {/* タイトルカード */}
      <header className={`print-page rounded-3xl bg-gradient-to-b ${service.accent}
                          p-8 sm:p-10 mb-5`}>
        <div className="text-5xl mb-3 print:text-4xl" aria-hidden>{service.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink print:text-2xl">
          {service.name}
        </h1>
        <p className="mt-3 text-sub text-base sm:text-lg leading-relaxed print:text-sm">
          {service.detail}
        </p>
      </header>

      {/* 基本情報 */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-5 space-y-0 divide-y divide-line">
        <div className="flex gap-4 sm:gap-5 py-5 first:pt-0">
          <div className="text-3xl shrink-0 print:text-2xl" aria-hidden>👥</div>
          <div>
            <div className="text-sm text-sub mb-1">こんな方に向いています</div>
            <div className="text-lg sm:text-xl text-ink leading-relaxed print:text-base">
              {service.forWhom}
            </div>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-5 py-5">
          <div className="text-3xl shrink-0 print:text-2xl" aria-hidden>💴</div>
          <div className="w-full">
            <div className="text-sm text-sub mb-1">費用のめやす</div>
            <div className="text-lg sm:text-xl text-ink leading-relaxed print:text-base">
              {service.cost}
            </div>
            <CostBar level={service.costLevel} />
          </div>
        </div>
      </section>

      {/* 利用イメージ */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-5">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2 print:text-base">
          <span aria-hidden>💡</span> こんなときに使います
        </h2>
        <ul className="space-y-3">
          {service.usageScene.map((scene, i) => (
            <li key={i} className="flex items-start gap-3 text-ink text-base leading-relaxed print:text-sm">
              <span className="text-accent shrink-0 mt-1" aria-hidden>●</span>
              {scene}
            </li>
          ))}
        </ul>
      </section>

      {/* 利用までの流れ */}
      <section className="print-page rounded-3xl bg-white p-6 sm:p-8 mb-5">
        <h2 className="text-lg font-semibold text-ink mb-5 flex items-center gap-2 print:text-base">
          <span aria-hidden>📋</span> 利用までの流れ
        </h2>
        <ol className="space-y-4">
          {service.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-ink text-white text-sm font-semibold
                              flex items-center justify-center shrink-0 print:w-6 print:h-6 print:text-xs">
                {i + 1}
              </div>
              <div className="pt-0.5">
                <p className="text-base font-semibold text-ink print:text-sm">{step.label}</p>
                <p className="text-base text-sub leading-relaxed mt-1 print:text-xs">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* よく聞かれること */}
      <section className="print-page rounded-3xl bg-white overflow-hidden mb-8">
        <h2 className="text-lg font-semibold text-ink px-6 sm:px-8 pt-6 sm:pt-8 pb-4
                       flex items-center gap-2 print:text-base print:pt-4">
          <span aria-hidden>💬</span> よく聞かれること
        </h2>
        <div className="divide-y divide-line">
          {service.faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between gap-4 cursor-pointer
                                  px-6 sm:px-8 py-4 list-none hover:bg-gray-50 transition-colors">
                <span className="text-base sm:text-lg font-medium text-ink print:text-sm">
                  Q. {faq.q}
                </span>
                <span className="text-sub shrink-0 transition-transform group-open:rotate-180
                                 print:hidden" aria-hidden>▼</span>
              </summary>
              <div className="px-6 sm:px-8 pb-5 pt-3 text-base sm:text-lg text-ink
                              leading-relaxed border-t border-line bg-gray-50/50
                              print:text-sm print:pb-3">
                A. {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 共有ボタン */}
      <ShareButtons title={service.name} />

      <p className="no-print mt-10 text-center text-sub text-sm">
        ※ 費用や対象は地域・事業所により異なります。詳しくはケアマネジャーへご相談ください。
      </p>
    </main>
  );
}
