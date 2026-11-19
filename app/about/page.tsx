import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { Arrow } from "@/components/Arrow";
import { author, channels, contact, site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "運営者について",
  description: "RUN LIFE HIROSHIMA を運営する、広島在住の市民ランナーについて。編集方針と、このメディアで大切にしていること。",
  path: "/about",
});

const VALUES = [
  ["速さより", "継続"],
  ["競争より", "楽しさ"],
  ["記録より", "健康"],
  ["高価な道具より", "自分に合った道具"],
] as const;

export default function AboutPage() {
  const live = channels.filter((c) => c.url);
  const planned = channels.filter((c) => !c.url);
  return (
    <div className="about">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "運営者について", path: "/about" }]} />
      </div>
      <header className="about__head wrap">
        <p className="hub__catch">このメディアについて</p>
        <h1 className="about__title">
          <span className="wb">走ることを、</span>
          <span className="wb">暮らしの一部に。</span>
        </h1>
      </header>

      <section className="wrap about__grid">
        <div className="about__text">
          <h2 className="hub__h2">運営者</h2>
          {author.photo ? <Photo id={author.photo} ratio="4/5" sizes="320px" /> : null}
          <p className="about__name">
            {author.displayName ?? "運営者"}
            <span>
              {author.role}／{author.ageGroup}
            </span>
          </p>
          <p>{author.summary}</p>
          {author.records.length ? (
            <dl className="spec-table">
              {author.records.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>
                    {r.value}
                    {r.note ? <span className="fact__note">{r.note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p>
            {site.name}は、いつか広島で走ろうと思った人が最初に訪れ、はじめてシューズを買う人が安心して読め、走ることを続けたい人が何度でも戻ってこられる場所を目指しています。
          </p>
        </div>
        <div className="values" aria-label="大切にしていること">
          {VALUES.map(([a, b]) => (
            <p key={a} className="values__row">
              <span className="values__a">{a}</span>
              <span className="values__b serif">{b}</span>
            </p>
          ))}
          <p className="values__row values__row--last">
            <span className="values__b serif">壊れず、少しずつ強くなる。</span>
          </p>
        </div>
      </section>

      <section className="wrap hub__section" aria-labelledby="policy">
        <h2 className="hub__h2" id="policy">
          編集方針
        </h2>
        <ol className="point-list">
          <li>実際に体験したことと、調べたことを、はっきり分けて書きます。</li>
          <li>確認できていない数字や情報は、推測で書かず「未確認」と表示します。</li>
          <li>「買ったほうがいい理由」と同じだけ、「買わなくてもいい理由」を書きます。</li>
          <li>紹介料の有無や金額で、おすすめの順番や評価を変えません。</li>
          <li>からだや健康の話は、医学的な根拠と個人の経験を区別し、診断や治療効果を断定しません。</li>
        </ol>
        <p>
          <Link href="/policy" className="text-link">
            広告・プライバシー・免責について <Arrow />
          </Link>
        </p>
      </section>

      {live.length || planned.length ? (
        <section className="wrap hub__section" aria-labelledby="channels">
          <h2 className="hub__h2" id="channels">
            ほかの場所でも
          </h2>
          <ul role="list" className="index-list">
            {live.map((c) => (
              <li key={c.id}>
                <a href={c.url!} target="_blank" rel="noopener noreferrer" className="index-item">
                  <span className="index-item__body">
                    <span className="index-item__title">{c.name}</span>
                    <span className="index-item__desc">{c.description}</span>
                  </span>
                  <Arrow dir="up-right" className="index-item__arrow" />
                </a>
              </li>
            ))}
            {planned.map((c) => (
              <li key={c.id}>
                <div className="index-item index-item--soon">
                  <span className="index-item__body">
                    <span className="index-item__title">{c.name}</span>
                    <span className="index-item__desc">{c.description}（リンクは準備中）</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {contact.url ? (
        <section className="wrap hub__section">
          <h2 className="hub__h2">お問い合わせ</h2>
          <p>
            <a href={contact.url} className="text-link">
              お問い合わせはこちら <Arrow />
            </a>
          </p>
        </section>
      ) : null}
    </div>
  );
}
