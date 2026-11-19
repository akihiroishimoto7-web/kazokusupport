import type { SaleInfo } from "@/lib/types";

/**
 * セール情報。
 * 実際に確認したセールだけを登録してください（割引率や価格を推測で書かない）。
 * endsAt を過ぎたものは自動的に表示されなくなります。
 * 1件もなければ、セール情報の欄そのものが表示されません。
 *
 * 例:
 * {
 *   id: "rakuten-super-sale-2026-12",
 *   title: "楽天スーパーSALE",
 *   shop: "楽天市場",
 *   url: "https://www.rakuten.co.jp/",
 *   checkedAt: "2026-12-01",
 *   endsAt: "2026-12-11",
 *   note: "ランニングシューズも対象ショップあり。対象かどうかは各商品ページで確認してください。",
 * }
 */
export const sales: SaleInfo[] = [];
