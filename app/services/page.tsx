import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { SERVICES } from "@/lib/data";

// 介護保険サービス説明ページ
export default function ServicesPage() {
  return (
    <main className="min-h-screen px-5 sm:px-8 py-8 sm:py-12 max-w-3xl mx-auto">
      <nav className="no-print mb-6">
        <Link href="/" className="text-accent text-base inline-flex items-center">
          <span className="mr-1">←</span> もどる
        </Link>
      </nav>

      <header className="mb-8 sm:mb-10">
        <div className="text-5xl mb-4" aria-hidden>🧡</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          介護保険でつかえるサービス
        </h1>
        <p className="mt-3 text-sub text-base sm:text-lg leading-relaxed">
          ご本人とご家族の暮らしを支える、代表的なサポートをご紹介します。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 mb-10">
        {SERVICES.map((s) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="print-page block rounded-3xl bg-white p-6 sm:p-7
                       shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]
                       hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]
                       transition-shadow"
          >
            <div className="flex gap-4 sm:gap-5 items-start">
              <div className="text-4xl shrink-0" aria-hidden>{s.emoji}</div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-semibold text-ink">{s.name}</h2>
                <p className="mt-1 text-accent text-base">{s.summary}</p>
                <p className="mt-3 text-sub text-base leading-relaxed">{s.detail}</p>
              </div>
              <span className="text-accent text-xl shrink-0 self-center">→</span>
            </div>
          </Link>
        ))}
      </section>

      <ShareButtons title="介護保険サービスの一覧" />

      <p className="no-print mt-10 text-center text-sub text-sm">
        ※ ご利用には介護認定が必要です。詳しくは担当のケアマネジャーへ。
      </p>
    </main>
  );
}
