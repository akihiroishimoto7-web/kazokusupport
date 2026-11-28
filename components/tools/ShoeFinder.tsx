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
  type PriceIndex,
} from "@/lib/shoe-finder";
import { Arrow } from "../Arrow";
import { pickForResult, type LinkedEntry } from "@/lib/ameblo-match";
import { track } from "@/lib/track";

type AmebloProps = { entries: LinkedEntry[]; blogUrl: string | null; title: string };

type Props = {
  shoes: Shoe[];
  brandNames: Record<string, string>;
  ameblo?: AmebloProps;
  prices?: PriceIndex;
  /** シリーズごとの世代比較ページ（例: /shoes/models/nike-pegasus-41-vs-nike-pegasus-42） */
  generationLinks?: Record<string, { path: string; label: string }>;
};

export function ShoeFinder({ shoes, brandNames, ameblo, prices, generationLinks }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initial = useMemo(() => answersFromParams(new URLSearchParams(params.toString())), [params]);
  const [answers, setAnswers] = useState<Partial<Answers>>(initial);
  // トップページなどから途中まで答えた状態で来た場合は、続きの質問から始める
  const [step, setStep] = useState(() => {
    const i = QUESTIONS.findIndex((q) => initial[q.key] === undefined);
    return i === -1 ? QUESTIONS.length : i;
  });
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
    if (step === 0 && !isComplete(answers)) track("finder_start", { first_question: key });
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
    return <Result answers={answers as Answers} shoes={shoes} prices={prices} generationLinks={generationLinks} brandNames={brandNames} ameblo={ameblo} onRestart={restart} headingRef={headingRef} onEdit={(i) => setStep(i)} />;
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
  prices,
  generationLinks,
  brandNames,
  ameblo,
  onRestart,
  onEdit,
  headingRef,
}: {
  answers: Answers;
  shoes: Shoe[];
  prices?: PriceIndex;
  generationLinks?: Record<string, { path: string; label: string }>;
  brandNames: Record<string, string>;
  ameblo?: AmebloProps;
  onRestart: () => void;
  onEdit: (step: number) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const purpose = primaryPurpose(answers);
  const ranked = scoreShoes(shoes, answers, prices).slice(0, 4);
  const advice = adviceFor(answers);
  // 結果を表示したことを1回だけ記録（主な用途だけ。回答の中身は送らない）
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track("finder_complete", { purpose, candidates: ranked.length });
  }, [purpose, ranked.length]);
  const blog = ameblo ? pickForResult(ameblo.entries, ranked.map((r) => r.shoe.slug), purpose, 3) : [];
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
          あなたの答えと、シューズの用途・特徴だけで並べています。広告やお店の都合で順番を変えることはありません。現行モデルのスペックは確認中のものがあります。
        </p>
        {ranked.length ? (
          <ol role="list" className="result__list">
            {ranked.map((r, i) => (
              <li key={r.shoe.slug}>
                <Link
                  href={`/shoes/${r.shoe.slug}`}
                  className="result-shoe"
                  onClick={() => track("finder_result_click", { shoe: r.shoe.slug, rank: i + 1, link_type: "detail" })}
                >
                  <span className="result-shoe__no num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="result-shoe__body">
                    <span className="result-shoe__name latin">
                      <span className="result-shoe__brand">{brandNames[r.shoe.brand]}</span> {r.shoe.model ?? r.shoe.series}
                    </span>
                    <span className="result-shoe__catch">{r.shoe.catch}</span>
                    {r.reasons.length ? (
                      <ul className="result-shoe__reasons">
                        {/* 予算の判定（価格の理由）は必ず見えるように残す */}
                        {[...r.reasons.filter((x) => !x.includes("予算内")).slice(0, 2), ...r.reasons.filter((x) => x.includes("予算内"))].map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : null}
                    <span className="result-shoe__facts">
                      <span>
                        価格帯：
                        {priceLine(prices?.[r.shoe.slug]) ?? <span className="muted">公式価格は未確認</span>}
                      </span>
                      {r.shoe.notFor[0] ? <span>注意：{r.shoe.notFor[0]}には向きません</span> : null}
                    </span>
                    <span className="result-shoe__more">
                      詳しく見る・購入先 <Arrow />
                    </span>
                  </span>
                </Link>
                <p className="result-shoe__links">
                  <Link
                    href={`/shoes/compare?s=${r.shoe.slug}`}
                    onClick={() => track("finder_result_click", { shoe: r.shoe.slug, rank: i + 1, link_type: "compare" })}
                  >
                    ほかの候補とくらべる
                  </Link>
                  {generationLinks?.[r.shoe.slug] ? (
                    <Link
                      href={generationLinks[r.shoe.slug]!.path}
                      onClick={() => track("finder_result_click", { shoe: r.shoe.slug, rank: i + 1, link_type: "generation" })}
                    >
                      {generationLinks[r.shoe.slug]!.label}
                    </Link>
                  ) : null}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p>条件に合うシリーズが見つかりませんでした。回答を変えてみてください。</p>
        )}
        {ranked.some((r) => r.deal) ? (
          <p className="result__note">価格は、メーカー公式オンラインストアの販売価格、またはメーカーが発表した希望小売価格で、確認した日のものです（{[...new Set(ranked.map((r) => r.deal?.checkedAt).filter(Boolean))].map((d) => d!.replaceAll("-", ".")).join("・")}確認）。セールの終了などで変わります。</p>
        ) : null}
      </div>

      {blog.length && ameblo ? (
        <div className="result__blog">
          <h2>もっとくわしく：研究所ブログ</h2>
          <p className="result__note">
            運営者のアメブロ「{ameblo.title}」から、候補のシューズや「{PURPOSE_LABEL[purpose]}」に関係する記事です。セール情報や広告（Ameba Pick）を含む記事があります。診断の順位には影響しません。
          </p>
          <ul role="list" className="ameblo__list">
            {blog.map((e) => (
              <li key={e.url}>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="ameblo__item">
                  <span className="ameblo__body">
                    <span className="ameblo__date">{e.date.replaceAll("-", ".")}</span>
                    <span className="ameblo__title">{e.title}</span>
                    <span className="result__blog-why">
                      {e.shoes.some((s) => ranked.some((r) => r.shoe.slug === s))
                        ? `候補の「${ranked.find((r) => e.shoes.includes(r.shoe.slug))!.shoe.series}」の記事`
                        : `「${PURPOSE_LABEL[purpose]}」に関係する記事`}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {ameblo.blogUrl ? (
            <p className="ameblo__more">
              <a href={ameblo.blogUrl} target="_blank" rel="noopener noreferrer" className="m-link">
                アメブロで、ほかの記事も読む
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

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
        {ranked.length >= 2 ? (
          <Link href={`/shoes/compare?s=${ranked.slice(0, 3).map((r) => r.shoe.slug).join(",")}`} className="button button--quiet">
            候補を並べてくらべる <Arrow />
          </Link>
        ) : null}
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

/** 公式ストア・メーカー希望小売価格で確認できた価格の幅（例: 6,600〜20,900円） */
function priceLine(opts: PriceIndex[string] | undefined): string | null {
  if (!opts?.length) return null;
  const ps = opts.map((o) => o.priceJpy);
  const min = Math.min(...ps);
  const max = Math.max(...ps);
  const y = (n: number) => n.toLocaleString("ja-JP");
  const prev = opts.some((o) => o.lifecycle === "previous" && o.priceJpy === min && min !== max);
  return min === max ? `${y(min)}円` : `${y(min)}〜${y(max)}円${prev ? "（安いほうは前の世代）" : ""}`;
}
