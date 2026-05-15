import Link from "next/link";
import ChecklistClient from "@/components/ChecklistClient";
import { FAQS } from "@/lib/data";

export default function GuidePage() {
  return (
    <main className="min-h-screen px-5 sm:px-8 py-8 sm:py-12 max-w-3xl mx-auto">
      <nav className="no-print mb-6">
        <Link href="/" className="text-accent text-base inline-flex items-center">
          <span className="mr-1">←</span> もどる
        </Link>
      </nav>

      {/* FAQ セクション */}
      <header className="mb-8">
        <div className="text-5xl mb-4" aria-hidden>💬</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          よくある質問
        </h1>
        <p className="mt-2 text-sub text-base sm:text-lg">
          ご家族からよくいただく質問にお答えします。
        </p>
      </header>

      <section className="space-y-3 mb-14">
        {FAQS.map((faq, i) => (
          <details
            key={i}
            className="group rounded-2xl bg-white overflow-hidden
                       shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
          >
            <summary
              className="flex items-center justify-between gap-4 cursor-pointer
                         px-6 py-5 text-lg font-medium text-ink list-none"
            >
              <span>Q. {faq.question}</span>
              <span className="text-sub transition-transform group-open:rotate-180 shrink-0">
                ▼
              </span>
            </summary>
            <div className="px-6 pb-5 text-base sm:text-lg text-ink leading-relaxed border-t border-line pt-4">
              A. {faq.answer}
            </div>
          </details>
        ))}
      </section>

      {/* チェックリスト セクション */}
      <header className="mb-6">
        <div className="text-5xl mb-4" aria-hidden>✅</div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          退院準備チェックリスト
        </h2>
        <p className="mt-2 text-sub text-base sm:text-lg">
          退院前に確認しておきたいことをリストにしました。
        </p>
      </header>

      <ChecklistClient />

      <p className="no-print mt-10 text-center text-sub text-sm">
        ※ ご不明な点は、病棟の相談員までお声がけください。
      </p>
    </main>
  );
}
