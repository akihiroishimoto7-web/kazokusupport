import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { sales } from "@/content/sales";
import { formatDate } from "@/lib/format";
import { affiliateActive } from "@/lib/shop";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "セール情報",
  description: "ランニングシューズや道具のセール情報。運営者が実際に確認したものだけを、確認日とともに掲載します。割引率や価格を推測で書くことはしません。",
  path: "/deals",
});

export const revalidate = 86400;

export default function DealsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const active = sales.filter((s) => s.endsAt >= today);
  return (
    <div className="page">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "セール情報", path: "/deals" }]} />
      </div>
      <header className="page-head wrap">
        <p className="eyebrow">セール</p>
        <h1 className="page-title">
          <span className="wb">安いから、</span>
          <span className="wb">ではなく。</span>
        </h1>
        <p className="lede">
          ほしいと思っていた一足が、たまたま安くなっている。そういう出会いのための場所です。運営者が確認したセールだけを、確認した日とともに載せます。割引率や価格を推測で書くことはしません。
        </p>
      </header>
      <section className="wrap page-section">
        {active.length ? (
          <ul role="list" className="reads">
            {active.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel={affiliateActive ? "sponsored noopener noreferrer" : "noopener noreferrer"} className="read">
                  <span className="read__cat">
                    {s.shop}・{formatDate(s.endsAt)}まで
                  </span>
                  <span className="read__title">{s.title}</span>
                  {s.note ? <span className="read__desc">{s.note}</span> : null}
                  <span className="read__date">{formatDate(s.checkedAt)}確認</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p className="empty-state__title">いま、お知らせできるセールはありません。</p>
            <p>
              セールは急いで買う理由にはなりません。まずは自分に合うシューズのタイプを知っておくと、よい出会いを見逃しにくくなります。
            </p>
            <p>
              <Link href="/tools/shoe-finder" className="more__link">
                シューズ診断へ
              </Link>
            </p>
          </div>
        )}
        {affiliateActive ? <p className="muted small">このページには広告（アフィリエイトリンク）が含まれます。</p> : null}
      </section>
    </div>
  );
}
