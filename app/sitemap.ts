import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getArticles } from "@/lib/articles";
import { publicShoes } from "@/content/shoes";
import { features } from "@/content/features";
import { isIndexableShoe } from "@/lib/shoe-db";
import { comparablePairs, pairSlug } from "@/lib/shoe-pairs";
import { allModels } from "@/lib/shoe-db";
import { generationPairs, modelPairSlug } from "@/lib/model-pairs";
import { indexableCourse, publicCourses } from "@/content/courses";
import { brands, shoePurposes } from "@/content/brands";
import { gearCategories, gearScenes } from "@/content/gear";
import { tools } from "@/content/tools";

/** 検索エンジンに登録するページだけを載せます（未確認情報だけのページは除外） */
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const now = new Date().toISOString().slice(0, 10);
  const statics = ["/", "/start", "/shoes", "/gear", "/courses", "/care", "/race", "/essays", "/tools", "/deals", "/shoes/compare", "/about", "/policy", "/credits"];
  return [
    ...statics.map((p) => ({ url: u(p), lastModified: now })),
    ...getArticles()
      .filter((a) => a.status === "published")
      .map((a) => ({ url: u(`/articles/${a.slug}`), lastModified: a.updatedAt })),
    { url: u("/features") },
    ...features.map((x) => ({ url: u(x.path), lastModified: x.updatedAt })),
    ...shoePurposes.map((p) => ({ url: u(`/shoes/purpose/${p.id}`) })),
    ...brands.map((b) => ({ url: u(`/shoes/brand/${b.id}`) })),
    ...publicShoes()
      .filter(isIndexableShoe)
      .map((s) => ({ url: u(`/shoes/${s.slug}`), lastModified: s.updatedAt })),
    ...generationPairs(allModels()).map(({ older, newer }) => ({
      url: u(`/shoes/models/${modelPairSlug(newer, older)}`),
      lastModified: newer.checkedAt > older.checkedAt ? newer.checkedAt : older.checkedAt,
    })),
    ...comparablePairs(publicShoes(), isIndexableShoe).map(([a, b]) => ({
      url: u(`/shoes/compare/${pairSlug(a.slug, b.slug)}`),
      lastModified: a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt,
    })),
    ...publicCourses()
      .filter(indexableCourse)
      .map((c) => ({ url: u(`/courses/${c.slug}`), lastModified: c.updatedAt })),
    ...gearCategories.map((g) => ({ url: u(`/gear/${g.slug}`) })),
    ...gearScenes.map((g) => ({ url: u(`/gear/scene/${g.slug}`) })),
    ...tools.filter((t) => t.status === "live").map((t) => ({ url: u(t.href) })),
  ];
}
