#!/usr/bin/env node
/**
 * アメブロ記事の下書きを、シューズデータベースから作ります（投稿はしません）。
 * ------------------------------------------------------------------
 *   npm run ameblo:drafts                       … 値下がりまとめ＋未作成のモデル記事
 *   npm run ameblo:drafts -- --series=brooks-ghost
 *   npm run ameblo:drafts -- --min-off=30        … 値下がりまとめに載せる割引率（%）の下限
 *
 * 出力: drafts/ameblo/<日付>-<種類>.md（git管理外ではなく、履歴として残します）
 *
 * 原則（docs/EDITORIAL.md）:
 *   - 冒頭に広告（PR）表記。数値には確認日と出典。推測の価格・評価は書かない
 *   - 「買わなくていい人」も必ず書く
 *   - HPへのリンクには utm を付け、アメブロからの送客を計測できるようにする
 *   - 投稿は運営者が手作業で行う（SNS・ブログへの自動投稿はしない）
 */
import fs from "node:fs";
import path from "node:path";
import { shoes } from "../../content/shoes.ts";
import { brands } from "../../content/brands.ts";
import { site } from "../../content/site.ts";
import { modelsOf, discountRate, priceHistory, usesNonOfficial } from "../../lib/shoe-db.ts";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const today = new Date().toISOString().slice(0, 10);
const outDir = path.join(ROOT, "drafts/ameblo");
fs.mkdirSync(outDir, { recursive: true });

const brandName = (id) => brands.find((b) => b.id === id)?.name ?? id;
const yen = (n) => `${n.toLocaleString("ja-JP")}円`;
const jdate = (iso) => iso.replaceAll("-", ".");
const hp = (p, campaign) => `${site.url}${p}?utm_source=ameblo&utm_medium=blog&utm_campaign=${campaign}`;

const PR = "※この記事には広告（PR）を含みます。紹介する順番や評価は、紹介料の有無で変えていません。";

/* ------------------------------------------------------------ 値下がりまとめ */
function dealsDraft(minOff) {
  const rows = [];
  for (const s of shoes) {
    for (const m of modelsOf(s.slug)) {
      const off = discountRate(m);
      if (off != null && off >= minOff) rows.push({ s, m, off });
    }
  }
  if (!rows.length) return null;
  rows.sort((a, b) => b.off - a.off || a.m.id.localeCompare(b.m.id));
  const checked = [...new Set(rows.map((r) => r.m.officialPrice.checkedAt))].sort().pop();
  const lines = [
    `# 【PR】公式ストアで値下がりしているランニングシューズ（${jdate(checked)}確認）`,
    "",
    PR,
    "",
    `メーカー公式オンラインストアで、通常価格から${minOff}%以上安くなっていたモデルをまとめました。多くは「一つ前の世代」です。新しいモデルにこだわらなければ、十分に走れる一足が手頃に手に入ります。`,
    "",
    "価格は確認した日のものです。セールの終了や在庫切れで変わるので、購入前に必ず各ストアで確かめてください。",
    "",
    "| モデル | 公式ストアの価格 | 通常価格 | 割引 |",
    "| --- | --- | --- | --- |",
    ...rows.map((r) => `| ${brandName(r.s.brand)} ${r.m.name}${r.m.lifecycle === "previous" ? "（前の世代）" : ""} | ${yen(r.m.officialPrice.priceJpy)} | ${yen(r.m.officialPrice.regularPriceJpy)} | ${r.off}%引き |`),
    "",
    "## それぞれ、どんな人に向いている？",
    "",
  ];
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.s.slug)) continue;
    seen.add(r.s.slug);
    lines.push(
      `### ${brandName(r.s.brand)} ${r.s.series}`,
      "",
      `${r.s.catch}。`,
      "",
      `- 向いている人：${r.s.recommendFor.join("／")}`,
      `- 向いていない人：${r.s.notFor.join("／")}`,
      `- 買わなくていい理由：${r.s.reasonsNotToBuy[0]}`,
      "",
      `重量・ドロップ・価格の記録はHPにまとめています → ${hp(`/shoes/${r.s.slug}`, `deals-${today}`)}`,
      "",
      "（ここに Ameba Pick の商品リンクを貼る）",
      "",
    );
  }
  lines.push(
    "## 選ぶときのひとこと",
    "",
    "安いから買う、ではなく、いまのシューズで困っていることがあるかどうかで決めてください。痛みや不満がなければ、買い替える必要はありません。",
    "",
    `自分に合うタイプがわからないときは、HPのシューズ診断（走力・用途・予算から選べます）→ ${hp("/tools/shoe-finder", `deals-${today}`)}`,
    "",
    "---",
    `出典：各メーカー公式オンラインストア（${jdate(checked)}確認）`,
  );
  return lines.join("\n") + "\n";
}

