import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo, creditText } from "@/components/Photo";
import { FactValue } from "@/components/FactValue";
import { Arrow } from "@/components/Arrow";
import { JsonLd } from "@/components/JsonLd";
import { courses, getCourse, indexableCourse, publicCourses } from "@/content/courses";
import { getPurpose } from "@/content/brands";
import { getPhoto } from "@/content/photos";
import { getArticle } from "@/lib/articles";
import { courseStats, jogMinutes, ROUTE_KIND_LABEL } from "@/lib/course-stats";
import { formatDate } from "@/lib/format";
import { buildMetadata, placeJsonLd } from "@/lib/seo";
import type { Course } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => publicCourses().map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c || c.status === "draft") return {};
  const s = courseStats(c);
  const dist = s ? `約${s.distanceKm.toFixed(1)}km（${ROUTE_KIND_LABEL[c.route!.kind]}）。` : "";
  return buildMetadata({
    title: `${c.name}のランニングコース｜距離・高低差・アクセス`,
    description: `${c.catch}。${dist}${c.description.slice(0, 70)}`,
    path: `/courses/${c.slug}`,
    photo: c.photo,
    noindex: !indexableCourse(c),
  });
}

const dots = (n: number) => "●".repeat(n) + "○".repeat(5 - n);

const FACT_ROWS: { key: keyof Course["facts"]; label: string }[] = [
  { key: "start", label: "スタート地点" },
  { key: "access", label: "公共交通機関" },
  { key: "toilets", label: "トイレ" },
  { key: "water", label: "自動販売機・給水" },
  { key: "surface", label: "路面" },
  { key: "signals", label: "信号" },
  { key: "shade", label: "日陰" },
  { key: "nightSafety", label: "夜間" },
  { key: "bestTime", label: "おすすめの時間帯" },
];

