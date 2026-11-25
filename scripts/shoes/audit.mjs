#!/usr/bin/env node
/**
 * シューズデータベースの点検。次にやるべき作業を、優先度つきで書き出します。
 *   npm run shoes:audit             … 画面に表示
 *   npm run shoes:audit -- --write  … docs/agent/QUEUE.md に保存（エージェントの作業キュー）
 *
 * 見るもの:
 *   - 現行モデルが未登録のシリーズ（＝検索に出ない、比較・診断で価格が使えない）
 *   - 仕様の確認から日が経ったモデル（価格は14日、仕様は90日で再確認）
 *   - 取れていない項目（重量・ドロップ・価格）
 *   - 前回の収集で失敗したもの（data/shoes/last-run.json）
 *   - 値下がり（前回の記録より安くなったもの）→ アメブロのセール記事の材料
 */
import fs from "node:fs";
import path from "node:path";
import { shoes } from "../../content/shoes.ts";
import { db } from "../../data/shoes/db.ts";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const today = new Date().toISOString().slice(0, 10);
const days = (iso) => Math.round((Date.parse(today) - Date.parse(iso)) / 86400000);
const { blocked = {} } = JSON.parse(fs.readFileSync(path.join(ROOT, "data/shoes/targets.json"), "utf8"));

const items = []; // { p: 1..3, area, text }
const add = (p, area, text) => items.push({ p, area, text });

for (const s of shoes.filter((x) => x.status !== "draft")) {
  const ms = db.models.filter((m) => m.series === s.slug);
  const cur = ms.find((m) => m.lifecycle === "current");
  if (!cur) {
    if (blocked[s.brand]) add(2, "収集", `${s.slug}: 現行モデル未登録（${s.brand} は自動取得が拒否される: ${blocked[s.brand]}）。公式ページを手作業で確認して data/shoes/models に追加するか、取得方法を見直す`);
    else add(1, "収集", `${s.slug}: 現行モデル未登録。公式の商品ページを探して data/shoes/targets.json に追加し、npm run shoes:collect`);
    continue;
  }
  for (const k of ["weightG", "dropMm"]) if (!cur.specs[k]) add(3, "仕様", `${cur.id}: ${k} が公式ページに見つからない（記載がないなら対応不要。別ページ・カタログに記載がないか確認）`);
  if (!cur.officialPrice) add(1, "価格", `${cur.id}: 公式価格が取れていない`);
  if (days(cur.checkedAt) > 90) add(2, "仕様", `${cur.id}: 仕様の確認から${days(cur.checkedAt)}日。再確認（新モデルが出ていないかも）`);
  if (cur.officialPrice && days(cur.officialPrice.checkedAt) > 14) add(1, "価格", `${cur.id}: 価格の確認から${days(cur.officialPrice.checkedAt)}日。npm run shoes:collect`);
  if (!ms.some((m) => m.lifecycle === "previous")) add(3, "収集", `${s.slug}: 前の世代が未登録（公式ストアに残っていれば、値下がり比較に使える）`);
}

// 前回の収集結果
const lastRunPath = path.join(ROOT, "data/shoes/last-run.json");
if (fs.existsSync(lastRunPath)) {
  const last = JSON.parse(fs.readFileSync(lastRunPath, "utf8"));
  for (const r of last.results.filter((x) => !x.ok)) add(1, "収集", `${r.id}: 前回の収集が失敗（${r.error}）。URLが変わっていないか確認`);
}

// 値下がり（直近2回の記録の比較）
const drops = [];
for (const [id, obs] of Object.entries(db.prices)) {
  if (obs.length < 2) continue;
  const [a, b] = obs.slice(-2);
  if (b.priceJpy < a.priceJpy) drops.push(`${id}: ${a.priceJpy.toLocaleString()}円 → ${b.priceJpy.toLocaleString()}円（${a.date} → ${b.date}）`);
}

items.sort((a, b) => a.p - b.p || a.area.localeCompare(b.area) || a.text.localeCompare(b.text));
const covered = new Set(db.models.filter((m) => m.lifecycle === "current").map((m) => m.series)).size;
const total = shoes.filter((x) => x.status !== "draft").length;

const md = [
  "# 作業キュー（自動生成）",
  "",
  `> \`npm run shoes:audit -- --write\` で作り直します。最終生成: ${today}`,
  "",
  `- 現行モデルの公式仕様があるシリーズ: **${covered} / ${total}**`,
  `- 登録モデル数: ${db.models.length}（現行 ${db.models.filter((m) => m.lifecycle === "current").length}・前の世代 ${db.models.filter((m) => m.lifecycle === "previous").length}）`,
  `- 価格の記録: ${Object.values(db.prices).reduce((n, o) => n + o.length, 0)} 件`,
  "",
  "## 値下がり（前回の記録より安くなったもの）",
  "",
  ...(drops.length ? drops.map((d) => `- ${d}`) : ["- なし（記録が2回以上たまると判定できます）"]),
  "",
  "## やること（優先度順。P1 が最優先）",
  "",
  ...items.map((i) => `- [ ] P${i.p}［${i.area}］${i.text}`),
  "",
].join("\n");

if (process.argv.includes("--write")) {
  fs.mkdirSync(path.join(ROOT, "docs/agent"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "docs/agent/QUEUE.md"), md);
  console.log(`docs/agent/QUEUE.md に ${items.length} 件を書き出しました`);
} else {
  console.log(md);
}
