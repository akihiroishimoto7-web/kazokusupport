import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { Arrow } from "@/components/Arrow";
import { ShopLinks } from "@/components/ShopLinks";
import { getBrand } from "@/content/brands";
import { getShoe } from "@/content/shoes";
import { amebloUrl, social } from "@/content/social";
import { formatDate, formatYen } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { allModels, discountRate } from "@/lib/shoe-db";
import { crossNotes, curatedPairs, generationNotes, generationPairs, modelPairSlug } from "@/lib/model-pairs";
import { SOURCE_TYPE_LABEL } from "@/lib/trusted-sources";
import type { ShoeModel } from "@/lib/shoe-db-types";
import type { BrandId } from "@/lib/types";

type Params = { params: Promise<{ pair: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => [
  ...generationPairs(allModels()).map(({ older, newer }) => ({ pair: modelPairSlug(newer, older) })),
  ...curatedPairs(allModels()).map((c) => ({ pair: c.slug })),
];

const loadCross = (pair: string) => curatedPairs(allModels()).find((c) => c.slug === pair) ?? null;

function load(pair: string) {
  return generationPairs(allModels()).find(({ older, newer }) => modelPairSlug(newer, older) === pair) ?? null;
}

const brandName = (m: ShoeModel) => getBrand(m.brand as BrandId).name;

export async function generateMetadata({ params }: Params) {
  const { pair } = await params;
  const x = loadCross(pair);
  if (x) {
    return buildMetadata({
      title: `${x.a.name}と${x.b.name}の違い`,
      description: `${brandName(x.a)} ${x.a.name}と${brandName(x.b)} ${x.b.name}を、価格・重量・ドロップ・向いている人でくらべます。数値には、メーカー公式か販売店の記載かを明記しています。`,
      path: `/shoes/models/${pair}`,
      type: "article",
      publishedAt: x.a.checkedAt > x.b.checkedAt ? x.a.checkedAt : x.b.checkedAt,
      updatedAt: x.a.checkedAt > x.b.checkedAt ? x.a.checkedAt : x.b.checkedAt,
    });
  }
  const p = load(pair);
  if (!p) return {};
  const { older, newer } = p;
  return buildMetadata({
    title: `${older.name}と${newer.name}の違い`,
    description: `${brandName(newer)} ${older.name}と${newer.name}は何が変わったのか。メーカー公式資料の記載（原文）と、確認できた価格・重量・発売日だけでくらべます。前のモデルで十分な人も書いています。`,
    path: `/shoes/models/${pair}`,
    type: "article",
    publishedAt: newer.checkedAt,
    updatedAt: newer.checkedAt > older.checkedAt ? newer.checkedAt : older.checkedAt,
  });
}

/** 値の出典の種類（公式・販売店・メディア） */
function srcLabel(m: ShoeModel): string {
  const types = new Set(Object.values(m.specs).map((v) => v.sourceType ?? "official"));
  return [...types].map((t) => SOURCE_TYPE_LABEL[t]).join("・");
}

const rows: { label: string; get: (m: ShoeModel) => string | null }[] = [
  { label: "定価（税込）", get: (m) => (m.officialPrice?.regularPriceJpy ? formatYen(m.officialPrice.regularPriceJpy) : null) },
  {
    label: "公式ストアの価格",
    get: (m) =>
      m.officialPrice && m.officialPrice.kind !== "msrp"
        ? `${formatYen(m.officialPrice.priceJpy)}${m.officialPrice.onSale ? "（セール）" : ""}・${formatDate(m.officialPrice.checkedAt)}確認`
        : null,
  },
  { label: "重量", get: (m) => (m.specs.weightG ? `${m.specs.weightG.value}g${m.specs.weightG.size ? `（${m.specs.weightG.size}）` : ""}` : null) },
  { label: "ドロップ", get: (m) => (m.specs.dropMm ? `${m.specs.dropMm.value}mm` : null) },
  {
    label: "かかと／前足部の厚さ",
    get: (m) => (m.specs.stackHeelMm && m.specs.stackForefootMm ? `${m.specs.stackHeelMm.value}mm／${m.specs.stackForefootMm.value}mm` : null),
  },
  { label: "日本での発売", get: (m) => m.releaseJp?.value ?? null },
  { label: "品番", get: (m) => m.styleCode ?? null },
];

function Cell({ v }: { v: string | null }) {
  return v ? <>{v}</> : <span className="muted">未確認</span>;
}

export default async function ModelPairPage({ params }: Params) {
  const { pair } = await params;
  const x = loadCross(pair);
  if (x) return <CrossPage pair={pair} a={x.a} b={x.b} why={x.why} />;
  const p = load(pair);
  if (!p) notFound();
  const { older, newer } = p;
  const series = getShoe(newer.series);
  if (!series) notFound();
  const b = brandName(newer);
  const notes = generationNotes(older, newer);
  const off = discountRate(older);
  const updated = newer.checkedAt > older.checkedAt ? newer.checkedAt : older.checkedAt;
  const crumbs = [
    { name: "ランニングシューズ研究所", path: "/shoes" },
    { name: `${b} ${series.series}`, path: `/shoes/${series.slug}` },
    { name: `${older.name} と ${newer.name}`, path: `/shoes/models/${pair}` },
  ];
  const sources = [...new Map([older, newer].flatMap((m) => [
    [m.officialUrl, { title: m.pageTitle, url: m.officialUrl, checkedAt: m.checkedAt }],
    ...(m.officialPrice?.sourceUrl ? [[m.officialPrice.sourceUrl, { title: m.officialPrice.sourceTitle ?? m.pageTitle, url: m.officialPrice.sourceUrl, checkedAt: m.officialPrice.checkedAt }]] : []),
    ...(m.changes ?? []).map((c) => [c.sourceUrl, { title: c.sourceTitle, url: c.sourceUrl, checkedAt: c.checkedAt }]),
  ] as [string, { title: string; url: string; checkedAt: string }][])).values()];


  return (
    <article className="page pair">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
      </div>
      <header className="page-head wrap">
        <p className="eyebrow">世代をくらべる</p>
        <h1 className="page-title">
          <span className="wb latin">{older.name}</span>
          <span className="wb">と</span>
          <span className="wb latin">{newer.name}</span>
          <span className="wb">の違い</span>
        </h1>
        <p className="lede">
          {b} {series.series}の、一つ前のモデルと現行モデル。何が変わったのかを、メーカー公式資料の言葉のまま並べ、確認できた数字だけでくらべます。（{formatDate(updated)}確認）
        </p>
      </header>

      <section className="wrap page-section" aria-labelledby="summary">
        <h2 id="summary" className="hub__h2">
          まず、数字の違い
        </h2>
        <ul className="pair-notes">
          {notes.map((n) => (
            <li key={n}>
              <span className="pair-notes__label">比較</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <div className="table-wrap" tabIndex={0}>
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">項目</th>
                <th scope="col" className="latin">
                  {older.name}
                </th>
                <th scope="col" className="latin">
                  {newer.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td>
                    <Cell v={r.get(older)} />
                  </td>
                  <td>
                    <Cell v={r.get(newer)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="spec-help">「未確認」は、メーカー公式の資料で確認できなかった項目です。推測では埋めていません。</p>
      </section>

      <section className="wrap page-section" aria-labelledby="changes">
        <h2 id="changes" className="hub__h2">
          {newer.name}で変わったこと（公式の記載）
        </h2>
        {newer.changes?.length ? (
          <ul className="quote-list">
            {newer.changes.map((c) => (
              <li key={c.text}>
                <blockquote>{c.text}</blockquote>
                <span className="muted">
                  出典：
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {c.sourceTitle}
                  </a>
                  （{formatDate(c.checkedAt)}確認）
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">前のモデルとの違いについての公式の記載は、まだ確認できていません。</p>
        )}
        {older.changes?.length ? (
          <>
            <p className="pair-col__h">参考：{older.name}が出たときの公式の記載</p>
            <ul className="quote-list quote-list--small">
              {older.changes.map((c) => (
                <li key={c.text}>
                  <blockquote>{c.text}</blockquote>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="wrap page-section" aria-labelledby="choose">
        <h2 id="choose" className="hub__h2">
          どちらを選ぶか
        </h2>
        <div className="pair-grid">
          <div className="pair-col">
            <h3 className="latin">{older.name}で十分な人</h3>
            <ul>
              <li>いまの{series.series}に不満がなく、同じ履き心地を続けたい人</li>
              {off ? <li>価格を抑えたい人（公式ストアで{off}%引き、{formatDate(older.officialPrice!.checkedAt)}確認）</li> : <li>価格が下がっていれば、それを優先したい人</li>}
              <li>{series.reasonsNotToBuy[0]}</li>
            </ul>
            <ShopLinks
              links={{ rakuten: `${b} ${older.name}`, amazon: `${b} ${older.name}`, yahoo: `${b} ${older.name}` }}
              subject={`${b} ${older.name}`}
              kind="search"
              compact
            />
          </div>
          <div className="pair-col">
            <h3 className="latin">{newer.name}を選ぶ理由がある人</h3>
            <ul>
              <li>上の「変わったこと」に、自分の困りごとに当てはまる項目がある人</li>
              {series.recommendFor.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <ShopLinks links={series.links} subject={`${b} ${newer.name}`} kind="search" compact />
          </div>
        </div>
        <p className="spec-help">
          新しいモデルが、自分にとって良いモデルとは限りません。最後は試し履きで決めてください。
          <Link href="/tools/shoe-finder">シューズ診断</Link>では、走力・用途・予算から合うタイプを探せます。
        </p>
        {amebloUrl() ? (
          <p className="spec-help">
            セール情報や購入先のまとめは、運営者のアメブロ「
            <a href={amebloUrl()!} target="_blank" rel="noopener noreferrer">
              {social.ameblo.title}
            </a>
            」に書いています（広告を含みます）。
          </p>
        ) : null}
        <p>
          <Link href={`/shoes/${series.slug}`} className="m-link">
            {b} {series.series}のページへ <Arrow />
          </Link>
        </p>
      </section>

      <section className="wrap page-section" aria-labelledby="sources">
        <h2 id="sources" className="hub__h2">
          出典
        </h2>
        <ol className="muted">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
              （{formatDate(s.checkedAt)}確認）
            </li>
          ))}
        </ol>
        <p className="muted">運営者はどちらもまだ履いていません。履き心地の評価はしていません。</p>
      </section>
      <JsonLd
        data={[
          articleJsonLd({
            title: `${older.name}と${newer.name}の違い`,
            description: `${b} ${older.name}と${newer.name}の違いを公式資料でくらべる`,
            path: `/shoes/models/${pair}`,
            publishedAt: updated,
            updatedAt: updated,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </article>
  );
}

function CrossPage({ pair, a, b, why }: { pair: string; a: ShoeModel; b: ShoeModel; why: string }) {
  const sa = getShoe(a.series);
  const sb = getShoe(b.series);
  if (!sa || !sb) notFound();
  const updated = a.checkedAt > b.checkedAt ? a.checkedAt : b.checkedAt;
  const notes = crossNotes(a, b);
  const crumbs = [
    { name: "ランニングシューズ研究所", path: "/shoes" },
    { name: "くらべる", path: "/shoes/compare" },
    { name: `${a.name} と ${b.name}`, path: `/shoes/models/${pair}` },
  ];
  const sources = [
    ...new Map(
      [a, b].flatMap((m) =>
        [
          [m.officialUrl, m.pageTitle, m.checkedAt],
          ...Object.values(m.specs).filter((v) => v.sourceUrl).map((v) => [v.sourceUrl!, v.sourceTitle ?? v.sourceUrl!, v.checkedAt]),
          ...(m.officialPrice?.sourceUrl ? [[m.officialPrice.sourceUrl, m.officialPrice.sourceTitle ?? m.officialPrice.sourceUrl, m.officialPrice.checkedAt]] : []),
        ].map(([url, title, d]) => [url as string, { url: url as string, title: title as string, checkedAt: (d ?? m.checkedAt) as string }] as const),
      ),
    ).values(),
  ];
  return (
    <article className="page pair">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
      </div>
      <header className="page-head wrap">
        <p className="eyebrow">2足をくらべる</p>
        <h1 className="page-title">
          <span className="wb latin">{brandName(a)} {a.name}</span>
          <span className="wb">と</span>
          <span className="wb latin">{brandName(b)} {b.name}</span>
          <span className="wb">の違い</span>
        </h1>
        <p className="lede">
          {why}。確認できた数字と、それぞれに向いている人・向いていない人でくらべます。（{formatDate(updated)}確認）
        </p>
        {[a, b].filter((m) => m.lifecycle === "previous").map((m) => (
          <p key={m.id} className="spec-help">
            {m.name}は、後継モデルがすでに発売されている「前の世代」のモデルです。在庫や価格は店舗によって異なります。
          </p>
        ))}
      </header>

      <section className="wrap page-section" aria-labelledby="summary">
        <h2 id="summary" className="hub__h2">
          数字の違い
        </h2>
        <ul className="pair-notes">
          {notes.map((n) => (
            <li key={n}>
              <span className="pair-notes__label">比較</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <div className="table-wrap" tabIndex={0}>
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">項目</th>
                <th scope="col" className="latin">
                  {a.name}
                </th>
                <th scope="col" className="latin">
                  {b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td>
                    <Cell v={r.get(a)} />
                  </td>
                  <td>
                    <Cell v={r.get(b)} />
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row">数値の出典</th>
                <td>{srcLabel(a)}</td>
                <td>{srcLabel(b)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="spec-help">
          「販売店の記載」は、運営者が信頼できると判断した販売店（ステップスポーツ・アルペン・ヒマラヤ）とランニングメディア（ラントリップ）の商品ページに書かれている値です。「未確認」は、どこでも確認できなかった項目です。
        </p>
      </section>

      <section className="wrap page-section" aria-labelledby="choose">
        <h2 id="choose" className="hub__h2">
          どちらが向いているか
        </h2>
        <div className="pair-grid">
          {[
            [a, sa],
            [b, sb],
          ].map(([m, s]) => {
            const model = m as ShoeModel;
            const series = s as NonNullable<typeof sa>;
            return (
              <div key={model.id} className="pair-col">
                <h3 className="latin">
                  {brandName(model)} {model.name}
                </h3>
                <p className="pair-col__h">おすすめできる人</p>
                <ul>
                  {series.recommendFor.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="pair-col__h">おすすめできない人</p>
                <ul>
                  {series.notFor.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="pair-col__h">買わなくてもいい理由</p>
                <ul>
                  {series.reasonsNotToBuy.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {model.changes?.length ? (
                  <>
                    <p className="pair-col__h">前のモデルから変わったこと（{SOURCE_TYPE_LABEL[model.changes[0]!.sourceType ?? "official"]}）</p>
                    <ul className="quote-list quote-list--small">
                      {model.changes.slice(0, 2).map((c) => (
                        <li key={c.text}>
                          <blockquote>{c.text}</blockquote>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p>
                  <Link href={`/shoes/${series.slug}`} className="m-link">
                    {series.series}のページへ <Arrow />
                  </Link>
                </p>
                <ShopLinks links={series.links} subject={`${brandName(model)} ${model.name}`} kind="search" compact />
              </div>
            );
          })}
        </div>
        <p className="spec-help">
          迷ったら、どちらも試し履きしてから決めてください。<Link href="/tools/shoe-finder">シューズ診断</Link>
          では、走力・用途・予算から合うタイプを探せます。
        </p>
        {amebloUrl() ? (
          <p className="spec-help">
            セール情報や購入先のまとめは、運営者のアメブロ「
            <a href={amebloUrl()!} target="_blank" rel="noopener noreferrer">
              {social.ameblo.title}
            </a>
            」に書いています（広告を含みます）。
          </p>
        ) : null}
      </section>

      <section className="wrap page-section" aria-labelledby="sources">
        <h2 id="sources" className="hub__h2">
          出典
        </h2>
        <ol className="muted">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
              （{formatDate(s.checkedAt)}確認）
            </li>
          ))}
        </ol>
        <p className="muted">運営者はどちらもまだ履いていません。履き心地の評価はしていません。</p>
      </section>
      <JsonLd
        data={[
          articleJsonLd({
            title: `${a.name}と${b.name}の違い`,
            description: why,
            path: `/shoes/models/${pair}`,
            publishedAt: updated,
            updatedAt: updated,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </article>
  );
}
