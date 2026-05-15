import HomeClient from "@/components/HomeClient";

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
      <header className="text-center mb-10 sm:mb-14">
        <p className="text-sub text-sm sm:text-base mb-3">退院後の暮らしガイド</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-ink leading-tight">
          退院後の選択肢を、<br className="sm:hidden" />
          一緒に考えましょう
        </h1>
        <p className="mt-4 text-sub text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          ご本人とご家族にとって、いちばん安心できる暮らし方を見つけるためのガイドです。
        </p>
      </header>

      <HomeClient />

      <footer className="mt-16 text-center text-sub text-sm pb-24">
        ※ 費用や入りやすさは目安です。地域・施設により異なります。
      </footer>
    </main>
  );
}
