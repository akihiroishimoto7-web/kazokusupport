import Link from "next/link";
import OptionCard from "@/components/OptionCard";
import { OPTIONS } from "@/lib/data";

// トップ画面：5つの選択肢を大きなカードで表示
export default function HomePage() {
  return (
    <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
      {/* ヘッダー */}
      <header className="text-center mb-12 sm:mb-16">
        <p className="text-sub text-sm sm:text-base mb-3">退院後の暮らしガイド</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-ink leading-tight">
          退院後の選択肢を、<br className="sm:hidden" />
          一緒に考えましょう
        </h1>
        <p className="mt-5 text-sub text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          ご本人とご家族にとって、いちばん安心できる暮らし方を見つけるためのガイドです。
        </p>
      </header>

      {/* 選択肢カード */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {OPTIONS.map((opt) => (
          <OptionCard key={opt.slug} option={opt} />
        ))}
      </section>

      {/* 介護保険サービスへの導線 */}
      <section className="mt-12 sm:mt-16">
        <Link
          href="/services"
          className="block rounded-3xl bg-white p-7 sm:p-8
                     shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]
                     hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]
                     transition-shadow"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-3xl mb-2" aria-hidden>🧡</div>
              <h2 className="text-xl sm:text-2xl font-semibold text-ink">
                介護保険でつかえるサービス
              </h2>
              <p className="mt-2 text-sub text-base">
                どんなサポートが受けられるのか、やさしく一覧で見られます
              </p>
            </div>
            <span className="text-accent text-2xl">→</span>
          </div>
        </Link>
      </section>

      {/* フッター */}
      <footer className="mt-16 text-center text-sub text-sm">
        ※ 費用や入りやすさは目安です。地域・施設により異なります。
      </footer>
    </main>
  );
}
