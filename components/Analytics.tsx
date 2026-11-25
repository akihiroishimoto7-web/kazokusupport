"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** 外部リンクの行き先を、分析しやすい種類に分ける */
export function classifyOutbound(href: string): string | null {
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return null;
  }
  const h = u.hostname;
  if (h.endsWith("ameblo.jp") || h.endsWith("ameba.jp")) return "ameblo";
  if (h.includes("rakuten.co.jp")) return "rakuten";
  if (h.includes("amazon.co.jp")) return "amazon";
  if (h.includes("yahoo.co.jp") || h.includes("valuecommerce.com")) return "yahoo";
  if (h.includes("instagram.com")) return "instagram";
  if (/nike\.com|on\.com|mizuno\.com|saucony\.jp|brooksrunning\.co\.jp|asics\.com|adidas\.jp|hoka\.com|newbalance\.jp/.test(h)) return "official";
  return "other";
}

/**
 * Google アナリティクス 4。測定IDがあるときだけ読み込みます。
 * App Router のページ移動でも page_view を送り、外部リンクのクリックを outbound_click として記録します。
 */
export function Analytics({ id }: { id: string }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    // 初回は gtag('config') が page_view を送るので、2回目以降の移動だけ送る
    if (first.current) {
      first.current = false;
      return;
    }
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href, page_title: document.title });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || !a.href || a.origin === window.location.origin) return;
      const kind = classifyOutbound(a.href);
      if (!kind) return;
      window.gtag?.("event", "outbound_click", {
        link_kind: kind,
        link_domain: new URL(a.href).hostname,
        from_path: window.location.pathname,
        sponsored: (a.getAttribute("rel") ?? "").includes("sponsored"),
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
