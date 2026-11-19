import Link from "next/link";
import { CategoryHub } from "@/components/CategoryHub";
import { Arrow } from "@/components/Arrow";
import { categories } from "@/content/categories";
import { buildMetadata } from "@/lib/seo";

const cat = categories.race;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path, photo: cat.photo });

export default function RacePage() {
  return (
    <CategoryHub id="race">
      <section className="wrap hub__section" aria-labelledby="race-tools">
        <h2 className="hub__h2" id="race-tools">
          大会の準備に使えるツール
        </h2>
        <ul role="list" className="tool-links">
          <li>
            <Link href="/tools/pace" className="tool-link">
              <span className="tool-link__t">マラソンペース計算機</span>
              <span className="tool-link__d">目標タイムから、1kmあたりのペースと通過タイムを</span>
              <Arrow />
            </Link>
          </li>
          <li>
            <Link href="/tools/race-checklist" className="tool-link">
              <span className="tool-link__t">大会持ち物チェックリスト</span>
              <span className="tool-link__d">前日と当日の朝に、ひとつずつ確認</span>
              <Arrow />
            </Link>
          </li>
        </ul>
      </section>
    </CategoryHub>
  );
}
