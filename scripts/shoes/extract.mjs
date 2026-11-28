/**
 * 公式ページのテキストから、シューズの仕様を取り出す純粋関数。
 * ------------------------------------------------------------------
 * - 取り出した値には、必ずページ上の該当行を evidence としてそのまま残します。
 *   後から人やエージェントが「本当にそう書いてあったか」を確認できるようにするためです。
 * - 書かれていない値は推測しません（null のまま）。
 * - 各メーカーの書式は tests/shoe-extract.test.mjs に実例として残しています。
 */

const norm = (s) => s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/ /g, " ");

/** ラベル行の後ろ（同じ行 or 3行以内）から値を探す */
function findAfterLabel(lines, labelRe, valueRe) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!labelRe.test(line) || line.length > 160) continue;
    const same = line.match(valueRe);
    if (same) return { m: same, evidence: line.trim() };
    for (let j = i + 1, seen = 0; j < lines.length && seen < 3; j++) {
      const t = lines[j].trim();
      if (!t) continue;
      seen++;
      if (/とは？$/.test(t)) continue; // On の「重さとは？」のような説明リンク
      const m = t.match(valueRe);
      if (m && t.length < 60) return { m, evidence: `${line.trim()} / ${t}` };
    }
  }
  return null;
}

export function extractSpecs(rawText) {
  const text = norm(rawText);
  const lines = text.split(/\r?\n/);
  const out = { weightG: null, dropMm: null, stackHeelMm: null, stackForefootMm: null };

  // 重量（重量 / 重さ / 質量）。例: 「重量：約300g（メンズサイズ28cm）」「質量	約265g（27.0cm片方）」「重さ : 290g (27cm)」
  const w = findAfterLabel(lines, /^(重量|重さ|質量|シューズの重量)\s*[:：\t ]?/, /約?\s*(\d{3})\s*g\s*(?:[（(/／]\s*([^）)]{0,30}?)\s*[）)]?)?\s*$/);
  if (w) {
    const g = Number(w.m[1]);
    if (g >= 120 && g <= 450) out.weightG = { value: g, size: cleanSize(w.m[2]), evidence: w.evidence };
  }

  // ドロップ / オフセット。例: 「オフセット：10mm」「ミッドソールドロップ : 10mm」「オフセット: / 8mm（36mm/28mm)」
  const d = findAfterLabel(
    lines,
    /(オフセット|ドロップ)\s*[:：\t ]?/,
    /(\d{1,2}(?:\.\d)?)\s*mm\s*(?:[（(]\s*(\d{2}(?:\.\d)?)\s*mm\s*[/／]\s*(\d{2}(?:\.\d)?)\s*mm\s*[）)]?)?/,
  );
  if (d && !/とは/.test(d.evidence.split(" / ").pop())) {
    const v = Number(d.m[1]);
    if (v >= 0 && v <= 16) out.dropMm = { value: v, evidence: d.evidence };
    if (d.m[2] && d.m[3]) {
      out.stackHeelMm = { value: Number(d.m[2]), evidence: d.evidence };
      out.stackForefootMm = { value: Number(d.m[3]), evidence: d.evidence };
    }
  }

  // 厚み（文章中）。例: 「前足部は36mm、かかとは46mmの厚み」
  if (!out.stackHeelMm) {
    const s = text.match(/[^\n。]*前足部は\s*(\d{2})\s*mm[、,]\s*かかとは\s*(\d{2})\s*mm[^\n。]*/);
    if (s) {
      out.stackForefootMm = { value: Number(s[1]), evidence: s[0].trim() };
      out.stackHeelMm = { value: Number(s[2]), evidence: s[0].trim() };
    }
  }
  return out;
}

function cleanSize(s) {
  if (!s) return null;
  const t = s.replace(/\s+/g, "").replace(/片方|片足/g, "");
  return t || null;
}

/** JSON-LD の offers から価格（円）を集める。最頻値を返す */
export function priceFromJsonLd(ld) {
  if (!/"priceCurrency"\s*:\s*"JPY"/.test(ld)) return null;
  const prices = [...ld.matchAll(/"price"\s*:\s*"?(\d{3,6})(?:\.0+)?"?/g)].map((m) => Number(m[1])).filter((n) => n >= 1000);
  if (!prices.length) return null;
  const count = new Map();
  for (const p of prices) count.set(p, (count.get(p) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
}

/**
 * ページ上で価格の直後に「セール価格」と書かれているか（Nike）。
 * セールでなければ、表示価格をメーカー希望小売価格として扱ってよいかは adapter ごとに判断します。
 */
export function looksOnSale(rawText, price) {
  const text = norm(rawText);
  const p = price.toLocaleString("en-US");
  const re = new RegExp(`[￥¥]\\s*${p}[^\\n]*\\n\\s*(セール価格|SALE)`);
  return re.test(text);
}

/** Shopify の /products/<handle>.js の価格（最小単位）を円に */
export function shopifyYen(v) {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  // .js は「銭」単位（×100）、products.json は文字列の円
  return typeof v === "number" ? Math.round(n / 100) : Math.round(n);
}

/**
 * 「前作からの変更」についての公式の記載を、原文の一文のまま取り出す。
 * 前の世代の名前・「前作」「前モデル」「従来」「〜と比較」などを含む文だけを拾い、要約や言い換えはしない。
 */
export function extractChanges(rawText, prevNames = []) {
  const text = norm(rawText);
  const keys = ["前作", "前モデル", "従来モデル", "旧モデル", "と比較し", "と比べて", "よりも", "アップデート", ...prevNames];
  const out = [];
  const seen = new Set();
  for (const line of text.split(/\r?\n/)) {
    for (let s of line.split(/(?<=。)/)) {
      s = s.trim();
      if (s.length < 12 || s.length > 160) continue;
      if (!keys.some((k) => k && s.includes(k))) continue;
      // 一般的な説明（サイズ表・配送・レビュー投稿など）や、ほかの商品の文を避ける
      if (/送料|返品|ポイント|クーポン|レビュー|サイズ表|お気に入り|カート|ログイン|※|\?$/.test(s)) continue;
      if (!/(mm|%|％|g|ミッドソール|クッション|アッパー|プレート|フォーム|ドロップ|フィット|反発|軽|厚|幅|ラバー|インソール|タン)/.test(s)) continue;
      const key = s.replace(/\s+/g, "");
      // 書き出しが同じ文（同じ内容の言い回し違い）は1つだけ残す
      const head = key.slice(0, 12);
      if (seen.has(key) || seen.has(head)) continue;
      seen.add(key);
      seen.add(head);
      out.push(s);
    }
  }
  return out.slice(0, 6);
}
