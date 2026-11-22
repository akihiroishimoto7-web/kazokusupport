import "server-only";
import { instagramPosts } from "@/content/instagram";
import { social } from "@/content/social";

export type InstagramPost = {
  id: string;
  /** サイト内の画像パス、または Instagram 公式APIから得た画像URL */
  image: string;
  width: number;
  height: number;
  permalink: string;
  caption?: string;
  alt: string;
  date: string;
  /** 動画（リール）の場合は true（サムネイルを表示し、元の投稿へリンク） */
  video?: boolean;
};

type ApiMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

/**
 * Instagram 公式API（Instagram API with Instagram Login）で最新投稿を取得します。
 * - プロアカウント（ビジネス／クリエイター）と長期アクセストークンが必要です
 * - トークンは環境変数 INSTAGRAM_ACCESS_TOKEN にだけ置きます
 * - 取得に失敗してもサイトは壊れず、手で登録した投稿を表示します
 */
async function fromApi(limit: number): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiMedia[] };
    return (json.data ?? [])
      .map((m): InstagramPost | null => {
        const image = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
        if (!image || !m.permalink.startsWith("https://www.instagram.com/")) return null;
        const caption = m.caption?.trim();
        return {
          id: m.id,
          image,
          // 公式APIは画像サイズを返さないため、Instagram の標準的な縦長比率で表示枠を作ります
          width: 1080,
          height: 1350,
          permalink: m.permalink,
          caption,
          alt: caption ? caption.split("\n")[0]!.slice(0, 80) : "Instagram の投稿写真",
          date: m.timestamp.slice(0, 10),
          video: m.media_type === "VIDEO",
        };
      })
      .filter((p): p is InstagramPost => p !== null);
  } catch {
    return null;
  }
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const limit = social.instagram.limit;
  if (process.env.SOCIAL_SAMPLE === "1") return sampleInstagram().slice(0, limit);
  const api = await fromApi(limit);
  if (api && api.length) return api;
  return instagramPosts.slice(0, limit);
}

/** 表示確認用のサンプル（ローカルで SOCIAL_SAMPLE=1 のときだけ。本番では使いません） */
function sampleInstagram(): InstagramPost[] {
  const ids = [
    "runner-levee-dusk",
    "motomachi-riverside-path",
    "castle-moat-dusk",
    "kyobashi-river-inari",
    "ota-floodway-embankment",
    "motoyasu-river-peace-bridge",
  ];
  return ids.map((id, i) => ({
    id: `sample-${i}`,
    image: `/photos/${id}.jpg`,
    width: 1080,
    height: 1350,
    permalink: "https://www.instagram.com/",
    alt: "表示確認用のサンプル写真",
    date: "2026-11-22",
  }));
}
