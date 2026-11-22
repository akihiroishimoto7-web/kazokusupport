/** 媒体の振り分けを一覧表示する： npm run channels */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { editorialPlan } from "../content/editorial.ts";

const root = path.resolve(import.meta.dirname, "..");
const DEFAULTS = {
  start: { site: true, ameblo: "link", instagram: false },
  shoes: { site: true, ameblo: "publish", instagram: false },
  gear: { site: true, ameblo: "publish", instagram: false },
  hiroshima: { site: true, ameblo: "none", instagram: true },
  care: { site: true, ameblo: "publish", instagram: false },
  race: { site: true, ameblo: "publish", instagram: false },
  essay: { site: true, ameblo: "none", instagram: true },
};
const mark = (v) => (v === true || v === "publish" || v === "post" || v === "reel" || v === "article" || v === "feature" ? "○" : v === "link" ? "→" : "－");

console.log("■ 企画台帳（content/editorial.ts）");
console.log("HP  アメブロ  Instagram  企画");
for (const p of editorialPlan) console.log(` ${mark(p.site)}     ${mark(p.ameblo)}        ${mark(p.instagram)}      ${p.title}${p.commercial ? "（商品）" : ""}`);

console.log("\n■ HPの記事（content/articles）");
console.log("HP  アメブロ  Instagram  記事");
const dir = path.join(root, "content", "articles");
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md")) {
  const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
  if (data.status !== "published") continue;
  const c = { ...DEFAULTS[data.category], ...(data.channels ?? {}) };
  console.log(` ${mark(c.site)}     ${mark(c.ameblo)}        ${mark(c.instagram)}      ${data.title}`);
}
console.log("\n○=掲載  →=アメブロ↔HPで紹介  －=載せない");
