import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSpecs, priceFromJsonLd, looksOnSale, shopifyYen } from "../scripts/shoes/extract.mjs";
import { priceWithinBudget, scoreShoes, BUDGET_CAP } from "../lib/shoe-finder.ts";
import { comparablePairs, pairNotes, pairSlug, parsePairSlug } from "../lib/shoe-pairs.ts";
import { shoes } from "../content/shoes.ts";
import { db } from "../data/shoes/db.ts";
import { isIndexableShoe } from "../lib/shoe-db.ts";

/* ---------------------------------------------------------------- 公式ページからの抽出（各社の実際の書式） */

test("抽出: Nike（重量とオフセット、本文中の厚さ）", () => {
  const t = "シューズの重量\n重量：約325g（メンズサイズ28cm）\nオフセット：10mm\nボメロ 18にはボメロ 17よりも6mm高いミッドソールを採用し、レベルアップしたクッショニングを実現。前足部は36mm、かかとは46mmの厚みになっています。";
  const s = extractSpecs(t);
  assert.equal(s.weightG.value, 325);
  assert.equal(s.weightG.size, "メンズサイズ28cm");
  assert.equal(s.dropMm.value, 10);
  assert.equal(s.stackHeelMm.value, 46);
  assert.equal(s.stackForefootMm.value, 36);
});

test("抽出: On（ラベルと値が別の行、「〜とは？」を飛ばす）", () => {
  const s = extractSpecs("ドロップ\nドロップとは？\n\n6mm\n\n重さ\n重さとは？\n\n295g\n");
  assert.equal(s.dropMm.value, 6);
  assert.equal(s.weightG.value, 295);
  assert.equal(s.weightG.size, null);
});

test("抽出: ミズノ（タブ区切りの仕様表）", () => {
  const s = extractSpecs("原産国\tベトナム製\n質量\t約265g（27.0cm片方）\nインソール\tプレミアムインソール");
  assert.equal(s.weightG.value, 265);
  assert.equal(s.weightG.size, "27.0cm");
  assert.equal(s.dropMm, null, "書かれていない値は推測しない");
});

test("抽出: サッカニー（オフセットに厚さが併記）", () => {
  const s = extractSpecs("重量:\n255g\n\nオフセット:\n8mm（36mm/28mm)\n");
  assert.equal(s.weightG.value, 255);
  assert.equal(s.dropMm.value, 8);
  assert.equal(s.stackHeelMm.value, 36);
  assert.equal(s.stackForefootMm.value, 28);
});

test("抽出: ブルックス（スライダーの見出しは無視し、仕様行から取る）", () => {
  const s = extractSpecs("重さ\n軽い\n重い\n\nミッドソールドロップ : 10mm\n重さ : 290g (27cm)\n幅 : D（レギュラー）");
  assert.equal(s.weightG.value, 290);
  assert.equal(s.weightG.size, "27cm");
  assert.equal(s.weightG.evidence, "重さ : 290g (27cm)");
  assert.equal(s.dropMm.value, 10);
});

test("抽出: ありえない値は捨てる", () => {
  const s = extractSpecs("重量：約999g\nオフセット：40mm");
  assert.equal(s.weightG, null);
  assert.equal(s.dropMm, null);
});

test("価格: JSON-LD の最頻値、セール表示、Shopify の単位", () => {
  const ld = '{"offers":{"price":17600,"priceCurrency":"JPY"}} {"offers":{"priceCurrency":"JPY","price":"17600"}} {"price":9900,"priceCurrency":"JPY"}';
  assert.equal(priceFromJsonLd(ld), 17600);
  assert.equal(priceFromJsonLd('{"price":120,"priceCurrency":"USD"}'), null);
  assert.equal(looksOnSale("￥14,999\nセール価格\n高評価", 14999), true);
  assert.equal(looksOnSale("￥17,600\nサイズを選択", 17600), false);
  assert.equal(shopifyYen(2090000), 20900);
  assert.equal(shopifyYen("19800.00"), 19800);
  assert.equal(shopifyYen(null), null);
});

/* ---------------------------------------------------------------- データベースの整合性 */

