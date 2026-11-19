import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { categories } from "@/content/categories";
import { Arrow } from "./Arrow";
import { Photo } from "./Photo";
import { pad2 } from "@/lib/format";

/** 雑誌の目次のような、罫線で区切った記事一覧 */
export function ArticleIndex({
  articles,
  numbered = false,
  showCategory = true,
}: {
  articles: ArticleMeta[];
  numbered?: boolean;
  showCategory?: boolean;
}) {
  if (!articles.length) return null;
  return (
    <ol role="list" className="index-list">
      {articles.map((a, i) => (
        <li key={a.slug}>
          <Link href={`/articles/${a.slug}`} className="index-item">
            {numbered ? <span className="index-item__no num">{pad2(i + 1)}</span> : null}
            <span className="index-item__body">
              {showCategory ? <span className="index-item__cat">{categories[a.category].name}</span> : null}
              <span className="index-item__title">{a.title}</span>
              <span className="index-item__desc">{a.description}</span>
            </span>
            <Arrow className="index-item__arrow" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** 大きな写真とともに見せる特集記事 */
export function LeadStory({ article, priority }: { article: ArticleMeta; priority?: boolean }) {
  return (
    <article className="lead-story">
      <Link href={`/articles/${article.slug}`} className="lead-story__link">
        <Photo
          id={article.hero}
          ratio="3/2"
          sizes="(min-width: 960px) 60vw, 100vw"
          priority={priority}
          caption={false}
          fallback={{ title: article.title }}
          className="lead-story__photo"
        />
        <div className="lead-story__text">
          <p className="lead-story__cat">{categories[article.category].name}</p>
          <h3 className="lead-story__title">{article.title}</h3>
          <p className="lead-story__desc">{article.description}</p>
          <p className="lead-story__more">
            読む <Arrow />
          </p>
        </div>
      </Link>
    </article>
  );
}
