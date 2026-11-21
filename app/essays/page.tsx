import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { categories } from "@/content/categories";
import { getArticlesByCategory } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

const cat = categories.essay;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path, photo: cat.photo });

export default function EssaysPage() {
  const essays = getArticlesByCategory("essay");
  return (
    <div className="essays">
      <div className="wrap">
        <Breadcrumbs items={[{ name: cat.name, path: cat.path }]} />
      </div>
      <header className="essays__head wrap">
        <h1 className="essays__title">{cat.name}</h1>
        <p className="essays__intro">{cat.intro}</p>
      </header>
      <ol role="list" className="essays__list wrap">
        {essays.map((e) => (
          <li key={e.slug}>
            <Link href={`/articles/${e.slug}`} className="essay-entry">
              {e.hero ? <Photo id={e.hero} ratio="3/2" sizes="(min-width: 960px) 40vw, 100vw" caption={false} className="essay-entry__photo" /> : null}
              <span className="essay-entry__text">
                <span className="essay-entry__title">{e.title}</span>
                {e.lede ? <span className="essay-entry__lede">{e.lede}</span> : null}
                <time className="essay-entry__date" dateTime={e.publishedAt}>
                  {formatDate(e.publishedAt)}
                </time>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {!essays.length ? <p className="wrap">エッセイは準備中です。</p> : null}
    </div>
  );
}
