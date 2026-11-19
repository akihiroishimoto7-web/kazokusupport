/**
 * 診断・ツールの一覧。
 * status が "live" のものだけリンクになります。"planned" は「準備中」と表示し、リンクは作りません。
 */
export type ToolInfo = {
  id: string;
  title: string;
  description: string;
  href: string;
  status: "live" | "planned";
  /** 質問の数・所要時間など */
  meta?: string;
};

export const tools: ToolInfo[] = [
  {
    id: "shoe-finder",
    title: "ランニングシューズ診断",
    description: "6つの質問に答えると、あなたに合うシューズのタイプと、その理由、候補のシリーズがわかります。",
    href: "/tools/shoe-finder",
    status: "live",
    meta: "質問6つ・約1分",
  },
  {
    id: "pace",
    title: "マラソンペース計算機",
    description: "目標タイムから1kmあたりのペースと通過タイムを、ペースからゴールタイムを計算します。",
    href: "/tools/pace",
    status: "live",
    meta: "5km・10km・ハーフ・フル",
  },
  {
    id: "race-checklist",
    title: "大会持ち物チェックリスト",
    description: "前日と当日朝に確認したい持ち物のリスト。チェックはこの端末に保存されます。",
    href: "/tools/race-checklist",
    status: "live",
    meta: "前日・当日朝・ゴール後",
  },
  {
    id: "watch-finder",
    title: "ランニングウォッチ診断",
    description: "使い方や予算から、必要な機能を整理する診断です。",
    href: "/tools/watch-finder",
    status: "planned",
  },
  {
    id: "bag-finder",
    title: "ランニングポーチ・リュック診断",
    description: "持ち物と走り方から、ポーチ・リュック・ベストのどれが合うかを整理します。",
    href: "/tools/bag-finder",
    status: "planned",
  },
  {
    id: "course-finder",
    title: "広島ランニングコース診断",
    description: "住んでいる場所や走りたい距離から、広島のコースを探します。コース情報の確認が進んでから公開します。",
    href: "/tools/course-finder",
    status: "planned",
  },
  {
    id: "plan",
    title: "初心者向け練習プラン作成",
    description: "週に走れる日数と目標から、無理のない4週間のプランを作ります。",
    href: "/tools/plan",
    status: "planned",
  },
];

export const liveTool = (id: string) => tools.find((t) => t.id === id && t.status === "live");
