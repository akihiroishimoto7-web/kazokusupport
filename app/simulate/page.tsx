"use client";
import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────
// データ定義
// ─────────────────────────────────────────────────────────

type Range = [number, number]; // 万円/月

const CARE_LEVELS = [
  { label: "要支援1〜2" },
  { label: "要介護1〜2" },
  { label: "要介護3〜4" },
  { label: "要介護5" },
];

const COPAY_RATES = [
  { label: "1割", desc: "一般的な方（ほとんどの方が該当）" },
  { label: "2割", desc: "一定以上の所得がある方" },
  { label: "3割", desc: "現役並みの所得がある方" },
];

const LIMIT_CERT = [
  { label: "なし（一般）", emoji: "📄", desc: "通常の食費・居住費が適用されます" },
  { label: "あり",         emoji: "✅", desc: "施設の食費・居住費が軽減されます" },
];

// 在宅: [careLevel][copay]
const HOME: Range[][] = [
  [[1, 3],  [2, 5],  [3, 7]],
  [[2, 5],  [4, 10], [6, 15]],
  [[3, 8],  [6, 15], [9, 22]],
  [[4, 10], [7, 18], [10, 25]],
];

// 老健: [copay][limitCert]
const ROKEN: Range[][] = [
  [[10, 13], [5, 8]],
  [[13, 16], [8, 11]],
  [[16, 19], [11, 14]],
];

// 特養: [copay][limitCert]
const TOKUYO: Range[][] = [
  [[9, 12], [5, 7]],
  [[12, 15], [7, 10]],
  [[15, 18], [10, 13]],
];

// 有料老人ホーム: [copay]
const YUURYOU: Range[] = [
  [15, 25],
  [17, 28],
  [19, 30],
];

// サ高住: [copay]
const SAKOUJU: Range[] = [
  [10, 18],
  [12, 20],
  [14, 22],
];

// ─────────────────────────────────────────────────────────
// 結果計算
// ─────────────────────────────────────────────────────────

type ResultItem = {
  slug: string;
  emoji: string;
  title: string;
  accent: string;
  range: Range | null;
  note: string;
  warning?: string;
};

function calcResults(careLevel: number, copay: number, limitCert: number): ResultItem[] {
  const isRokenEligible  = careLevel >= 1;
  const isTokuyoEligible = careLevel >= 2;

  return [
    {
      slug:  "home",
      emoji: "🏠",
      title: "自宅へ帰る",
      accent: "from-sky-100 to-white",
      range: HOME[careLevel][copay],
      note:  "介護保険サービスの自己負担のみ。食費・光熱費は別途かかります。",
    },
    {
      slug:  "roken",
      emoji: "🌿",
      title: "老健",
      accent: "from-emerald-100 to-white",
      range: isRokenEligible ? ROKEN[copay][limitCert] : null,
      note:  "食費・居住費・介護サービス費・日常生活費を含む目安です。",
      warning: isRokenEligible ? undefined : "原則、要介護1以上の方が対象です",
    },
    {
      slug:  "tokuyo",
      emoji: "🌷",
      title: "特養",
      accent: "from-rose-100 to-white",
      range: isTokuyoEligible ? TOKUYO[copay][limitCert] : null,
      note:  "食費・居住費・介護サービス費・日常生活費を含む目安です。",
      warning: isTokuyoEligible ? undefined : "原則、要介護3以上の方が対象です",
    },
    {
      slug:  "yuuryou",
      emoji: "🏨",
      title: "有料老人ホーム",
      accent: "from-amber-100 to-white",
      range: YUURYOU[copay],
      note:  "月額費用の目安。別途、入居一時金が必要な施設もあります。",
    },
    {
      slug:  "sakouju",
      emoji: "🌼",
      title: "サ高住",
      accent: "from-violet-100 to-white",
      range: SAKOUJU[copay],
      note:  "家賃・サービス費の目安。訪問介護など外部サービスを使うと追加費用がかかります。",
      warning: careLevel >= 3 ? "介護度が重い場合、住み続けが難しくなることがあります" : undefined,
    },
  ];
}

// ─────────────────────────────────────────────────────────
// コンポーネント
// ─────────────────────────────────────────────────────────

const BTN = `w-full flex items-center gap-5 rounded-2xl bg-white px-6 py-5 text-left
             shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]
             hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]
             border-2 border-transparent hover:border-accent/30
             transition-all active:scale-[0.99]`;

