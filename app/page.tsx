import Link from "next/link";
import { Photo, creditText } from "@/components/Photo";
import { Arrow } from "@/components/Arrow";
import { startQuestions, featuredEssay } from "@/content/home";
import { courses } from "@/content/courses";
import { shoePurposes } from "@/content/brands";
import { gearCategories, gearScenes } from "@/content/gear";
import { author } from "@/content/site";
import { sales } from "@/content/sales";
import { getPhoto } from "@/content/photos";
import { QUESTIONS } from "@/lib/shoe-finder";
import { getArticle, isPublished, seasonalPicks } from "@/lib/articles";
import { categories } from "@/content/categories";
import { labPromises as PROMISES } from "@/content/lab";
import { formatDate } from "@/lib/format";
import { courseStats, ROUTE_KIND_LABEL } from "@/lib/course-stats";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ path: "/", photo: "ota-floodway-embankment" });

// 季節のおすすめを更新するため、1日に1回つくり直します
export const revalidate = 86400;

const HERO = "ota-floodway-embankment";
const HERO_MOBILE = "motomachi-riverside-path";
const CITY = "castle-west-moat";

/** はじめる人のための、3つの段階 */
const STEPS = [
  { when: "最初の1週間", title: "まず、歩く。", text: "外に出て、20分。走らなくていい。", href: "/articles/start-first-week" },
  { when: "2週目から", title: "歩いて、少し走る。", text: "1分走って、2分歩く。その繰り返し。", href: "/articles/start-first-month" },
  { when: "1か月後", title: "暮らしの一部に。", text: "曜日と時間を決めて、気楽に続ける。", href: "/articles/start-make-it-habit" },
];


