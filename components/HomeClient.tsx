"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OptionCard from "@/components/OptionCard";
import { OPTIONS, CARE_LEVELS } from "@/lib/data";

export default function HomeClient() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggleCompare = (slug: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < 3) {
        next.add(slug);
      }
      return next;
    });
  };

  const goCompare = () => {
    const slugs = [...compareSet];
    const params = slugs.map((s, i) => `${String.fromCharCode(97 + i)}=${s}`).join("&");
    router.push(`/compare?${params}`);
  };

  return (
    <>
      {/* 要介護度フィルター */}
      <section className="mb-8">
        <p className="text-sub text-sm mb-3 text-center">
          要介護度を選ぶと、対象外の選択肢が薄く表示されます
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedLevel(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                        ${selectedLevel === null
                          ? "bg-ink text-white"
                          : "bg-white text-sub border border-line"}`}
          >
            すべて
          </button>
          {CARE_LEVELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setSelectedLevel(selectedLevel === i ? null : i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                          ${selectedLevel === i
                            ? "bg-ink text-white"
                            : "bg-white text-sub border border-line"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 比較ヒント */}
      <p className="text-sub text-xs text-center mb-6 no-print">
        ✓ カードのチェックボタンで最大3つまで比較できます
      </p>

      {/* カードグリッド */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {OPTIONS.map((opt) => {
          const dimmed =
            selectedLevel !== null && !opt.careLevels.includes(selectedLevel);
          return (
            <OptionCard
              key={opt.slug}
              option={opt}
              dimmed={dimmed}
              checked={compareSet.has(opt.slug)}
              onToggleCompare={() => toggleCompare(opt.slug)}
            />
          );
        })}
      </section>

      {/* 介護保険サービスへの導線 */}
      <section className="mt-8 sm:mt-10">
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
              <p className="mt-1 text-sub text-base">
                ヘルパー・デイケア・福祉用具など、使えるサポートを見る
              </p>
            </div>
            <span className="text-accent text-2xl shrink-0">→</span>
          </div>
        </Link>
      </section>

      {/* 面談ガイドへの導線 */}
      <section className="mt-4">
        <Link
          href="/guide"
          className="block rounded-3xl bg-white p-7 sm:p-8
                     shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]
                     hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]
                     transition-shadow"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-3xl mb-2" aria-hidden>📋</div>
              <h2 className="text-xl sm:text-2xl font-semibold text-ink">
                よくある質問・退院準備チェックリスト
              </h2>
              <p className="mt-1 text-sub text-base">
                家族からよく聞かれる質問と、退院前に確認することを一覧で
              </p>
            </div>
            <span className="text-accent text-2xl shrink-0">→</span>
          </div>
        </Link>
      </section>

      {/* 比較バーが出た時の下余白 */}
      {compareSet.size > 0 && <div className="h-24" />}

      {/* 比較フローティングバー */}
      {compareSet.size > 0 && (
        <div className="no-print fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
          <div className="flex items-center gap-4 bg-ink text-white px-6 py-4 rounded-full
                          shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <span className="text-sm font-medium">
              {compareSet.size}件を選択中
            </span>
            <button
              onClick={goCompare}
              className="bg-white text-ink px-5 py-2 rounded-full text-sm font-semibold
                         hover:bg-gray-100 transition-colors"
            >
              比較する →
            </button>
            <button
              onClick={() => setCompareSet(new Set())}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              クリア
            </button>
          </div>
        </div>
      )}
    </>
  );
}
