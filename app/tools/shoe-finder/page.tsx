import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShoeFinder } from "@/components/tools/ShoeFinder";
import { publicShoes } from "@/content/shoes";
import { brands } from "@/content/brands";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ランニングシューズ診断",
  description: "6つの質問に答えるだけで、あなたに合うランニングシューズのタイプと、その理由、候補のシリーズがわかります。",
  path: "/tools/shoe-finder",
});

export default function ShoeFinderPage() {
  const shoes = publicShoes();
  const brandNames = Object.fromEntries(brands.map((b) => [b.id, b.name]));
  return (
    <div className="tool-page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "診断とツール", path: "/tools" },
            { name: "ランニングシューズ診断", path: "/tools/shoe-finder" },
          ]}
        />
      </div>
      <Suspense fallback={<div className="wrap finder finder--loading">読み込んでいます…</div>}>
        <ShoeFinder shoes={shoes} brandNames={brandNames} />
      </Suspense>
    </div>
  );
}
