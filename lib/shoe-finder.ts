import type { Shoe, ShoePurposeId } from "./types";

/**
 * ランニングシューズ診断のロジック
 * ------------------------------------------------------------------
 * - 収益性（紹介料・価格）は一切スコアに使いません。使うのは用途と特徴タグだけです。
 * - 同点の場合は slug のアルファベット順で並べます（恣意的な優先をしないため）。
 * - ロジックは純粋関数なので tests/shoe-finder.test.ts でテストしています。
 */

export type Answers = {
  experience: "none" | "some" | "regular";
  goal: "health" | "distance" | "speed";
  concern: "knee" | "wobble" | "none";
  feel: "soft" | "stable" | "light" | "unknown";
  width: "wide" | "normal" | "unknown";
  budget: "low" | "mid" | "any";
};

export type Question<K extends keyof Answers = keyof Answers> = {
  key: K;
  title: string;
  hint?: string;
  options: { value: Answers[K]; label: string; detail?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    key: "experience",
    title: "いま、どのくらい走っていますか？",
    options: [
      { value: "none", label: "これから始める", detail: "または、始めたばかり" },
      { value: "some", label: "ときどき走る", detail: "週に1〜2回ほど" },
      { value: "regular", label: "習慣になっている", detail: "週に3回以上、大会に出ることも" },
    ],
  },
  {
    key: "goal",
    title: "いちばんの目的は？",
    options: [
      { value: "health", label: "健康や気分転換", detail: "気持ちよく、続けられればいい" },
      { value: "distance", label: "長く走れるようになりたい", detail: "ハーフやフルの完走も気になる" },
      { value: "speed", label: "タイムを縮めたい", detail: "少し速く走る練習もしたい" },
    ],
  },
  {
    key: "concern",
    title: "走るときに、気になることは？",
    options: [
      { value: "knee", label: "膝や脚への負担", detail: "走ったあとに疲れや違和感が残る" },
      { value: "wobble", label: "足首のぐらつき", detail: "着地で内側に倒れやすいと言われた" },
      { value: "none", label: "とくにない" },
    ],
  },
  {
    key: "feel",
    title: "好きな履き心地は？",
    hint: "わからなければ「まだわからない」で大丈夫です。",
    options: [
      { value: "soft", label: "ふかふか、やわらかい" },
      { value: "stable", label: "しっかり、ぶれない" },
      { value: "light", label: "軽くて、軽快" },
      { value: "unknown", label: "まだわからない" },
    ],
  },
  {
    key: "width",
    title: "足の幅は？",
    options: [
      { value: "wide", label: "幅が広いほう", detail: "靴の小指側がきつくなりやすい" },
      { value: "normal", label: "ふつう" },
      { value: "unknown", label: "わからない" },
    ],
  },
  {
    key: "budget",
    title: "予算の考え方は？",
    options: [
      { value: "low", label: "できるだけ抑えたい" },
      { value: "mid", label: "標準的な価格帯で" },
      { value: "any", label: "合うものなら、価格は問わない" },
    ],
  },
];

export const PURPOSE_REASON: Record<ShoePurposeId, string> = {
  first: "走り始めの時期は、速さより「痛くならないこと」と「また履きたくなること」が大切です。扱いやすい、癖の少ないシューズから始めましょう。",
  easy: "健康や気分転換のためのジョギングには、着地がやさしく、毎日履いても疲れにくいデイリートレーナーが向いています。",
  cushion: "脚への負担が気になるなら、クッションに余裕のあるシューズが候補です。ただし、柔らかすぎて不安定に感じないかは必ず試し履きで確かめてください。",
  stability: "足首のぐらつきが気になるなら、かかとまわりの支えがしっかりした「安定性（スタビリティ）」タイプが候補です。倒れ込みの程度は自己判断が難しいので、専門店での計測もおすすめします。",
  long: "距離を伸ばしていく時期には、後半の脚を守ってくれるクッションと、長時間でも当たりにくい足当たりが大切です。",
  marathon: "フルマラソンの完走を目指すなら、35km以降も脚を守ってくれる、履き慣れたクッションシューズが心強い味方です。",
  speed: "少し速く走る練習には、軽さと反発のあるシューズが向いています。ゆっくり走る日用のシューズとは使い分けるのが一般的です。",
  value: "予算を抑えるなら、メーカーのエントリーモデルや、一世代前のモデルが十分な選択肢です。高い一足より、合う一足を。",
};

export function primaryPurpose(a: Answers): ShoePurposeId {
  if (a.concern === "wobble") return "stability";
  if (a.goal === "speed" && a.experience !== "none") return "speed";
  if (a.goal === "distance") return a.experience === "regular" ? "marathon" : "long";
  if (a.concern === "knee" || a.feel === "soft") return "cushion";
  if (a.budget === "low") return a.experience === "none" ? "first" : "value";
  if (a.experience === "none") return "first";
  return "easy";
}

