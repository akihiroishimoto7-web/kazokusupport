import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getArticles } from "@/lib/articles";
import { publicShoes } from "@/content/shoes";
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
    ...shoePurposes.map((p) => ({ url: u(`/shoes/purpose/${p.id}`) })),
    ...brands.map((b) => ({ url: u(`/shoes/brand/${b.id}`) })),
    ...publicShoes()
      .filter((s) => s.status === "review")
      .map((s) => ({ url: u(`/shoes/${s.slug}`), lastModified: s.updatedAt })),
    ...publicCourses()
      .filter(indexableCourse)
      .map((c) => ({ url: u(`/courses/${c.slug}`), lastModified: c.updatedAt })),
    ...gearCategories.map((g) => ({ url: u(`/gear/${g.slug}`) })),
    ...gearScenes.map((g) => ({ url: u(`/gear/scene/${g.slug}`) })),
    ...tools.filter((t) => t.status === "live").map((t) => ({ url: u(t.href) })),
  ];
}
