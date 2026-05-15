"use client";
import { useState } from "react";
import Link from "next/link";
import { OPTIONS } from "@/lib/data";

// ── 設問定義 ────────────────────────────────────────
const QUESTIONS = [
  {
    id: "careLevel",
    question: "現在の要介護度を教えてください",
    options: [
      { label: "要支援（1〜2）",  emoji: "🌱", value: "a" },
      { label: "要介護1〜2",      emoji: "🌿", value: "b" },
      { label: "要介護3以上",     emoji: "🍀", value: "c" },
      { label: "まだわからない",  emoji: "❓", value: "d" },
    ],
  },
  {
    id: "rehab",
    question: "リハビリを続けることは重視しますか？",
    options: [
      { label: "はい、できるだけ続けたい",        emoji: "💪", value: "a" },
      { label: "できればやりたい程度",             emoji: "🙂", value: "b" },
      { label: "リハビリより安定した生活を優先したい", emoji: "🏡", value: "c" },
    ],
  },
  {
    id: "priority",
    question: "いちばん重視することは何ですか？",
    options: [
      { label: "できるだけ家に近い環境で暮らしたい", emoji: "🏠", value: "a" },
      { label: "しっかりした介護・医療サポートが欲しい", emoji: "🩺", value: "b" },
      { label: "費用をできるだけおさえたい",       emoji: "💴", value: "c" },
      { label: "すぐに入れる場所を探している",     emoji: "⚡", value: "d" },
    ],
  },
] as const;

// ── スコアリング ─────────────────────────────────────
type Slug = "home" | "roken" | "tokuyo" | "yuuryou" | "sakouju";

const SCORE_TABLE: Record<string, Record<string, Partial<Record<Slug, number>>>> = {
  careLevel: {
    a: { home: 3, sakouju: 3, yuuryou: 1 },
    b: { home: 2, roken: 2, yuuryou: 2, sakouju: 1 },
    c: { tokuyo: 3, roken: 2, yuuryou: 2 },
    d: { home: 1, roken: 1, tokuyo: 1, yuuryou: 1, sakouju: 1 },
  },
  rehab: {
    a: { roken: 3, home: 2 },
    b: { home: 1, roken: 1, yuuryou: 1 },
    c: { tokuyo: 2, yuuryou: 2, sakouju: 2 },
  },
  priority: {
    a: { home: 3, sakouju: 2 },
    b: { roken: 2, tokuyo: 2, yuuryou: 2 },
    c: { home: 2, tokuyo: 3 },
    d: { yuuryou: 3, home: 2, sakouju: 2 },
  },
};

function calcScores(answers: Record<string, string>): { slug: Slug; score: number }[] {
  const scores: Record<Slug, number> = { home: 0, roken: 0, tokuyo: 0, yuuryou: 0, sakouju: 0 };
  for (const [qId, val] of Object.entries(answers)) {
    const row = SCORE_TABLE[qId]?.[val] ?? {};
    for (const [slug, pts] of Object.entries(row)) {
      scores[slug as Slug] += pts as number;
    }
  }
  return (Object.entries(scores) as [Slug, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([slug, score]) => ({ slug, score }));
}

// ── コンポーネント ───────────────────────────────────
export default function QuizPage() {
  const [step, setStep]       = useState(0);          // 0〜2: 設問 / 3: 結果
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQ = QUESTIONS[step];
  const progress  = Math.round((step / QUESTIONS.length) * 100);

  const handleAnswer = (value: string) => {
    const next = { ...answers, [currentQ.id]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length); // 結果画面
    }
  };

  const reset = () => { setStep(0); setAnswers({}); };

  // ── 結果画面 ───────────────────────────────────────
  if (step === QUESTIONS.length) {
    const ranked  = calcScores(answers);
    const top2    = ranked.slice(0, 2);
    const topSlugs = top2.map((r) => r.slug);
    const recommended = OPTIONS.filter((o) => topSlugs.includes(o.slug as Slug))
      .sort((a, b) => topSlugs.indexOf(a.slug as Slug) - topSlugs.indexOf(b.slug as Slug));

    return (
      <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-2xl mx-auto pb-32">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            おすすめの選択肢が見つかりました
          </h1>
          <p className="mt-3 text-sub text-base">回答内容をもとに、合いそうな選択肢をご提案します。</p>
        </div>

        <div className="space-y-4 mb-10">
          {recommended.map((opt, i) => (
            <div
              key={opt.slug}
              className={`rounded-3xl bg-gradient-to-b ${opt.accent} p-7
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]`}
            >
              {i === 0 && (
                <span className="inline-block bg-accent text-white text-xs font-semibold
                                 px-3 py-1 rounded-full mb-3">
                  いちばんおすすめ
                </span>
              )}
              <div className="flex items-start gap-4">
                <span className="text-5xl" aria-hidden>{opt.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-ink">{opt.title}</h2>
                  <p className="mt-1 text-sub text-base leading-relaxed">{opt.lead}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {opt.badges.map((b) => (
                      <span key={b.label}
                            className="px-3 py-1 rounded-full text-sm font-medium bg-white/70 text-ink">
                        {b.label}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/options/${opt.slug}`}
                    className="mt-4 inline-flex items-center text-accent text-base font-medium"
                  >
                    くわしく見る →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full text-center rounded-full border border-line bg-white
                       text-ink py-4 text-base font-medium hover:bg-gray-50 transition"
          >
            すべての選択肢を見る
          </Link>
          <button
            onClick={reset}
            className="block w-full text-center rounded-full text-sub text-base
                       py-3 hover:text-ink transition"
          >
            もう一度診断する
          </button>
        </div>
      </main>
    );
  }

  // ── 設問画面 ───────────────────────────────────────
  return (
    <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-2xl mx-auto pb-32">

      {/* プログレスバー */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-sub">質問 {step + 1} / {QUESTIONS.length}</span>
          <span className="text-sm font-medium text-accent">{progress}%</span>
        </div>
        <div className="w-full bg-line rounded-full h-1.5">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 設問 */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink text-center mb-10">
        {currentQ.question}
      </h1>

      {/* 選択肢ボタン */}
      <div className="space-y-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="w-full flex items-center gap-5 rounded-2xl bg-white px-6 py-5 text-left
                       shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]
                       hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]
                       hover:border-accent/40 border-2 border-transparent
                       transition-all active:scale-[0.99]"
          >
            <span className="text-3xl shrink-0" aria-hidden>{opt.emoji}</span>
            <span className="text-lg font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* 戻るボタン */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-8 w-full text-center text-sub text-base hover:text-ink transition py-3"
        >
          ← 前の質問に戻る
        </button>
      )}
    </main>
  );
}
