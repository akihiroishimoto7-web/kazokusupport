import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShopLinks } from "@/components/ShopLinks";
import { Arrow } from "@/components/Arrow";
import { gearCategories, gearScenes, getGear } from "@/content/gear";
import { getArticle } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => gearCategories.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const g = getGear(slug);
  if (!g) return {};
  return buildMetadata({ title: `${g.name}の選び方`, description: `${g.catch}。${g.whatFor}必要な場面と、なくてもいい場面、選ぶときのポイントをまとめています。`, path: `/gear/${g.slug}` });
}

export default async function GearCategoryPage({ params }: Params) {
  const { slug } = await params;
  const g = getGear(slug);
  if (!g) notFound();
  const scenes = gearScenes.filter((s) => s.picks.some((p) => p.gear === g.slug));
  const articles = g.relatedArticles.map((s) => getArticle(s)).filter((a) => Boolean(a));

  return (
    <article className="hub gear-page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "補給と道具", path: "/gear" },
            { name: g.name, path: `/gear/${g.slug}` },
          ]}
        />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">{g.catch}</p>
          <h1 className="hub__title">{g.name}</h1>
          <p className="hub__intro">{g.whatFor}</p>
        </div>
      </header>

      <div className="wrap gear-page__grid">
        <div>
          <section className="hub__section need-pair" aria-label="必要かどうか">
            <div className="need-pair__col">
              <h2>あると助かるとき</h2>
              <ul>
                {g.needWhen.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="need-pair__col need-pair__col--skip">
              <h2>まだ買わなくていいとき</h2>
              <ul>
                {g.skipWhen.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="hub__section" aria-labelledby="points">
            <h2 className="hub__h2" id="points">
              選ぶときに見るところ
            </h2>
            <ol className="point-list">
              {g.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            {g.cautions.map((c) => (
              <aside key={c} className="callout callout--caution">
                <p className="callout__label">
                  <span>注意</span>
                </p>
                <div className="callout__body">
                  <p>{c}</p>
                </div>
              </aside>
            ))}
          </section>

          {scenes.length ? (
            <section className="hub__section" aria-labelledby="scenes">
              <h2 className="hub__h2" id="scenes">
                こんな場面で
              </h2>
              <ul role="list" className="index-list">
                {scenes.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/gear/scene/${s.slug}`} className="index-item">
                      <span className="index-item__body">
                        <span className="index-item__title">{s.title}</span>
                        <span className="index-item__desc">{s.picks.find((p) => p.gear === g.slug)?.why}</span>
                      </span>
                      <Arrow className="index-item__arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {articles.length ? (
            <section className="hub__section" aria-labelledby="read">
              <h2 className="hub__h2" id="read">
                関連する記事
              </h2>
              <ul role="list" className="index-list">
                {articles.map((a) => (
                  <li key={a!.slug}>
                    <Link href={`/articles/${a!.slug}`} className="index-item">
                      <span className="index-item__body">
                        <span className="index-item__title">{a!.title}</span>
                      </span>
                      <Arrow className="index-item__arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="gear-page__aside">
          <ShopLinks links={g.links} subject={g.links.rakuten ?? g.name} kind="search" />
        </aside>
      </div>
    </article>
  );
}
