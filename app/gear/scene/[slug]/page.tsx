import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Arrow } from "@/components/Arrow";
import { gearScenes, getGear, getScene } from "@/content/gear";
import { getArticle } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => gearScenes.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const s = getScene(slug);
  if (!s) return {};
  return buildMetadata({ title: `${s.title}ときの道具`, description: `${s.summary}おすすめの道具と、買わなくてもいいものをまとめています。`, path: `/gear/scene/${s.slug}` });
}

export default async function ScenePage({ params }: Params) {
  const { slug } = await params;
  const s = getScene(slug);
  if (!s) notFound();
  const articles = s.relatedArticles.map((x) => getArticle(x)).filter((a) => Boolean(a));
  return (
    <article className="hub scene-page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "補給と道具", path: "/gear" },
            { name: s.title, path: `/gear/scene/${s.slug}` },
          ]}
        />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">こんなときは</p>
          <h1 className="hub__title">「{s.title}」</h1>
          <p className="hub__intro">{s.summary}</p>
        </div>
      </header>

      <section className="wrap hub__section" aria-labelledby="picks">
        <h2 className="hub__h2" id="picks">
          考えたい道具
        </h2>
        <ol role="list" className="pick-list">
          {s.picks.map((p, i) => {
            const g = getGear(p.gear);
            if (!g) return null;
            return (
              <li key={p.gear}>
                <Link href={`/gear/${g.slug}`} className="pick">
                  <span className="pick__no num">{pad2(i + 1)}</span>
                  <span className="pick__body">
                    <span className="pick__name">{g.name}</span>
                    <span className="pick__why">{p.why}</span>
                    <span className="pick__more">
                      選び方を見る <Arrow />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {s.skip ? (
        <section className="wrap hub__section">
          <div className="not-buy">
            <h2>買わなくていいもの</h2>
            <p>{s.skip}</p>
          </div>
        </section>
      ) : null}

      <section className="wrap hub__section" aria-labelledby="tips">
        <h2 className="hub__h2" id="tips">
          ちょっとしたコツ
        </h2>
        <ul className="point-list point-list--plain">
          {s.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      {articles.length ? (
        <section className="wrap hub__section" aria-labelledby="read">
          <h2 className="hub__h2" id="read">
            あわせて読みたい
          </h2>
          <ul role="list" className="index-list">
            {articles.map((a) => (
              <li key={a!.slug}>
                <Link href={`/articles/${a!.slug}`} className="index-item">
                  <span className="index-item__body">
                    <span className="index-item__title">{a!.title}</span>
                    <span className="index-item__desc">{a!.description}</span>
                  </span>
                  <Arrow className="index-item__arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
