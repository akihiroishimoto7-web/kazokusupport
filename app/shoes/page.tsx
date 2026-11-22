import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Arrow } from "@/components/Arrow";
import { ArticleIndex } from "@/components/ArticleList";
import { ShoeList } from "@/components/ShoeList";
import { categories } from "@/content/categories";
import { brands, shoePurposes } from "@/content/brands";
import { modelsInResearch, publicShoes } from "@/content/shoes";
import { sales } from "@/content/sales";
import { labPromises } from "@/content/lab";
import { AmebloList } from "@/components/SocialSections";
import { getAmebloEntries } from "@/lib/ameblo";
import { social, amebloUrl } from "@/content/social";
import { getArticlesByCategory } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

const cat = categories.shoes;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path });

export const revalidate = 3600;

export default async function ShoesPage() {
  const amebloEntries = await getAmebloEntries();
  const all = publicShoes();
  const reviews = all.filter((s) => s.status === "review");
  const articles = getArticlesByCategory("shoes");
  const today = new Date().toISOString().slice(0, 10);
  const activeSales = sales.filter((s) => s.endsAt >= today);

  return (
    <div className="hub shoes-hub">
      <div className="wrap">
        <Breadcrumbs items={[{ name: cat.name, path: cat.path }]} />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">{cat.catch}</p>
          <h1 className="hub__title">
            <span className="wb">ランニングシューズ</span>
            <span className="wb">研究所</span>
          </h1>
          <p className="hub__intro">{cat.intro}</p>
        </div>
      </header>

      <section className="wrap hub__section">
        <div className="finder-invite finder-invite--wide">
          <div>
            <p className="finder-invite__title">迷ったら、ここから。</p>
            <p className="finder-invite__text">6つの質問に答えるだけ。合うシューズのタイプと、その理由、候補のシリーズを表示します。</p>
          </div>
          <Link href="/tools/shoe-finder" className="button button--primary">
            ランニングシューズ診断 <Arrow />
          </Link>
        </div>
      </section>

      <section className="wrap hub__section" aria-labelledby="promise">
        <h2 className="hub__h2" id="promise">
          研究所の約束
        </h2>
        <ul role="list" className="promises-inline">
          {labPromises.map((p) => (
            <li key={p.title}>
              <p className="promises__title">{p.title}</p>
              <p className="promises__text">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {amebloEntries.length ? (
        <section className="wrap hub__section" aria-label="アメブロの新しい記事">
          <AmebloList entries={amebloEntries} blogUrl={amebloUrl()} blogTitle={social.ameblo.title} heading="レビューと比較の新しい記事" />
        </section>
      ) : null}

      <section className="wrap hub__section" aria-labelledby="research">
        <h2 className="hub__h2" id="research">
          いま調べているモデル
        </h2>
        <p className="hub__note">
          メーカー公式サイトの仕様を確認できたものから掲載しています。運営者が実際に履いたものは、レビューとして別に書きます。
        </p>
        <ul role="list" className="reads research-list">
          {modelsInResearch.map((m) => (
            <li key={m.name}>
              <Link href={`/shoes/${m.shoe}`} className="read">
                <span className="read__title latin">{m.name}</span>
                <span className={m.status === "confirmed" ? "research-list__ok" : "research-list__wait"}>{m.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap hub__section" aria-labelledby="by-worry">
        <h2 className="hub__h2" id="by-worry">
          悩みや用途から探す
        </h2>
        <ul role="list" className="purpose-grid">
          {shoePurposes.map((p) => (
            <li key={p.id}>
              <Link href={`/shoes/purpose/${p.id}`} className="purpose-item">
                <span className="purpose-item__q">{p.question}</span>
                <span className="purpose-item__t">
                  {p.title} <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {articles.length ? (
        <section className="wrap hub__section" aria-labelledby="basics">
          <h2 className="hub__h2" id="basics">
            選ぶ前に読む
          </h2>
          <ArticleIndex articles={articles} showCategory={false} />
        </section>
      ) : null}

      <section className="wrap hub__section" aria-labelledby="by-brand">
        <h2 className="hub__h2" id="by-brand">
          メーカーから探す
        </h2>
        <ul role="list" className="brand-list">
          {brands.map((b) => {
            const n = all.filter((s) => s.brand === b.id).length;
            return (
              <li key={b.id}>
                <Link href={`/shoes/brand/${b.id}`} className="brand-item">
                  <span className="brand-item__name latin">{b.name}</span>
                  <span className="brand-item__ja">{b.nameJa}</span>
                  <span className="brand-item__n num">{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {activeSales.length ? (
        <section className="wrap hub__section" aria-labelledby="sales">
          <h2 className="hub__h2" id="sales">
            確認できているセール
          </h2>
          <ul role="list" className="index-list">
            {activeSales.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="index-item">
                  <span className="index-item__body">
                    <span className="index-item__title">
                      {s.shop}「{s.title}」
                    </span>
                    <span className="index-item__desc">
                      {formatDate(s.endsAt)}まで。{s.note}（{formatDate(s.checkedAt)}確認）
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="wrap hub__section" aria-labelledby="all">
        <h2 className="hub__h2" id="all">
          登録しているシューズ
        </h2>
        <p className="hub__note">
          {reviews.length
            ? `レビュー公開中 ${reviews.length}足。`
            : "現在は、各メーカーの主要シリーズの位置づけをまとめた「シリーズ概要」のみを掲載しています。"}
          価格・重量・厚さなどのスペックは、メーカー公式で確認できたものから順に掲載します。実際に履いたものは、レビューとして公開します。
        </p>
        <ShoeList shoes={all} />
      </section>
    </div>
  );
}
