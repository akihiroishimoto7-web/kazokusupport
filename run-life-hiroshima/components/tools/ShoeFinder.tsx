"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Shoe } from "@/lib/types";
import {
  PURPOSE_LABEL,
  PURPOSE_REASON,
  QUESTIONS,
  adviceFor,
  answersFromParams,
  isComplete,
  primaryPurpose,
  scoreShoes,
  type Answers,
} from "@/lib/shoe-finder";
import { Arrow } from "../Arrow";

type Props = { shoes: Shoe[]; brandNames: Record<string, string> };

export function ShoeFinder({ shoes, brandNames }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initial = useMemo(() => answersFromParams(new URLSearchParams(params.toString())), [params]);
  const [answers, setAnswers] = useState<Partial<Answers>>(initial);
  const [step, setStep] = useState(() => (isComplete(initial) ? QUESTIONS.length : 0));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // 質問が変わったら見出しにフォーカス（スクリーンリーダーと片手操作のため）
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  const done = step >= QUESTIONS.length && isComplete(answers);

  const choose = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value } as Partial<Answers>;
    setAnswers(next);
    // 結果画面から「変更」した場合は、答え直したらすぐ結果に戻る
    const nextStep = isComplete(answers) && isComplete(next) ? QUESTIONS.length : step + 1;
    setStep(nextStep);
    if (nextStep >= QUESTIONS.length && isComplete(next)) {
      const sp = new URLSearchParams(next as Record<string, string>);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    router.replace(pathname, { scroll: false });
  };

  if (done) {
    return <Result answers={answers as Answers} shoes={shoes} brandNames={brandNames} onRestart={restart} headingRef={headingRef} onEdit={(i) => setStep(i)} />;
  }

  const q = QUESTIONS[step]!;
  return (
    <section className="finder wrap" aria-labelledby="finder-q">
      {step === 0 ? (
        <header className="finder__intro">
          <p className="hub__catch">ランニングシューズ診断</p>
          <p className="finder__lead">
            6つの質問に答えると、あなたに合うシューズの<strong>タイプ</strong>と、<strong>その理由</strong>がわかります。
          </p>
        </header>
      ) : null}
      <div className="finder__progress" aria-hidden="true">
        {QUESTIONS.map((_, i) => (
          <span key={i} className={i < step ? "done" : i === step ? "now" : ""} />
        ))}
      </div>
      <p className="finder__count num">
        {step + 1} / {QUESTIONS.length}
      </p>
      <h1 className="finder__q" id="finder-q" tabIndex={-1} ref={headingRef}>
        {q.title}
      </h1>
      {q.hint ? <p className="finder__hint">{q.hint}</p> : null}
      <ul role="list" className="finder__options">
        {q.options.map((o) => {
          const selected = answers[q.key] === o.value;
          return (
            <li key={String(o.value)}>
              <button
                type="button"
                className={`option ${selected ? "is-selected" : ""}`}
                aria-pressed={selected}
                onClick={() => choose(q.key, String(o.value))}
              >
                <span className="option__label">{o.label}</span>
                {o.detail ? <span className="option__detail">{o.detail}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {step > 0 ? (
        <button type="button" className="finder__back" onClick={() => setStep(step - 1)}>
          ひとつ前の質問に戻る
        </button>
      ) : null}
    </section>
  );
}

function Result({
  answers,
  shoes,
  brandNames,
  onRestart,
  onEdit,
  headingRef,
}: {
  answers: Answers;
  shoes: Shoe[];
  brandNames: Record<string, string>;
  onRestart: () => void;
  onEdit: (step: number) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const purpose = primaryPurpose(answers);
  const ranked = scoreShoes(shoes, answers).slice(0, 4);
  const advice = adviceFor(answers);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: "ランニングシューズ診断の結果", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* 共有がキャンセルされた場合は何もしない */
    }
  };

  return (
    <section className="finder finder--result wrap" aria-labelledby="result-title">
      <p className="hub__catch">診断の結果</p>
      <h1 className="result__title" id="result-title" tabIndex={-1} ref={headingRef}>
        あなたに合いそうなのは
        <br />
        <span className="result__type">「{PURPOSE_LABEL[purpose]}」</span>
        <span className="wb">のシューズです。</span>
      </h1>

      <div className="result__why">
        <h2>なぜ、このタイプ？</h2>
        <p>{PURPOSE_REASON[purpose]}</p>
        <dl className="result__answers">
          {QUESTIONS.map((q, i) => (
            <div key={q.key}>
              <dt>{q.title}</dt>
              <dd>
                {q.options.find((o) => o.value === answers[q.key])?.label}
                <button type="button" className="link-button" onClick={() => onEdit(i)}>
                  変更
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="result__picks">
        <h2>候補になるシリーズ</h2>
        <p className="result__note">
          用途と特徴だけで並べています。紹介料や価格の高さで順位を変えることはありません。現行モデルのスペックは確認中のものがあります。
        </p>
        {ranked.length ? (
          <ol role="list" className="result__list">
            {ranked.map((r, i) => (
              <li key={r.shoe.slug}>
                <Link href={`/shoes/${r.shoe.slug}`} className="result-shoe">
                  <span className="result-shoe__no num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="result-shoe__body">
                    <span className="result-shoe__name latin">
                      <span className="result-shoe__brand">{brandNames[r.shoe.brand]}</span> {r.shoe.model ?? r.shoe.series}
                    </span>
                    <span className="result-shoe__catch">{r.shoe.catch}</span>
                    {r.reasons.length ? (
                      <ul className="result-shoe__reasons">
                        {r.reasons.slice(0, 3).map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : null}
                    <span className="result-shoe__more">
                      詳しく見る <Arrow />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p>条件に合うシリーズが見つかりませんでした。回答を変えてみてください。</p>
        )}
      </div>

      <div className="result__advice">
        <h2>選ぶ前に</h2>
        <ul>
          {advice.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p>今のシューズで痛みや不満がなければ、無理に買い替える必要はありません。</p>
      </div>

      <div className="result__next">
        <Link href={`/shoes/purpose/${purpose}`} className="button button--primary">
          「{PURPOSE_LABEL[purpose]}」の選び方を読む <Arrow />
        </Link>
        <Link href="/articles/shoes-first-pair" className="button button--quiet">
          はじめての一足の選び方 <Arrow />
        </Link>
        <div className="result__actions">
          <button type="button" className="link-button" onClick={share}>
            {copied ? "URLをコピーしました" : "結果を共有する"}
          </button>
          <button type="button" className="link-button" onClick={onRestart}>
            最初からやり直す
          </button>
        </div>
      </div>
    </section>
  );
}
