import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { Badge } from "@/components/Badge";
import { Arrow } from "@/components/Arrow";
import { ArticleIndex } from "@/components/ArticleList";
import { categories } from "@/content/categories";
import { publicCourses } from "@/content/courses";
import { getArticlesByCategory } from "@/lib/articles";
import { buildMetadata } from "@/lib/seo";

const cat = categories.hiroshima;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path, photo: cat.photo });

export default function CoursesPage() {
  const list = publicCourses();
  const [first, ...rest] = list;
  const articles = getArticlesByCategory("hiroshima");
  return (
    <div className="courses">
      <div className="wrap">
        <Breadcrumbs items={[{ name: cat.name, path: cat.path }]} />
      </div>
      <header className="courses__head wrap">
        <p className="hub__catch">{cat.catch}</p>
        <h1 className="courses__title">
          <span className="wb">広島ランニング</span>
          <span className="wb">コース図鑑</span>
        </h1>
        <p className="hub__intro">{cat.intro}</p>
      </header>

      {first ? (
        <section className="wrap course-feature">
          <Link href={`/courses/${first.slug}`} className="course-feature__link">
            <Photo id={first.photo} ratio="3/2" sizes="(min-width: 960px) 66vw, 100vw" priority caption={false} />
            <div className="course-feature__text">
              <p className="course-card__area">{first.area}</p>
              <h2 className="course-feature__name">{first.name}</h2>
              <p className="course-feature__catch">{first.catch}</p>
              <p className="text-link">
                コースを見る <Arrow />
              </p>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="wrap" aria-label="コース一覧">
        <ul role="list" className="course-grid">
          {rest.map((c) => (
            <li key={c.slug}>
              <Link href={`/courses/${c.slug}`} className="course-card">
                <Photo id={c.photo} ratio="4/3" sizes="(min-width: 960px) 30vw, 100vw" caption={false} fallback={{ title: c.name, sub: c.area }} />
                <span className="course-card__area">{c.area}</span>
                <span className="course-card__name">{c.name}</span>
                <span className="course-card__catch">{c.catch}</span>
                <span className="course-card__state">
                  {c.status === "surveyed" ? <Badge tone="verified">走って確認済み</Badge> : <Badge tone="planned">情報を調査中</Badge>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {articles.length ? (
        <section className="wrap hub__section" aria-labelledby="read">
          <h2 className="hub__h2" id="read">
            広島で走る前に
          </h2>
          <ArticleIndex articles={articles} showCategory={false} />
        </section>
      ) : null}

      <section className="wrap hub__section">
        <aside className="state-note">
          <p>
            距離・累積標高・トイレや給水の場所などは、運営者が実際に走って確認したものだけを掲載します。確認できていない項目は「未確認」と表示しています。写真は Wikimedia Commons で公開されている、撮影地が分かる写真を使用しています（各ページにクレジットを記載）。
          </p>
        </aside>
      </section>
    </div>
  );
}