export default function HomePage() {
  const now = new Date();
  const month = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).getMonth() + 1;
  const picks = seasonalPicks(now, 4);
  const [lead, ...rest] = picks;
  const essay = getArticle(featuredEssay);
  const heroPhoto = getPhoto(HERO);
  const heroMobile = getPhoto(HERO_MOBILE);
  const cityPhoto = getPhoto(CITY);
  const activeSales = sales.filter((s) => s.endsAt >= now.toISOString().slice(0, 10));
  const courseList = courses.filter((c) => c.status !== "draft");
  const firstQ = QUESTIONS[0]!;
  const knee = getArticle("care-knee-pain");
  const careTopics = categories.care.topics.slice(1, 7).map((t) => t.title);

  return (
    <div className="home">
      {/* ------------------------------------------------ 表紙 */}
      <section className="cover" aria-labelledby="cover-title">
        <div className="cover__media">
          {/* 縦長の画面では道が奥へ続く写真、横長の画面では人が小さく写る川の写真（アートディレクション） */}
          <Photo id={HERO_MOBILE} ratio="4/5" sizes="100vw" priority caption={false} className="cover__photo cover__photo--mobile" />
          <Photo id={HERO} ratio="4/5" sizes="(min-width: 840px) 100vw, 1px" caption={false} className="cover__photo cover__photo--wide" />
          <div className="cover__text">
            <p className="cover__kicker">広島から、走る暮らしを。</p>
            <h1 className="cover__title" id="cover-title">
              <span>走ると、</span>
              <span>日常が少し変わる。</span>
            </h1>
          </div>
        </div>
        <div className="cover__below">
          <p className="cover__sub">
            <span className="wb">速くなくていい。</span>
            <span className="wb">遠くまで走れなくてもいい。</span>
            <br />
            <span className="wb">あなたの最初の一歩を、</span>
            <span className="wb">サポートします。</span>
          </p>
          <div className="cover__actions">
            <Link href="/start" className="btn btn--solid">
              はじめてのランニング
            </Link>
            <Link href="/tools/shoe-finder" className="btn btn--line">
              自分に合ったシューズを探す
            </Link>
          </div>
          {[heroMobile, heroPhoto].map((ph, i) =>
            ph?.credit.kind === "licensed" ? (
              <p key={ph.id} className={`credit ${i === 0 ? "credit--mobile" : "credit--wide"}`}>
                {ph.place}　
                <a href={ph.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {creditText(ph)}
                </a>
              </p>
            ) : null,
          )}
        </div>
      </section>

      {/* ------------------------------------------------ はじめる人へ */}
      <section className="spread spread--start" aria-labelledby="start-title">
        <div className="wrap">
          <p className="eyebrow">これから走り始める人へ</p>
          <h2 className="statement" id="start-title">
            <span className="wb">最初の一歩は、</span>
            <span className="wb">歩くことから。</span>
          </h2>
          <ol role="list" className="steps">
            {STEPS.map((s) => (
              <li key={s.title}>
                <Link href={s.href} className="step">
                  <span className="step__when">{s.when}</span>
                  <span className="step__title">{s.title}</span>
                  <span className="step__text">{s.text}</span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="asks">
            <h3 className="asks__title">よくある、最初の疑問</h3>
            <ul role="list" className="asks__list">
              {startQuestions.map((item) => {
                const slug = item.href.startsWith("/articles/") ? item.href.slice(10) : undefined;
                const live = !slug || isPublished(slug);
                return (
                  <li key={item.q}>
                    {live ? (
                      <Link href={item.href} className="ask">
                        <span className="ask__q">{item.q}</span>
                        <span className="ask__a">{item.a}</span>
                        <Arrow className="ask__arrow" />
                      </Link>
                    ) : (
                      <div className="ask ask--soon">
                        <span className="ask__q">{item.q}</span>
                        <span className="ask__a">準備中です</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ シューズ診断 */}
      <section className="finder-band" aria-labelledby="finder-title">
        <div className="wrap finder-band__inner">
          <div>
            <p className="eyebrow eyebrow--light">ランニングシューズ診断</p>
            <h2 className="finder-band__title" id="finder-title">
              <span className="wb">6つの質問で、</span>
              <span className="wb">合う一足の</span>
              <span className="wb">タイプがわかる。</span>
            </h2>
            <p className="finder-band__text">答えに合わせて、理由といっしょに候補を示します。紹介料で順位を変えることはありません。</p>
          </div>
          <div className="finder-band__q">
            <p className="finder-band__qtitle">{firstQ.title}</p>
            <ul role="list">
              {firstQ.options.map((o) => (
                <li key={String(o.value)}>
                  <Link href={`/tools/shoe-finder?${firstQ.key}=${o.value}`} className="finder-band__opt">
                    <span>{o.label}</span>
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 広島を走る */}
      <section className="city" aria-labelledby="city-title">
        <div className="city__media">
          <Photo id={CITY} ratio="4/5" sizes="100vw" caption={false} className="city__photo" />
          <div className="city__text">
            <p className="eyebrow eyebrow--light">広島のランニングコース</p>
            <h2 className="city__title" id="city-title">
              <span className="wb">川の街を、</span>
              <span className="wb">走る。</span>
            </h2>
            <p className="city__lede">六つの川が流れるデルタの街。川沿いの道、お城のお堀、海辺、街を見下ろす山。地図データから計算した距離と高低差つきで。</p>
          </div>
        </div>
        {cityPhoto?.credit.kind === "licensed" ? (
          <p className="credit wrap">
            {cityPhoto.place}
            <a href={cityPhoto.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
              {creditText(cityPhoto)}
            </a>
          </p>
        ) : null}
        <ul role="list" className="rail" aria-label="広島のランニングコース">
          {courseList.map((c) => (
            <li key={c.slug} className="rail__item">
              <Link href={`/courses/${c.slug}`} className="place">
                {c.photo || !c.route ? (
                  <Photo id={c.photo} ratio="3/4" sizes="(min-width: 960px) 24vw, 62vw" caption={false} fallback={{ title: c.name, sub: c.area }} />
                ) : (
                  <figure className="photo">
                    <div className="photo__frame" style={{ aspectRatio: "3/4" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.route.map.src} alt={`${c.name}のルート地図`} loading="lazy" className="cx-item__map" />
                    </div>
                  </figure>
                )}
                <span className="place__area">{c.area}</span>
                <span className="place__name">{c.name}</span>
                {(() => {
                  const st = courseStats(c);
                  return st && c.route ? (
                    <span className="place__nums">
                      {st.distanceKm.toFixed(1)}km・{ROUTE_KIND_LABEL[c.route.kind]}　累積標高{st.elevationGainM}m
                    </span>
                  ) : null;
                })()}
              </Link>
            </li>
          ))}
        </ul>
        <div className="wrap">
          <p className="more">
            <Link href="/courses" className="more__link">
              広島ランニングコース図鑑へ <Arrow />
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ シューズ研究所 */}
      <section className="spread spread--lab" aria-labelledby="lab-title">
        <div className="wrap">
          <div className="lab-head">
            <p className="eyebrow">ランニングシューズ研究所</p>
            <h2 className="statement" id="lab-title">
              <span className="wb">高い一足より、</span>
              <span className="wb">合う一足。</span>
            </h2>
            <p className="lede">メーカーの名前からではなく、あなたの悩みから。用途ごとに、選び方と候補のシリーズをまとめています。</p>
          </div>
          <ul role="list" className="worries">
            {shoePurposes.map((p) => (
              <li key={p.id}>
                <Link href={`/shoes/purpose/${p.id}`} className="worry">
                  <span className="worry__q">{p.question}</span>
                  <span className="worry__t">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="promises">
            <p className="promises__label">研究所の約束</p>
            <ul role="list">
              {PROMISES.map((p) => (
                <li key={p.title}>
                  <p className="promises__title">{p.title}</p>
                  <p className="promises__text">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="more">
            <Link href="/shoes" className="more__link">
              ランニングシューズ研究所へ <Arrow />
            </Link>
          </p>
          {activeSales.length ? (
            <div className="sale-note">
              <p className="promises__label">確認できているセール</p>
              <ul role="list">
                {activeSales.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.shop}「{s.title}」
                    </a>
                    <span className="sale-note__date">
                      {formatDate(s.endsAt)}まで（{formatDate(s.checkedAt)}確認）
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------ ランニングのある暮らし */}
      {essay ? (
        <section className="life" aria-labelledby="life-title">
          <div className="wrap life__inner">
            <Photo id={essay.hero} ratio="4/5" sizes="(min-width: 960px) 40vw, 100vw" caption="credit-only" className="life__photo" />
            <div className="life__text">
              <p className="eyebrow eyebrow--light">ランニングのある暮らし</p>
              <h2 className="life__title" id="life-title">
                走ること、生きること
              </h2>
              <blockquote className="life__quote">
                <p>{essay.lede ?? essay.description}</p>
              </blockquote>
              <Link href={`/articles/${essay.slug}`} className="more__link more__link--light">
                エッセイを読む <Arrow />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ 今月の読みもの */}
      {lead ? (
        <section className="spread spread--picks" aria-labelledby="picks-title">
          <div className="wrap picks">
            <div className="picks__head">
              <p className="eyebrow">編集部のおすすめ</p>
              <h2 className="headline" id="picks-title">
                {month}月に、読んでほしいこと。
              </h2>
            </div>
            <Link href={`/articles/${lead.slug}`} className="feature">
              <Photo id={lead.hero} ratio="3/2" sizes="(min-width: 960px) 56vw, 100vw" caption={false} fallback={{ title: lead.title }} />
              <span className="feature__cat">{categories[lead.category].name}</span>
              <span className="feature__title">{lead.title}</span>
              <span className="feature__desc">{lead.description}</span>
            </Link>
            <ul role="list" className="reads">
              {rest.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="read">
                    <span className="read__cat">{categories[a.category].name}</span>
                    <span className="read__title">{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ このメディアについて */}
      <section className="spread spread--about" aria-labelledby="about-title">
        <div className="wrap about-note">
          <p className="eyebrow">このメディアについて</p>
          <h2 className="headline" id="about-title">
            <span className="wb">ふつうの市民ランナーが、</span>
            <span className="wb">つくっています。</span>
          </h2>
          <p className="lede">
            {author.role}、{author.ageGroup}。トップアスリートではありません。膝の痛みや、続かない時期や、限られた予算。同じ悩みを持つ人のために、確かめた情報だけを書きます。わからないことは、わからないと書きます。
          </p>
          <Link href="/about" className="more__link">
            運営者と編集方針 <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
