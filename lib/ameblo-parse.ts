/** アメブロのRSSを読み取る純粋関数（外部ライブラリ・別名インポートなし。テストから直接読み込めます） */

export type AmebloEntry = {
  title: string;
  url: string;
  date: string;
  /** 本文の冒頭（RSSの本文から作る要約。RSSにない情報は作りません） */
  summary: string;
  /** RSS本文に画像が含まれていた場合だけ */
  image?: string;
};

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1];

/** RSS 2.0 を読み取る（外部ライブラリなし）。テスト可能な純粋関数 */
export function parseAmebloRss(xml: string, amebaId: string): AmebloEntry[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const out: AmebloEntry[] = [];
  for (const it of items) {
    const title = decode(tag(it, "title") ?? "").trim();
    const url = decode(tag(it, "link") ?? "").trim();
    const pub = tag(it, "pubDate")?.trim();
    // 自分のブログの記事URLだけを通す（念のため）
    if (!title || !url.startsWith(`https://ameblo.jp/${amebaId}/`)) continue;
    const d = pub ? new Date(pub) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const html = decode(tag(it, "description") ?? "");
    const img = html.match(/<img[^>]+src="(https:\/\/[^"]+)"/)?.[1];
    const text = html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    out.push({
      title,
      url,
      date: new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10),
      summary: text.length > 70 ? `${text.slice(0, 70)}…` : text,
      // アメブロの画像サーバーの画像だけを使う
      image: img && /^https:\/\/stat\.ameba\.jp\//.test(img) ? img : undefined,
    });
  }
  return out;
}

