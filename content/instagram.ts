import type { InstagramPost } from "@/lib/instagram";

/**
 * 手で登録する Instagram 投稿（公式APIを使わない場合）
 * ------------------------------------------------------------------
 * 1. 投稿した写真を public/instagram/ に保存（例: 2026-11-30-otagawa.jpg）
 * 2. 下の配列に追加（新しいものを上に）
 *
 * {
 *   id: "2026-11-30-otagawa",
 *   image: "/instagram/2026-11-30-otagawa.jpg",
 *   width: 1080,
 *   height: 1350,
 *   permalink: "https://www.instagram.com/p/XXXXXXXXXXX/",
 *   caption: "朝の太田川。",            // 画面には出しません（代替テキストに使います）
 *   alt: "朝もやの太田川と、川沿いを走る人",
 *   date: "2026-11-30",
 * },
 *
 * Instagram は「売らない」場所です。商品紹介・セール・アフィリエイトの投稿は登録しないでください。
 */
export const instagramPosts: InstagramPost[] = [];
