import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShoeList } from "@/components/ShoeList";
import { Arrow } from "@/components/Arrow";
import { getPurpose, shoePurposes } from "@/content/brands";
import { publicShoes } from "@/content/shoes";
import { buildMetadata } from "@/lib/seo";
import type { ShoePurposeId } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => shoePurposes.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const p = shoePurposes.find((x) => x.id === id);
  if (!p) return {};
  return buildMetadata({ title: `${p.title}のランニングシューズの選び方`, description: p.summary, path: `/shoes/purpose/${p.id}` });
}

export default async function PurposePage({ params }: Params) {
  const { id } = await params;
  if (!shoePurposes.some((x) => x.id === id)) notFound();
  const p = getPurpose(id as ShoePurposeId);
  const list = publicShoes().filter((s) => s.purposes.includes(p.id));

  return (
    <div className="hub">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "ランニングシューズ研究所", path: "/shoes" },
            { name: p.title, path: `/shoes/purpose/${p.id}` },
          ]}
        />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">「{p.question}」</p>
          <h1 className="hub__title">{p.title}</h1>
          <p className="hub__intro">{p.summary}</p>
        </div>
      </header>
      <section className="wrap hub__section" aria-labelledby="points">
        <h2 className="hub__h2" id="points">
          選ぶときに見るところ
        </h2>
        <ol className="point-list">
          {p.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ol>
        {p.caution ? (
          <aside className="callout callout--caution">
            <p className="callout__label">
              <span>注意</span>
            </p>
            <div className="callout__body">
              <p>{p.caution}</p>
            </div>
          </aside>
        ) : null}
      </section>
      <section className="wrap hub__section" aria-labelledby="list">
        <h2 className="hub__h2" id="list">
          候補になるシリーズ
        </h2>
        <p className="hub__note">並び順はメーカー順です。紹介料や価格の高さで並べ替えることはしていません。</p>
        <ShoeList shoes={list} />
        <p className="section__more">
          <Link href="/tools/shoe-finder" className="text-link">
            質問に答えて絞り込む（シューズ診断） <Arrow />
          </Link>
        </p>
      </section>
    </div>
  );
}
