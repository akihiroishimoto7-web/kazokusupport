import Link from "next/link";
import { CategoryHub } from "@/components/CategoryHub";
import { Arrow } from "@/components/Arrow";
import { categories } from "@/content/categories";
import { buildMetadata } from "@/lib/seo";

const cat = categories.start;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path, photo: cat.photo });

export default function StartPage() {
  return (
    <CategoryHub id="start" topicsTitle="順番に読む、はじめてのランニング" ordered>
      <section className="wrap hub__section">
        <div className="promise">
          <p className="promise__title serif">はじめる前に、知っておいてほしいこと</p>
          <ul role="list" className="promise__list">
            <li>高価なシューズやウォッチは、最初はいりません。</li>
            <li>歩いてもいい。歩きながら走るのも、立派なランニングです。</li>
            <li>痛みは、がんばりのしるしではありません。止まる合図です。</li>
          </ul>
          <p>
            <Link href="/tools/shoe-finder" className="text-link">
              シューズ選びに迷ったら、診断へ <Arrow />
            </Link>
          </p>
        </div>
      </section>
    </CategoryHub>
  );
}
