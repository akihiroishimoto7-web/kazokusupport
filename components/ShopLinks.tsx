import type { ShopLinks as ShopLinksType } from "@/lib/types";
import { buildShopLinks } from "@/lib/shop";
import { Arrow } from "./Arrow";
import { Badge } from "./Badge";

type Props = {
  links: ShopLinksType | undefined;
  /** 何を探すリンクか（例: NOVABLAST シリーズ） */
  subject: string;
  /** 個別の商品ではなく検索結果へのリンクであることの説明 */
  kind?: "search" | "product";
  compact?: boolean;
};

/**
 * 購入先の比較リンク。
 * - アフィリエイトIDが設定されているときだけ「広告」表示と rel="sponsored" を付けます
 * - 価格・在庫・割引率はここでは表示しません（推測で書かないため）
 */
export function ShopLinks({ links, subject, kind = "search", compact }: Props) {
  const list = buildShopLinks(links);
  if (!list.length && !links?.official) return null;
  const sponsored = list.some((l) => l.sponsored);
  return (
    <section className={`shop-links ${compact ? "shop-links--compact" : ""}`} aria-label={`${subject}の購入先`}>
      <div className="shop-links__head">
        <p className="shop-links__title">{compact ? "購入先" : "購入先をくらべる"}</p>
        {sponsored ? <Badge tone="sponsored">広告</Badge> : null}
      </div>
      <ul role="list" className="shop-links__list">
        {links?.official ? (
          <li>
            <a href={links.official} target="_blank" rel="noopener noreferrer" className="shop-link">
              <span className="shop-link__shop">メーカー公式サイト</span>
              <span className="shop-link__go">
                見る <Arrow dir="up-right" />
              </span>
            </a>
          </li>
        ) : null}
        {list.map((l) => (
          <li key={l.shop}>
            <a
              href={l.url}
              target="_blank"
              rel={l.sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              className="shop-link"
            >
              <span className="shop-link__shop">{l.label}</span>
              <span className="shop-link__go">
                {kind === "search" ? "検索結果を見る" : "商品を見る"} <Arrow dir="up-right" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="shop-links__note">
        {kind === "search"
          ? `「${subject}」の検索結果へのリンクです。特定の商品や価格をおすすめするものではありません。`
          : null}
        {sponsored
          ? "リンク先で購入されると、運営者に紹介料が支払われることがあります。紹介料の有無や金額で、掲載や評価の内容を変えることはありません。"
          : null}
        価格・在庫は各ショップでご確認ください。
      </p>
    </section>
  );
}