export default function SimulatePage() {
  const [step, setStep]           = useState(0);
  const [careLevel, setCareLevel] = useState<number | null>(null);
  const [copay, setCopay]         = useState<number | null>(null);
  const [limitCert, setLimitCert] = useState<number | null>(null);

  const progress = Math.round((step / 3) * 100);

  const reset = () => { setStep(0); setCareLevel(null); setCopay(null); setLimitCert(null); };

  // ── 結果画面 ─────────────────────────────────────────────
  if (careLevel !== null && copay !== null && limitCert !== null) {
    const results = calcResults(careLevel, copay, limitCert);
    return (
      <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-2xl mx-auto pb-32">

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💴</div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            月額費用のめやす
          </h1>
          <p className="mt-3 text-sub text-sm leading-relaxed">
            {CARE_LEVELS[careLevel].label}・{COPAY_RATES[copay].label}負担・
            負担限度額{limitCert === 0 ? "なし" : "あり"}の場合
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {results.map((r) => (
            <div
              key={r.slug}
              className={`rounded-3xl bg-gradient-to-b ${r.accent} p-6 sm:p-7
                          ${r.range === null ? "opacity-50" : ""}
                          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl shrink-0" aria-hidden>{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-ink">{r.title}</h2>
                    {r.warning && (
                      <span className="text-xs font-medium bg-white/70 text-amber-700
                                       px-2 py-0.5 rounded-full shrink-0">
                        {r.warning}
                      </span>
                    )}
                  </div>

                  {r.range ? (
                    <div className="mt-2 mb-1 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-ink">
                        {r.range[0]}〜{r.range[1]}
                      </span>
                      <span className="text-base text-sub">万円/月</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-base text-sub">対象外の可能性があります</p>
                  )}

                  <p className="text-sm text-sub leading-relaxed">{r.note}</p>

                  {r.range && (
                    <Link
                      href={`/options/${r.slug}`}
                      className="mt-3 inline-flex items-center text-accent text-sm font-medium"
                    >
                      くわしく見る →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 負担限度額の補足説明 */}
        <div className="rounded-2xl bg-white p-5 mb-8
                        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
          <p className="font-semibold text-ink mb-2 text-sm">📌 負担限度額認定制度とは？</p>
          <p className="text-sm text-sub leading-relaxed">
            施設入所時の食費・居住費を軽減する制度です。住民税非課税世帯で、
            預貯金が一定額以下の方が対象です。市区町村の窓口で申請できます。
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="block w-full text-center rounded-full border border-line bg-white
                       text-ink py-4 text-base font-medium hover:bg-gray-50 transition"
          >
            条件を変えてもう一度
          </button>
          <Link
            href="/"
            className="block w-full text-center rounded-full text-sub text-base
                       py-3 hover:text-ink transition"
          >
            選択肢一覧へ戻る
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-sub">
          ※ あくまで目安です。実際の費用は施設・地域・サービス内容により異なります。
        </p>
      </main>
    );
  }

  // ── 設問画面 ─────────────────────────────────────────────
  return (
    <main className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-2xl mx-auto pb-32">

      {/* プログレスバー */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-sub">ステップ {step + 1} / 3</span>
          <span className="text-sm font-medium text-accent">{Math.max(progress, 8)}%</span>
        </div>
        <div className="w-full bg-line rounded-full h-1.5">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </div>
      </div>

      {/* Step 0: 要介護度 */}
      {step === 0 && (
        <>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink text-center mb-10">
            要介護度を教えてください
          </h1>
          <div className="space-y-3">
            {CARE_LEVELS.map((opt, i) => (
              <button
                key={i}
                onClick={() => { setCareLevel(i); setStep(1); }}
                className={BTN}
              >
                <span className="text-lg font-medium text-ink">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 1: 自己負担割合 */}
      {step === 1 && (
        <>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink text-center mb-3">
            介護保険の自己負担割合は？
          </h1>
          <p className="text-center text-sub text-base mb-10">
            介護保険証に記載されています
          </p>
          <div className="space-y-3">
            {COPAY_RATES.map((opt, i) => (
              <button
                key={i}
                onClick={() => { setCopay(i); setStep(2); }}
                className={BTN}
              >
                <span className="text-2xl font-bold text-accent w-12 shrink-0">{opt.label}</span>
                <span className="text-base text-sub">{opt.desc}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(0)}
            className="mt-8 w-full text-center text-sub text-base hover:text-ink transition py-3"
          >
            ← 前の質問に戻る
          </button>
        </>
      )}

      {/* Step 2: 負担限度額認定 */}
      {step === 2 && (
        <>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink text-center mb-3">
            負担限度額認定は受けていますか？
          </h1>
          <p className="text-center text-sub text-base mb-10 leading-relaxed">
            施設の食費・居住費を軽減する制度です。<br className="hidden sm:block" />
            わからない場合は「なし」を選んでください。
          </p>
          <div className="space-y-3">
            {LIMIT_CERT.map((opt, i) => (
              <button
                key={i}
                onClick={() => setLimitCert(i)}
                className={BTN}
              >
                <span className="text-3xl shrink-0" aria-hidden>{opt.emoji}</span>
                <div>
                  <p className="text-lg font-medium text-ink">{opt.label}</p>
                  <p className="text-sm text-sub">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-8 w-full text-center text-sub text-base hover:text-ink transition py-3"
          >
            ← 前の質問に戻る
          </button>
        </>
      )}
    </main>
  );
}
