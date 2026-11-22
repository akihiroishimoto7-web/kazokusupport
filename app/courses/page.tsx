import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo, PlateLines, creditText } from "@/components/Photo";
import { categories } from "@/content/categories";
import { publicCourses } from "@/content/courses";
import { getPhoto } from "@/content/photos";
import { getArticlesByCategory } from "@/lib/articles";
import { courseStats, ROUTE_KIND_LABEL } from "@/lib/course-stats";
import { buildMetadata } from "@/lib/seo";

const cat = categories.hiroshima;
export const metadata = buildMetadata({
  title: "広島ランニングコース図鑑｜距離・高低差・アクセス",
  description:
    "太田川の川沿い、広島城、平和記念公園、宇品の海辺、牛田山、比治山。広島のランニングコースを、地図データから計算した距離と高低差、アクセスとともに紹介します。",
  path: cat.path,
  photo: "own-river-evening",
});

const COVER = "own-river-evening";

export default function CoursesPage() {
  const list = publicCourses();
  const articles = getArticlesByCategory("hiroshima");
  const cover = getPhoto(COVER);
  return (
    <div className="cx">
      <header className="cg-cover cx-cover">
        <Photo id={COVER} ratio="4/5" sizes="100vw" priority caption={false} className="cg-cover__photo" />
        <div className="cg-cover__text">
          <p className="cg-cover__area">広島ランニングコース図鑑</p>
          <h1 className="cg-cover__name">
            <span className="wb">川の街を、</span>
            <span className="wb">走る。</span>
          </h1>
          <p className="cg-cover__catch">六つの川が流れるデルタの街の、川沿い、お城、公園、海辺、山。</p>
        </div>
      </header>
      {cover?.credit.kind === "licensed" ? (
        <p className="credit wrap">
          {cover.caption}
          <a href={cover.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
            {creditText(cover)}
          </a>
        </p>
      ) : null}

      <div className="wrap">
        <Breadcrumbs items={[{ name: cat.name, path: cat.path }]} />
        <p className="cg-lede cx-lede">
          距離と高低差は、OpenStreetMap の道路データと国土地理院の標高データから作った想定ルートで計算しています。トイレや駅の情報も地図データにもとづくもので、現地での確認が必要です。運営者が実際に走ったコースから、感想を書き足していきます。
        </p>

        <ul role="list" className="cx-list">
          {list.map((c) => {
            const s = courseStats(c);
            return (
              <li key={c.slug}>
                <Link href={`/courses/${c.slug}`} className="cx-item">
                  <div className="cx-item__media">
                    {c.photo ? (
                      <Photo id={c.photo} ratio="4/3" sizes="(min-width: 960px) 40vw, 100vw" caption={false} />
                    ) : (
                      <figure className="photo photo--plate">
                        <div className="photo__frame plate" style={{ aspectRatio: "4/3" }}>
                          <PlateLines />
                          {c.route ? (
                            // 写真がないコースは、ルートの地図を見せる
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.route.map.src} alt="" className="cx-item__map" loading="lazy" />
                          ) : (
                            <span className="plate__title">{c.name}</span>
                          )}
                        </div>
                      </figure>
                    )}
                  </div>
                  <div className="cx-item__text">
                    <p className="cx-item__area">{c.area}</p>
                    <h2 className="cx-item__name">{c.name}</h2>
                    <p className="cx-item__catch">{c.catch}</p>
                    {s && c.route ? (
                      <p className="cx-item__nums">
                        <span>
                          <span className="num">{s.distanceKm.toFixed(1)}</span>km・{ROUTE_KIND_LABEL[c.route.kind]}
                        </span>
                        <span>
                          累積標高 <span className="num">{s.elevationGainM}</span>m
                        </span>
                      </p>
                    ) : (
                      <p className="cx-item__nums cx-item__nums--muted">ルートを調査中</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {articles.length ? (
          <section className="cg-section" aria-labelledby="read">
            <p className="eyebrow" id="read">
              広島で走る前に
            </p>
            <ul role="list" className="reads">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="read">
                    <span className="read__title">{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
