import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PaceCalculator } from "@/components/tools/PaceCalculator";
import { PaceSimulator } from "@/components/tools/PaceSimulator";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "マラソンペース計算機",
  description: "目標タイムから1kmあたりのペースと通過タイムを、ペースからゴールタイムを計算します。5km・10km・ハーフ・フルマラソンに対応。",
  path: "/tools/pace",
});

export default function PacePage() {
  return (
    <div className="tool-page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "診断とツール", path: "/tools" },
            { name: "マラソンペース計算機", path: "/tools/pace" },
          ]}
        />
      </div>
      <div className="wrap tool-page__inner">
        <header className="tool-page__head">
          <p className="hub__catch">目標を、1kmずつに。</p>
          <h1 className="hub__title">マラソンペース計算機</h1>
          <p className="hub__intro">
            完走が目標なら、前半は計算したペースより少しゆっくり入るくらいでちょうどいいことが多いです。上り坂や給水でペースが落ちるのは自然なこと。数字は目安として使ってください。
          </p>
        </header>
        <section aria-labelledby="sim" className="ps-section">
          <h2 className="sc-h2" id="sim">
            ペース配分シミュレーター
          </h2>
          <p className="sc-note">目標タイムと配分を選ぶと、1kmごとのペースと5kmごとの通過タイムが変わります。</p>
          <PaceSimulator />
        </section>
        <section aria-labelledby="calc" className="ps-section">
          <h2 className="sc-h2" id="calc">
            かんたん計算
          </h2>
          <p className="sc-note">タイムからペース、ペースからタイムを、いろいろな距離で。</p>
          <PaceCalculator />
        </section>
        <p className="tool-page__foot">
          <Link href="/race" className="text-link">
            はじめてのマラソン大会へ
          </Link>
        </p>
      </div>
    </div>
  );
}
