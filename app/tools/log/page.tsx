import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RunLog } from "@/components/tools/RunLog";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ランニング記録ノート｜距離・ペース・VO2maxを見える化",
  description: "走った距離とタイムを入れるだけで、週ごとの距離、ペースの移り変わり、時計のVO2maxをグラフにします。記録はこの端末にだけ保存されます。",
  path: "/tools/log",
});

export default function LogPage() {
  return (
    <div className="tool-page">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "診断とツール", path: "/tools" }, { name: "ランニング記録ノート", path: "/tools/log" }]} />
      </div>
      <div className="wrap tool-page__inner">
        <header className="tool-page__head">
          <p className="hub__catch">走ったぶんだけ、見えてくる。</p>
          <h1 className="hub__title">ランニング記録ノート</h1>
          <p className="hub__intro">
            距離とタイムを入れるだけ。週ごとの距離と、ペースの移り変わりがグラフになります。からだの状態を診断するものではありません。数字は、続けるための目安として。
          </p>
        </header>
        <RunLog />
        <p className="tool-page__foot">
          将来は、ヘルスケアアプリなどとの連携も検討しています。いまは手入力だけで使えます。
          <br />
          <Link href="/care" className="text-link">
            長く走るための記事
          </Link>
        </p>
      </div>
    </div>
  );
}
