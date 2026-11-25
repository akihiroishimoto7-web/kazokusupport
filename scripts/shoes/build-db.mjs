#!/usr/bin/env node
/**
 * data/shoes/models/*.json と data/prices/*.json を、サイトが読む data/shoes/db.ts にまとめます。
 *   npm run shoes:db           … 生成
 *   npm run shoes:db -- --check … 生成結果が最新か確認（validate から呼ばれます）
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const dir = (p) => (fs.existsSync(p) ? fs.readdirSync(p).filter((f) => f.endsWith(".json")).sort() : []);
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

export function buildDb() {
  const mdir = path.join(ROOT, "data/shoes/models");
  const pdir = path.join(ROOT, "data/prices");
  const models = dir(mdir).map((f) => read(path.join(mdir, f)));
  models.sort((a, b) => a.series.localeCompare(b.series) || b.generation - a.generation);
  const prices = {};
  for (const f of dir(pdir)) {
    const h = read(path.join(pdir, f));
    prices[h.id] = h.observations;
  }
  return { models, prices };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const out = path.join(ROOT, "data/shoes/db.ts");
  const data = buildDb();
  const next =
    "/* 自動生成ファイル。直接編集せず npm run shoes:db で作り直してください（元データ: data/shoes/models, data/prices） */\n" +
    'import type { ShoeDb } from "../../lib/shoe-db-types.ts";\n\n' +
    `export const db: ShoeDb = ${JSON.stringify(data, null, 2)};\n`;
  if (process.argv.includes("--check")) {
    const cur = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (cur !== next) {
      console.error("data/shoes/db.ts が古いままです。npm run shoes:db を実行してください。");
      process.exit(1);
    }
    console.log("db.ts は最新です");
  } else {
    fs.writeFileSync(out, next);
    console.log(`db.ts: ${data.models.length} モデル / 価格履歴 ${Object.keys(data.prices).length} 件`);
  }
}
