"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Rating, Shoe, ShoePurposeId, ShoeTrait } from "@/lib/types";

type Lite = Pick<Shoe, "slug" | "brand" | "series" | "model" | "catch" | "purposes" | "traits" | "recommendFor" | "notFor" | "reasonsNotToBuy" | "specs" | "ratings" | "checkedAt">;

const TRAIT: Record<ShoeTrait, string> = {
  neutral: "ニュートラル",
  stability: "安定性（スタビリティ）",
  soft: "やわらかめ",
  "max-cushion": "厚いクッション",
  light: "軽量",
  bouncy: "弾む反発",
  plate: "プレート入り",
  budget: "入門価格帯",
  "wide-option": "幅広モデルあり",
};
const PURPOSE: Record<ShoePurposeId, string> = {
  first: "はじめての一足",
  easy: "ゆっくりジョグ",
  cushion: "クッション重視",
  stability: "安定性重視",
  long: "長い距離",
  marathon: "フルマラソン",
  speed: "スピード練習",
  value: "コスパ",
};
const ALL_PURPOSES = Object.keys(PURPOSE) as ShoePurposeId[];
const RATING: { key: keyof Shoe["ratings"]; label: string; criterion: string }[] = [
  { key: "cushion", label: "クッション性", criterion: "着地のやわらかさ・衝撃の少なさ" },
  { key: "stability", label: "安定性", criterion: "着地でのぐらつきにくさ" },
  { key: "response", label: "反発性", criterion: "蹴り出しの弾み" },
  { key: "fit", label: "フィット感", criterion: "かかと・甲・幅の収まり" },
];
const COLORS = ["var(--navy)", "#c2662d", "#3f7d6a"];

type Props = { shoes: Lite[]; brandNames: Record<string, string> };

