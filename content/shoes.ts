import type { BrandId, Fact, Rating, Shoe, ShoePurposeId, ShoeTrait, ShopLinks } from "@/lib/types";
import { currentModel, usesNonOfficial, withModelData } from "../lib/shoe-db.ts";

/**
 * シューズ台帳
 * ------------------------------------------------------------------
 * 現在登録しているのは、すべて「シリーズの位置づけ」だけをまとめた outline です。
 * 価格・重量・厚さ・ドロップは、メーカー公式で確認するまで null（画面では「未確認」）にしています。
 * outline のページは検索エンジンに登録されません（noindex）。
 *
 * レビューを公開するときの手順:
 *   1. model に世代まで含めた名前を入れる（例: "NOVABLAST 5"）
 *   2. specs の各値を入れ、公式サイトで確認したら verified: true と source を入れる
 *   3. 実際に履いたら worn に、第三者レビューを調べたら research に書く（混ぜない）
 *   4. ratings の basis を "worn"（履いた）か "research"（調査）にする
 *   5. status を "review" に、checkedAt に確認日を入れる
 */

const unknown = <T,>(): Fact<T> => ({ value: null, verified: false });
const noRating: Rating = { score: null, basis: null };

type OutlineInput = {
  slug: string;
  brand: BrandId;
  series: string;
  purposes: ShoePurposeId[];
  traits: ShoeTrait[];
  catch: string;
  positioning: string;
  bestFor: string[];
  recommendFor: string[];
  notFor: string[];
  reasonsNotToBuy: string[];
  cautions?: string[];
  similar: string[];
  links?: ShopLinks;
};

function outline(input: OutlineInput): Shoe {
  const query = `${input.brand === "newbalance" ? "ニューバランス" : ""} ${input.series} ランニングシューズ`.trim();
  return {
    model: null,
    status: "outline",
    specs: {
      priceJpy: unknown(),
      weightG: unknown(),
      stackHeelMm: unknown(),
      stackForefootMm: unknown(),
      dropMm: unknown(),
    },
    ratings: { cushion: noRating, stability: noRating, response: noRating, fit: noRating },
    worn: null,
    research: null,
    sources: [],
    checkedAt: null,
    updatedAt: "2026-11-18",
    cautions: [],
    links: { rakuten: query, amazon: query, yahoo: query },
    ...input,
  };
}

/** 共通で使う「買わなくてもよい理由」 */
const NOT_NEEDED_IF_FINE = "いま履いているシューズで痛みや不満がなければ、買い替える必要はありません。";
const OLDER_MODEL_IS_FINE = "新しい世代が出ても、一つ前のモデルで十分に走れます。価格が下がった旧モデルも検討してください。";

