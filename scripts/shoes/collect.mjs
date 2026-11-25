#!/usr/bin/env node
/**
 * 公式サイトから、シューズの仕様と価格を集めて data/ に蓄積します。
 * ------------------------------------------------------------------
 *   npm run shoes:collect                 … すべての対象（仕様＋価格）
 *   npm run shoes:collect -- --only=brooks-ghost-18,saucony-ride-19
 *   npm run shoes:collect -- --dry        … 書き込まずに結果だけ表示
 *
 * 書き込むもの:
 *   data/shoes/models/<id>.json   … モデルごとの仕様（値ごとに根拠の行と確認日）
 *   data/prices/<id>.json         … 価格の観測記録（追記のみ。同じ日・同じURLは上書き）
 *   data/shoes/last-run.json      … 実行結果（失敗・取れなかった項目）
 *
 * 原則:
 *   - 取れなかった値は、前回の値を残し、推測で埋めません。
 *   - 公式ページの表示が変わって取れなくなったら、last-run.json に記録されます。
 *   - アクセスは1ページずつ、間隔を空けて行います。
 *
 * 必要なもの: Playwright（このリポジトリの依存には入れていません。クラウド環境には導入済み）
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { extractSpecs, priceFromJsonLd, looksOnSale, shopifyYen } from "./extract.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const today = new Date().toISOString().slice(0, 10);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const { targets } = JSON.parse(fs.readFileSync(path.join(ROOT, "data/shoes/targets.json"), "utf8"));
const only = typeof args.only === "string" ? new Set(args.only.split(",")) : null;
const list = targets.filter((t) => !only || only.has(t.id));

const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : fallback);
const writeJson = (p, v) => {
  if (args.dry) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchShopify(url) {
  const u = new URL(url);
  const res = await fetch(`${u.origin}${u.pathname}.js`, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`shopify ${res.status}`);
  const j = await res.json();
  const price = shopifyYen(j.price);
  const compare = shopifyYen(j.compare_at_price);
  return {
    title: j.title,
    priceJpy: price,
    regularPriceJpy: compare && compare > price ? compare : price,
    onSale: Boolean(compare && compare > price),
  };
}

async function main() {
  const require = createRequire(import.meta.url);
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ locale: "ja-JP", userAgent: UA })).newPage();
  const report = { ranAt: new Date().toISOString(), results: [] };

  for (const t of list) {
    const r = { id: t.id, ok: false, missing: [], notes: [] };
    try {
      const res = await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(4500);
      // 商品詳細が折りたたまれているサイト（Nike など）は開く
      for (const label of ["商品の詳細", "詳細を見る", "商品詳細", "スペック", "仕様"]) {
        try {
          await page.getByText(label, { exact: false }).first().click({ timeout: 1200 });
          await page.waitForTimeout(800);
        } catch {}
      }
      const status = res?.status() ?? 0;
      if (status >= 400) throw new Error(`HTTP ${status}`);
      const title = await page.title();
      const text = await page.evaluate(() => document.body.innerText);
      const ld = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join("\n"));
      const specs = extractSpecs(text);

      // 価格
      let price = null;
      if (t.adapter === "shopify") {
        const s = await fetchShopify(t.url);
        price = { priceJpy: s.priceJpy, regularPriceJpy: s.regularPriceJpy, onSale: s.onSale };
      } else {
        const p = priceFromJsonLd(ld);
        if (p) {
          const sale = looksOnSale(text, p);
          // セール表示がなければ、表示価格を通常価格として扱う（Nike/On/ミズノの公式ストア）
          price = { priceJpy: p, regularPriceJpy: sale ? null : p, onSale: sale };
        }
      }

      // モデルファイルを更新（取れなかった値は前回の値を残す）
      const file = path.join(ROOT, "data/shoes/models", `${t.id}.json`);
      const prev = readJson(file, null);
      const merged = {
        id: t.id,
        series: t.series,
        brand: t.brand,
        name: t.name,
        nameJa: t.nameJa,
        generation: t.generation,
        lifecycle: t.lifecycle,
        officialUrl: t.url,
        pageTitle: title,
        specs: {},
        checkedAt: today,
      };
      for (const key of ["weightG", "dropMm", "stackHeelMm", "stackForefootMm"]) {
        const v = specs[key];
        if (v) merged.specs[key] = { ...v, checkedAt: today };
        else {
          r.missing.push(key);
          if (prev?.specs?.[key]) {
            merged.specs[key] = prev.specs[key];
            r.notes.push(`${key}: 今回は取れず、${prev.specs[key].checkedAt} の値を維持`);
          }
        }
      }
      if (price?.priceJpy) {
        merged.officialPrice = { ...price, checkedAt: today };
        const pfile = path.join(ROOT, "data/prices", `${t.id}.json`);
        const hist = readJson(pfile, { id: t.id, observations: [] });
        hist.observations = hist.observations.filter((o) => !(o.date === today && o.url === t.url));
        hist.observations.push({ date: today, store: "official", url: t.url, ...price });
        hist.observations.sort((a, b) => a.date.localeCompare(b.date));
        writeJson(pfile, hist);
      } else {
        r.missing.push("price");
        if (prev?.officialPrice) merged.officialPrice = prev.officialPrice;
      }
      writeJson(file, merged);
      r.ok = true;
      r.summary = `${merged.specs.weightG?.value ?? "-"}g / drop ${merged.specs.dropMm?.value ?? "-"}mm / ¥${price?.priceJpy ?? "-"}${price?.onSale ? "（セール）" : ""}`;
    } catch (e) {
      r.error = String(e.message ?? e).slice(0, 200);
    }
    report.results.push(r);
    console.log(`${r.ok ? "✓" : "✗"} ${t.id}  ${r.summary ?? r.error}${r.missing.length ? `  [取れず: ${r.missing.join(", ")}]` : ""}`);
    await sleep(2500);
  }
  await browser.close();
  writeJson(path.join(ROOT, "data/shoes/last-run.json"), report);
  const failed = report.results.filter((r) => !r.ok).length;
  console.log(`\n${report.results.length - failed} 件成功 / ${failed} 件失敗${args.dry ? "（--dry: 書き込みなし）" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
