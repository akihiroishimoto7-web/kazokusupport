import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { FactValue } from "@/components/FactValue";
import { Badge } from "@/components/Badge";
import { Arrow } from "@/components/Arrow";
import { JsonLd } from "@/components/JsonLd";
import { CourseRoute } from "@/components/CourseRoute";
import { courses, getCourse, publicCourses } from "@/content/courses";
import { getArticle } from "@/lib/articles";
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
  return buildMetadata({
    title: `${c.name}のランニングコース`,
    description: `${c.catch}。${c.description.slice(0, 80)}`,
    path: `/courses/${c.slug}`,
    photo: c.photo,
    // 実際に走って確認するまでは検索エンジンに登録しない
    noindex: c.status !== "surveyed",
  });
}

const dots = (n: number) => "●".repeat(n) + "○".repeat(5 - n);

const FACT_ROWS: { key: keyof Course["facts"]; label: string; fmt?: (v: never) => string }[] = [
  { key: "start", label: "スタート地点" },
  { key: "distanceKm", label: "距離", fmt: ((v: number) => `${v}km`) as (v: never) => string },
  { key: "elevationGainM", label: "累積標高", fmt: ((v: number) => `${v}m`) as (v: never) => string },
  { key: "surface", label: "路面" },
  { key: "signals", label: "信号の多さ" },
  { key: "toilets", label: "トイレ" },
  { key: "water", label: "自動販売機・給水" },
  { key: "shade", label: "日陰" },
  { key: "access", label: "公共交通機関でのアクセス" },
  { key: "nightSafety", label: "夜間の安全性" },
  { key: "bestTime", label: "おすすめの時間帯" },
];

export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c || c.status === "draft") notFound();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`;
  const related = c.relatedArticles.map((s) => getArticle(s)).filter(Boolean);
  const allFacts = [c.difficulty, c.beginnerScore, ...Object.values(c.facts)];
  const known = allFacts.filter((f) => f.value !== null).length;
  const others = courses.filter((x) => x.slug !== c.slug && x.status !== "draft").slice(0, 4);

  return (
    <article className="course">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "広島ランニングコース図鑑", path: "/courses" },
            { name: c.name, path: `/courses/${c.slug}` },
          ]}
        />
      </div>

      <header className="course__head wrap">
        <p className="course__area">広島市　{c.area}</p>
        <h1 className="course__name">{c.name}</h1>
        {c.kana ? <p className="course__kana">{c.kana}</p> : null}
        <p className="course__catch serif">{c.catch}</p>
      </header>

      <div className="course__hero">
        <Photo id={c.photo} ratio="3/2" sizes="(min-width: 1240px) 1240px, 100vw" priority fallback={{ title: c.name, sub: "写真は準備中です" }} />
      </div>

      <div className="wrap course__grid">
        <div className="course__main">
          <p className="course__desc">{c.description}</p>

          {c.status !== "surveyed" ? (
            <aside className="state-note">
              <p>
                <Badge tone="planned">情報を調査中</Badge>
                このコースは、まだ運営者が走って確認していません。下の表の「未確認」の項目は、走って確かめたうえで掲載します。お出かけの際は、現地の案内や公式の情報もあわせてご確認ください。
              </p>
            </aside>
          ) : null}

          <section className="course__section" aria-labelledby="facts">
            <h2 id="facts">コースの基本情報</h2>
            {known === 0 ? (
              <details className="facts-pending">
                <summary>
                  <span>距離・累積標高・トイレ・給水・信号など{allFacts.length}項目は、走って確認したあとに掲載します。</span>
                  <span className="facts-pending__open">項目を見る</span>
                </summary>
            <dl className="spec-table spec-table--course">
                  <div>
                    <dt>難易度</dt>
                    <dd>
                      <FactValue fact={c.difficulty} format={(v) => dots(v)} />
                    </dd>
                  </div>
                  <div>
                    <dt>初心者へのおすすめ度</dt>
                    <dd>
                      <FactValue fact={c.beginnerScore} format={(v) => dots(v)} />
                    </dd>
                  </div>
                  {FACT_ROWS.map((r) => (
                    <div key={r.key}>
                      <dt>{r.label}</dt>
                      <dd>
                        <FactValue fact={c.facts[r.key] as never} format={r.fmt} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            ) : (
            <dl className="spec-table spec-table--course">
              <div>
                <dt>難易度</dt>
                <dd>
                  <FactValue fact={c.difficulty} format={(v) => dots(v)} />
                </dd>
              </div>
              <div>
                <dt>初心者へのおすすめ度</dt>
                <dd>
                  <FactValue fact={c.beginnerScore} format={(v) => dots(v)} />
                </dd>
              </div>
              {FACT_ROWS.map((r) => (
                <div key={r.key}>
                  <dt>{r.label}</dt>
                  <dd>
                    <FactValue fact={c.facts[r.key] as never} format={r.fmt} />
                  </dd>
                </div>
              ))}
            </dl>
            )}
          </section>

          <section className="course__section" aria-labelledby="map">
            <h2 id="map">地図とルート</h2>
            {c.gpx ? <CourseRoute file={c.gpx} name={c.name} /> : <p className="muted">ルートは、実際に走ったGPSの記録をもとに掲載する予定です。</p>}
            <p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="button button--quiet button--inline">
                地図アプリで場所を開く <Arrow dir="up-right" />
              </a>
            </p>
            <p className="muted small">「{c.mapQuery}」でGoogleマップを検索します。</p>
          </section>

          <section className="course__section" aria-labelledby="report">
            <h2 id="report">実際に走った感想</h2>
            {c.runReport ? (
              <div className="voice voice--worn">
                <p className="voice__label">{formatDate(c.runReport.date)}に走りました</p>
                <p>{c.runReport.text}</p>
              </div>
            ) : (
              <p className="voice__empty">まだ走った記録はありません。走ったら、ここに書きます。</p>
            )}
          </section>

          <section className="course__section" aria-labelledby="safety">
            <h2 id="safety">走るときに気をつけたいこと</h2>
            <ul>
              <li>歩行者や自転車が優先です。すれ違うときはペースを落としましょう。</li>
              <li>夏は早朝か日没後に。熱中症警戒アラートの日は走らない判断も。</li>
              <li>暗い時間は、明るく人通りのある道を選び、反射材やライトを。</li>
            </ul>
          </section>

          {related.length ? (
            <section className="course__section" aria-labelledby="read">
              <h2 id="read">あわせて読みたい</h2>
              <ul role="list" className="index-list">
                {related.map((a) => (
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
      </div>

      <section className="wrap other-courses" aria-labelledby="others">
        <h2 className="hub__h2" id="others">
          ほかのコース
        </h2>
        <ul role="list" className="other-courses__list">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/courses/${o.slug}`} className="other-course">
                <span className="other-course__name">{o.name}</span>
                <span className="other-course__area">{o.area}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd data={placeJsonLd({ name: c.name, description: c.description, path: `/courses/${c.slug}`, photo: c.photo })} />
    </article>
  );
}
