/**
 * コンテンツの整合性チェック
 *   npm run validate
 *
 * AI や人が記事・商品・コースを追加したあと、ビルドの前に実行してください。
 * - 記事の frontmatter の書式
 * - 記事内の @shoe(...) などの参照先が存在するか
 * - 写真IDが存在し、画像ファイルがあるか
 * - 広島以外の写真が、広島のコースに使われていないか
 * - 「確認済み」の値に出典が付いているか
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { photos } from "../content/photos.ts";
import { shoes } from "../content/shoes.ts";
import { brands, shoePurposes } from "../content/brands.ts";
import { gearCategories, gearScenes } from "../content/gear.ts";
import { courses } from "../content/courses.ts";
import { tools } from "../content/tools.ts";
import { categories } from "../content/categories.ts";
import { startQuestions, featuredEssay } from "../content/home.ts";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* 写真 */
for (const p of Object.values(photos)) {
  if (!fs.existsSync(path.join(root, "public", p.src))) err(`写真ファイルがありません: ${p.src}（${p.id}）`);
  if (!p.alt) err(`写真 ${p.id} に alt がありません`);
  if (p.credit.kind === "licensed" && (!p.credit.author || !p.credit.license || !p.credit.sourceUrl))
    err(`写真 ${p.id} のクレジットが不完全です`);
}
const photoExists = (id) => !id || Boolean(photos[id]);

/* 記事 */
const dir = path.join(root, "content", "articles");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("_"));
const articles = new Map();
for (const f of files) {
  const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
  articles.set(f.replace(/\.md$/, ""), { data, content, file: f });
}
const CATS = Object.keys(categories);
for (const [slug, { data, content, file }] of articles) {
  const where = `content/articles/${file}`;
  if (!/^[a-z0-9-]+$/.test(slug)) err(`${where}: ファイル名に使えない文字があります`);
  for (const k of ["title", "description", "category", "publishedAt"]) if (!data[k]) err(`${where}: ${k} がありません`);
  if (data.category && !CATS.includes(data.category)) err(`${where}: category "${data.category}" は存在しません`);
  if (data.status && !["published", "draft"].includes(data.status)) err(`${where}: status は published か draft です`);
  if (data.hero && !photoExists(data.hero)) err(`${where}: hero の写真ID "${data.hero}" がありません`);
  if (data.description && data.description.length > 140) warn(`${where}: description が長めです（${data.description.length}字）`);
  for (const r of data.related ?? []) if (!articles.has(r)) err(`${where}: related の "${r}" がありません`);
  for (const m of content.matchAll(/^@(\w+)\(([a-z0-9-]+)\)\s*$/gm)) {
    const [, kind, ref] = m;
    const ok =
      (kind === "shoe" && shoes.some((s) => s.slug === ref)) ||
      (kind === "gear" && gearCategories.some((g) => g.slug === ref)) ||
      (kind === "course" && courses.some((c) => c.slug === ref)) ||
      (kind === "article" && articles.has(ref)) ||
      (kind === "tool" && tools.some((t) => t.id === ref && t.status === "live"));
    if (!ok) err(`${where}: @${kind}(${ref}) の参照先がありません`);
    if (kind === "article" && articles.get(ref)?.data.status !== "published" && data.status === "published")
      warn(`${where}: @article(${ref}) は下書きのため表示されません`);
  }
  const opens = (content.match(/^:::\w+/gm) ?? []).length;
  const closes = (content.match(/^:::\s*$/gm) ?? []).length;
  if (opens !== closes) err(`${where}: ::: の開始と終了の数が合いません`);
}
const published = (slug) => articles.get(slug)?.data.status === "published";

