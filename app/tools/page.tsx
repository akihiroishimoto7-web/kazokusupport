import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/Badge";
import { Arrow } from "@/components/Arrow";
import { tools } from "@/content/tools";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "診断とツール",
  description: "ランニングシューズ診断、マラソンペース計算機、大会持ち物チェックリストなど、ブラウザで使えるツール。",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="hub">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "診断とツール", path: "/tools" }]} />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">迷ったときの、道しるべ。</p>
          <h1 className="hub__title">診断とツール</h1>
          <p className="hub__intro">
            ブラウザの中だけで動く、小さな道具です。入力した内容をサーバーに送ることはありません。結果の順番を、広告やお店の都合で変えることもしません。
          </p>
        </div>
      </header>
      <section className="wrap hub__section">
        <ul role="list" className="tool-index">
          {tools.map((t) => (
            <li key={t.id}>
              {t.status === "live" ? (
                <Link href={t.href} className="tool-row">
                  <span className="tool-row__body">
                    <span className="tool-row__t">{t.title}</span>
                    <span className="tool-row__d">{t.description}</span>
                    {t.meta ? <span className="tool-row__m">{t.meta}</span> : null}
                  </span>
                  <Arrow className="tool-row__arrow" />
                </Link>
              ) : (
                <div className="tool-row tool-row--soon">
                  <span className="tool-row__body">
                    <span className="tool-row__t">{t.title}</span>
                    <span className="tool-row__d">{t.description}</span>
                  </span>
                  <Badge tone="planned">準備中</Badge>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
