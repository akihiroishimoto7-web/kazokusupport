import type { Metadata } from "next";
import { site, author } from "@/content/site";
import { getPhoto } from "@/content/photos";

type MetaInput = {
  title?: string;
  description?: string;
  path: string;
  /** 写真ID */
  photo?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
};

export const absUrl = (p: string) => `${site.url}${p.startsWith("/") ? p : `/${p}`}`;

export function buildMetadata(m: MetaInput): Metadata {
  const title = m.title ? `${m.title}｜${site.name}` : `${site.name}｜${site.tagline}`;
  const description = m.description ?? site.description;
  const photo = getPhoto(m.photo);
  const images = photo
    ? [{ url: photo.src, width: photo.width, height: photo.height, alt: photo.alt }]
    : [{ url: "/og-default.jpg", width: 1200, height: 630, alt: site.name }];
  const robots = m.noindex || !site.indexable ? { index: false, follow: true } : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: m.path },
    robots,
    openGraph: {
      type: m.type ?? "website",
      siteName: site.name,
      locale: site.locale,
      url: m.path,
      title: m.title ?? site.name,
      description,
      images,
      ...(m.type === "article" ? { publishedTime: m.publishedAt, modifiedTime: m.updatedAt } : {}),
    },
    twitter: { card: "summary_large_image", title: m.title ?? site.name, description, images: images.map((i) => i.url) },
  };
}

const publisher = {
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: { "@type": "ImageObject", url: absUrl("/icon.png") },
};

const personOrOrg = () =>
  author.displayName
    ? { "@type": "Person", name: author.displayName, url: absUrl("/about") }
    : { "@type": "Organization", name: site.name, url: absUrl("/about") };

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    alternateName: site.nameJa,
    url: site.url,
    description: site.description,
    inLanguage: "ja-JP",
    publisher,
  };
}

export function articleJsonLd(a: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  photo?: string;
}) {
  const photo = getPhoto(a.photo);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: absUrl(a.path),
    datePublished: a.publishedAt,
    dateModified: a.updatedAt,
    inLanguage: "ja-JP",
    author: personOrOrg(),
    publisher,
    ...(photo ? { image: [absUrl(photo.src)] } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export function placeJsonLd(c: { name: string; description: string; path: string; photo?: string }) {
  const photo = getPhoto(c.photo);
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: c.name,
    description: c.description,
    url: absUrl(c.path),
    address: { "@type": "PostalAddress", addressRegion: "広島県", addressCountry: "JP" },
    ...(photo ? { photo: absUrl(photo.src) } : {}),
  };
}
