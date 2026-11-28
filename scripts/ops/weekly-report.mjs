#!/usr/bin/env node
/**
 * 週次レポート（docs/reports/weekly-YYYY-MM-DD.md）をつくります。
 *   npm run weekly:report
 * まとめるもの: データの量と鮮度、値下がり、作業キューの上位、SEO点検の要約、収益の記録。
 * GA4 / Search Console の数字は、API の接続（docs/ops/analytics.md）ができるまでは手入力欄です。
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "../../data/shoes/db.ts";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const today = new Date().toISOString().slice(0, 10);
const read = (p) => (fs.existsSync(path.join(ROOT, p)) ? fs.readFileSync(path.join(ROOT, p), "utf8") : "");

// 値下がり
const drops = [];
for (const [id, obs] of Object.entries(db.prices)) {
  if (obs.length < 2) continue;
  const [a, b] = obs.slice(-2);
  if (b.priceJpy < a.priceJpy) drops.push(`- ${id}: ${a.priceJpy.toLocaleString()}円 → ${b.priceJpy.toLocaleString()}円（${a.date} → ${b.date}）`);
}
// 収益
const rows = read("data/revenue/log.csv").trim().split("\n").slice(1).filter(Boolean).map((l) => l.split(","));
const byMonth = new Map();
for (const r of rows) byMonth.set(r[0], (byMonth.get(r[0]) ?? 0) + (Number(r[2]) || 0));
const queue = read("docs/agent/QUEUE.md").split("\n").filter((l) => l.startsWith("- [ ] P1") || l.startsWith("- [ ] P2")).slice(0, 8);
const seoHead = read("docs/seo/report.md").split("\n").filter((l) => l.startsWith("- ")).slice(0, 4);

const md = [
  `# 週次レポート ${today}`,
  "",
  "## データ",
  "",
  `- 登録モデル: ${db.models.length}（現行 ${db.models.filter((m) => m.lifecycle === "current").length}）`,
  `- 価格の記録: ${Object.values(db.prices).reduce((n, o) => n + o.length, 0)} 件`,
  "",
  "## 値下がり（アメブロのセール記事の材料）",
  "",
  ...(drops.length ? drops : ["- なし"]),
  "",
  "## 収益（data/revenue/log.csv）",
  "",
  ...(byMonth.size ? [...byMonth].map(([m, v]) => `- ${m}: ${v.toLocaleString()}円`) : ["- まだ記録がありません"]),
  "- 目標: 月50,000円",
  "",
  "## アクセス（GA4・Search Console）",
  "",
  "- ページ別の表示回数、検索流入、outbound_click（link_kind=ameblo / rakuten など）、finder_start → finder_complete → finder_result_click の割合を記入（API 接続後は自動）",
  "",
  "## SEO 点検の要約（docs/seo/report.md）",
  "",
  ...(seoHead.length ? seoHead : ["- 未実行（npm run seo:audit -- --write）"]),
  "",
  "## 次にやること（docs/agent/QUEUE.md の上位）",
  "",
  ...(queue.length ? queue : ["- なし"]),
  "",
  "## 改善の提案（エージェントが記入）",
  "",
  "- ",
  "",
].join("\n");
fs.mkdirSync(path.join(ROOT, "docs/reports"), { recursive: true });
const out = path.join(ROOT, `docs/reports/weekly-${today}.md`);
fs.writeFileSync(out, md);
console.log(`${path.relative(ROOT, out)} を作りました`);
