import Link from "next/link";
import type { ReactNode } from "react";
import type { CategoryId } from "@/lib/types";
import { categories } from "@/content/categories";
import { getArticle, getArticlesByCategory } from "@/lib/articles";
import { Breadcrumbs } from "./Breadcrumbs";
import { Photo } from "./Photo";
import { Arrow } from "./Arrow";
import { ArticleIndex } from "./ArticleList";
import { pad2 } from "@/lib/format";

/** カテゴリーの入口ページ。テーマの一覧（公開済みはリンク、未公開は「準備中」）と記事一覧 */
export function CategoryHub({
  id,
  topicsTitle = "このカテゴリーで扱うこと",
  ordered = false,
  children,
}: {
  id: CategoryId;
  topicsTitle?: string;
  ordered?: boolean;
  children?: ReactNode;
}) {
  const cat = categories[id];
  const articles = getArticlesByCategory(id);
  const usedInTopics = new Set(cat.topics.map((t) => t.article).filter(Boolean));
  const others = articles.filter((a) => !usedInTopics.has(a.slug));

  return (
    <div className="hub">
      <div className="wrap">
        <Breadcrumbs items={[{ name: cat.name, path: cat.path }]} />
      </div>
      <header className={`hub__head wrap ${cat.photo ? "hub__head--photo" : ""}`}>
        <div className="hub__title-block">
          <p className="hub__catch">{cat.catch}</p>
          <h1 className="hub__title">{cat.name}</h1>
          <p className="hub__intro">{cat.intro}</p>
        </div>
        {cat.photo ? <Photo id={cat.photo} ratio="4/3" sizes="(min-width: 960px) 45vw, 100vw" priority className="hub__photo" /> : null}
      </header>

      {cat.topics.length ? (
        <section className="wrap hub__section" aria-labelledby="topics">
          <h2 className="hub__h2" id="topics">
            {topicsTitle}
          </h2>
          <ol role="list" className="topic-list">
            {cat.topics.map((t, i) => {
              const a = t.article ? getArticle(t.article) : undefined;
              const no = <span className="topic__no num">{pad2(i + 1)}</span>;
              return (
                <li key={`${t.title}-${i}`}>
                  {a ? (
                    <Link href={`/articles/${a.slug}`} className="topic">
                      {ordered ? no : null}
                      <span className="topic__body">
                        <span className="topic__title">{t.title}</span>
                        {t.note ? <span className="topic__note">{t.note}</span> : <span className="topic__note">{a.title}</span>}
                      </span>
                      <Arrow className="topic__arrow" />
                    </Link>
                  ) : (
                    <div className="topic topic--soon">
                      {ordered ? no : null}
                      <span className="topic__body">
                        <span className="topic__title">{t.title}</span>
                        {t.note ? <span className="topic__note">{t.note}</span> : null}
                      </span>
                      <span className="topic__soon">準備中</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {children}

      {others.length ? (
        <section className="wrap hub__section" aria-labelledby="more">
          <h2 className="hub__h2" id="more">
            {cat.topics.length ? "そのほかの記事" : "記事"}
          </h2>
          <ArticleIndex articles={others} showCategory={false} />
        </section>
      ) : null}
    </div>
  );
}