/* シューズ */
const brandIds = brands.map((b) => b.id);
const purposeIds = shoePurposes.map((p) => p.id);
const shoeSlugs = new Set();
for (const s of shoes) {
  const where = `shoes: ${s.slug}`;
  if (shoeSlugs.has(s.slug)) err(`${where}: slug が重複しています`);
  shoeSlugs.add(s.slug);
  if (!brandIds.includes(s.brand)) err(`${where}: brand "${s.brand}" がありません`);
  for (const p of s.purposes) if (!purposeIds.includes(p)) err(`${where}: purpose "${p}" がありません`);
  if (!s.reasonsNotToBuy.length) err(`${where}: 「買わなくてもいい理由」が空です（必須）`);
  if (!photoExists(s.photo)) err(`${where}: 写真ID "${s.photo}" がありません`);
  for (const [k, f] of Object.entries(s.specs)) if (f.verified && !f.source) err(`${where}: specs.${k} が確認済みなのに出典がありません`);
  for (const [k, r] of Object.entries(s.ratings))
    if (r.score !== null && !r.basis) err(`${where}: ratings.${k} に根拠（worn / research）がありません`);
  for (const [k, r] of Object.entries(s.ratings))
    if (r.basis === "worn" && !s.worn) err(`${where}: ratings.${k} が「履いた評価」なのに worn が空です`);
  if (s.status === "review" && !s.checkedAt) err(`${where}: レビュー公開には checkedAt が必要です`);
}
for (const s of shoes) for (const x of s.similar) if (!shoeSlugs.has(x)) err(`shoes: ${s.slug}: similar の "${x}" がありません`);

/* 道具 */
const gearSlugs = new Set(gearCategories.map((g) => g.slug));
for (const g of gearCategories) for (const a of g.relatedArticles) if (!articles.has(a)) err(`gear: ${g.slug}: 記事 "${a}" がありません`);
for (const s of gearScenes) {
  for (const p of s.picks) if (!gearSlugs.has(p.gear)) err(`gearScene: ${s.slug}: 道具 "${p.gear}" がありません`);
  for (const a of s.relatedArticles) if (!articles.has(a)) err(`gearScene: ${s.slug}: 記事 "${a}" がありません`);
}

/* コース */
for (const c of courses) {
  const where = `courses: ${c.slug}`;
  if (c.photo) {
    if (!photos[c.photo]) err(`${where}: 写真ID "${c.photo}" がありません`);
    else if (!photos[c.photo].isHiroshima) err(`${where}: 広島で撮影されていない写真がコースに使われています`);
  }
  if (c.gpx && !fs.existsSync(path.join(root, "public", "gpx", c.gpx))) err(`${where}: GPX "${c.gpx}" がありません`);
  if (c.status === "surveyed" && !c.runReport) warn(`${where}: 走って確認済みなのに runReport が空です`);
  for (const a of c.relatedArticles) if (!articles.has(a)) err(`${where}: 記事 "${a}" がありません`);
}

/* カテゴリー・トップ */
for (const cat of Object.values(categories)) {
  if (!photoExists(cat.photo)) err(`categories: ${cat.id}: 写真ID "${cat.photo}" がありません`);
  for (const t of cat.topics) if (t.article && !articles.has(t.article)) err(`categories: ${cat.id}: 記事 "${t.article}" がありません`);
}
for (const q of startQuestions) {
  const slug = q.href.replace("/articles/", "");
  if (q.href.startsWith("/articles/") && !published(slug)) warn(`home: 「${q.q}」のリンク先 ${slug} が未公開です（準備中と表示されます）`);
}
if (!published(featuredEssay)) warn(`home: featuredEssay "${featuredEssay}" が未公開です`);

for (const w of warnings) console.log(`注意  ${w}`);
for (const e of errors) console.log(`エラー ${e}`);
console.log(
  `\n記事 ${articles.size}本（公開 ${[...articles.values()].filter((a) => a.data.status === "published").length}）／シューズ ${shoes.length}／道具 ${gearCategories.length}／場面 ${gearScenes.length}／コース ${courses.length}／写真 ${Object.keys(photos).length}`,
);
if (errors.length) {
  console.log(`\n${errors.length}件のエラーがあります。`);
  process.exit(1);
}
console.log("問題は見つかりませんでした。");
