import Image from "next/image";
import type { InstagramPost } from "@/lib/instagram";
import type { AmebloEntry } from "@/lib/ameblo-parse";
import { formatDate } from "@/lib/format";

/**
 * Instagram の写真を、サイトのデザインに合わせて並べる（標準の埋め込みは使わない）。
 * キャプション・いいね数・購入導線は出さず、写真だけ。各写真は元の投稿へ。
 */
export function InstagramGallery({ posts, profileUrl, username }: { posts: InstagramPost[]; profileUrl: string | null; username: string | null }) {
  if (!posts.length) return null;
  const [first, ...rest] = posts;
  return (
    <section className="ig" aria-labelledby="ig-title">
      <div className="wrap ig__head">
        <p className="m-kicker" id="ig-title">
          Instagram
        </p>
        <p className="ig__lead">
          <span className="wb">走りながら見つけた、</span>
          <span className="wb">いつもの景色。</span>
        </p>
      </div>
      <div className="wrap ig__grid">
        {[first!, ...rest.slice(0, 4)].map((p, i) => (
          <a
            key={p.id}
            href={p.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={`ig__item ${i === 0 ? "ig__item--lead" : ""}`}
            aria-label={`Instagram の投稿を開く：${p.alt}`}
          >
            <Image
              src={p.image}
              alt={p.alt}
              fill
              sizes={i === 0 ? "(min-width: 960px) 50vw, 100vw" : "(min-width: 960px) 20vw, 50vw"}
              style={{ objectFit: "cover" }}
            />
            {p.video ? <span className="ig__video">動画</span> : null}
          </a>
        ))}
      </div>
      {profileUrl ? (
        <p className="wrap ig__more">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="m-link">
            {username ? `@${username}` : "Instagram"} を見る
          </a>
        </p>
      ) : null}
    </section>
  );
}

/** アメブロの最新記事（RSSから）。タイトル・日付・冒頭だけを、静かな一覧で */
export function AmebloList({
  entries,
  blogUrl,
  blogTitle,
  heading = "研究所ブログの新しい記事",
  compact = false,
}: {
  entries: AmebloEntry[];
  blogUrl: string | null;
  blogTitle: string;
  heading?: string;
  compact?: boolean;
}) {
  if (!entries.length) return null;
  return (
    <div className={`ameblo ${compact ? "ameblo--compact" : ""}`}>
      <p className="m-small-head">
        {heading}
        <span className="ameblo__src">アメブロ「{blogTitle}」より</span>
      </p>
      <ul role="list" className="ameblo__list">
        {entries.map((e) => (
          <li key={e.url}>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="ameblo__item">
              {e.image && !compact ? (
                <span className="ameblo__thumb">
                  <Image src={e.image} alt="" fill sizes="96px" style={{ objectFit: "cover" }} />
                </span>
              ) : null}
              <span className="ameblo__body">
                <time className="ameblo__date" dateTime={e.date}>
                  {formatDate(e.date)}
                </time>
                <span className="ameblo__title">{e.title}</span>
                {!compact && e.summary ? <span className="ameblo__summary">{e.summary}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {blogUrl ? (
        <p className="ameblo__more">
          <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="m-link">
            アメブロで読む
          </a>
        </p>
      ) : null}
      <p className="ameblo__note">アメブロの記事には、広告（Ameba Pick）を含むものがあります。</p>
    </div>
  );
}
