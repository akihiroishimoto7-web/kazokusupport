import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gyakusouFeature, CUT_LABEL } from "../content/features/gyakusou.ts";

test("特集: 写真は必須項目がそろい、ファイルが public にあり、外部の画像を使っていない", () => {
  for (const m of gyakusouFeature.models) {
    const cuts = new Set();
    for (const p of m.photos) {
      assert.ok(p.cut in CUT_LABEL, `${p.src}: cut`);
      assert.ok(!cuts.has(p.cut), `${m.slug}: 同じカット（${p.cut}）が2枚`);
      cuts.add(p.cut);
      assert.match(p.src, /^\/features\/gyakusou\/[\w.-]+\.(jpe?g|webp|png|avif)$/, "public/features/gyakusou/ の画像だけ");
      assert.ok(fs.existsSync(`public${p.src}`), `${p.src} がない`);
      for (const k of ["alt", "credit", "caption", "note"]) assert.ok(p[k]?.trim(), `${p.src}: ${k} が空`);
      assert.ok(p.width > 0 && p.height > 0);
      assert.match(p.permission.confirmedAt, /^\d{4}-\d{2}-\d{2}$/, `${p.src}: 掲載条件の確認日`);
      assert.ok(p.permission.detail.trim(), `${p.src}: 掲載条件の内容`);
    }
  }
});

test("特集: 出典はすべて URL と確認日つき、公式リンクは Nike SNKRS", () => {
  for (const s of gyakusouFeature.sources) {
    assert.match(s.url, /^https:\/\//);
    assert.match(s.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.match(gyakusouFeature.models[0].officialUrl, /^https:\/\/www\.nike\.com\/jp\/launch\//);
});
