"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * 控えめな表示アニメーション。
 * - [data-reveal] の要素が画面に入ったら、少しだけ浮かび上がるように表示します
 * - 「視差効果を減らす」設定の人には何もしません
 * - JavaScript が動かない環境では、最初からすべて表示されたままです
 */
export function RevealScript() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    for (const el of els) {
      // すでに画面内にあるものは、そのまま表示（ちらつきを防ぐ）
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add("is-in");
        continue;
      }
      el.classList.add("is-pending");
      io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
