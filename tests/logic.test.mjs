import { test } from "node:test";
import assert from "node:assert/strict";
import { parseClock, formatClock, splits, paceFromTime } from "../lib/pace.ts";
import { parseGpx, summarizeGpx, elevationGain, haversine } from "../lib/gpx.ts";
import { primaryPurpose, scoreShoes, QUESTIONS, answersFromParams } from "../lib/shoe-finder.ts";
import { renderArticleBody } from "../lib/markdown.ts";
import { shoes } from "../content/shoes.ts";

test("ペース: 時刻文字列の読み取り", () => {
  assert.equal(parseClock("4:30"), 270);
  assert.equal(parseClock("2:30:00"), 9000);
  assert.equal(parseClock("１"), null);
  assert.equal(parseClock("5:75"), null);
  assert.equal(parseClock("abc"), null);
});

test("ペース: フルマラソン5時間は1kmあたり約7分07秒", () => {
  const pace = paceFromTime(5 * 3600, 42.195);
  assert.equal(formatClock(pace), "7:07");
  const s = splits(pace, 42.195, 5);
  assert.equal(s.at(-1).km, 42.195);
  assert.equal(formatClock(s.at(-1).sec, true), "5:00:00");
});

test("GPX: 距離と累積標高", () => {
  const gpx = `<gpx><trk><trkseg>
    <trkpt lat="34.4000" lon="132.4500"><ele>2</ele></trkpt>
    <trkpt lat="34.4090" lon="132.4500"><ele>12</ele></trkpt>
    <trkpt lat="34.4180" lon="132.4500"><ele>4</ele></trkpt>
  </trkseg></trk></gpx>`;
  const pts = parseGpx(gpx);
  assert.equal(pts.length, 3);
  const sum = summarizeGpx(pts);
  // 緯度0.018度 ≒ 2.0km
  assert.ok(Math.abs(sum.distanceKm - 2.0) < 0.02, `distance ${sum.distanceKm}`);
  assert.equal(sum.elevationGainM, 10);
  assert.ok(sum.routePath.startsWith("M"));
  assert.equal(elevationGain([0, 1, 2, 1, 0, 5]), 5);
  assert.ok(haversine(pts[0], pts[0]) === 0);
});

test("GPX: 点が足りなければ null", () => {
  assert.equal(summarizeGpx(parseGpx("<gpx></gpx>")), null);
});

const base = { experience: "none", goal: "health", concern: "none", feel: "unknown", width: "unknown", budget: "mid" };

test("診断: 足首のぐらつき → 安定性タイプ、候補は安定性シリーズが上位", () => {
  const a = { ...base, concern: "wobble" };
  assert.equal(primaryPurpose(a), "stability");
  const top = scoreShoes(shoes, a).slice(0, 3);
  assert.ok(top.every((r) => r.shoe.traits.includes("stability")), top.map((t) => t.shoe.slug).join(","));
});

test("診断: 初心者にはプレート入りシューズを出さない", () => {
  for (const goal of ["health", "distance", "speed"]) {
    const ranked = scoreShoes(shoes, { ...base, goal });
    assert.ok(!ranked.some((r) => r.shoe.traits.includes("plate")), goal);
  }
});

test("診断: 予算を抑えたい初心者 → はじめての一足、入門モデルが上位", () => {
  const a = { ...base, budget: "low" };
  assert.equal(primaryPurpose(a), "first");
  const top = scoreShoes(shoes, a).slice(0, 2);
  assert.ok(top.every((r) => r.shoe.traits.includes("budget")));
});

test("診断: 同じ回答なら同じ順番（並びは決定的）", () => {
  const a = { ...base, feel: "soft", concern: "knee" };
  assert.deepEqual(
    scoreShoes(shoes, a).map((r) => r.shoe.slug),
    scoreShoes(shoes, a).map((r) => r.shoe.slug),
  );
});

test("診断: URLの不正な値は無視する", () => {
  const p = new URLSearchParams("experience=none&goal=hack&budget=low");
  assert.deepEqual(answersFromParams(p), { experience: "none", budget: "low" });
  assert.equal(QUESTIONS.length, 6);
});

test("Markdown: 囲み・埋め込み・目次・HTMLの無害化", () => {
  const { segments, toc } = renderArticleBody(
    ["## はじめに", "本文<script>alert(1)</script>", ":::caution 注意", "気をつけて", ":::", "@shoe(asics-novablast)", "## 次に"].join("\n"),
  );
  assert.deepEqual(toc.map((t) => t.text), ["はじめに", "次に"]);
  assert.equal(segments[1].type, "callout");
  assert.equal(segments[2].type, "embed");
  const html = segments.filter((s) => s.type === "html").map((s) => s.html).join("");
  assert.ok(!html.includes("<script>"));
});
