import type { Segment } from "@/lib/markdown";
import { Callout } from "./Callout";
import { Embed } from "./Embeds";

/** 記事本文の表示 */
export function Prose({ segments, variant = "article" }: { segments: Segment[]; variant?: "article" | "essay" }) {
  return (
    <div className={`prose prose--${variant}`}>
      {segments.map((s, i) => {
        if (s.type === "html") return <div key={i} className="prose__flow" dangerouslySetInnerHTML={{ __html: s.html }} />;
        if (s.type === "callout")
          return (
            <Callout key={i} kind={s.kind} title={s.title}>
              <div className="prose__flow" dangerouslySetInnerHTML={{ __html: s.html }} />
            </Callout>
          );
        return <Embed key={i} kind={s.kind} slug={s.slug} />;
      })}
    </div>
  );
}
