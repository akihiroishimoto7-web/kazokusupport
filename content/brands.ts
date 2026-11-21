import type { Brand, BrandId, ShoePurpose, ShoePurposeId } from "@/lib/types";

/** メーカー一覧（表示順） */
export const brands: Brand[] = [
  { id: "asics", name: "ASICS", nameJa: "アシックス", officialUrl: "https://www.asics.com/jp/ja-jp/" },
  { id: "nike", name: "Nike", nameJa: "ナイキ", officialUrl: "https://www.nike.com/jp/" },
  { id: "newbalance", name: "New Balance", nameJa: "ニューバランス", officialUrl: "https://shop.newbalance.jp/" },
  { id: "hoka", name: "HOKA", nameJa: "ホカ", officialUrl: "https://www.hoka.com/jp/" },
  { id: "adidas", name: "adidas", nameJa: "アディダス", officialUrl: "https://www.adidas.jp/" },
  { id: "on", name: "On", nameJa: "オン", officialUrl: "https://www.on.com/ja-jp" },
  { id: "brooks", name: "Brooks", nameJa: "ブルックス", officialUrl: "https://brooksrunning.co.jp/" },
  { id: "mizuno", name: "Mizuno", nameJa: "ミズノ", officialUrl: "https://jpn.mizuno.com/" },
  { id: "saucony", name: "Saucony", nameJa: "サッカニー", officialUrl: "https://saucony.jp/" },
];

export function getBrand(id: BrandId): Brand {
  const b = brands.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown brand: ${id}`);
  return b;
}

/**
 * 用途・悩みから探すための分類。
 * question は読者の言葉、title は分類名です。
 */
export const shoePurposes: ShoePurpose[] = [
  {
    id: "first",
    title: "はじめての一足",
    question: "何を買えばいいのか、まったく分からない",
    summary:
      "最初の一足に求めたいのは、速さではなく「痛くならないこと」と「また履きたくなること」です。極端な厚底や軽さより、足をやさしく受け止めてくれるクッションと、かかとがぐらつかない安定感を優先します。",
    points: [
      "足の長さだけでなく、幅（ワイズ）も合うものを選ぶ",
      "つま先に指一本ぶん程度の余裕があるか、店頭で確かめる",
      "最新モデルでなくてもいい。型落ちでも十分に役目を果たします",
      "可能なら夕方、ランニング用の靴下を履いて試し履きする",
    ],
    caution:
      "カーボンプレート入りのレース用シューズは、はじめての一足には向かないことが多いです。走り方が定まる前は、扱いやすい練習用のシューズから。",
  },
  {
    id: "easy",
    title: "ゆっくりジョギング",
    question: "おしゃべりできるくらいのペースで、気持ちよく走りたい",
    summary:
      "ゆっくり走るときは、一歩一歩の着地時間が長くなります。地面からの衝撃をやわらかく受け止めるクッションと、なめらかに転がる形状のシューズが楽です。",
    points: ["軽さより、着地のやわらかさを優先する", "かかとから着地しても違和感がないものを", "毎日履くなら耐久性も見る"],
  },
  {
    id: "cushion",
    title: "クッション重視",
    question: "脚や膝への負担をできるだけ減らしたい",
    summary:
      "クッションの厚いシューズは、長い時間走ったときの脚の疲れを和らげてくれることがあります。ただし、柔らかすぎると足元が不安定に感じる人もいます。",
    points: ["柔らかさと安定感のバランスを試し履きで確かめる", "厚底でも幅が広く、ぐらつきにくい形を選ぶ", "重さとのかね合いも考える"],
    caution: "クッションが厚いことと、けがをしないことは同じではありません。痛みが続くときは、シューズより先に医療機関へ。",
  },
  {
    id: "stability",
    title: "安定性重視",
    question: "足首が内側に倒れる、ぐらつく感じがある",
    summary:
      "着地したときに足首が内側へ倒れ込みやすい人や、疲れてくるとフォームが崩れやすい人には、かかとまわりの支えがしっかりした「スタビリティ」と呼ばれるタイプが選択肢になります。",
    points: ["かかとを包むカウンターの硬さを確かめる", "土踏まずの支えが当たりすぎないか確かめる", "必要以上に安定機能の強いモデルを選ばない"],
    caution: "倒れ込みの程度は自己判断が難しいところです。専門店での計測や、医療機関での相談も検討してください。",
  },
  {
    id: "long",
    title: "長い距離を走る",
    question: "10km以上、1時間以上走るようになってきた",
    summary:
      "走る時間が長くなるほど、後半の脚の疲れやすさが効いてきます。クッションの持続性、足当たりのやさしさ、ムレにくさが選ぶ基準になります。",
    points: ["後半に足がむくんでも当たらないサイズ感", "アッパーの縫い目や当たりの強さ", "練習で20km程度まで試してから本番で使う"],
  },
  {
    id: "marathon",
    title: "フルマラソン",
    question: "はじめてのフルマラソンを完走したい",
    summary:
      "完走を目指す人にとって大切なのは、35km以降も脚を守ってくれることです。速さを引き出すレース用シューズより、履き慣れた、クッションの残る一足を選ぶほうが安心な場合も多くあります。",
    points: ["本番で新品をおろさない。数十km履いて慣らしておく", "完走目標なら、練習用のクッションシューズで出るのも十分な選択", "サイズは練習の後半、足がむくんだ状態で確かめる"],
    caution: "厚底カーボンシューズは、脚の筋力やフォームによっては負担が増すと感じる人もいます。",
  },
  {
    id: "speed",
    title: "スピード練習",
    question: "少し速く走る練習を取り入れたい",
    summary:
      "インターバル走やテンポ走のような、速めのペースで走る練習用のシューズです。軽さと反発を重視したものが多く、ゆっくり走る日用とは使い分けるのが一般的です。",
    points: ["速い練習は週に1回程度でも十分", "まずは今のシューズで練習を始めてもいい", "軽いシューズほど耐久性は控えめなことが多い"],
    caution: "走り始めて数か月のうちは、速い練習そのものが必要ないことも多いです。",
  },
  {
    id: "value",
    title: "コストパフォーマンス",
    question: "予算を抑えて、それでもちゃんとした一足がほしい",
    summary:
      "ランニングシューズは、最新モデルより一世代前のモデルや、メーカーのエントリーモデルでも十分に走れます。高い一足より、合った一足。それがいちばんの節約です。",
    points: ["型落ちモデルは価格が下がりやすい", "エントリーモデルは週末ジョグには十分", "サイズが合わないまま安さで選ばない"],
  },
];

export function getPurpose(id: ShoePurposeId): ShoePurpose {
  const p = shoePurposes.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown purpose: ${id}`);
  return p;
}