test("DB: すべての値に根拠の行と確認日があり、厚さとドロップが矛盾しない", () => {
  const series = new Set(shoes.map((s) => s.slug));
  for (const m of db.models) {
    assert.ok(series.has(m.series), `${m.id}: series ${m.series} がない`);
    for (const [k, v] of Object.entries(m.specs)) {
      assert.ok(v.evidence && v.evidence.includes(String(v.value)), `${m.id}.${k}: 根拠の行に値が含まれていない`);
      assert.match(v.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
    const { stackHeelMm: h, stackForefootMm: f, dropMm: d } = m.specs;
    if (h && f && d) assert.equal(h.value - f.value, d.value, `${m.id}: 厚さの差とドロップが合わない`);
    if (m.officialPrice?.regularPriceJpy) assert.ok(m.officialPrice.priceJpy <= m.officialPrice.regularPriceJpy, `${m.id}: 販売価格が通常価格より高い`);
  }
  for (const s of series) {
    const cur = db.models.filter((m) => m.series === s && m.lifecycle === "current");
    assert.ok(cur.length <= 1, `${s}: 現行モデルが2つある`);
  }
});

test("DB: 価格の記録は日付順で、同じ日・同じURLの重複がない", () => {
  for (const [id, obs] of Object.entries(db.prices)) {
    const keys = obs.map((o) => `${o.date}|${o.url}`);
    assert.equal(new Set(keys).size, keys.length, id);
    assert.deepEqual([...obs].sort((a, b) => a.date.localeCompare(b.date)), obs, id);
  }
});

/* ---------------------------------------------------------------- 診断の予算判定 */

test("予算: 現行が予算オーバーでも、前の世代が予算内ならそれを示す", () => {
  const opts = [
    { model: "RIDE 19", priceJpy: 20900, lifecycle: "current", onSale: false, checkedAt: "2026-11-25" },
    { model: "RIDE 18", priceJpy: 6600, lifecycle: "previous", onSale: true, checkedAt: "2026-11-25" },
  ];
  assert.equal(priceWithinBudget(opts, 12000).model, "RIDE 18");
  assert.equal(priceWithinBudget(opts, 25000).model, "RIDE 19", "予算内なら現行を優先");
  assert.equal(priceWithinBudget(opts, 5000), null, "すべて予算オーバー");
  assert.equal(priceWithinBudget(undefined, 12000), undefined, "価格不明なら判定しない");
  assert.equal(priceWithinBudget(opts, null), undefined, "予算を問わないなら判定しない");
});

test("予算: 価格データで予算内のシリーズが上がり、理由に価格と確認元が出る", () => {
  const a = { experience: "some", goal: "health", concern: "none", feel: "unknown", width: "unknown", budget: "low" };
  const prices = { "saucony-ride": [{ model: "RIDE 18", priceJpy: 6600, lifecycle: "previous", onSale: true, checkedAt: "2026-11-25" }] };
  const without = scoreShoes(shoes, a).find((r) => r.shoe.slug === "saucony-ride");
  const withP = scoreShoes(shoes, a, prices).find((r) => r.shoe.slug === "saucony-ride");
  assert.ok(withP.score > (without?.score ?? 0));
  assert.ok(withP.reasons.some((r) => r.includes("RIDE 18") && r.includes("6,600円")));
  assert.equal(BUDGET_CAP.any, null);
});

/* ---------------------------------------------------------------- 2足の比較 */

test("比較: 組み合わせは用途が近い公式確認済みのものだけ、URLは順序によらない", () => {
  const pairs = comparablePairs(shoes, isIndexableShoe);
  assert.ok(pairs.length > 0);
  for (const [a, b] of pairs) {
    assert.ok(isIndexableShoe(a) && isIndexableShoe(b));
    assert.ok(a.purposes.filter((p) => b.purposes.includes(p)).length >= 2);
  }
  assert.equal(pairSlug("b-x", "a-y"), pairSlug("a-y", "b-x"));
  assert.deepEqual(parsePairSlug("brooks-ghost-vs-nike-pegasus"), ["brooks-ghost", "nike-pegasus"]);
});

test("比較: 計測サイズが違う重量は差を計算しない", () => {
  const mk = (slug, w, size) => ({ ...shoes[0], slug, specs: { ...shoes[0].specs, weightG: { value: w, verified: true, size }, dropMm: { value: 10, verified: true }, priceJpy: { value: null, verified: false } } });
  const n = (s) => s.slug;
  const diff = pairNotes(mk("a", 300, "メンズ28cm"), mk("b", 290, "27cm"), n).find((x) => x.label === "重量");
  assert.match(diff.text, /単純には比べられません/);
  const same = pairNotes(mk("a", 300, "27.0cm"), mk("b", 290, "27cm"), n).find((x) => x.label === "重量");
  assert.match(same.text, /bのほうが10g軽い/);
});
