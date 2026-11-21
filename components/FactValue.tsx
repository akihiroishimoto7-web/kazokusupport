import type { Fact } from "@/lib/types";
import { FACT_LABEL, factState, formatDate } from "@/lib/format";
import { Badge } from "./Badge";

type Props<T> = {
  fact: Fact<T>;
  format?: (v: T) => string;
  /** 未確認のときに出す説明（任意） */
  emptyText?: string;
};

/** 確認状態つきの値を表示します。未確認の値は推測で埋めず、そのまま「未確認」と表示します */
export function FactValue<T>({ fact, format, emptyText }: Props<T>) {
  const state = factState(fact);
  if (state === "unknown") {
    return (
      <span className="fact fact--unknown">
        <Badge tone="unknown">{FACT_LABEL.unknown}</Badge>
        {fact.note || emptyText ? <span className="fact__note">{fact.note ?? emptyText}</span> : null}
      </span>
    );
  }
  const text = format ? format(fact.value as T) : String(fact.value);
  return (
    <span className={`fact fact--${state}`}>
      <span className="fact__value">{text}</span>
      {state === "unverified" ? <Badge tone="unverified">{FACT_LABEL.unverified}</Badge> : null}
      {fact.source ? (
        <span className="fact__source">
          出典：
          {fact.source.url ? (
            <a href={fact.source.url} target="_blank" rel="noopener noreferrer">
              {fact.source.title}
            </a>
          ) : (
            fact.source.title
          )}
          {fact.source.checkedAt ? `（${formatDate(fact.source.checkedAt)}確認）` : null}
        </span>
      ) : null}
      {fact.note ? <span className="fact__note">{fact.note}</span> : null}
    </span>
  );
}
