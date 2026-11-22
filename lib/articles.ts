import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Article, ArticleMeta, CategoryId, ChannelPlan, Level, Season } from "./types";

/**
 * 記事は content/articles/*.md に、1記事1ファイルで置きます。
 * ファイル名（拡張子を除く）がそのままURLになります: /articles/<ファイル名>
 * 書き方は content/articles/README.md を参照してください。
 */
const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

const CATEGORIES: CategoryId[] = ["start", "shoes", "gear", "hiroshima", "care", "race", "essay"];
const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
const LEVELS: Level[] = ["first", "beginner", "intermediate"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`[content/articles/${file}] ${message}`);
  }
}

function asDate(v: unknown): string | undefined {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v;
  return undefined;
}

function strArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

/** 日本語の本文を1分あたり約500字として読了時間を見積もる */
function estimateMinutes(body: string): number {
  const text = body
    .replace(/^:::.*$/gm, "")
    .replace(/^@\w+\(.*\)$/gm, "")
    .replace(/[#>*_`\-|[\]()]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, "");
  return Math.max(1, Math.round(text.length / 500));
}

/**
 * カテゴリーごとの媒体の初期値（frontmatter の channels で上書きできます）
 * 商品に関わるカテゴリー（shoes / gear）は Instagram に出しません。
 */
export const DEFAULT_CHANNELS: Record<CategoryId, ChannelPlan> = {
  start: { site: true, ameblo: "link", instagram: false },
  shoes: { site: true, ameblo: "publish", instagram: false },
  gear: { site: true, ameblo: "publish", instagram: false },
  hiroshima: { site: true, ameblo: "none", instagram: true },
  care: { site: true, ameblo: "publish", instagram: false },
  race: { site: true, ameblo: "publish", instagram: false },
  essay: { site: true, ameblo: "none", instagram: true },
};

function parseFile(file: string): Article {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.md$/, "");
  const fail = (m: string) => {
    throw new ContentError(file, m);
  };

  if (!/^[a-z0-9-]+$/.test(slug)) fail("ファイル名は半角英小文字・数字・ハイフンのみ使えます");
  if (typeof data.title !== "string" || !data.title.trim()) fail("title がありません");
  if (typeof data.description !== "string" || !data.description.trim()) fail("description がありません");
  if (!CATEGORIES.includes(data.category)) fail(`category は ${CATEGORIES.join(" / ")} のいずれかです`);
  const status = data.status ?? "draft";
  if (status !== "published" && status !== "draft") fail("status は published か draft です");
  const publishedAt = asDate(data.publishedAt);
  const updatedAt = asDate(data.updatedAt) ?? publishedAt;
  if (!publishedAt || !DATE_RE.test(publishedAt)) fail("publishedAt は YYYY-MM-DD 形式で書いてください");
  if (!updatedAt || !DATE_RE.test(updatedAt)) fail("updatedAt は YYYY-MM-DD 形式で書いてください");

  const seasons = strArray(data.seasons) as Season[];
  seasons.forEach((s) => SEASONS.includes(s) || fail(`seasons に不明な値: ${s}`));
  const levels = strArray(data.levels) as Level[];
  levels.forEach((l) => LEVELS.includes(l) || fail(`levels に不明な値: ${l}`));

  const sources = Array.isArray(data.sources)
    ? data.sources.map((s: Record<string, unknown>) => ({
        title: String(s.title ?? ""),
        url: s.url ? String(s.url) : undefined,
        publisher: s.publisher ? String(s.publisher) : undefined,
        checkedAt: asDate(s.checkedAt),
      }))
    : [];

  const meta: ArticleMeta = {
    slug,
    title: data.title.trim(),
    description: data.description.trim(),
    lede: typeof data.lede === "string" ? data.lede.trim() : undefined,
    category: data.category,
    tags: strArray(data.tags),
    status,
    publishedAt: publishedAt!,
    updatedAt: updatedAt!,
    hero: typeof data.hero === "string" ? data.hero : undefined,
    seasons: seasons.length ? seasons : [...SEASONS],
    levels: levels.length ? levels : ["first", "beginner"],
    series:
      data.series && typeof data.series === "object"
        ? { id: String(data.series.id), order: Number(data.series.order) }
        : undefined,
    related: strArray(data.related),
    sources,
    medical: data.medical === true,
    answers: typeof data.answers === "string" ? data.answers : undefined,
    readingMinutes: estimateMinutes(content),
    channels: {
      ...DEFAULT_CHANNELS[data.category as CategoryId],
      ...(data.channels && typeof data.channels === "object" ? data.channels : {}),
    },
  };
  // 商品の埋め込みがある記事は、設定にかかわらず Instagram には出さない
  if (/^@(shoe|gear)\(/m.test(content)) meta.channels.instagram = false;
  return { ...meta, body: content.trim() };
}

let cache: Article[] | null = null;

function loadAll(): Article[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    : [];
  const all = files.map(parseFile).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  cache = all;
  return all;
}

/** 公開記事（開発中は SHOW_DRAFTS=1 で下書きも表示） */
export function getArticles(): Article[] {
  const showDrafts = process.env.SHOW_DRAFTS === "1";
  return loadAll().filter((a) => a.status === "published" || showDrafts);
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: CategoryId): Article[] {
  return getArticles().filter((a) => a.category === category);
}

export function getSeries(id: string): Article[] {
  return getArticles()
    .filter((a) => a.series?.id === id)
    .sort((a, b) => (a.series!.order ?? 0) - (b.series!.order ?? 0));
}

/** 公開済みかどうか（存在しないリンクを作らないために使う） */
export function isPublished(slug: string | undefined): boolean {
  if (!slug) return false;
  return getArticles().some((a) => a.slug === slug);
}

/** 季節に合った「編集部のおすすめ」 */
export function seasonalPicks(date = new Date(), count = 4): Article[] {
  const m = date.getMonth() + 1;
  const season: Season = m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
  const list = getArticles().filter((a) => a.category !== "essay");
  const inSeason = list.filter((a) => a.seasons.length < 4 && a.seasons.includes(season));
  const rest = list.filter((a) => !inSeason.includes(a));
  return [...inSeason, ...rest].slice(0, count);
}

export function currentSeasonLabel(date = new Date()): string {
  const m = date.getMonth() + 1;
  return `${m}月`;
}

export function relatedArticles(article: Article, count = 3): Article[] {
  const all = getArticles().filter((a) => a.slug !== article.slug);
  const explicit = article.related.map((s) => all.find((a) => a.slug === s)).filter(Boolean) as Article[];
  const sameCat = all.filter((a) => a.category === article.category && !explicit.includes(a));
  return [...explicit, ...sameCat].slice(0, count);
}
