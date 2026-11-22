import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FactValue } from "@/components/FactValue";
import { Badge } from "@/components/Badge";
import { Photo } from "@/components/Photo";
import { ShopLinks } from "@/components/ShopLinks";
import { JsonLd } from "@/components/JsonLd";
import { Arrow } from "@/components/Arrow";
import { getBrand, getPurpose } from "@/content/brands";
import { getShoe, publicShoes } from "@/content/shoes";
import { formatDate, formatYen } from "@/lib/format";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import type { Rating, Shoe } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => publicShoes().map((s) => ({ slug: s.slug }));

const fullName = (s: Shoe) => `${getBrand(s.brand).name} ${s.model ?? s.series}`;

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const s = getShoe(slug);
  if (!s || s.status === "draft") return {};
  return buildMetadata({
    title: s.status === "review" ? `${fullName(s)} レビュー` : `${fullName(s)}シリーズの特徴と向いている人`,
    description: `${s.catch}。${s.positioning}`,
    path: `/shoes/${s.slug}`,
    photo: s.photo,
    // スペック未確認の概要ページは検索エンジンに登録しない
    noindex: s.status !== "review",
  });
}

const RATING_LABEL = { cushion: "クッション性", stability: "安定性", response: "反発性", fit: "フィット感" } as const;

function RatingRow({ label, r }: { label: string; r: Rating }) {
  return (
    <div className="rating">
      <dt>{label}</dt>
      <dd>
        {r.score ? (
          <>
            <span className="rating__bar" role="img" aria-label={`5段階中${r.score}`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= r.score! ? "on" : ""} />
              ))}
            </span>
            <span className="rating__basis">{r.basis === "worn" ? "実際に履いた評価" : "調査にもとづく評価"}</span>
          </>
        ) : (
          <span className="rating__none">未評価</span>
        )}
      </dd>
    </div>
  );
}

