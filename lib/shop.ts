import { affiliate } from "@/content/affiliate";
import type { ShopLinks } from "./types";

export type ShopId = "rakuten" | "amazon" | "yahoo";

export type ShopLink = {
  shop: ShopId;
  label: string;
  url: string;
  /** アフィリエイトIDが設定され、紹介料が発生しうるリンクか */
  sponsored: boolean;
};

const LABEL: Record<ShopId, string> = { rakuten: "楽天市場", amazon: "Amazon", yahoo: "Yahoo!ショッピング" };

function rakuten(query: string): ShopLink {
  const plain = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(query)}/`;
  const id = affiliate.rakuten.affiliateId;
  if (!id) return { shop: "rakuten", label: LABEL.rakuten, url: plain, sponsored: false };
  const enc = encodeURIComponent(plain);
  return {
    shop: "rakuten",
    label: LABEL.rakuten,
    url: `https://hb.afl.rakuten.co.jp/hgc/${encodeURIComponent(id)}/?pc=${enc}&m=${enc}`,
    sponsored: true,
  };
}

function amazon(query: string): ShopLink {
  const tag = affiliate.amazon.associateTag;
  const url = new URL("https://www.amazon.co.jp/s");
  url.searchParams.set("k", query);
  if (tag) url.searchParams.set("tag", tag);
  return { shop: "amazon", label: LABEL.amazon, url: url.toString(), sponsored: Boolean(tag) };
}

function yahoo(query: string): ShopLink {
  const plain = `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(query)}`;
  const { valuecommerceSid: sid, valuecommercePid: pid } = affiliate.yahoo;
  if (!sid || !pid) return { shop: "yahoo", label: LABEL.yahoo, url: plain, sponsored: false };
  const url = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${encodeURIComponent(sid)}&pid=${encodeURIComponent(
    pid,
  )}&vc_url=${encodeURIComponent(plain)}`;
  return { shop: "yahoo", label: LABEL.yahoo, url, sponsored: true };
}

/** 商品データの links から、表示用の購入リンク一覧を作ります */
export function buildShopLinks(links: ShopLinks | undefined): ShopLink[] {
  if (!links) return [];
  const out: ShopLink[] = [];
  for (const shop of affiliate.shops) {
    const q = links[shop];
    if (!q) continue;
    if (shop === "rakuten") out.push(rakuten(q));
    if (shop === "amazon") out.push(amazon(q));
    if (shop === "yahoo") out.push(yahoo(q));
  }
  return out;
}

/** サイト全体でアフィリエイトが1つでも有効か */
export const affiliateActive = Boolean(
  affiliate.rakuten.affiliateId ||
    affiliate.amazon.associateTag ||
    (affiliate.yahoo.valuecommerceSid && affiliate.yahoo.valuecommercePid),
);
