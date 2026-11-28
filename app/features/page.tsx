import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { features } from "@/content/features";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "特集",
  description: "RUN LIFE HIROSHIMA の編集特集。走る道具やカルチャーを、色・素材・シルエットなど、ランナーの目で読みます。出典を確認できる情報だけで書いています。",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <div className="fx-index">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "特集", path: "/features" }]} />
      </div>
      <header className="wrap fx-index__head">
        <h1 className="essays__title">特集</h1>
        <p className="essays__intro">走る道具やカルチャーを、ランナーの目で読む編集特集です。</p>
      </header>
      <ol role="list" className="wrap fx-index__list">
        {features.map((x) => (
          <li key={x.path}>
            <Link href={x.path} className="fx-index__item">
              <span className="fx-index__title latin">{x.title}</span>
              <span className="fx-index__sub">{x.subtitle}</span>
              <span className="fx-index__desc">{x.description}</span>
              <time className="fx-index__date" dateTime={x.publishedAt}>
                {formatDate(x.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
