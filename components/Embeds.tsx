import Link from "next/link";
import { getShoe } from "@/content/shoes";
import { getBrand } from "@/content/brands";
import { getGear } from "@/content/gear";
import { getCourse } from "@/content/courses";
import { liveTool } from "@/content/tools";
import { getArticle } from "@/lib/articles";
import { categories } from "@/content/categories";
import { Arrow } from "./Arrow";
import { Photo } from "./Photo";
import type { EmbedKind } from "@/lib/markdown";

/** 記事中の @shoe(...) などの埋め込み。存在しない・非公開のものは何も表示しません */
export function Embed({ kind, slug }: { kind: EmbedKind; slug: string }) {
  if (kind === "shoe") {
    const s = getShoe(slug);
    if (!s || s.status === "draft") return null;
    const b = getBrand(s.brand);
    return (
      <Link href={`/shoes/${s.slug}`} className="embed embed--shoe">
        <span className="embed__kind">シューズ研究所</span>
        <span className="embed__title">
          <span className="latin embed__brand">{b.name}</span> <span className="latin">{s.model ?? s.series}</span>
        </span>
        <span className="embed__desc">{s.catch}</span>
        <Arrow className="embed__arrow" />
      </Link>
    );
  }
  if (kind === "gear") {
    const g = getGear(slug);
    if (!g) return null;
    return (
      <Link href={`/gear/${g.slug}`} className="embed">
        <span className="embed__kind">道具箱</span>
        <span className="embed__title">{g.name}</span>
        <span className="embed__desc">{g.catch}</span>
        <Arrow className="embed__arrow" />
      </Link>
    );
  }
  if (kind === "course") {
    const c = getCourse(slug);
    if (!c || c.status === "draft") return null;
    return (
      <Link href={`/courses/${c.slug}`} className="embed embed--course">
        {c.photo ? <Photo id={c.photo} ratio="1/1" sizes="96px" caption={false} className="embed__thumb" /> : null}
        <span className="embed__kind">広島ランニングコース図鑑</span>
        <span className="embed__title">{c.name}</span>
        <span className="embed__desc">{c.catch}</span>
        <Arrow className="embed__arrow" />
      </Link>
    );
  }
  if (kind === "article") {
    const a = getArticle(slug);
    if (!a) return null;
    return (
      <Link href={`/articles/${a.slug}`} className="embed">
        <span className="embed__kind">{categories[a.category].name}</span>
        <span className="embed__title">{a.title}</span>
        <span className="embed__desc">{a.description}</span>
        <Arrow className="embed__arrow" />
      </Link>
    );
  }
  if (kind === "tool") {
    const t = liveTool(slug);
    if (!t) return null;
    return (
      <Link href={t.href} className="embed embed--tool">
        <span className="embed__kind">診断とツール</span>
        <span className="embed__title">{t.title}</span>
        <span className="embed__desc">{t.description}</span>
        <Arrow className="embed__arrow" />
      </Link>
    );
  }
  return null;
}
