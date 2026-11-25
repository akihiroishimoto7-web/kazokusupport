import { Marked, type Tokens } from "marked";

/**
 * 記事本文（Markdown）を、表示用のかたまり（セグメント）に分けます。
 *
 * 通常の Markdown に加えて、次の書き方が使えます。
 *
 *   :::note 見出し          … 補足
 *   :::caution 見出し       … 注意
 *   :::experience 見出し    … 運営者が実際に体験したこと
 *   :::research 見出し      … 第三者の情報・レビューを調べたこと
 *   :::evidence 見出し      … 医学的・科学的な根拠（出典を書く）
 *   本文
 *   :::
 *
 *   @shoe(asics-novablast)    … シューズの紹介を埋め込む
 *   @gear(pouch)              … 道具カテゴリーを埋め込む
 *   @course(chuo-park)        … コースを埋め込む
 *   @article(start-first-week) … 記事へのリンクを埋め込む
 *   @tool(shoe-finder)        … 診断ツールへの入口を埋め込む
 *
 * 安全のため、本文中のHTMLタグはそのまま文字として表示されます。
 */

export type CalloutKind = "note" | "caution" | "experience" | "research" | "evidence";
export type EmbedKind = "shoe" | "gear" | "course" | "article" | "tool";

export type Segment =
  | { type: "html"; html: string }
  | { type: "callout"; kind: CalloutKind; title?: string; html: string }
  | { type: "embed"; kind: EmbedKind; slug: string };

export type TocItem = { id: string; text: string };

const CALLOUTS: CalloutKind[] = ["note", "caution", "experience", "research", "evidence"];
const EMBEDS: EmbedKind[] = ["shoe", "gear", "course", "article", "tool"];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createMarked(toc: TocItem[], counter: { n: number }) {
  const marked = new Marked({ gfm: true, breaks: false });
  // 日本語の句読点・かっこの前後でも **太字** が効くようにする（標準の規則では「）**は」などが太字にならない）
  marked.use({
    extensions: [
      {
        name: "cjkStrong",
        level: "inline",
        start(src: string) {
          const i = src.indexOf("**");
          return i < 0 ? undefined : i;
        },
        tokenizer(this: { lexer: { inlineTokens: (s: string) => Tokens.Generic[] } }, src: string) {
          const m = /^\*\*([^*\n]+?)\*\*/.exec(src);
          if (m) return { type: "cjkStrong", raw: m[0], text: m[1]!, tokens: this.lexer.inlineTokens(m[1]!) };
          return undefined;
        },
        renderer(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Generic) {
          return `<strong>${this.parser.parseInline(token.tokens ?? [])}</strong>`;
        },
      },
    ],
  });
  marked.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        const level = Math.min(Math.max(token.depth, 2), 4);
        if (level === 2) {
          counter.n += 1;
          const id = `s${counter.n}`;
          toc.push({ id, text: token.text.replace(/[*_`]/g, "") });
          return `<h2 id="${id}">${inner}</h2>\n`;
        }
        return `<h${level}>${inner}</h${level}>\n`;
      },
      html(token: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(token.text);
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
        const text = this.parser.parseInline(token.tokens);
        const href = token.href ?? "";
        if (/^javascript:/i.test(href)) return text;
        const external = /^https?:\/\//.test(href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        const mark = external ? '<span class="ext" aria-hidden="true">↗</span><span class="sr-only">（外部サイト）</span>' : "";
        return `<a href="${escapeHtml(href)}"${attrs}>${text}${mark}</a>`;
      },
      image(token: Tokens.Image) {
        // 記事内の画像は loading="lazy" で読み込む
        const alt = escapeHtml(token.text ?? "");
        return `<figure class="prose-figure"><img src="${escapeHtml(token.href)}" alt="${alt}" loading="lazy" decoding="async" />${
          token.title ? `<figcaption>${escapeHtml(token.title)}</figcaption>` : ""
        }</figure>`;
      },
    },
  });
  return marked;
}

function wrapTables(html: string): string {
  return html.replace(/<table>/g, '<div class="table-wrap" tabindex="0"><table>').replace(/<\/table>/g, "</table></div>");
}

export function renderArticleBody(body: string): { segments: Segment[]; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const counter = { n: 0 };
  const marked = createMarked(toc, counter);
  const md = (s: string) => wrapTables(marked.parse(s, { async: false }) as string);

  const segments: Segment[] = [];
  const lines = body.split(/\r?\n/);
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text) segments.push({ type: "html", html: md(text) });
    buf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const open = line.match(/^:::(\w+)\s*(.*)$/);
    if (open && CALLOUTS.includes(open[1] as CalloutKind)) {
      flush();
      const inner: string[] = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i]!)) {
        inner.push(lines[i]!);
        i++;
      }
      const innerToc: TocItem[] = [];
      const innerMarked = createMarked(innerToc, { n: 1000 });
      segments.push({
        type: "callout",
        kind: open[1] as CalloutKind,
        title: open[2]?.trim() || undefined,
        html: wrapTables(innerMarked.parse(inner.join("\n"), { async: false }) as string),
      });
      continue;
    }
    const embed = line.trim().match(/^@(\w+)\(([a-z0-9-]+)\)$/);
    if (embed && EMBEDS.includes(embed[1] as EmbedKind)) {
      flush();
      segments.push({ type: "embed", kind: embed[1] as EmbedKind, slug: embed[2]! });
      continue;
    }
    buf.push(line);
  }
  flush();
  return { segments, toc };
}

/** 本文から埋め込みの参照を取り出す（内容検証用） */
export function listEmbeds(body: string): { kind: string; slug: string }[] {
  return [...body.matchAll(/^@(\w+)\(([a-z0-9-]+)\)\s*$/gm)].map((m) => ({ kind: m[1]!, slug: m[2]! }));
}