export const shoes: Shoe[] = [
  /* ------------------------------------------------------------ ASICS */
  outline({
    slug: "asics-novablast",
    brand: "asics",
    series: "NOVABLAST",
    purposes: ["first", "easy", "cushion", "long"],
    traits: ["neutral", "bouncy", "soft"],
    catch: "弾むように進む、日々のジョグの相棒",
    positioning:
      "アシックスのデイリートレーナーとして知られるシリーズ。厚めのクッションに、跳ね返るような感覚を持たせているのが特徴とされています。",
    bestFor: ["毎日のジョギング", "ゆっくりから少し速めまで幅広く"],
    recommendFor: ["一足で色々な練習をこなしたい人", "クッションがありつつ、重たい靴は避けたい人"],
    notFor: ["足首の倒れ込みが強く、しっかりした支えがほしい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "弾む感覚が合わず、落ち着いた履き心地を好む人には別の選択肢があります。", OLDER_MODEL_IS_FINE],
    similar: ["nike-pegasus", "saucony-ride", "brooks-ghost"],
  }),
  outline({
    slug: "asics-gel-nimbus",
    brand: "asics",
    series: "GEL-NIMBUS",
    purposes: ["cushion", "easy", "long", "marathon"],
    traits: ["neutral", "max-cushion", "soft", "wide-option"],
    catch: "やわらかさを優先した、長く走る日のための一足",
    positioning: "アシックスのクッション性を重視したシリーズとして長く続いているモデル。足当たりのやさしさを優先した作りで知られています。",
    bestFor: ["ゆっくり長く走る日", "脚の疲れを抑えたいとき"],
    recommendFor: ["着地のやわらかさを最優先したい人", "長い距離をゆっくり走ることが多い人"],
    notFor: ["軽いシューズで速いペースの練習をしたい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "上位のクッションモデルは価格も高めです。週に数回のジョグなら、より手頃なモデルでも十分なことがあります。"],
    similar: ["asics-gel-kayano", "nb-1080", "hoka-bondi", "brooks-glycerin"],
  }),
  outline({
    slug: "asics-gel-kayano",
    brand: "asics",
    series: "GEL-KAYANO",
    purposes: ["stability", "cushion", "long", "marathon"],
    traits: ["stability", "max-cushion", "wide-option"],
    catch: "支えとクッションを両立した、安定性のシリーズ",
    positioning: "アシックスの安定性（スタビリティ）を重視したシリーズの代表格として知られています。足首の倒れ込みを抑える支えと、厚めのクッションを組み合わせています。",
    bestFor: ["長い距離をゆっくり走る日", "疲れてフォームが崩れやすい後半"],
    recommendFor: ["着地で足首が内側に倒れやすいと言われたことがある人", "膝や足首のぐらつきが気になる人"],
    notFor: ["倒れ込みが気にならず、軽快さを求める人"],
    reasonsNotToBuy: [
      NOT_NEEDED_IF_FINE,
      "足の倒れ込みが気にならない人にとって、安定機能は必須ではありません。より軽いモデルで十分なことがあります。",
      "価格帯は高めです。同じメーカーの GT-2000 シリーズも比較してみてください。",
    ],
    cautions: ["痛みの原因がシューズとは限りません。痛みが続く場合は医療機関に相談してください。"],
    similar: ["asics-gt-2000", "brooks-adrenaline", "saucony-guide", "hoka-arahi"],
  }),
  outline({
    slug: "asics-gt-2000",
    brand: "asics",
    series: "GT-2000",
    purposes: ["first", "stability", "easy", "value"],
    traits: ["stability", "wide-option"],
    catch: "はじめての安定性シューズに、手の届く選択肢",
    positioning: "アシックスの安定性シリーズの中で、上位モデルより手頃な価格帯に位置づけられてきたシリーズです。",
    bestFor: ["週に数回のジョギング", "はじめての一足"],
    recommendFor: ["足首のぐらつきが少し気になる初心者", "予算を抑えつつ支えのあるシューズがほしい人"],
    notFor: ["とにかく軽いシューズがほしい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "倒れ込みが気にならない人は、ニュートラルなクッションシューズでも問題ありません。"],
    similar: ["asics-gel-kayano", "mizuno-wave-inspire", "brooks-adrenaline"],
  }),
  outline({
    slug: "asics-jolt",
    brand: "asics",
    series: "JOLT",
    purposes: ["first", "value"],
    traits: ["neutral", "budget", "wide-option"],
    catch: "まず走ってみたい人のための、エントリーモデル",
    positioning: "アシックスのエントリー（入門）クラスとして展開されているシリーズ。手頃な価格で、ウォーキングと軽いジョギングを想定した作りです。",
    bestFor: ["ウォーキングとジョギングの組み合わせ", "週末の短いジョグ"],
    recommendFor: ["続くかどうか分からないので、まずは手頃に始めたい人"],
    notFor: ["すでに週に何度も、長い距離を走っている人"],
    reasonsNotToBuy: ["手持ちのスニーカーで数回歩いて・走ってみてから決めても遅くありません。", "走る距離が伸びてきたら、クッションのある上位モデルへの買い替えを考える時期が早く来る可能性があります。"],
    similar: ["adidas-duramo", "nike-revolution"],
  }),
  /* ------------------------------------------------------------ Nike */
  outline({
    slug: "nike-pegasus",
    brand: "nike",
    series: "Pegasus",
    purposes: ["first", "easy", "long"],
    traits: ["neutral", "wide-option"],
    catch: "長く愛されてきた、ナイキの定番トレーニングシューズ",
    positioning: "ナイキのランニングシューズの中で、長い歴史を持つ定番のトレーニングシリーズです。日々の練習に幅広く使える万能型として知られています。",
    bestFor: ["毎日のジョギング", "ジョグから少し速めのペースまで"],
    recommendFor: ["一足目に、癖の少ないシューズを選びたい人"],
    notFor: ["とにかく柔らかいクッションを求める人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, OLDER_MODEL_IS_FINE],
    similar: ["asics-novablast", "brooks-ghost", "mizuno-wave-rider"],
  }),
  outline({
    slug: "nike-vomero",
    brand: "nike",
    series: "Vomero",
    purposes: ["cushion", "easy", "long"],
    traits: ["neutral", "max-cushion", "soft"],
    catch: "ナイキの中で、クッションを重視したシリーズ",
    positioning: "ナイキのランニングシューズの中で、クッション性を重視したシリーズとして展開されています。",
    bestFor: ["ゆっくり長く走る日"],
    recommendFor: ["脚への衝撃をやわらげたい人", "ナイキの足型が合う人"],
    notFor: ["軽さを最優先したい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "ナイキは細身に感じる人もいます。幅が合うかは必ず試し履きで確かめてください。"],
    similar: ["asics-gel-nimbus", "nb-1080", "hoka-clifton"],
  }),
  outline({
    slug: "nike-revolution",
    brand: "nike",
    series: "Revolution",
    purposes: ["first", "value"],
    traits: ["neutral", "budget"],
    catch: "手頃に始めるための、ナイキの入門シリーズ",
    positioning: "ナイキのランニングシューズの中で、手頃な価格帯の入門用として展開されているシリーズです。",
    bestFor: ["ウォーキングと短いジョギング"],
    recommendFor: ["まずは手頃な価格で始めたい人"],
    notFor: ["週に何度も長い距離を走る人"],
    reasonsNotToBuy: ["走る習慣が定着してから、クッションのあるモデルを選ぶ方法もあります。"],
    similar: ["asics-jolt", "adidas-duramo"],
  }),
  /* ------------------------------------------------------------ New Balance */
  outline({
    slug: "nb-1080",
    brand: "newbalance",
    series: "Fresh Foam X 1080",
    purposes: ["cushion", "easy", "long", "marathon"],
    traits: ["neutral", "max-cushion", "soft", "wide-option"],
    catch: "ニューバランスのクッションを代表するシリーズ",
    positioning: "ニューバランスのランニングシューズの中で、クッション性を重視した上位シリーズとして知られています。幅の選択肢が用意されることが多いのも特徴です。",
    bestFor: ["ゆっくり長く走る日", "フルマラソンを完走したい人の練習"],
    recommendFor: ["幅広の足で、合うクッションシューズを探している人"],
    notFor: ["軽快さやスピードを重視する人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "上位モデルは価格も上がります。同じメーカーの 880 シリーズも比較を。"],
    similar: ["asics-gel-nimbus", "nike-vomero", "brooks-glycerin"],
  }),
  outline({
    slug: "nb-880",
    brand: "newbalance",
    series: "Fresh Foam X 880",
    purposes: ["first", "easy", "value"],
    traits: ["neutral", "wide-option"],
    catch: "毎日履ける、落ち着いた万能型",
    positioning: "ニューバランスのデイリートレーナーとして展開されているシリーズ。癖の少ない、毎日の練習向けの作りとされています。",
    bestFor: ["毎日のジョギング", "はじめての一足"],
    recommendFor: ["落ち着いた履き心地を好む人", "幅の選択肢があるシューズを探している人"],
    notFor: ["弾むような感覚を求める人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, OLDER_MODEL_IS_FINE],
    similar: ["nike-pegasus", "brooks-ghost", "mizuno-wave-rider"],
  }),
  /* ------------------------------------------------------------ HOKA */
  outline({
    slug: "hoka-clifton",
    brand: "hoka",
    series: "Clifton",
    purposes: ["first", "easy", "cushion", "long"],
    traits: ["neutral", "max-cushion", "light", "wide-option"],
    catch: "厚いクッションと軽さを両立した、HOKAの定番",
    positioning: "HOKA の定番シリーズとして知られています。厚いクッションでありながら、重くなりすぎないバランスが特徴とされています。",
    bestFor: ["ゆっくりジョギング", "長い距離"],
    recommendFor: ["厚底のやわらかさを試してみたい人"],
    notFor: ["地面の感覚をしっかり感じたい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "厚底が合わず、不安定に感じる人もいます。購入前に店頭で数歩走ってみてください。"],
    similar: ["hoka-bondi", "nike-vomero", "on-cloudmonster"],
  }),
  outline({
    slug: "hoka-bondi",
    brand: "hoka",
    series: "Bondi",
    purposes: ["cushion", "easy"],
    traits: ["neutral", "max-cushion", "soft", "wide-option"],
    catch: "とにかく厚く、やわらかく。いたわる日のための一足",
    positioning: "HOKA の中でも、特に厚いクッションを持つシリーズとして知られています。ウォーキングやゆっくりしたジョグでも使われています。",
    bestFor: ["ゆっくりジョギング", "ウォーキングとの組み合わせ"],
    recommendFor: ["脚への衝撃をできるだけ和らげたい人"],
    notFor: ["軽さや速さを求める人"],
    reasonsNotToBuy: ["クッションが厚いほど、重さは増えがちです。軽さを重視するなら Clifton など他のシリーズも比較を。"],
    similar: ["hoka-clifton", "asics-gel-nimbus", "brooks-glycerin"],
  }),
  outline({
    slug: "hoka-arahi",
    brand: "hoka",
    series: "Arahi",
    purposes: ["stability", "easy"],
    traits: ["stability", "light"],
    catch: "軽やかさを残した、HOKAの安定性シリーズ",
    positioning: "HOKA の安定性（スタビリティ）を担うシリーズとして展開されています。",
    bestFor: ["毎日のジョギング"],
    recommendFor: ["支えはほしいけれど、重い靴は避けたい人"],
    notFor: ["倒れ込みが気にならない人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "倒れ込みが気にならない人は、Clifton のようなニュートラルなモデルでも十分です。"],
    similar: ["asics-gt-2000", "saucony-guide", "brooks-adrenaline"],
  }),
  /* ------------------------------------------------------------ adidas */
  outline({
    slug: "adidas-adizero-boston",
    brand: "adidas",
    series: "ADIZERO BOSTON",
    purposes: ["speed", "marathon", "long"],
    traits: ["neutral", "bouncy", "light"],
    catch: "少し速く走る練習と、レースのあいだに",
    positioning: "アディダスの ADIZERO シリーズの中で、スピード練習や長い距離の練習にも使われるモデルとして知られています。",
    bestFor: ["テンポ走", "マラソンに向けた長めの練習"],
    recommendFor: ["ジョグ用とは別に、少し速く走る日のシューズがほしい人"],
    notFor: ["走り始めたばかりの人の最初の一足"],
    reasonsNotToBuy: ["速い練習をまだしていないなら、急いで買う必要はありません。", "まずはジョグ用の一足を履きつぶしてから検討しても遅くありません。"],
    similar: ["saucony-endorphin-speed", "asics-novablast"],
  }),
  outline({
    slug: "adidas-duramo",
    brand: "adidas",
    series: "DURAMO",
    purposes: ["first", "value"],
    traits: ["neutral", "budget", "light"],
    catch: "手頃な価格で始める、アディダスの入門モデル",
    positioning: "アディダスのランニングシューズの中で、手頃な価格帯の入門用として展開されているシリーズです。",
    bestFor: ["ウォーキングと短いジョギング"],
    recommendFor: ["予算を抑えて始めたい人"],
    notFor: ["長い距離を頻繁に走る人"],
    reasonsNotToBuy: ["走る距離が伸びてきたら、クッションのあるモデルへの買い替えを考えることになります。"],
    similar: ["asics-jolt", "nike-revolution"],
  }),
  /* ------------------------------------------------------------ On */
  outline({
    slug: "on-cloudmonster",
    brand: "on",
    series: "Cloudmonster",
    purposes: ["cushion", "easy", "long"],
    traits: ["neutral", "max-cushion", "bouncy"],
    catch: "On らしさを、厚いクッションで",
    positioning: "On のランニングシューズの中で、クッション性を重視したシリーズとして展開されています。",
    bestFor: ["ゆっくり長めのジョグ"],
    recommendFor: ["On の履き心地が好きで、クッションを求める人"],
    notFor: ["予算を抑えたい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "デザインで選びたくなるシューズですが、走るためには足に合うかどうかを優先してください。"],
    similar: ["hoka-clifton", "asics-novablast"],
  }),
  /* ------------------------------------------------------------ Brooks */
  outline({
    slug: "brooks-ghost",
    brand: "brooks",
    series: "Ghost",
    purposes: ["first", "easy", "long"],
    traits: ["neutral", "wide-option"],
    catch: "癖が少なく、毎日に寄り添うニュートラルな一足",
    positioning: "ブルックスの定番のニュートラルシューズとして知られ、毎日の練習向けのシリーズです。",
    bestFor: ["毎日のジョギング", "はじめての一足"],
    recommendFor: ["癖の少ない履き心地を求める人"],
    notFor: ["弾むような反発を求める人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, OLDER_MODEL_IS_FINE],
    similar: ["nike-pegasus", "nb-880", "saucony-ride"],
  }),
  outline({
    slug: "brooks-adrenaline",
    brand: "brooks",
    series: "Adrenaline GTS",
    purposes: ["stability", "easy", "first"],
    traits: ["stability", "wide-option"],
    catch: "支えのあるシューズの、定番のひとつ",
    positioning: "ブルックスの安定性シリーズとして長く展開されている定番モデルです。",
    bestFor: ["毎日のジョギング"],
    recommendFor: ["足首のぐらつきが気になる人"],
    notFor: ["倒れ込みが気にならず、軽快さを求める人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "倒れ込みが気にならない人は、同じメーカーの Ghost でも十分なことがあります。"],
    similar: ["asics-gt-2000", "asics-gel-kayano", "saucony-guide"],
  }),
  outline({
    slug: "brooks-glycerin",
    brand: "brooks",
    series: "Glycerin",
    purposes: ["cushion", "long", "easy"],
    traits: ["neutral", "max-cushion", "soft"],
    catch: "ブルックスのクッションを重視したシリーズ",
    positioning: "ブルックスの中で、クッション性を重視した上位シリーズとして展開されています。",
    bestFor: ["ゆっくり長く走る日"],
    recommendFor: ["やわらかな履き心地を求める人"],
    notFor: ["価格を抑えたい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "同じメーカーの Ghost でも、多くのジョグには十分なクッションがあります。"],
    similar: ["asics-gel-nimbus", "nb-1080", "hoka-bondi"],
  }),
  /* ------------------------------------------------------------ Mizuno */
  outline({
    slug: "mizuno-wave-rider",
    brand: "mizuno",
    series: "WAVE RIDER",
    purposes: ["first", "easy", "long"],
    traits: ["neutral", "wide-option"],
    catch: "長く作り続けられてきた、ミズノの定番",
    positioning: "ミズノのランニングシューズの中で、長い歴史を持つ定番のトレーニングシリーズです。",
    bestFor: ["毎日のジョギング"],
    recommendFor: ["国内メーカーの足型を試したい人", "安定した履き心地を好む人"],
    notFor: ["とにかく柔らかい厚底を求める人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, OLDER_MODEL_IS_FINE],
    similar: ["nike-pegasus", "brooks-ghost", "nb-880"],
  }),
  outline({
    slug: "mizuno-wave-inspire",
    brand: "mizuno",
    series: "WAVE INSPIRE",
    purposes: ["stability", "easy"],
    traits: ["stability", "wide-option"],
    catch: "ミズノの安定性シリーズ",
    positioning: "ミズノのランニングシューズの中で、安定性を重視したシリーズとして展開されています。",
    bestFor: ["毎日のジョギング"],
    recommendFor: ["足首のぐらつきが気になる人"],
    notFor: ["軽さを最優先したい人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE],
    similar: ["asics-gt-2000", "brooks-adrenaline", "saucony-guide"],
  }),
  /* ------------------------------------------------------------ Saucony */
  outline({
    slug: "saucony-ride",
    brand: "saucony",
    series: "RIDE",
    purposes: ["first", "easy"],
    traits: ["neutral"],
    catch: "サッカニーの、毎日のためのシューズ",
    positioning: "サッカニーのデイリートレーナーとして展開されているシリーズです。",
    bestFor: ["毎日のジョギング"],
    recommendFor: ["癖の少ないシューズを探している人"],
    notFor: ["厚いクッションを最優先する人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, OLDER_MODEL_IS_FINE],
    similar: ["brooks-ghost", "nike-pegasus", "asics-novablast"],
  }),
  outline({
    slug: "saucony-guide",
    brand: "saucony",
    series: "GUIDE",
    purposes: ["stability", "easy"],
    traits: ["stability"],
    catch: "サッカニーの安定性シリーズ",
    positioning: "サッカニーの安定性（スタビリティ）を担うシリーズとして展開されています。",
    bestFor: ["毎日のジョギング"],
    recommendFor: ["支えのあるシューズを試したい人"],
    notFor: ["倒れ込みが気にならない人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE],
    similar: ["asics-gt-2000", "brooks-adrenaline", "hoka-arahi"],
  }),
  outline({
    slug: "saucony-endorphin-speed",
    brand: "saucony",
    series: "ENDORPHIN SPEED",
    purposes: ["speed", "marathon"],
    traits: ["neutral", "light", "bouncy", "plate"],
    catch: "速く走る練習のための、プレート入りトレーナー",
    positioning: "サッカニーのスピード練習向けのシリーズとして知られ、プレートを内蔵した作りとされています。",
    bestFor: ["テンポ走", "レースに向けた練習"],
    recommendFor: ["ジョグ用とは別に、速く走る日の一足がほしい中級者"],
    notFor: ["走り始めたばかりの人"],
    reasonsNotToBuy: ["速い練習をしていないなら、必要ありません。", "プレート入りのシューズは、脚の使い方によっては合わない人もいます。"],
    similar: ["adidas-adizero-boston"],
  }),
  outline({
    slug: "nb-rebel",
    brand: "newbalance",
    series: "FuelCell Rebel",
    purposes: ["speed", "easy"],
    traits: ["neutral", "light", "bouncy"],
    catch: "軽さと弾みで、少し速く走る日に",
    positioning: "ニューバランスの FuelCell シリーズの中で、軽さと反発を持たせたトレーニングシューズとして知られています。",
    bestFor: ["少し速めのジョグ", "テンポ走"],
    recommendFor: ["ジョグ用とは別に、軽快に走れる一足がほしい人"],
    notFor: ["走り始めたばかりで、まず安定感を求める人"],
    reasonsNotToBuy: [NOT_NEEDED_IF_FINE, "速い練習をまだしていないなら、急いで買う必要はありません。"],
    similar: ["adidas-adizero-boston", "saucony-endorphin-speed", "asics-novablast"],
  }),
  outline({
    slug: "adidas-adizero-evo-sl",
    brand: "adidas",
    series: "ADIZERO EVO SL",
    purposes: ["speed", "marathon"],
    traits: ["neutral", "light", "bouncy"],
    catch: "レースの技術を、毎日の練習へ",
    positioning: "アディダスの ADIZERO シリーズの中で、軽さを重視したトレーニング向けのモデルとして展開されています。",
    bestFor: ["テンポ走", "レースに向けた練習"],
    recommendFor: ["軽いシューズで速めのペースの練習をしたい中級者"],
    notFor: ["走り始めたばかりの人の最初の一足"],
    reasonsNotToBuy: ["速い練習をしていないなら、必要ありません。", "まずはジョグ用の一足を履きつぶしてから検討しても遅くありません。"],
    similar: ["adidas-adizero-boston", "nb-rebel", "saucony-endorphin-speed"],
  }),
];

/* ------------------------------------------------------------------
 * メーカー公式サイトで確認した情報（2026年11月22日）
 * 価格は公式商品ページの表示をそのまま記載。
 * 重量・ドロップ・厚さは公式ページを自動で読み取った要約から得た値のため「要確認」としています。
 * ------------------------------------------------------------------ */
const NIKE_PEGASUS_41 = {
  title: "ナイキ ペガサス 41 メンズ ロード ランニングシューズ（FD2722-016）",
  url: "https://www.nike.com/jp/t/%E3%83%8A%E3%82%A4%E3%82%AD-%E3%83%9A%E3%82%AC%E3%82%B5%E3%82%B9-41-%E3%83%A1%E3%83%B3%E3%82%BA-%E3%83%AD%E3%83%BC%E3%83%89-%E3%83%A9%E3%83%B3%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%B7%E3%83%A5%E3%83%BC%E3%82%BA-fCM7Mn/FD2722-016",
  publisher: "ナイキ公式サイト",
  checkedAt: "2026-11-22",
};
const NIKE_VOMERO_18 = {
  title: "ナイキ ボメロ 18 メンズ ロード ランニングシューズ（ワイド／IF0514-002）",
  url: "https://www.nike.com/jp/t/%E3%83%8A%E3%82%A4%E3%82%AD-%E3%83%9C%E3%83%A1%E3%83%AD-18-%E3%83%A1%E3%83%B3%E3%82%BA-%E3%83%AD%E3%83%BC%E3%83%89-%E3%83%A9%E3%83%B3%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%B7%E3%83%A5%E3%83%BC%E3%82%BA-%E3%83%AF%E3%82%A4%E3%83%89-6IUGLPEF/IF0514-002",
  publisher: "ナイキ公式サイト",
  checkedAt: "2026-11-22",
};
const SUMMARY_NOTE = "公式ページの記載を自動で読み取った値です。公式サイトで要確認";

function applyOfficial(slug: string, patch: Partial<Shoe>) {
  const i = shoes.findIndex((x) => x.slug === slug);
  if (i >= 0) shoes[i] = { ...shoes[i]!, ...patch };
}

applyOfficial("nike-pegasus", {
  model: "Pegasus 41",
  checkedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  specs: {
    priceJpy: { value: 16500, verified: true, source: NIKE_PEGASUS_41, note: "メンズ（FD2722-016）の公式サイト表示価格。セール時は変わります" },
    weightG: { value: 297, verified: false, size: "メンズ28cm", source: NIKE_PEGASUS_41, note: SUMMARY_NOTE },
    stackHeelMm: { value: null, verified: false, note: "公式ページで確認できませんでした" },
    stackForefootMm: { value: null, verified: false, note: "公式ページで確認できませんでした" },
    dropMm: { value: 10, verified: false, source: NIKE_PEGASUS_41, note: SUMMARY_NOTE },
  },
  research: {
    summary:
      "ナイキ公式サイトでは、用途を「ロードランニング」としています。メンズのほか、ウィメンズ、ジュニア、GORE-TEX モデルも展開されています（2026年11月22日、公式サイトで確認）。",
  },
  sources: [NIKE_PEGASUS_41],
  links: { rakuten: "ナイキ ペガサス 41", amazon: "ナイキ ペガサス 41", yahoo: "ナイキ ペガサス 41", official: NIKE_PEGASUS_41.url },
});

applyOfficial("nike-vomero", {
  model: "Vomero 18",
  checkedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  specs: {
    priceJpy: { value: 17600, verified: true, source: NIKE_VOMERO_18, note: "メンズ・ワイド（IF0514-002）の公式サイト通常価格。確認時はセール価格も表示されていました" },
    weightG: { value: 325, verified: false, size: "メンズ28cm（ワイド）", source: NIKE_VOMERO_18, note: SUMMARY_NOTE },
    stackHeelMm: { value: 46, verified: false, source: NIKE_VOMERO_18, note: SUMMARY_NOTE },
    stackForefootMm: { value: 36, verified: false, source: NIKE_VOMERO_18, note: SUMMARY_NOTE },
    dropMm: { value: 10, verified: false, source: NIKE_VOMERO_18, note: SUMMARY_NOTE },
  },
  research: {
    summary:
      "ナイキ公式サイトでは、用途を「ロードランニング」、特徴を「クッション」としています。通常幅とワイドが展開されています（2026年11月22日、公式サイトで確認）。",
  },
  sources: [NIKE_VOMERO_18],
  links: { rakuten: "ナイキ ボメロ 18", amazon: "ナイキ ボメロ 18", yahoo: "ナイキ ボメロ 18", official: NIKE_VOMERO_18.url },
});

/* ------------------------------------------------------------ 公式データベースを重ねる */
// data/shoes/（npm run shoes:collect で更新）の現行モデルの公式仕様・価格を、シリーズの情報に重ねます。
for (let i = 0; i < shoes.length; i++) shoes[i] = withModelData(shoes[i]!);

/** 自動取得が公式サイト側で拒否されているメーカー（data/shoes/targets.json の blocked と同じ） */
const BLOCKED_BRANDS = new Set(["asics", "adidas", "hoka", "newbalance"]);

/**
 * 公式仕様の確認状況（シューズ研究所のページに表示）。
 * status: confirmed … 公式ページで仕様・価格を確認済み / pending … まだ確認できていない
 */
export const modelsInResearch: { name: string; shoe: string; status: "confirmed" | "pending"; note: string }[] = shoes
  .filter((s) => s.status !== "draft")
  .map((s) => {
    const m = currentModel(s.slug);
    const brandName = s.brand === "newbalance" ? "New Balance" : s.brand === "on" ? "On" : s.brand.charAt(0).toUpperCase() + s.brand.slice(1);
    if (m) {
      const missing = (["weightG", "dropMm"] as const).filter((k) => !m.specs[k]).map((k) => (k === "weightG" ? "重量" : "ドロップ"));
      return {
        name: `${brandName} ${m.name}`,
        shoe: s.slug,
        status: "confirmed" as const,
        note: `${usesNonOfficial(m) ? "販売店・メディアの記載で仕様・価格を確認" : "公式の仕様・価格を確認"}（${m.checkedAt.replaceAll("-", ".")}）${missing.length ? `。${missing.join("・")}は未確認` : ""}`,
      };
    }
    return {
      name: `${brandName} ${s.series}`,
      shoe: s.slug,
      status: "pending" as const,
      note: BLOCKED_BRANDS.has(s.brand) ? "公式サイトの自動確認ができず、手作業での確認待ち" : "現行モデルの公式仕様を確認中",
    };
  })
  .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "confirmed" ? -1 : 1));

export const publicShoes = () => shoes.filter((s) => s.status !== "draft");
export const getShoe = (slug: string) => shoes.find((s) => s.slug === slug);