/* ------------------------------------------------------------ モデル記事 */
function modelDraft(s) {
  const ms = modelsOf(s.slug);
  const m = ms.find((x) => x.lifecycle === "current");
  if (!m) return null;
  const prev = ms.filter((x) => x.lifecycle === "previous");
  const b = brandName(s.brand);
  const spec = (k, unit) => (m.specs[k] ? `${m.specs[k].value}${unit}${k === "weightG" && m.specs[k].size ? `（${m.specs[k].size}）` : ""}` : "未確認（公式資料で確認できていません）");
  const hist = priceHistory(m.id);
  const lines = [
    m.specs.weightG ? `# 【PR】${b} ${m.name}の重量・ドロップ・価格と、買わなくていい人` : `# 【PR】${b} ${m.name}は何が変わった？価格と、買わなくていい人`,
    "",
    PR,
    "",
    `${b}の${s.series}シリーズの現行モデル、${m.name}。${usesNonOfficial(m) ? "メーカー公式や、信頼できる販売店・ランニングメディアに書かれている数値" : "メーカー公式ページに書かれている数値"}と、どんな人に向いているかをまとめました。運営者はまだ履いていないので、履き心地の感想は書いていません。`,
    "",
    usesNonOfficial(m) ? "## 数値（出典つき）" : "## 公式の数値",
    "",
    `- 通常価格（税込）：${m.officialPrice?.regularPriceJpy ? yen(m.officialPrice.regularPriceJpy) : "確認できず"}`,
    `- 重量：${spec("weightG", "g")}`,
    `- ドロップ：${spec("dropMm", "mm")}`,
    m.specs.stackHeelMm && m.specs.stackForefootMm ? `- 厚さ：かかと${m.specs.stackHeelMm.value}mm／前足部${m.specs.stackForefootMm.value}mm` : null,
    "",
    `（${jdate(m.checkedAt)}、${m.pageTitle}で確認）`,
    "",
    ...(m.changes?.length
      ? ["## 前のモデルから変わったこと（公式の記載）", "", ...m.changes.flatMap((c) => [`> ${c.text}`, ""]), `（出典：${m.changes[0].sourceTitle}）`, ""]
      : []),
    "## どんなシューズ？",
    "",
    s.positioning,
    "",
    "## 向いている人",
    "",
    ...s.recommendFor.map((t) => `- ${t}`),
    "",
    "## 向いていない人",
    "",
    ...s.notFor.map((t) => `- ${t}`),
    "",
    "## 買わなくていい理由",
    "",
    ...s.reasonsNotToBuy.map((t) => `- ${t}`),
    "",
  ];
  if (prev.length) {
    lines.push("## 一つ前のモデルという選択", "");
    for (const p of prev) {
      const off = discountRate(p);
      lines.push(
        `- ${p.name}：${p.officialPrice ? `公式ストアで${yen(p.officialPrice.priceJpy)}${off ? `（通常価格から${off}%引き）` : ""}、${jdate(p.officialPrice.checkedAt)}確認` : "価格は未確認"}。重量${p.specs.weightG ? `${p.specs.weightG.value}g` : "記載なし"}、ドロップ${p.specs.dropMm ? `${p.specs.dropMm.value}mm` : "記載なし"}`,
      );
    }
    lines.push("", "最新でなくても、走るための一足としては十分です。", "");
  }
  lines.push(
    "（ここに Ameba Pick の商品リンクを貼る）",
    "",
    "## もっとくわしく",
    "",
    `公式ストアの価格の記録や、似たシューズとの比較はHPに載せています → ${hp(`/shoes/${s.slug}`, `model-${m.id}`)}`,
    "",
    `自分に合うかどうかは、シューズ診断でも確かめられます → ${hp("/tools/shoe-finder", `model-${m.id}`)}`,
    "",
    "---",
    `出典：${m.pageTitle}（${m.officialUrl}、${jdate(m.checkedAt)}確認）`,
    hist.length > 1 ? `価格の記録：${hist.length}回` : null,
  );
  return lines.filter((l) => l !== null).join("\n") + "\n";
}

/* ------------------------------------------------------------ 実行 */
const written = [];
const write = (name, body) => {
  const f = path.join(outDir, name);
  fs.writeFileSync(f, body);
  written.push(path.relative(ROOT, f));
};

const minOff = Number(args["min-off"] ?? 30);
if (!args.series) {
  const d = dealsDraft(minOff);
  if (d) write(`${today}-deals.md`, d);
}
const existing = new Set(fs.readdirSync(outDir));
for (const s of shoes) {
  if (args.series && s.slug !== args.series) continue;
  const m = modelsOf(s.slug).find((x) => x.lifecycle === "current");
  if (!m) continue;
  const name = `model-${m.id}.md`;
  if (!args.series && existing.has(name)) continue; // 同じモデルの下書きは作り直さない（--series 指定時は上書き）
  const body = modelDraft(s);
  if (body) write(name, body);
}
console.log(written.length ? `下書きを作りました:\n  ${written.join("\n  ")}` : "新しく作る下書きはありませんでした");
