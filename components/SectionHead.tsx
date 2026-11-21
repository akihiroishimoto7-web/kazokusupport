import type { ReactNode } from "react";

type Props = {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  no?: string;
  id?: string;
  as?: "h1" | "h2";
  tone?: "default" | "dark";
};

/** セクションの見出し。小さな日本語のラベル、明朝の大見出し、短いリード */
export function SectionHead({ label, title, lead, no, id, as = "h2", tone = "default" }: Props) {
  const H = as;
  return (
    <header className={`sec-head ${tone === "dark" ? "sec-head--dark" : ""}`}>
      <p className="sec-head__label">
        {no ? <span className="sec-head__no num">{no}</span> : null}
        <span>{label}</span>
      </p>
      <H className="sec-head__title" id={id}>
        {title}
      </H>
      {lead ? <p className="sec-head__lead">{lead}</p> : null}
    </header>
  );
}
