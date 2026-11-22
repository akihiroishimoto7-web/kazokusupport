import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShoeCompare } from "@/components/tools/ShoeCompare";
import { brands } from "@/content/brands";
import { publicShoes } from "@/content/shoes";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ランニングシューズ比較｜最大3足を並べてくらべる",
  description: "Nike、ASICS、New Balance、HOKA、adidas、On などのランニングシューズを最大3足まで並べ、用途・公式スペック・特徴をくらべられます。",
  path: "/shoes/compare",
});

export default function ComparePage() {
  const order = brands.map((b) => b.id);
  const shoes = publicShoes()
    .sort((a, b) => order.indexOf(a.brand) - order.indexOf(b.brand))
    .map(({ slug, brand, series, model, catch: c, purposes, traits, recommendFor, notFor, reasonsNotToBuy, specs, ratings, checkedAt }) => ({
      slug, brand, series, model, catch: c, purposes, traits, recommendFor, notFor, reasonsNotToBuy, specs, ratings, checkedAt,
    }));
  const brandNames = Object.fromEntries(brands.map((b) => [b.id, b.name]));
  return (
    <div className="page">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "ランニングシューズ研究所", path: "/shoes" }, { name: "くらべる", path: "/shoes/compare" }]} />
      </div>
      <header className="page-head wrap">
        <p className="eyebrow">シューズ図鑑</p>
        <h1 className="page-title">
          <span className="wb">3足まで、</span>
          <span className="wb">並べてくらべる。</span>
        </h1>
        <p className="lede">
          気になるシューズを選ぶと、得意な用途・公式の数値・特徴が並びます。数値は公式情報だけ、主観の評価は基準つきで、確認できていないものは空けておきます。
        </p>
      </header>
      <div className="wrap page-section sc-wrap">
        <Suspense fallback={<p className="muted">読み込んでいます…</p>}>
          <ShoeCompare shoes={shoes} brandNames={brandNames} />
        </Suspense>
        <p className="sc-foot">
          どれを選べばいいかわからないときは、<Link href="/tools/shoe-finder">シューズ診断</Link>から。
        </p>
      </div>
    </div>
  );
}