export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c || c.status === "draft") notFound();
  const stats = courseStats(c);
  const photo = getPhoto(c.photo);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`;
  const related = c.relatedArticles.map((s) => getArticle(s)).filter(Boolean);
  const others = courses.filter((x) => x.slug !== c.slug && x.status !== "draft");
  const [minA, minB] = stats ? jogMinutes(stats.distanceKm) : [0, 0];

  return (
    <article className="cg">
      {/* 表紙 */}
      <header className={`cg-cover ${photo ? "" : "cg-cover--plain"}`}>
        {photo ? <Photo id={c.photo} ratio="4/5" sizes="100vw" priority caption={false} className="cg-cover__photo" /> : null}
        <div className="cg-cover__text">
          <p className="cg-cover__area">広島市{c.area}</p>
          <h1 className="cg-cover__name">{c.name}</h1>
          <p className="cg-cover__catch">{c.catch}</p>
        </div>
      </header>
      {photo?.credit.kind === "licensed" ? (
        <p className="credit wrap">
          {photo.caption}
          <a href={photo.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
            {creditText(photo)}
          </a>
        </p>
      ) : null}

      <div className="wrap cg-body">
        <Breadcrumbs
          items={[
            { name: "広島ランニングコース図鑑", path: "/courses" },
            { name: c.name, path: `/courses/${c.slug}` },
          ]}
        />

        {/* 数字で見る */}
        {stats && c.route ? (
          <dl className="cg-stats" aria-label="コースの数字">
            <div>
              <dt>距離（{ROUTE_KIND_LABEL[c.route.kind]}）</dt>
              <dd>
                <span className="num">{stats.distanceKm.toFixed(1)}</span>
                <small>km</small>
              </dd>
            </div>
            <div>
              <dt>累積標高</dt>
              <dd>
                <span className="num">{stats.elevationGainM ?? "—"}</span>
                <small>m</small>
              </dd>
            </div>
            <div>
              <dt>ゆっくり走ると</dt>
              <dd>
                <span className="num">
                  {minA}〜{minB}
                </span>
                <small>分</small>
              </dd>
            </div>
            <div>
              <dt>初心者へのおすすめ</dt>
              <dd className="cg-stats__dots">{c.beginnerScore.value ? dots(c.beginnerScore.value) : "—"}</dd>
            </div>
          </dl>
        ) : null}
        {stats ? (
          <p className="cg-stats__note">
            OpenStreetMap の道路データと国土地理院の標高データから計算した値です。所要時間は1kmあたり7〜8分で計算しています。運営者はまだ走っていません。
          </p>
        ) : null}

        <p className="cg-lede">{c.description}</p>

        {c.status === "outline" ? (
          <aside className="state-note">
            <p>このコースはまだ情報を調査中です。距離やルートは、確認できしだい掲載します。</p>
          </aside>
        ) : null}

        {/* 地図 */}
        {c.route && stats ? (
          <section className="cg-section" aria-labelledby="map">
            <p className="eyebrow">ルート</p>
            <h2 className="cg-h2" id="map">
              {c.route.summary}
            </h2>
            <figure className="cg-map">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label="地図アプリで場所を開く">
                <Image src={c.route.map.src} alt={`${c.name}の想定ルートの地図。${c.route.summary}`} width={c.route.map.width} height={c.route.map.height} sizes="(min-width: 960px) 760px, 100vw" />
              </a>
              {stats.profilePath ? (
                <div className="cg-profile">
                  <svg viewBox="0 0 1000 200" preserveAspectRatio="none" role="img" aria-label={`高低図。最も低い地点${stats.minEle?.toFixed(0)}m、最も高い地点${stats.maxEle?.toFixed(0)}m`}>
                    <path d={stats.profilePath} />
                  </svg>
                  <p className="cg-profile__label">
                    <span>高低図</span>
                    <span className="num">
                      {stats.minEle?.toFixed(0)}m 〜 {stats.maxEle?.toFixed(0)}m
                    </span>
                  </p>
                </div>
              ) : null}
              <figcaption>
                出発点は白い丸。{c.route.note} 地図：
                <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">
                  地理院タイル（淡色地図）
                </a>
                を加工して作成。ルート：© OpenStreetMap contributors
              </figcaption>
            </figure>
            <div className="cg-map__actions">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn--line">
                地図アプリで開く
              </a>
              <a href={`/gpx/${c.route.gpx}`} download className="btn btn--line">
                GPXをダウンロード
              </a>
            </div>
          </section>
        ) : (
          <p className="cg-section">
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn--line">
              地図アプリで場所を開く
            </a>
          </p>
        )}

        {c.features.length ? (
          <section className="cg-section" aria-labelledby="features">
            <p className="eyebrow">このコースのよさ</p>
            <h2 className="cg-h2" id="features">
              特徴
            </h2>
            <ul role="list" className="cg-list">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {c.shoes.length ? (
          <section className="cg-section" aria-labelledby="shoes">
            <p className="eyebrow">足もと</p>
            <h2 className="cg-h2" id="shoes">
              おすすめのシューズ
            </h2>
            <ul role="list" className="cg-shoes">
              {c.shoes.map((s) => (
                <li key={s.text}>
                  <p>{s.text}</p>
                  {s.purpose ? (
                    <Link href={`/shoes/purpose/${s.purpose}`} className="more__link">
                      「{getPurpose(s.purpose).title}」のシューズを見る <Arrow />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="cg-section" aria-labelledby="facts">
          <p className="eyebrow">出かける前に</p>
          <h2 className="cg-h2" id="facts">
            アクセスと設備
          </h2>
          <p className="cg-stats__note cg-facts-note">
            「要確認」は地図データや一般的な目安にもとづく情報、「未確認」はまだ調べられていない項目です。どちらも現地での確認が必要です。情報源はページの最後にまとめています。
          </p>
          <dl className="spec-table">
            <div>
              <dt>坂道</dt>
              <dd>
                <FactValue fact={c.facts.hills} compact />
              </dd>
            </div>
            <div>
              <dt>難易度（目安）</dt>
              <dd>
                <FactValue fact={c.difficulty} format={(v) => dots(v)} compact />
              </dd>
            </div>
            {FACT_ROWS.map((r) => (
              <div key={r.key}>
                <dt>{r.label}</dt>
                <dd>
                  <FactValue fact={c.facts[r.key] as never} compact />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {c.cautions.length ? (
          <section className="cg-section" aria-labelledby="cautions">
            <p className="eyebrow">気をつけたいこと</p>
            <h2 className="cg-h2" id="cautions">
              夏・夜・安全のために
            </h2>
            <ul role="list" className="cg-list cg-list--caution">
              {c.cautions.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {c.nearby.length ? (
          <section className="cg-section" aria-labelledby="nearby">
            <p className="eyebrow">寄り道</p>
            <h2 className="cg-h2" id="nearby">
              周辺の立ち寄りスポット
            </h2>
            <p className="cg-nearby">{c.nearby.join("　/　")}</p>
          </section>
        ) : null}

        <section className="cg-section" aria-labelledby="report">
          <p className="eyebrow">実走レポート</p>
          <h2 className="cg-h2" id="report">
            走った感想
          </h2>
          {c.runReport ? (
            <div className="voice voice--worn">
              <p className="voice__label">{formatDate(c.runReport.date)}に走りました</p>
              <p>{c.runReport.text}</p>
            </div>
          ) : (
            <p className="muted">運営者はまだこのコースを走っていません。走ったら、ここに書きます。</p>
          )}
        </section>

        {related.length ? (
          <section className="cg-section" aria-labelledby="read">
            <p className="eyebrow">あわせて読みたい</p>
            <ul role="list" className="reads" id="read">
              {related.map((a) => (
                <li key={a!.slug}>
                  <Link href={`/articles/${a!.slug}`} className="read">
                    <span className="read__title">{a!.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {c.sources.length ? (
          <section className="sources" aria-labelledby="sources-title">
            <h2 className="sources__title" id="sources-title">
              情報源と確認日
            </h2>
            <ol>
              {c.sources.map((s) => (
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
      </div>

      <section className="wrap cg-others" aria-labelledby="others">
        <p className="eyebrow" id="others">
          ほかのコース
        </p>
        <ul role="list" className="reads">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/courses/${o.slug}`} className="read">
                <span className="read__cat">{o.area}</span>
                <span className="read__title">{o.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd data={placeJsonLd({ name: c.name, description: c.description, path: `/courses/${c.slug}`, photo: c.photo })} />
    </article>
  );
}
