"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav, subNav } from "@/lib/nav";

export function Wordmark() {
  return (
    <span className="wordmark" aria-label="RUN LIFE HIROSHIMA">
      <span className="wordmark__main" aria-hidden="true">
        RUN LIFE
      </span>
      <span className="wordmark__place" aria-hidden="true">
        HIROSHIMA
      </span>
    </span>
  );
}

const TABS = [
  { href: "/", label: "ホーム" },
  { href: "/start", label: "はじめる" },
  { href: "/shoes", label: "シューズ" },
  { href: "/courses", label: "コース" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ページを移動したらメニューを閉じる
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const open = () => {
    const d = dialogRef.current;
    if (!d) return;
    d.showModal();
    document.documentElement.classList.add("menu-open");
  };
  const close = () => dialogRef.current?.close();

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || undefined}>
        <div className="site-header__inner">
          <Link href="/" className="site-header__home" aria-label="RUN LIFE HIROSHIMA">
            <Wordmark />
          </Link>
          <nav className="site-nav" aria-label="主なカテゴリー">
            <ul role="list">
              {mainNav.slice(0, 5).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={isCurrent(n.href) ? "page" : undefined}>
                    {n.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" className="menu-button" onClick={open} aria-haspopup="dialog">
            <span className="menu-button__lines" aria-hidden="true">
              <span />
              <span />
            </span>
            メニュー
          </button>
        </div>
      </header>

      {/* スマートフォン用：親指で届く下部ナビゲーション */}
      <nav className="tabbar" aria-label="主なページ">
        <ul role="list">
          {TABS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} aria-current={(t.href === "/" ? pathname === "/" : isCurrent(t.href)) ? "page" : undefined}>
                {t.label}
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={open} aria-haspopup="dialog">
              メニュー
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialogRef}
        className="menu-sheet"
        aria-label="サイトメニュー"
        onClose={() => document.documentElement.classList.remove("menu-open")}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="menu-sheet__inner">
          <div className="menu-sheet__top">
            <Link href="/" className="site-header__home" onClick={close}>
              <Wordmark />
            </Link>
            <button type="button" className="menu-button" onClick={close} autoFocus>
              閉じる
            </button>
          </div>
          <nav aria-label="サイトメニュー">
            <ol role="list" className="menu-sheet__list">
              {mainNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={close} aria-current={isCurrent(n.href) ? "page" : undefined}>
                    <span className="menu-sheet__label">{n.label}</span>
                    <span className="menu-sheet__note">{n.note}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <ul role="list" className="menu-sheet__sub">
              {subNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={close}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="menu-sheet__message serif">走ることを、暮らしの一部に。</p>
        </div>
      </dialog>
    </>
  );
}
