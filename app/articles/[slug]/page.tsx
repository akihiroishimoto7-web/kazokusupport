import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { Prose } from "@/components/Prose";
import { JsonLd } from "@/components/JsonLd";
import { ArticleIndex } from "@/components/ArticleList";
import { Arrow } from "@/components/Arrow";
import { categories } from "@/content/categories";
import { author } from "@/content/site";
import { getArticle, getArticles, getSeries, relatedArticles } from "@/lib/articles";
import { renderArticleBody } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { affiliateActive } from "@/lib/shop";
import { articleJsonLd, buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return buildMetadata({
    title: a.title,
    description: a.description,
    path: `/articles/${a.slug}`,
    photo: a.hero,
    type: "article",
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    noindex: a.status !== "published",
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const cat = categories[article.category];
  const { segments, toc } = renderArticleBody(article.body);
  const isEssay = article.category === "essay";
  const series = article.series ? getSeries(article.series.id) : [];
  const idx = series.findIndex((s) => s.slug === article.slug);
  const prev = idx > 0 ? series[idx - 1] : undefined;
  const next = idx >= 0 && idx < series.length - 1 ? series[idx + 1] : undefined;
  const related = relatedArticles(article, 3);
  const hasShopEmbeds = segments.some((s) => s.type === "embed" && (s.kind === "shoe" || s.kind === "gear"));

  return (
    <article className={`article ${isEssay ? "article--essay" : ""}`}>
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: cat.name, path: cat.path },
            { name: article.title, path: `/articles/${article.slug}` },
          ]}
        />
      </div>

      <header className="article__head wrap">
        <p className="article__cat">
          <Link href={cat.path}>{cat.name}</Link>
          {article.series && idx >= 0 ? <span className="article__step num">　{idx + 1} / {series.length}</span> : null}
        </p>
        <h1 className="article__title">{article.title}</h1>
        {article.lede ? <p className="article__lede">{article.lede}</p> : null}
        <p className="article__meta">
          <span>
            更新 <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
          </span>
          <span>約{article.readingMinutes}分で読めます</span>
          <span>
            文：<Link href="/about">{author.displayName ?? "RUN LIFE HIROSHIMA"}（{author.role}）</Link>
          </span>
          {article.status === "draft" ? <span className="badge badge--planned">下書き</span> : null}
        </p>
        {affiliateActive && hasShopEmbeds ? (
          <p className="pr-notice">この記事には広告（アフィリエイトリンク）を含むページへの案内があります。</p>
        ) : null}
      </header>

      {article.hero ? (
        <div className={isEssay ? "article__hero article__hero--bleed" : "article__hero wrap"}>
          <Photo id={article.hero} ratio={isEssay ? "3/2" : "3/2"} sizes="(min-width: 960px) 960px, 100vw" priority />
        </div>
      ) : null}

      <div className="article__layout wrap">
        {!isEssay && toc.length >= 3 ? (
          <nav className="toc" aria-labelledby="toc-title">
            <p className="toc__title" id="toc-title">
              この記事の内容
            </p>
            <ol role="list">
              {toc.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>
                    <span className="num">{String(i + 1).padStart(2, "0")}</span>
                    {t.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="article__body">
          <Prose segments={segments} variant={isEssay ? "essay" : "article"} />

          {article.medical ? (
            <aside className="medical-note">
              <p className="medical-note__title">からだに関する記事について</p>
              <p>
                この記事は一般的な情報と、市民ランナーとしての経験をもとに書いています。医師による診断や治療の代わりにはなりません。痛みやしびれ、腫れが続く場合、また持病のある方は、医療機関に相談してください。
              </p>
            </aside>
          ) : null}

          {article.sources.length ? (
            <section className="sources" aria-labelledby="sources-title">
              <h2 className="sources__title" id="sources-title">
                参考にした情報
              </h2>
              <ol>
                {article.sources.map((s) => (
                  <li key={s.title}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                    {s.publisher ? `（${s.publisher}）` : null}
                    {s.checkedAt ? <span className="sources__date">{formatDate(s.checkedAt)}確認</span> : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {isEssay ? <p className="essay-end" aria-hidden="true" /> : null}
        </div>
      </div>

      {prev || next ? (
        <nav className="series-nav wrap" aria-label="シリーズの前後の記事">
          {prev ? (
            <Link href={`/articles/${prev.slug}`} className="series-nav__item series-nav__item--prev">
              <span className="series-nav__dir">前へ</span>
              <span className="series-nav__title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/articles/${next.slug}`} className="series-nav__item series-nav__item--next">
              <span className="series-nav__dir">
                次に読む <Arrow />
              </span>
              <span className="series-nav__title">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      {article.category === "shoes" || article.category === "start" || article.category === "race" ? (
        <aside className="wrap article-tools" aria-label="シューズ選びの道具">
          <p className="article-tools__head">シューズ選びに迷ったら</p>
          <ul role="list">
            <li>
              <Link href="/tools/shoe-finder">シューズ診断（走力・用途・予算から） <Arrow /></Link>
            </li>
            <li>
              <Link href="/shoes/compare">2〜3足を並べてくらべる <Arrow /></Link>
            </li>
            <li>
              <Link href="/shoes">ランニングシューズ研究所 <Arrow /></Link>
            </li>
          </ul>
        </aside>
      ) : null}

      {related.length ? (
        <aside className="related wrap" aria-labelledby="related-title">
          <h2 className="related__title" id="related-title">
            あわせて読みたい
          </h2>
          <ArticleIndex articles={related} />
        </aside>
      ) : null}

      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.description,
          path: `/articles/${article.slug}`,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          photo: article.hero,
        })}
      />
    </article>
  );
}
