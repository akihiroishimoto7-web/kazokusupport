import type { ReactNode } from "react";
import type { CalloutKind } from "@/lib/markdown";

const LABEL: Record<CalloutKind, string> = {
  note: "補足",
  caution: "注意",
  experience: "運営者の体験",
  research: "調べたこと",
  evidence: "根拠",
};

/**
 * 記事内の囲み。体験（experience）と調査（research）は必ずラベルを分けて表示し、
 * 読者が「実際に試したこと」と「調べたこと」を区別できるようにします。
 */
export function Callout({ kind, title, children }: { kind: CalloutKind; title?: string; children: ReactNode }) {
  return (
    <aside className={`callout callout--${kind}`}>
      <p className="callout__label">
        <span>{LABEL[kind]}</span>
        {title ? <span className="callout__title">{title}</span> : null}
      </p>
      <div className="callout__body">{children}</div>
    </aside>
  );
}
