#!/usr/bin/env node
/**
 * SEO の点検（週1回）。サイトを内部リンクでたどり、ページごとの基本項目を確かめます。
 *   npm run seo:audit                                  … 本番（https://kazokusupport-u8zk.vercel.app）
 *   npm run seo:audit -- --base=http://localhost:3100  … ローカル（next start 後）
 *   npm run seo:audit -- --write                       … docs/seo/report.md に保存
 *
 * 見るもの:
 *   - title（長さ・重複）、description（有無・長さ・重複）、canonical、h1 の数、noindex
 *   - JSON-LD が JSON として読めるか、@type
 *   - 内部リンク切れ（4xx/5xx）
 *   - sitemap.xml にあるのに noindex のページ、sitemap にないのに index されるページ
 *   - どこからもリンクされていないページ（sitemap にはあるが孤立）
 *   - 画像の alt 抜け
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const BASE = String(args.base ?? "https://kazokusupport-u8zk.vercel.app").replace(/\/$/, "");
const SITE = "https://kazokusupport-u8zk.vercel.app";
const MAX = Number(args.max ?? 400);

const pick = (html, re) => (html.match(re) ?? [])[1] ?? null;
const decode = (s) => s?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">") ?? null;

async function get(url) {
  const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "RUNLIFE-seo-audit/1.0" } });
  return { status: res.status, html: res.status < 300 ? await res.text() : "" };
}

const pages = new Map(); // path -> info
const linkedFrom = new Map(); // path -> Set(from)
const queue = ["/"];
const seen = new Set(queue);

while (queue.length && pages.size < MAX) {
  const p = queue.shift();
  let r;
  try {
    r = await get(BASE + p);
  } catch (e) {
    pages.set(p, { status: 0, error: String(e) });
    continue;
  }
  const h = r.html;
  const info = {
    status: r.status,
    title: decode(pick(h, /<title>([^<]*)<\/title>/)),
    description: decode(pick(h, /<meta name="description" content="([^"]*)"/)),
    canonical: pick(h, /<link rel="canonical" href="([^"]*)"/),
    robots: pick(h, /<meta name="robots" content="([^"]*)"/),
    h1: (h.match(/<h1[\s>]/g) ?? []).length,
    jsonld: [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
      try {
        const j = JSON.parse(m[1]);
        return [].concat(j).map((x) => x["@type"]).join("+");
      } catch {
        return "INVALID";
      }
    }),
    imgNoAlt: (h.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length,
  };
  pages.set(p, info);
  for (const m of h.matchAll(/href="(\/[^"#?]*)/g)) {
    const to = m[1].replace(/\/$/, "") || "/";
    if (/\.(gpx|xml|txt|png|jpe?g|webp|ico|json|webmanifest)$/.test(to) || to.startsWith("/_next")) continue;
    if (!linkedFrom.has(to)) linkedFrom.set(to, new Set());
    linkedFrom.get(to).add(p);
    if (!seen.has(to)) {
      seen.add(to);
      queue.push(to);
    }
  }
}

// sitemap
const sm = await get(BASE + "/sitemap.xml");
const inSitemap = new Set([...sm.html.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].replace(SITE, "").replace(BASE, "") || "/"));
for (const p of inSitemap) {
  if (!pages.has(p)) {
    const r = await get(BASE + p);
    const h = r.html;
    pages.set(p, {
      status: r.status,
      title: decode(pick(h, /<title>([^<]*)<\/title>/)),
      description: decode(pick(h, /<meta name="description" content="([^"]*)"/)),
      canonical: pick(h, /<link rel="canonical" href="([^"]*)"/),
      robots: pick(h, /<meta name="robots" content="([^"]*)"/),
      h1: (h.match(/<h1[\s>]/g) ?? []).length,
      jsonld: [],
      imgNoAlt: 0,
      orphanCrawl: true,
    });
  }
}

const issues = [];
const add = (level, p, msg) => issues.push({ level, p, msg });
const byTitle = new Map();
const byDesc = new Map();
for (const [p, i] of pages) {
  if (i.status >= 400 || i.status === 0) {
    add("P1", p, `HTTP ${i.status}（リンク元: ${[...(linkedFrom.get(p) ?? [])].slice(0, 3).join(", ") || "sitemap"}）`);
    continue;
  }
  if (i.status >= 300) continue;
  const noindex = /noindex/.test(i.robots ?? "");
  if (!i.title) add("P1", p, "title がない");
  else {
    if (i.title.length > 60) add("P3", p, `title が長い（${i.title.length}字）`);
    if (!noindex) byTitle.set(i.title, [...(byTitle.get(i.title) ?? []), p]);
  }
  if (!i.description) add("P2", p, "description がない");
  else {
    if (i.description.length < 50) add("P3", p, `description が短い（${i.description.length}字）`);
    if (!noindex) byDesc.set(i.description, [...(byDesc.get(i.description) ?? []), p]);
  }
  if (!i.canonical) add("P2", p, "canonical がない");
  else if (!noindex && i.canonical.replace(SITE, "").replace(/\/$/, "") !== (p === "/" ? "" : p)) add("P2", p, `canonical が自分以外（${i.canonical}）`);
  if (i.h1 !== 1) add("P3", p, `h1 が ${i.h1} 個`);
  if (i.jsonld.includes("INVALID")) add("P1", p, "JSON-LD が壊れている");
  if (i.imgNoAlt) add("P2", p, `alt のない画像 ${i.imgNoAlt} 枚`);
  if (noindex && inSitemap.has(p)) add("P1", p, "noindex なのに sitemap にある");
  if (!noindex && !inSitemap.has(p)) add("P3", p, "index 対象なのに sitemap にない");
  if (i.orphanCrawl) add("P2", p, "sitemap にあるが、サイト内のどこからもリンクされていない");
}
for (const [t, ps] of byTitle) if (ps.length > 1) add("P2", ps.join(", "), `title が重複: ${t}`);
for (const [d, ps] of byDesc) if (ps.length > 1) add("P3", ps.join(", "), `description が重複: ${d.slice(0, 40)}…`);

issues.sort((a, b) => a.level.localeCompare(b.level) || a.p.localeCompare(b.p));
const indexable = [...pages.values()].filter((i) => i.status === 200 && !/noindex/.test(i.robots ?? "")).length;
const types = new Map();
for (const i of pages.values()) for (const t of i.jsonld ?? []) for (const x of t.split("+")) types.set(x, (types.get(x) ?? 0) + 1);

const md = [
  "# SEO 点検レポート（自動生成）",
  "",
  `> \`npm run seo:audit -- --write\` で作り直します。対象: ${BASE}／実行日: ${new Date().toISOString().slice(0, 10)}`,
  "",
  `- たどったページ: ${pages.size}（index 対象 ${indexable}）／sitemap: ${inSitemap.size}`,
  `- 構造化データ: ${[...types].map(([t, n]) => `${t} ${n}`).join("、") || "なし"}`,
  `- 問題: P1 ${issues.filter((i) => i.level === "P1").length}／P2 ${issues.filter((i) => i.level === "P2").length}／P3 ${issues.filter((i) => i.level === "P3").length}`,
  "",
  "## 問題（P1 が最優先）",
  "",
  ...(issues.length ? issues.map((i) => `- [ ] ${i.level} \`${i.p}\` ${i.msg}`) : ["- なし"]),
  "",
].join("\n");

if (args.write) {
  fs.mkdirSync(path.join(ROOT, "docs/seo"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "docs/seo/report.md"), md);
  console.log(`docs/seo/report.md に保存（問題 ${issues.length} 件）`);
} else console.log(md);
