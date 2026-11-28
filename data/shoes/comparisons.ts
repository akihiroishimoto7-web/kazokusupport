/**
 * シリーズをまたいで比べるモデルの組み合わせ（運営者の優先比較）。
 * 両方のモデルが data/shoes/models にあるときだけ /shoes/models/<a>-vs-<b> ができる。
 */
export const comparisons: { a: string; b: string; why: string }[] = [
  { a: "hoka-clifton-10", b: "on-cloudmonster-3", why: "毎日のジョグで、厚いクッションのシューズを探している人がよく迷う2足" },
  { a: "adidas-adizero-evo-sl", b: "nb-rebel-v5", why: "軽さと弾む反発で、スピード練習にも使えるトレーナーとして比べられる2足" },
];
