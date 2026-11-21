import Link from "next/link";
import { mainNav, subNav } from "@/lib/nav";
import { channels, site } from "@/content/site";
import { affiliateActive } from "@/lib/shop";

export function SiteFooter() {
  const live = channels.filter((c) => c.url);
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__mark latin">
            RUN LIFE
            <br />
            HIROSHIMA
          </p>
          <p className="site-footer__message serif">{site.message}</p>
          <p className="site-footer__about">
            広島在住の市民ランナーが運営する、個人のランニングメディアです。
            {affiliateActive ? "一部のリンクはアフィリエイト広告を利用しています。" : null}
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="フッター">
          <ul role="list">
            {mainNav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <ul role="list">
            {subNav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
            {live.map((c) => (
              <li key={c.id}>
                <a href={c.url!} target="_blank" rel="noopener noreferrer">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="wrap site-footer__base">
        <p className="num">© 2026 {site.name}</p>
        <p>速さより、続けること。</p>
      </div>
    </footer>
  );
}
