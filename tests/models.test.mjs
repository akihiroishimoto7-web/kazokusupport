import { test } from "node:test";
import assert from "node:assert/strict";
import { extractChanges } from "../scripts/shoes/extract.mjs";
import { generationPairs, generationNotes, modelPairSlug } from "../lib/model-pairs.ts";
import { db } from "../data/shoes/db.ts";

test("変更点の抽出: 前作との比較の文だけを、原文のまま、重複なく", () => {
  const t = [
    "フィット感をアップデートし、前足部とつま先部分に余裕を持たせました。",
    "フィット感をアップデートし、ペガサス 41と比較してつま先と前足部に少しゆとりを持たせました。",
    "送料無料。前作よりお得なポイント還元。",
    "毎日のランに。",
    "ボメロ 18にはボメロ 17よりも6mm高いミッドソールを採用し、レベルアップしたクッショニングを実現。",
  ].join("\n");
  const c = extractChanges(t, ["ペガサス 41", "ボメロ 17"]);
  assert.equal(c.length, 2, c.join(" / "));
  assert.ok(c.includes("ボメロ 18にはボメロ 17よりも6mm高いミッドソールを採用し、レベルアップしたクッショニングを実現。"));
  assert.ok(!c.some((x) => x.includes("送料")));
});

test("世代比較: 現行と前の世代がそろったシリーズだけ、古い→新しいの順", () => {
  const pairs = generationPairs(db.models);
  assert.ok(pairs.length >= 3);
  for (const { older, newer } of pairs) {
    assert.equal(older.series, newer.series);
    assert.ok(older.generation < newer.generation);
    assert.equal(newer.lifecycle, "current");
    assert.ok(modelPairSlug(newer, older).startsWith(older.id));
  }
  const ids = pairs.map((p) => modelPairSlug(p.newer, p.older));
  for (const want of ["nike-pegasus-41-vs-nike-pegasus-42", "asics-gel-kayano-32-vs-asics-gel-kayano-33", "nb-1080-v14-vs-nb-1080-v15"]) assert.ok(ids.includes(want), want);
});

test("世代比較の文: 確認できない値は未確認と書き、サイズが違えば差を計算しない", () => {
  const base = { id: "x", series: "s", brand: "nike", nameJa: "", lifecycle: "current", officialUrl: "", pageTitle: "", checkedAt: "2026-11-28" };
  const older = { ...base, name: "A 1", generation: 1, lifecycle: "previous", specs: { weightG: { value: 290, size: "27cm", evidence: "290g", checkedAt: "" } } };
  const newer = { ...base, name: "A 2", generation: 2, specs: { weightG: { value: 300, size: "28cm", evidence: "300g", checkedAt: "" } } };
  assert.match(generationNotes(older, newer)[0], /単純には比べられません/);
  const n2 = generationNotes({ ...older, specs: {} }, { ...newer, specs: {} });
  assert.match(n2[0], /未確認/);
});

test("手作業で確認したモデル: 価格・発売日・変更点に原文と出典がある", () => {
  for (const m of db.models) {
    const p = m.officialPrice;
    if (p?.kind === "msrp") {
      assert.ok(p.evidence?.includes(p.priceJpy.toLocaleString("en-US")), `${m.id}: 価格の原文に金額がない`);
      assert.match(p.sourceUrl ?? "", /^https:\/\//);
    }
    if (m.releaseJp) {
      assert.ok(m.releaseJp.evidence.length > 5 && /^https:\/\//.test(m.releaseJp.sourceUrl), `${m.id}: 発売日の出典`);
    }
    for (const c of m.changes ?? []) {
      assert.ok(c.text.length >= 10, `${m.id}: 変更点が短すぎる`);
      assert.match(c.sourceUrl, /^https:\/\//, `${m.id}: 変更点の出典`);
    }
  }
});

import { trustedSource } from "../lib/trusted-sources.ts";
import { curatedPairs } from "../lib/model-pairs.ts";

test("公式以外の値は、承認済みの情報源（ステップスポーツ・アルペン・ヒマラヤ・ラントリップ）だけ", () => {
  for (const m of db.models) {
    const facts = [...Object.entries(m.specs).map(([k, v]) => [k, v]), ["price", m.officialPrice], ...(m.changes ?? []).map((c) => ["change", c])];
    for (const [k, v] of facts) {
      if (!v || !v.sourceType || v.sourceType === "official") continue;
      const t = trustedSource(v.sourceUrl ?? "");
      assert.ok(t, `${m.id}.${k}: 承認されていない情報源 ${v.sourceUrl}`);
      assert.equal(t.type, v.sourceType, `${m.id}.${k}: 情報源の種類が違う`);
    }
  }
  assert.equal(trustedSource("https://item.rakuten.co.jp/alpen/4303618116/")?.name, "アルペン（楽天市場店）");
  assert.equal(trustedSource("https://item.rakuten.co.jp/someshop/123/"), null);
  assert.deepEqual(trustedSource("https://runtrip.jp/magazine/1"), { name: "ラントリップ", type: "media" });
});

test("シリーズをまたいだ比較は、両方のモデルがあるときだけ", () => {
  for (const p of curatedPairs(db.models)) {
    assert.notEqual(p.a.series, p.b.series);
    assert.equal(p.slug, `${p.a.id}-vs-${p.b.id}`);
  }
});
