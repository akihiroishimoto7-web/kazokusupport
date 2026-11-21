import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShoeList } from "@/components/ShoeList";
import { Arrow } from "@/components/Arrow";
import { brands } from "@/content/brands";
import { publicShoes } from "@/content/shoes";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => brands.map((b) => ({ id: b.id }));

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const b = brands.find((x) => x.id === id);
  if (!b) return {};
  return buildMetadata({
    title: `${b.name}（${b.nameJa}）のランニングシューズ`,
    description: `${b.nameJa}の主なランニングシューズのシリーズを、用途と向いている人から整理しています。`,
    path: `/shoes/brand/${b.id}`,
  });
}

export default async function BrandPage({ params }: Params) {
  const { id } = await params;
  const b = brands.find((x) => x.id === id);
  if (!b) notFound();
  const list = publicShoes().filter((s) => s.brand === b.id);
  return (
    <div className="hub">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "ランニングシューズ研究所", path: "/shoes" },
            { name: b.name, path: `/shoes/brand/${b.id}` },
          ]}
        />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <p className="hub__catch">{b.nameJa}</p>
          <h1 className="hub__title latin brand-title">{b.name}</h1>
          <p className="hub__intro">
            {b.nameJa}の主なシリーズを、用途と向いている人から整理しています。最新モデルの情報は
            <a href={b.officialUrl} target="_blank" rel="noopener noreferrer">
              メーカー公式サイト
              <Arrow dir="up-right" />
            </a>
            でご確認ください。
          </p>
        </div>
      </header>
      <section className="wrap hub__section">
        <ShoeList shoes={list} />
      </section>
    </div>
  );
}