export function ShoeCompare({ shoes, brandNames }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selected = useMemo(() => {
    const slugs = (params.get("s") ?? "").split(",").filter(Boolean);
    const list = slugs.map((s) => shoes.find((x) => x.slug === s)).filter((x): x is Lite => Boolean(x));
    return list.length ? list.slice(0, 3) : shoes.filter((s) => ["nike-pegasus", "nike-vomero", "asics-novablast"].includes(s.slug));
  }, [params, shoes]);

  const setSlot = (i: number, slug: string) => {
    const next = selected.map((s) => s.slug);
    if (slug === "") next.splice(i, 1);
    else next[i] = slug;
    router.replace(`${pathname}?s=${[...new Set(next)].join(",")}`, { scroll: false });
  };

  const name = (s: Lite) => `${brandNames[s.brand]} ${s.model ?? s.series}`;
  const maxWeight = Math.max(...selected.map((s) => s.specs.weightG.value ?? 0), 1);
  const maxStack = Math.max(...selected.map((s) => s.specs.stackHeelMm.value ?? 0), 1);

  const num = (s: Lite, k: keyof Shoe["specs"], unit: string, max: number) => {
    const f = s.specs[k];
    if (f.value === null) return <span className="sc-unknown">未確認</span>;
    return (
      <span className="sc-num">
        <span className="sc-num__v num">
          {k === "priceJpy" ? f.value.toLocaleString("ja-JP") : f.value}
          <small>{unit}</small>
        </span>
        {max > 0 && k !== "priceJpy" && k !== "dropMm" ? (
          <span className="sc-bar" aria-hidden="true">
            <span style={{ width: `${(f.value / max) * 100}%` }} />
          </span>
        ) : null}
        <span className={f.verified ? "sc-src sc-src--ok" : "sc-src"}>{f.verified ? "公式で確認" : "要確認"}</span>
      </span>
    );
  };

  const rating = (r: Rating) =>
    r.score ? (
      <span className="sc-rating">
        <span className="sc-rating__dots" role="img" aria-label={`5段階中${r.score}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className={n <= r.score! ? "on" : ""} />
          ))}
        </span>
        <span className="sc-src">{r.basis === "worn" ? "実際に履いた評価" : "調査にもとづく評価"}</span>
      </span>
    ) : (
      <span className="sc-unknown">未評価</span>
    );

  const Row = ({ label, note, render }: { label: string; note?: string; render: (s: Lite) => React.ReactNode }) => (
    <div className="sc-row">
      <p className="sc-row__label">
        {label}
        {note ? <small>{note}</small> : null}
      </p>
      <ul role="list" className="sc-row__vals">
        {selected.map((s, i) => (
          <li key={s.slug}>
            <span className="sc-who" style={{ color: COLORS[i] }}>
              {s.model ?? s.series}
            </span>
            <span className="sc-val">{render(s)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="sc">
      {/* 選ぶ */}
      <div className="sc-pick">
        {[0, 1, 2].map((i) => (
          <label key={i} className="sc-pick__slot" style={{ borderTopColor: selected[i] ? COLORS[i] : undefined }}>
            <span className="sc-pick__n">{i + 1}足目</span>
            <select value={selected[i]?.slug ?? ""} onChange={(e) => setSlot(i, e.target.value)} disabled={i > selected.length}>
              <option value="">{i < selected.length ? "外す" : "選ぶ"}</option>
              {Object.entries(
                shoes.reduce<Record<string, Lite[]>>((acc, s) => ((acc[brandNames[s.brand]!] ??= []).push(s), acc), {}),
              ).map(([brand, list]) => (
                <optgroup key={brand} label={brand}>
                  {list.map((s) => (
                    <option key={s.slug} value={s.slug} disabled={selected.some((x, j) => j !== i && x.slug === s.slug)}>
                      {s.model ?? s.series}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* 一目で */}
      <ul role="list" className="sc-heads">
        {selected.map((s, i) => (
          <li key={s.slug} style={{ borderTopColor: COLORS[i] }}>
            <p className="sc-heads__brand">{brandNames[s.brand]}</p>
            <p className="sc-heads__name latin">{s.model ?? s.series}</p>
            <p className="sc-heads__catch">{s.catch}</p>
            <Link href={`/shoes/${s.slug}`} className="m-link">
              詳しく
            </Link>
          </li>
        ))}
      </ul>

      {/* 用途の適性（マップ） */}
      <section className="sc-section" aria-labelledby="sc-fit">
        <h2 id="sc-fit" className="sc-h2">
          得意な用途
        </h2>
        <p className="sc-note">各メーカーの製品分類をもとにした、編集部の整理です（性能の点数ではありません）。</p>
        <div className="sc-matrix" role="table" aria-label="用途の適性">
          <div role="row" className="sc-matrix__row sc-matrix__head">
            <span role="columnheader" />
            {selected.map((s, i) => (
              <span role="columnheader" key={s.slug} style={{ color: COLORS[i] }}>
                {s.model ?? s.series}
              </span>
            ))}
          </div>
          {ALL_PURPOSES.map((p) => (
            <div role="row" key={p} className="sc-matrix__row">
              <span role="rowheader">{PURPOSE[p]}</span>
              {selected.map((s, i) => (
                <span role="cell" key={s.slug} aria-label={s.purposes.includes(p) ? "向いている" : "－"}>
                  {s.purposes.includes(p) ? <i className="sc-dot" style={{ background: COLORS[i] }} /> : <i className="sc-dot sc-dot--off" />}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 数値 */}
      <section className="sc-section" aria-labelledby="sc-spec">
        <h2 id="sc-spec" className="sc-h2">
          数値で見る
        </h2>
        <p className="sc-note">メーカー公式の数値だけを載せています。公式で確認できていない数値は「未確認」です。</p>
        <Row label="公式価格" note="税込" render={(s) => num(s, "priceJpy", "円", 0)} />
        <Row label="重量" note="片足" render={(s) => num(s, "weightG", "g", maxWeight)} />
        <Row label="かかとの厚さ" render={(s) => num(s, "stackHeelMm", "mm", maxStack)} />
        <Row label="つま先の厚さ" render={(s) => num(s, "stackForefootMm", "mm", maxStack)} />
        <Row label="ドロップ" render={(s) => num(s, "dropMm", "mm", 0)} />
      </section>

      {/* 主観 */}
      <section className="sc-section" aria-labelledby="sc-feel">
        <h2 id="sc-feel" className="sc-h2">
          履き心地の評価
        </h2>
        <p className="sc-note">
          5段階の主観評価です。実際に履いたか、十分に調べてから付けます。評価のないモデルは「未評価」です。
        </p>
        {selected.some((s) => RATING.some((r) => s.ratings[r.key].score)) ? (
          RATING.map((r) => <Row key={r.key} label={r.label} note={r.criterion} render={(s) => rating(s.ratings[r.key])} />)
        ) : (
          <p className="sc-empty">
            選んだシューズには、まだ評価がありません。評価する項目は、{RATING.map((r) => `${r.label}（${r.criterion}）`).join("、")}です。
          </p>
        )}
      </section>

      {/* 特徴 */}
      <section className="sc-section" aria-labelledby="sc-trait">
        <h2 id="sc-trait" className="sc-h2">
          特徴
        </h2>
        <Row label="タイプ" render={(s) => <span className="sc-chips">{s.traits.map((t) => <span key={t}>{TRAIT[t]}</span>)}</span>} />
        <Row label="向いている人" render={(s) => s.recommendFor[0]} />
        <Row label="向いていない人" render={(s) => s.notFor[0]} />
        <Row label="買わなくていい理由" render={(s) => s.reasonsNotToBuy.at(-1)} />
      </section>
    </div>
  );
}
