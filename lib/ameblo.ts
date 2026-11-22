import "server-only";
import { social } from "@/content/social";

import { parseAmebloRss, type AmebloEntry } from "./ameblo-parse";

export type { AmebloEntry };

/** アメブロ公式のRSSから最新記事を取得（1時間ごとに更新）。失敗しても空配列を返すだけ */
export async function getAmebloEntries(): Promise<AmebloEntry[]> {
  if (process.env.SOCIAL_SAMPLE === "1") return sampleAmeblo();
  const id = social.ameblo.amebaId;
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return [];
  try {
    const res = await fetch(`https://rssblog.ameba.jp/${id}/rss20.xml`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    return parseAmebloRss(await res.text(), id).slice(0, social.ameblo.limit);
  } catch {
    return [];
  }
}

/** 表示確認用のサンプル（ローカルで SOCIAL_SAMPLE=1 のときだけ。本番では使いません） */
function sampleAmeblo(): AmebloEntry[] {
  return [1, 2, 3].map((n) => ({
    title: `表示確認用のサンプル記事タイトル ${n}`,
    url: "https://ameblo.jp/",
    date: `2026-11-2${n}`,
    summary: "アメブロのRSSから取得した本文の冒頭が、ここに70文字ほど表示されます。",
  }));
}