export type Scored = { shoe: Shoe; score: number; reasons: string[] };

export function scoreShoes(shoes: Shoe[], a: Answers): Scored[] {
  const primary = primaryPurpose(a);
  const secondary = new Set<ShoePurposeId>();
  if (a.experience === "none") secondary.add("first");
  if (a.budget === "low") secondary.add("value");
  if (a.concern === "knee") secondary.add("cushion");
  if (a.goal === "health") secondary.add("easy");
  if (a.goal === "distance") secondary.add("long");
  secondary.delete(primary);

  const scored = shoes.map((shoe) => {
    let score = 0;
    const reasons: string[] = [];
    const t = new Set(shoe.traits);
    const p = new Set(shoe.purposes);

    if (p.has(primary)) {
      score += 4;
      reasons.push(`「${PURPOSE_LABEL[primary]}」に向くシリーズとして整理しています`);
    }
    for (const s of secondary) if (p.has(s)) score += 1;

    if (a.concern === "wobble") {
      if (t.has("stability")) {
        score += 3;
        reasons.push("かかとまわりの支えを重視した安定性タイプです");
      }
    } else if (t.has("stability")) {
      score -= 1;
    }

    if (a.concern === "knee" || a.feel === "soft") {
      if (t.has("max-cushion")) {
        score += 2;
        reasons.push("厚めのクッションで、着地の衝撃をやわらげる作りです");
      } else if (t.has("soft")) score += 1;
    }
    if (a.feel === "stable" && (t.has("stability") || (t.has("neutral") && !t.has("soft")))) {
      score += 1;
      reasons.push("落ち着いた、ぶれにくい履き心地が期待できるタイプです");
    }
    if (a.feel === "light" && t.has("light")) {
      score += 2;
      reasons.push("軽さを意識したシリーズです");
    }
    if (a.budget === "low" && t.has("budget")) {
      score += 3;
      reasons.push("メーカーの入門クラスで、手頃な価格帯のシリーズです");
    }
    if (a.width === "wide" && t.has("wide-option")) {
      score += 1;
      reasons.push("幅広のモデルが用意されることが多いシリーズです（現行モデルで要確認）");
    }
    if (t.has("plate") && (a.experience === "none" || a.goal !== "speed")) score -= 4;
    if (p.has("speed") && !p.has("easy") && a.goal !== "speed") score -= 3;
    if (t.has("budget") && a.experience === "regular") score -= 2;

    return { shoe, score, reasons };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || x.shoe.slug.localeCompare(y.shoe.slug));
}

export const PURPOSE_LABEL: Record<ShoePurposeId, string> = {
  first: "はじめての一足",
  easy: "ゆっくりジョギング",
  cushion: "クッション重視",
  stability: "安定性重視",
  long: "長い距離を走る",
  marathon: "フルマラソン",
  speed: "スピード練習",
  value: "コストパフォーマンス",
};

export function adviceFor(a: Answers): string[] {
  const out: string[] = [];
  if (a.experience === "none")
    out.push("最初の数週間は、歩きと走りを組み合わせるくらいで十分です。シューズも、まずは手頃なものからで構いません。");
  if (a.concern === "knee")
    out.push("膝の痛みが続く、腫れがあるといった場合は、シューズを替える前に医療機関に相談してください。");
  if (a.width === "wide" || a.width === "unknown")
    out.push("足の幅はメーカーやモデルで大きく違います。可能なら店頭で足を計測してもらい、幅（ワイズ）の選択肢があるかを確かめてください。");
  if (a.budget === "low") out.push("一世代前のモデルは、価格が下がっていることがよくあります。最新でなくても十分に走れます。");
  if (a.goal === "speed" && a.experience === "none")
    out.push("走り始めの時期は、速く走るためのシューズはまだ必要ありません。まずはジョグ用の一足で、走る習慣をつくりましょう。");
  out.push("どのシューズも、最後は試し履きで決めてください。夕方、ランニング用の靴下を履いて、つま先に指一本ぶんの余裕があるかを確かめます。");
  return out;
}

export function isComplete(a: Partial<Answers>): a is Answers {
  return QUESTIONS.every((q) => a[q.key] !== undefined);
}

/** URLのクエリから回答を復元（結果を共有・再訪できるように） */
export function answersFromParams(params: URLSearchParams): Partial<Answers> {
  const out: Partial<Answers> = {};
  for (const q of QUESTIONS) {
    const v = params.get(q.key);
    if (v && q.options.some((o) => o.value === v)) (out as Record<string, string>)[q.key] = v;
  }
  return out;
}
