import Link from "next/link";
import { Photo, creditText } from "@/components/Photo";
import { SectionHead } from "@/components/SectionHead";
import { Arrow } from "@/components/Arrow";
import { ArticleIndex, LeadStory } from "@/components/ArticleList";
import { startQuestions, featuredEssay } from "@/content/home";
import { courses } from "@/content/courses";
import { shoePurposes } from "@/content/brands";
import { gearScenes } from "@/content/gear";
import { author } from "@/content/site";
import { sales } from "@/content/sales";
import { getPhoto } from "@/content/photos";
import { getArticle, isPublished, seasonalPicks } from "@/lib/articles";
import { formatDate, pad2 } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ path: "/", photo: "motomachi-riverside-path" });

// 季節のおすすめを更新するため、1日に1回つくり直します
export const revalidate = 86400;

const HERO = "motomachi-riverside-path";

export default function HomePage() {
  const now = new Date();
  const month = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).getMonth() + 1;
  const picks = seasonalPicks(now, 4);
  const [lead, ...rest] = picks;
  const essay = getArticle(featuredEssay);
  const heroPhoto = getPhoto(HERO);
  const activeSales = sales.filter((s) => s.endsAt >= now.toISOString().slice(0, 10));
  const courseList = courses.filter((c) => c.status !== "draft");

  return (
    <>
      {/* ------------------------------------------------ ファーストビュー */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__stage">
          <Photo id={HERO} ratio="4/5" sizes="(min-width: 960px) 66vw, 82vw" priority caption={false} className="hero__photo" />
          <h1 className="hero__copy" id="hero-title">
            <span>走ると、</span>
            <span>日常が少し変わる。</span>
          </h1>
        </div>
        <div className="hero__body">
          <p className="hero__sub">
            <span className="wb">速くなくていい。</span>
            <br />
            <span className="wb">遠くまで走れなくてもいい。</span>
            <br />
            <span className="wb">あなたの最初の一歩を、</span>
            <span className="wb">サポートします。</span>
          </p>
          <div className="hero__actions">
            <Link href="/start" className="button button--primary">
              はじめてのランニング
              <Arrow />
            </Link>
            <Link href="/tools/shoe-finder" className="button button--quiet">
              自分に合ったシューズを探す
              <Arrow />
            </Link>
          </div>
          {heroPhoto ? (
            <p className="hero__caption">
              {heroPhoto.place}
              {heroPhoto.credit.kind === "licensed" ? (
                <a href={heroPhoto.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {creditText(heroPhoto)}
                </a>
              ) : (
                creditText(heroPhoto)
              )}
            </p>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------ 何から始めよう？ */}
      <section className="section wrap" aria-labelledby="start-q">
        <div className="split">
          <SectionHead
            no="01"
            label="はじめに"
            id="start-q"
            title="何から始めよう？"
            lead="走り始める前の、小さな疑問から。ひとつずつ、答えていきます。"
          />
          <ol role="list" className="q-list">
            {startQuestions.map((item, i) => {
              const slug = item.href.startsWith("/articles/") ? item.href.slice(10) : undefined;
              const live = !slug || isPublished(slug);
              const inner = (
                <>
                  <span className="q-item__no num">{pad2(i + 1)}</span>
                  <span className="q-item__body">
                    <span className="q-item__q">{item.q}</span>
                    <span className="q-item__a">{item.a}</span>
                  </span>
                  {live ? <Arrow className="q-item__arrow" /> : <span className="q-item__soon">準備中</span>}
                </>
              );
              return (
                <li key={item.q}>
                  {live ? (
                    <Link href={item.href} className="q-item">
                      {inner}
                    </Link>
                  ) : (
                    <div className="q-item q-item--soon">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ 編集部のおすすめ */}
      {lead ? (
        <section className="section section--tint" aria-labelledby="picks">
          <div className="wrap">
            <SectionHead no="02" label="編集部のおすすめ" id="picks" title={`${month}月に、読んでほしいこと。`} />
            <div className="picks">
              <LeadStory article={lead} />
              <ArticleIndex articles={rest} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ 広島を走ろう */}
      <section className="section" aria-labelledby="hiroshima">
        <div className="wrap">
          <SectionHead
            no="03"
            label="広島を走ろう"
            id="hiroshima"
            title={
              <>
                <span className="wb">川の街を、</span>
                <span className="wb">走る。</span>
              </>
            }
            lead="六つの川が流れるデルタの街。川沿いの道、街なかの公園、港、そして街を見下ろす山。走って確かめた情報から、順に掲載していきます。"
          />
        </div>
        <ul role="list" className="course-rail" aria-label="広島のランニングコース">
          {courseList.map((c, i) => (
            <li key={c.slug} className={i === 0 ? "course-rail__item course-rail__item--lead" : "course-rail__item"}>
              <Link href={`/courses/${c.slug}`} className="course-card">
                <Photo
                  id={c.photo}
                  ratio={i === 0 ? "4/5" : "4/5"}
                  sizes="(min-width: 960px) 30vw, 72vw"
                  caption={false}
                  fallback={{ title: c.name, sub: c.area }}
                />
                <span className="course-card__area">{c.area}</span>
                <span className="course-card__name">{c.name}</span>
                <span className="course-card__catch">{c.catch}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="wrap">
          <p className="section__more">
            <Link href="/courses" className="text-link">
              広島ランニングコース図鑑へ <Arrow />
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ シューズ研究所 */}
      <section className="section section--rule" aria-labelledby="shoes">
        <div className="wrap split">
          <div>
            <SectionHead
              no="04"
              label="ランニングシューズ研究所"
              id="shoes"
              title={
                <>
                  <span className="wb">高い一足より、</span>
                  <span className="wb">合う一足。</span>
                </>
              }
              lead="メーカーの名前ではなく、あなたの悩みから。買ったほうがいい理由と同じだけ、買わなくてもいい理由も書きます。"
            />
            <div className="finder-invite">
              <p className="finder-invite__title">ランニングシューズ診断</p>
              <p className="finder-invite__text">6つの質問に答えると、合うシューズのタイプと、その理由がわかります。</p>
              <Link href="/tools/shoe-finder" className="button button--primary">
                診断をはじめる
                <Arrow />
              </Link>
            </div>
          </div>
          <div>
            <p className="list-caption">悩みから探す</p>
            <ul role="list" className="worry-list">
              {shoePurposes.map((p) => (
                <li key={p.id}>
                  <Link href={`/shoes/purpose/${p.id}`} className="worry-item">
                    <span className="worry-item__q">{p.question}</span>
                    <span className="worry-item__t">{p.title}</span>
                    <Arrow className="worry-item__arrow" />
                  </Link>
                </li>
              ))}
            </ul>
            {activeSales.length ? (
              <div className="sale-note">
                <p className="list-caption">確認できているセール</p>
                <ul role="list">
                  {activeSales.map((s) => (
                    <li key={s.id}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.shop}「{s.title}」
                      </a>
                      <span className="sale-note__date">{formatDate(s.endsAt)}まで（{formatDate(s.checkedAt)}確認）</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 道具箱 */}
      <section className="section section--tint" aria-labelledby="gear">
        <div className="wrap split">
          <SectionHead
            no="05"
            label="ランニングの道具箱"
            id="gear"
            title={
              <>
                <span className="wb">道具は、</span>
                <span className="wb">暮らしに合わせて。</span>
              </>
            }
            lead="ランキングではなく、あなたの走り方から。最初に買うべきものは、実はほとんどありません。"
          />
          <ul role="list" className="scene-list">
            {gearScenes.map((s) => (
              <li key={s.slug}>
                <Link href={`/gear/scene/${s.slug}`} className="scene-item">
                  <span className="scene-item__t">{s.title}</span>
                  <Arrow className="scene-item__arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ ランニングと人生 */}
      {essay ? (
        <section className="essay-band" aria-labelledby="life">
          <div className="wrap essay-band__inner">
            <SectionHead no="06" label="ランニングと人生" id="life" title="走ること、生きること" tone="dark" />
            <figure className="essay-band__quote">
              <blockquote>
                <p>{essay.lede ?? essay.description}</p>
              </blockquote>
              <figcaption>
                <Link href={`/articles/${essay.slug}`} className="text-link text-link--on-dark">
                  「{essay.title}」を読む <Arrow />
                </Link>
              </figcaption>
            </figure>
            <Photo id={essay.hero} ratio="3/2" sizes="(min-width: 960px) 30vw, 100vw" className="essay-band__photo" caption="credit-only" />
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ 運営者 */}
      <section className="section wrap" aria-labelledby="about">
        <div className="about-teaser">
          <SectionHead no="07" label="このメディアについて" id="about" title="ふつうの市民ランナーが、つくっています。" />
          <div className="about-teaser__body">
            <p>
              {author.role}、{author.ageGroup}。{author.summary}
            </p>
            <p>
              ここに書くのは、トップランナーの理論ではなく、同じ悩みを持つ人のための、確かめた情報です。わからないことは、わからないと書きます。
            </p>
            <p>
              <Link href="/about" className="text-link">
                運営者と編集方針について <Arrow />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
