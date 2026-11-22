import Link from "next/link";
import { Photo, creditText } from "@/components/Photo";
import { Arrow } from "@/components/Arrow";
import { courses } from "@/content/courses";
import { shoePurposes } from "@/content/brands";
import { gearCategories, gearScenes } from "@/content/gear";
import { modelsInResearch, getShoe } from "@/content/shoes";
import { sales } from "@/content/sales";
import { getPhoto } from "@/content/photos";
import { categories } from "@/content/categories";
import { featuredEssay } from "@/content/home";
import { getArticle, getArticles } from "@/lib/articles";
import { courseStats, ROUTE_KIND_LABEL } from "@/lib/course-stats";
import { formatDate, formatYen } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import type { Photo as PhotoT } from "@/lib/types";

export const metadata = buildMetadata({ path: "/" });

// 新着とセールを更新するため、1日に1回つくり直します
export const revalidate = 86400;

function Credit({ p, className = "" }: { p?: PhotoT; className?: string }) {
  if (!p || p.credit.kind !== "licensed") return null;
  return (
    <p className={`credit ${className}`}>
      {p.isHiroshima ? p.caption : p.place.replace("（広島ではありません）", "")}
      {p.isHiroshima ? null : "（イメージ写真）"}
      <a href={p.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
        {creditText(p)}
      </a>
    </p>
  );
}

export default function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const cover = getPhoto("runner-levee-dusk");
  const story = getPhoto("runner-riverside-mukogawa");
  const city = getPhoto("castle-west-moat");
  const everyday = getPhoto("runner-city-morning");
  const essay = getArticle(featuredEssay);
  const latest = getArticles().slice(0, 5);
  const routed = courses.filter((c) => c.route);
  const [bigCourse, ...restCourses] = routed;
  const activeSales = sales.filter((s) => s.endsAt >= today);
  const confirmed = modelsInResearch.filter((m) => m.status === "confirmed");
  const knee = getArticle("care-knee-pain");
  const firstWeek = getArticle("start-first-week");
  const habit = getArticle("start-make-it-habit");

  return (
    <div className="mag">
      {/* ================================================ 表紙 */}
      <section className="m-cover" aria-labelledby="cover-title">
        <Photo id="runner-levee-dusk" ratio="4/5" sizes="100vw" priority caption={false} className="m-cover__photo" />
        <div className="m-cover__text">
          <h1 className="m-cover__title" id="cover-title">
            ただ、走る。
          </h1>
          <p className="m-cover__sub">広島の、いつもの道で。</p>
        </div>
      </section>
      <Credit p={cover} className="wrap" />

      {/* ================================================ 宣言 */}
      <section className="m-manifesto wrap" aria-label="このメディアについて" data-reveal>
        <p className="m-manifesto__lead">
          <span className="wb">飾らない。</span>
          <span className="wb">気取らない。</span>
          <span className="wb">力まない。</span>
        </p>
        <p className="m-manifesto__body">
          高価なウェアも、最新のシューズも、速いタイムも、なくていい。普通の街、いつもの道、使い慣れたシューズ。そこにある美しさを、走りながら見つけにいく。
        </p>
        <p className="m-manifesto__links">
          <Link href="/start" className="m-link">
            はじめてのランニング <Arrow />
          </Link>
          <Link href="/tools/shoe-finder" className="m-link">
            合う一足を探す <Arrow />
          </Link>
        </p>
      </section>

      {/* ================================================ 走るということ */}
      <section className="m-stories" aria-labelledby="stories-title">
        <div className="wrap">
          <p className="m-kicker" id="stories-title">
            走るということ
          </p>
        </div>
        <Link href={essay ? `/articles/${essay.slug}` : "/essays"} className="m-feature" data-reveal>
          <Photo id="runner-riverside-mukogawa" ratio="3/2" sizes="100vw" caption={false} className="m-feature__photo" />
          <span className="m-feature__text wrap">
            <span className="m-feature__title">{essay?.title ?? "走ること、生きること"}</span>
            <span className="m-feature__lede">{essay?.description}</span>
          </span>
        </Link>
        <Credit p={story} className="wrap" />
        <div className="wrap m-pair" data-reveal>
          {[firstWeek, habit].filter(Boolean).map((a) => (
            <Link key={a!.slug} href={`/articles/${a!.slug}`} className="m-story">
              <span className="m-story__cat">{categories[a!.category].name}</span>
              <span className="m-story__title">{a!.title}</span>
              <span className="m-story__desc">{a!.lede ?? a!.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================ 広島 */}
      <section className="m-city" aria-labelledby="city-title">
        <div className="m-city__media">
          <Photo id="castle-west-moat" ratio="4/5" sizes="100vw" caption={false} className="m-city__photo" />
          <div className="m-city__text wrap">
            <p className="m-kicker m-kicker--light">広島を走る</p>
            <h2 className="m-city__title" id="city-title">
              <span className="wb">川の街の、</span>
              <span className="wb">いつもの道。</span>
            </h2>
          </div>
        </div>
        <Credit p={city} className="wrap" />
        <div className="wrap m-courses" data-reveal>
          {bigCourse ? (
            <Link href={`/courses/${bigCourse.slug}`} className="m-course m-course--big">
              <Photo id={bigCourse.photo} ratio="4/3" sizes="(min-width: 960px) 55vw, 100vw" caption={false} />
              <CourseLine c={bigCourse} />
            </Link>
          ) : null}
          <ul role="list" className="m-course-list">
            {restCourses.map((c) => (
              <li key={c.slug}>
                <Link href={`/courses/${c.slug}`} className="m-course">
                  <CourseLine c={c} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="wrap m-more">
          <Link href="/courses" className="m-link">
            広島ランニングコース図鑑 <Arrow />
          </Link>
        </p>
      </section>

      {/* ================================================ シューズ */}
      <section className="m-shoes wrap" aria-labelledby="shoes-title" data-reveal>
        <p className="m-kicker">シューズ</p>
        <h2 className="m-statement" id="shoes-title">
          <span className="wb">高い一足より、</span>
          <span className="wb">合う一足。</span>
        </h2>
        <div className="m-shoes__grid">
          <div className="m-finder">
            <p className="m-finder__title">6つの質問で、合うタイプがわかる。</p>
            <p className="m-finder__text">紹介料で順位を変えることはありません。</p>
            <Link href="/tools/shoe-finder" className="m-button">
              シューズ診断をはじめる
            </Link>
          </div>
          <ul role="list" className="m-worries">
            {shoePurposes.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link href={`/shoes/purpose/${p.id}`}>
                  <span className="m-worries__q">{p.question}</span>
                  <span className="m-worries__t">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {confirmed.length ? (
          <div className="m-models">
            <p className="m-small-head">公式情報を確認したモデル</p>
            <ul role="list">
              {confirmed.map((m) => {
                const s = getShoe(m.shoe);
                return (
                  <li key={m.name}>
                    <Link href={`/shoes/${m.shoe}`} className="m-model">
                      <span className="m-model__name latin">{m.name}</span>
                      <span className="m-model__price">
                        {s?.specs.priceJpy.value ? `公式価格 ${formatYen(s.specs.priceJpy.value)}` : "価格は確認中"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <p className="m-more">
          <Link href="/shoes" className="m-link">
            ランニングシューズ研究所 <Arrow />
          </Link>
        </p>
      </section>

      {/* ================================================ セール */}
      <section className="m-deals wrap" aria-labelledby="deals-title" data-reveal>
        <div className="m-deals__head">
          <p className="m-kicker" id="deals-title">
            セール
          </p>
          <p className="m-deals__text">
            {activeSales.length
              ? "運営者が確認したセールを、確認日とともに。"
              : "いま、お知らせできるセールはありません。確認できたものだけを、確認日とともに載せます。"}
          </p>
        </div>
        {activeSales.length ? (
          <ul role="list" className="reads">
            {activeSales.slice(0, 3).map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="read">
                  <span className="read__cat">
                    {s.shop}・{formatDate(s.endsAt)}まで
                  </span>
                  <span className="read__title">{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <Link href="/deals" className="m-link">
          セール情報 <Arrow />
        </Link>
      </section>

      {/* ================================================ 補給と道具 */}
      <section className="m-gear" aria-labelledby="gear-title">
        <div className="wrap m-gear__grid">
          <div className="m-gear__media" data-reveal>
            <Photo id="runner-city-morning" ratio="3/4" sizes="(min-width: 960px) 40vw, 100vw" caption={false} />
            <Credit p={everyday} />
          </div>
          <div data-reveal>
            <p className="m-kicker">補給と道具</p>
            <h2 className="m-statement" id="gear-title">
              <span className="wb">持ち物は、</span>
              <span className="wb">少なくていい。</span>
            </h2>
            <ul role="list" className="m-scenes">
              {gearScenes.map((s) => (
                <li key={s.slug}>
                  <Link href={`/gear/scene/${s.slug}`}>
                    <span className="m-scenes__q">{s.title}</span>
                    <span className="m-scenes__g">
                      {s.picks
                        .map((p) => gearCategories.find((g) => g.slug === p.gear)?.name)
                        .filter(Boolean)
                        .join("・")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="m-more">
              <Link href="/gear" className="m-link">
                補給と道具 <Arrow />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ================================================ 長く走る */}
      <section className="m-long wrap" aria-labelledby="long-title" data-reveal>
        <p className="m-kicker">長く走る</p>
        <h2 className="m-quote" id="long-title">
          <span className="wb">痛みは、</span>
          <span className="wb">止まる合図。</span>
        </h2>
        <div className="m-long__grid">
          <p className="m-long__text">
            VO2max、健康寿命、からだのケア。速くなるためではなく、何年先も走っているための知識です。医学的な根拠と個人の経験を分けて書き、診断や治療の代わりにはしません。
          </p>
          <div>
            {knee ? (
              <Link href={`/articles/${knee.slug}`} className="m-story">
                <span className="m-story__cat">からだ</span>
                <span className="m-story__title">{knee.title}</span>
                <span className="m-story__desc">{knee.description}</span>
              </Link>
            ) : null}
            <p className="m-long__soon">準備中：VO2max と健康寿命、睡眠、栄養、筋力トレーニング</p>
          </div>
        </div>
        <p className="m-more">
          <Link href="/care" className="m-link">
            長く走るための記事 <Arrow />
          </Link>
        </p>
      </section>

      {/* ================================================ 新着 */}
      <section className="m-latest wrap" aria-labelledby="latest-title" data-reveal>
        <p className="m-kicker" id="latest-title">
          新しい記事
        </p>
        <ol role="list" className="m-latest__list">
          {latest.map((a) => (
            <li key={a.slug}>
              <Link href={`/articles/${a.slug}`} className="m-latest__item">
                <time dateTime={a.updatedAt} className="m-latest__date num">
                  {a.updatedAt.slice(5).replace("-", ".")}
                </time>
                <span className="m-latest__title">{a.title}</span>
                <span className="m-latest__cat">{categories[a.category].name}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ================================================ 運営者 */}
      <section className="m-about wrap" aria-labelledby="about-title" data-reveal>
        <p className="m-kicker" id="about-title">
          つくっている人
        </p>
        <p className="m-about__text">
          広島在住、40代の市民ランナー。トップアスリートではありません。膝の痛みも、続かない時期も、限られた予算も知っています。わからないことは、わからないと書きます。
        </p>
        <Link href="/about" className="m-link">
          運営者と編集方針 <Arrow />
        </Link>
      </section>
    </div>
  );
}

function CourseLine({ c }: { c: (typeof courses)[number] }) {
  const s = courseStats(c);
  return (
    <span className="m-course__line">
      <span className="m-course__name">{c.name}</span>
      {s && c.route ? (
        <span className="m-course__nums">
          {s.distanceKm.toFixed(1)}km・{ROUTE_KIND_LABEL[c.route.kind]}
          {s.elevationGainM ? `・上り${s.elevationGainM}m` : "・ほぼ平ら"}
        </span>
      ) : null}
    </span>
  );
}
