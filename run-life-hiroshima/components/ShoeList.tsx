import Link from "next/link";
import type { Shoe } from "@/lib/types";
import { getBrand } from "@/content/brands";
import { Arrow } from "./Arrow";
import { Badge } from "./Badge";

/** シューズの一覧（罫線で区切った目次形式） */
export function ShoeList({ shoes }: { shoes: Shoe[] }) {
  if (!shoes.length) return <p className="empty">該当するシューズは、まだ登録されていません。</p>;
  return (
    <ul role="list" className="shoe-list">
      {shoes.map((s) => {
        const b = getBrand(s.brand);
        return (
          <li key={s.slug}>
            <Link href={`/shoes/${s.slug}`} className="shoe-row">
              <span className="shoe-row__brand latin">{b.name}</span>
              <span className="shoe-row__name latin">{s.model ?? s.series}</span>
              <span className="shoe-row__catch">{s.catch}</span>
              <span className="shoe-row__state">
                {s.status === "review" ? <Badge tone="verified">レビュー</Badge> : <Badge tone="planned">シリーズ概要</Badge>}
              </span>
              <Arrow className="shoe-row__arrow" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
