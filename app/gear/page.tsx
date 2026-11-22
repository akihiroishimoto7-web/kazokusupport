import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Arrow } from "@/components/Arrow";
import { categories } from "@/content/categories";
import { gearCategories, gearScenes } from "@/content/gear";
import { buildMetadata } from "@/lib/seo";

const cat = categories.gear;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path });

const NEED = {
  always: { label: "最初から", note: "あると助かる" },
  sometimes: { label: "場面による", note: "必要なときに" },
  later: { label: "慣れてから", note: "急がなくていい" },
} as const;

export default function GearPage() {
  const groups = (["always", "sometimes", "later"] as const).map((k) => ({
    key: k,
    items: gearCategories.filter((g) => g.needed === k),
  }));
  return (
    <div className="hub">
      <div className="wrap">
        <Breadcrumbs items={[{ name: cat.name, path: cat.path }]} />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">{cat.catch}</p>
          <h1 className="hub__title">{cat.name}</h1>
          <p className="hub__intro">{cat.intro}</p>
        </div>
      </header>

      <section className="wrap hub__section" aria-labelledby="scenes">
        <h2 className="hub__h2" id="scenes">
          こんなとき、何を持てばいい？
        </h2>
        <ol role="list" className="scene-index">
          {gearScenes.map((s) => (
            <li key={s.slug}>
              <Link href={`/gear/scene/${s.slug}`} className="scene-row">
                <span className="scene-row__body">
                  <span className="scene-row__t">{s.title}</span>
                  <span className="scene-row__d">{s.summary}</span>
                </span>
                <Arrow className="scene-row__arrow" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap hub__section" aria-labelledby="cats">
        <h2 className="hub__h2" id="cats">
          道具の種類から
        </h2>
        <p className="hub__note">「いつ必要になるか」で分けています。右にいくほど、急いで買う必要はありません。</p>
        <div className="need-columns">
          {groups.map((g) => (
            <section key={g.key} className="need-col" aria-label={NEED[g.key].label}>
              <p className="need-col__head">
                <span className="need-col__label">{NEED[g.key].label}</span>
                <span className="need-col__note">{NEED[g.key].note}</span>
              </p>
              <ul role="list">
                {g.items.map((it) => (
                  <li key={it.slug}>
                    <Link href={`/gear/${it.slug}`} className="gear-row">
                      <span className="gear-row__name">{it.name}</span>
                      <span className="gear-row__catch">{it.catch}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="wrap hub__section">
        <aside className="state-note">
          <p>
            個別の商品は、運営者が実際に使ったもの、または情報を確認できたものから順に掲載します。いまは選び方と、ショップの検索結果へのリンクを置いています。
          </p>
        </aside>
      </section>
    </div>
  );
}
