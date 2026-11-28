import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FactValue } from "@/components/FactValue";
import { ShopLinks } from "@/components/ShopLinks";
import { JsonLd } from "@/components/JsonLd";
import { Arrow } from "@/components/Arrow";
import { getBrand, getPurpose } from "@/content/brands";
import { getShoe, publicShoes } from "@/content/shoes";
import { formatDate, formatYen } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { isIndexableShoe } from "@/lib/shoe-db";
import { comparablePairs, pairNotes, pairSlug, parsePairSlug } from "@/lib/shoe-pairs";
import type { Shoe } from "@/lib/types";

type Params = { params: Promise<{ pair: string }> };
export const dynamicParams = false;

export const generateStaticParams = () => comparablePairs(publicShoes(), isIndexableShoe).map(([a, b]) => ({ pair: pairSlug(a.slug, b.slug) }));

const name = (s: Shoe) => `${getBrand(s.brand).name} ${s.model ?? s.series}`;

function load(pair: string): [Shoe, Shoe] | null {
  const p = parsePairSlug(pair);
  if (!p) return null;
  const a = getShoe(p[0]);
  const b = getShoe(p[1]);
  return a && b ? [a, b] : null;
}

export async function generateMetadata({ params }: Params) {
  const { pair } = await params;
  const ab = load(pair);
  if (!ab) return {};
  const [a, b] = ab;
  return buildMetadata({
    title: `${a.model ?? a.series}と${b.model ?? b.series}の違い`,
    description: `${name(a)}と${name(b)}を、メーカー公式の重量・ドロップ・価格と、向いている人・向いていない人でくらべます。数値は公式ページで確認したものだけを載せています。`,
    path: `/shoes/compare/${pair}`,
  });
}

export default async function PairPage({ params }: Params) {
  const { pair } = await params;
  const ab = load(pair);
  if (!ab) notFound();
  const [a, b] = ab;
  const shared = a.purposes.filter((p) => b.purposes.includes(p));
  const notes = pairNotes(a, b, name);
  const crumbs = [
    { name: "ランニングシューズ研究所", path: "/shoes" },
    { name: "くらべる", path: "/shoes/compare" },
    { name: `${a.model ?? a.series} と ${b.model ?? b.series}`, path: `/shoes/compare/${pair}` },
  ];
  const checked = [a.checkedAt, b.checkedAt].filter(Boolean).sort().pop();

  return (
    <article className="page pair">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
      </div>
      <header className="page-head wrap">
        <p className="eyebrow">2足をくらべる</p>
        <h1 className="page-title">
          <span className="wb latin">{name(a)}</span>
          <span className="wb">と</span>
          <span className="wb latin">{name(b)}</span>
          <span className="wb">の違い</span>
        </h1>
        <p className="lede">
          どちらも「{shared.map((p) => getPurpose(p).title).join("」「")}」に向くシリーズです。メーカー公式の数値と、向いている人・向いていない人をくらべます。
          {checked ? `（数値は${formatDate(checked)}に公式ページで確認）` : null}
        </p>
      </header>

      <section className="wrap page-section" aria-labelledby="diff">
        <h2 id="diff" className="hub__h2">
          数値で見る違い
        </h2>
        <ul className="pair-notes">
          {notes.map((n) => (
            <li key={n.label}>
              <span className="pair-notes__label">{n.label}</span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
        <div className="table-wrap" tabIndex={0}>
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">項目</th>
                <th scope="col" className="latin">
                  {a.model ?? a.series}
                </th>
                <th scope="col" className="latin">
                  {b.model ?? b.series}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">公式の通常価格</th>
                <td>
                  <FactValue fact={a.specs.priceJpy} format={formatYen} compact />
                </td>
                <td>
                  <FactValue fact={b.specs.priceJpy} format={formatYen} compact />
                </td>
              </tr>
              <tr>
                <th scope="row">重量</th>
                {[a, b].map((s) => (
                  <td key={s.slug}>
                    <FactValue fact={s.specs.weightG} format={(v) => `${v}g${s.specs.weightG.size ? `（${s.specs.weightG.size}）` : ""}`} compact />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">ドロップ</th>
                {[a, b].map((s) => (
                  <td key={s.slug}>
                    <FactValue fact={s.specs.dropMm} format={(v) => `${v}mm`} compact />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">かかと／前足部の厚さ</th>
                {[a, b].map((s) => (
                  <td key={s.slug}>
                    {s.specs.stackHeelMm.value != null && s.specs.stackForefootMm.value != null ? (
                      `${s.specs.stackHeelMm.value}mm／${s.specs.stackForefootMm.value}mm`
                    ) : (
                      <span className="muted">公式に記載なし</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">ひとことで</th>
                <td>{a.catch}</td>
                <td>{b.catch}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="wrap page-section pair-who" aria-labelledby="who">
        <h2 id="who" className="hub__h2">
          どちらが向いているか
        </h2>
        <div className="pair-grid">
          {[a, b].map((s) => (
            <div key={s.slug} className="pair-col">
              <h3 className="latin">{s.model ?? s.series}</h3>
              <p className="pair-col__h">おすすめできる人</p>
              <ul>
                {s.recommendFor.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="pair-col__h">おすすめできない人</p>
              <ul>
                {s.notFor.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="pair-col__h">買わなくてもいい理由</p>
              <ul>
                {s.reasonsNotToBuy.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p>
                <Link href={`/shoes/${s.slug}`} className="m-link">
                  {s.model ?? s.series}をくわしく見る <Arrow />
                </Link>
              </p>
              <ShopLinks links={s.links} subject={name(s)} kind="search" compact />
            </div>
          ))}
        </div>
        <p className="spec-help">
          迷ったら、どちらも試し履きしてから決めてください。<Link href="/tools/shoe-finder">シューズ診断</Link>
          では、走力・用途・予算から合うタイプを探せます。
        </p>
      </section>

      <section className="wrap page-section" aria-labelledby="sources">
        <h2 id="sources" className="hub__h2">
          出典
        </h2>
        <ol className="muted">
          {[...a.sources, ...b.sources].map((s) => (
            <li key={`${s.url}-${s.title}`}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
              {s.checkedAt ? `（${formatDate(s.checkedAt)}確認）` : null}
            </li>
          ))}
        </ol>
        <p className="muted">履き心地の評価は、実際に履くか十分な調査ができるまでつけていません。</p>
      </section>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </article>
  );
}
