import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RaceChecklist } from "@/components/tools/RaceChecklist";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "大会持ち物チェックリスト",
  description: "はじめてのマラソン大会の前日、当日の朝、ゴールのあとに確認したい持ち物のチェックリスト。",
  path: "/tools/race-checklist",
});

export default function ChecklistPage() {
  return (
    <div className="tool-page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "診断とツール", path: "/tools" },
            { name: "大会持ち物チェックリスト", path: "/tools/race-checklist" },
          ]}
        />
      </div>
      <div className="wrap tool-page__inner">
        <header className="tool-page__head">
          <p className="hub__catch">忘れものは、前の晩に。</p>
          <h1 className="hub__title">大会持ち物チェックリスト</h1>
          <p className="hub__intro">必要なものは大会によって違います。最終的には、大会から届く案内を必ず確認してください。</p>
        </header>
        <RaceChecklist />
        <p className="tool-page__foot">
          <Link href="/articles/race-first-race" className="text-link">
            はじめての大会の流れを読む
          </Link>
        </p>
      </div>
    </div>
  );
}