export default async function ShoePage({ params }: Params) {
  const { slug } = await params;
  const shoe = getShoe(slug);
  if (!shoe || shoe.status === "draft") notFound();
  const brand = getBrand(shoe.brand);
  const similar = shoe.similar.map(getShoe).filter((s): s is Shoe => Boolean(s && s.status !== "draft"));
  const isOutline = shoe.status === "outline";
  const name = shoe.model ?? shoe.series;

  return (
    <article className="shoe">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "ランニングシューズ研究所", path: "/shoes" },
            { name: brand.name, path: `/shoes/brand/${brand.id}` },
            { name, path: `/shoes/${shoe.slug}` },
          ]}
        />
      </div>

      <header className="shoe__head wrap">
        <div className="shoe__title-block">
          <p className="shoe__brand">
            <Link href={`/shoes/brand/${brand.id}`} className="latin">
              {brand.name}
            </Link>
            <span>{brand.nameJa}</span>
          </p>
          <h1 className="shoe__name latin">
            {name}
            {shoe.model ? null : <span className="shoe__series-note">シリーズ</span>}
          </h1>
          <p className="shoe__catch serif">{shoe.catch}</p>
          <p className="shoe__status">
            {isOutline ? (
              <Badge tone="planned">{shoe.model && shoe.checkedAt ? "公式情報の一部を確認" : "シリーズ概要・スペック調査中"}</Badge>
            ) : (
              <Badge tone="verified">レビュー</Badge>
            )}
            <span>更新 {formatDate(shoe.updatedAt)}</span>
          </p>
        </div>
        {/* 商品写真が登録されるまでは、名前を繰り返すだけの代替面は出さない */}
        <Photo id={shoe.photo} ratio="4/3" sizes="(min-width: 960px) 45vw, 100vw" priority className="shoe__photo" />
      </header>

      <div className="wrap shoe__grid">
        <div className="shoe__main">
          {isOutline ? (
            <aside className="state-note">
              <p>
                {shoe.model && shoe.checkedAt
                  ? `メーカー公式サイトで確認できた情報を中心にまとめています（${formatDate(shoe.checkedAt)}確認）。「要確認」の数値は、公式ページで改めて確認してください。実際に履いた感想は、履いてから書きます。`
                  : "このページは、シリーズの位置づけと、向いている人・向いていない人をまとめた段階です。現行モデルの価格・重量・厚さなどは、メーカー公式で確認できしだい掲載します。実際に履いた感想は、履いてから書きます。"}
              </p>
            </aside>
          ) : null}

          <section className="shoe__section" aria-labelledby="about">
            <h2 id="about">どんなシューズ？</h2>
            <p>{shoe.positioning}</p>
            <dl className="usecases">
              <dt>得意な用途</dt>
              <dd>
                <ul role="list">
                  {shoe.bestFor.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </dd>
              <dt>分類</dt>
              <dd>
                <ul role="list" className="inline-links">
                  {shoe.purposes.map((p) => (
                    <li key={p}>
                      <Link href={`/shoes/purpose/${p}`}>{getPurpose(p).title}</Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
          </section>

          <section className="shoe__section" aria-labelledby="specs">
            <h2 id="specs">スペック</h2>
            <dl className="spec-table">
              <div>
                <dt>日本国内の公式価格（税込）</dt>
                <dd>
                  <FactValue fact={shoe.specs.priceJpy} format={formatYen} />
                </dd>
              </div>
              <div>
                <dt>重量</dt>
                <dd>
                  <FactValue
                    fact={shoe.specs.weightG}
                    format={(v) => `${v}g${shoe.specs.weightG.size ? `（${shoe.specs.weightG.size}）` : ""}`}
                  />
                </dd>
              </div>
              <div>
                <dt>ヒールの厚さ</dt>
                <dd>
                  <FactValue fact={shoe.specs.stackHeelMm} format={(v) => `${v}mm`} />
                </dd>
              </div>
              <div>
                <dt>フォアフットの厚さ</dt>
                <dd>
                  <FactValue fact={shoe.specs.stackForefootMm} format={(v) => `${v}mm`} />
                </dd>
              </div>
              <div>
                <dt>ドロップ</dt>
                <dd>
                  <FactValue fact={shoe.specs.dropMm} format={(v) => `${v}mm`} />
                </dd>
              </div>
            </dl>
            <p className="spec-help">
              厚さやドロップの意味は
              <Link href="/articles/shoes-glossary">「シューズの言葉」</Link>
              で解説しています。
            </p>
          </section>

          <section className="shoe__section" aria-labelledby="ratings">
            <h2 id="ratings">履き心地の評価</h2>
            <dl className="ratings">
              {(Object.keys(RATING_LABEL) as (keyof typeof RATING_LABEL)[]).map((k) => (
                <RatingRow key={k} label={RATING_LABEL[k]} r={shoe.ratings[k]} />
              ))}
            </dl>
            <p className="spec-help">実際に履くか、十分な調査ができるまでは評価をつけません。評価には、履いたものか調査にもとづくものかを必ず併記します。</p>
          </section>

          <section className="shoe__section shoe__fit" aria-labelledby="who">
            <h2 id="who" className="sr-only">
              向いている人・向いていない人
            </h2>
            <div className="fit-col fit-col--yes">
              <h3>おすすめできる人</h3>
              <ul>
                {shoe.recommendFor.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="fit-col fit-col--no">
              <h3>おすすめできない人</h3>
              <ul>
                {shoe.notFor.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="shoe__section not-buy" aria-labelledby="not-buy">
            <h2 id="not-buy">買わなくてもいい理由</h2>
            <ul>
              {shoe.reasonsNotToBuy.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          {shoe.cautions.length ? (
            <section className="shoe__section" aria-labelledby="cautions">
              <h2 id="cautions">購入前の注意点</h2>
              <ul>
                {shoe.cautions.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="shoe__section" aria-labelledby="cautions">
              <h2 id="cautions">購入前の注意点</h2>
              <ul>
                <li>同じシリーズでも、世代が変わると履き心地が大きく変わることがあります。</li>
                <li>サイズ感はメーカーやモデルで異なります。可能なら試し履きをしてから選んでください。</li>
              </ul>
            </section>
          )}

          <section className="shoe__section two-voices" aria-labelledby="voices">
            <h2 id="voices">履いた感想と、調べたこと</h2>
            <div className="voice voice--worn">
              <p className="voice__label">運営者が実際に履いた感想</p>
              {shoe.worn ? (
                <>
                  <p>{shoe.worn.summary}</p>
                  <p className="voice__meta">
                    {shoe.worn.period ? `期間：${shoe.worn.period}　` : null}
                    {shoe.worn.distanceKm ? `走行距離：約${shoe.worn.distanceKm}km　` : null}
                    {shoe.worn.size ? `サイズ：${shoe.worn.size}` : null}
                  </p>
                </>
              ) : (
                <p className="voice__empty">まだ履いていません。履いたら、ここに書きます。</p>
              )}
            </div>
            <div className="voice voice--research">
              <p className="voice__label">第三者のレビュー・公式情報を調べたこと</p>
              {shoe.research ? <p>{shoe.research.summary}</p> : <p className="voice__empty">調査中です。</p>}
            </div>
          </section>

          {similar.length ? (
            <section className="shoe__section" aria-labelledby="compare">
              <h2 id="compare">似たシューズとくらべる</h2>
              <div className="table-wrap" tabIndex={0}>
                <table className="compare">
                  <thead>
                    <tr>
                      <th scope="col">シューズ</th>
                      <th scope="col">ひとことで</th>
                      <th scope="col">価格</th>
                      <th scope="col">重量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[shoe, ...similar].map((s) => (
                      <tr key={s.slug} className={s.slug === shoe.slug ? "is-current" : undefined}>
                        <th scope="row">
                          {s.slug === shoe.slug ? (
                            <span className="latin">{fullName(s)}</span>
                          ) : (
                            <Link href={`/shoes/${s.slug}`} className="latin">
                              {fullName(s)}
                            </Link>
                          )}
                        </th>
                        <td>{s.catch}</td>
                        <td>{s.specs.priceJpy.value ? formatYen(s.specs.priceJpy.value) : <span className="muted">未確認</span>}</td>
                        <td>{s.specs.weightG.value ? `${s.specs.weightG.value}g` : <span className="muted">未確認</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="shoe__section" aria-labelledby="sources">
            <h2 id="sources">情報の出典と確認日</h2>
            {shoe.sources.length ? (
              <ol>
                {shoe.sources.map((s) => (
                  <li key={s.title}>
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
            ) : (
              <p className="muted">
                出典つきで確認した情報はまだありません。シリーズの位置づけは、各メーカーの製品分類をもとに編集部が整理したものです。最新の情報は
                <a href={brand.officialUrl} target="_blank" rel="noopener noreferrer">
                  {brand.nameJa}の公式サイト
                </a>
                でご確認ください。
              </p>
            )}
            <p className="muted">最終確認日：{shoe.checkedAt ? formatDate(shoe.checkedAt) : "未確認"}</p>
          </section>
        </div>

        <aside className="shoe__aside">
          <div className="shoe__aside-inner">
            <ShopLinks links={shoe.links} subject={`${brand.name} ${shoe.series}`} kind="search" />
            <p className="aside-note">
              最新モデルにこだわらなければ、一つ前の世代が安くなっていることもあります。
              <Link href="/tools/shoe-finder">
                自分に合うタイプを診断する <Arrow />
              </Link>
            </p>
          </div>
        </aside>
      </div>

      {shoe.status === "review" ? (
        <JsonLd
          data={articleJsonLd({
            title: `${fullName(shoe)} レビュー`,
            description: shoe.catch,
            path: `/shoes/${shoe.slug}`,
            publishedAt: shoe.updatedAt,
            updatedAt: shoe.updatedAt,
            photo: shoe.photo,
          })}
        />
      ) : null}
    </article>
  );
}
