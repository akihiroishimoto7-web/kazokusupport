/** サイトの主要な入口。ヘッダー・メニュー・フッターで共通に使います */
export const mainNav = [
  { href: "/start", label: "はじめてのランニング", short: "はじめて", note: "最初の一歩と、最初の1か月" },
  { href: "/shoes", label: "ランニングシューズ研究所", short: "シューズ", note: "悩みから探す、合う一足" },
  { href: "/gear", label: "ランニングの道具箱", short: "道具箱", note: "暮らしに合わせた道具選び" },
  { href: "/courses", label: "広島ランニングコース図鑑", short: "広島のコース", note: "川の街を走る" },
  { href: "/care", label: "壊れず、強くなる", short: "からだ", note: "長く走るための、からだの話" },
  { href: "/race", label: "はじめてのマラソン大会", short: "大会", note: "5kmから、いつかのフルまで" },
  { href: "/essays", label: "走ること、生きること", short: "読みもの", note: "走りながら考えたこと" },
] as const;

export const subNav = [
  { href: "/tools", label: "診断とツール" },
  { href: "/about", label: "運営者について" },
  { href: "/policy", label: "編集方針・広告について" },
  { href: "/credits", label: "写真のクレジット" },
] as const;
