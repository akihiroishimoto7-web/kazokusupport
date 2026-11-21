import Image from "next/image";
import { getPhoto } from "@/content/photos";
import type { Photo as PhotoType } from "@/lib/types";

type Ratio = "4/5" | "3/4" | "1/1" | "3/2" | "4/3" | "16/9" | "21/9" | "natural";

type Props = {
  id?: string | null;
  ratio?: Ratio;
  sizes?: string;
  priority?: boolean;
  /** キャプションを表示するか */
  caption?: boolean | "credit-only";
  className?: string;
  /** 写真がないときの代わり（タイポグラフィの面） */
  fallback?: { title: string; sub?: string };
};

export function creditText(p: PhotoType): string {
  if (p.credit.kind === "self") return "写真：運営者撮影";
  return `写真：${p.credit.author}（${p.credit.license}）`;
}

/**
 * 写真の表示。写真がない場合でも、文字と余白だけで成り立つ面を表示します。
 * 撮影地が広島でない写真には「イメージ」であることを必ず併記します（content/photos.ts の isHiroshima）。
 */
export function Photo({ id, ratio = "3/2", sizes = "100vw", priority, caption = true, className, fallback }: Props) {
  const p = getPhoto(id);
  if (!p) {
    if (!fallback) return null;
    return (
      <figure className={`photo photo--plate ${className ?? ""}`}>
        <div className="photo__frame plate" style={{ aspectRatio: ratio === "natural" ? "3/2" : ratio }}>
          <PlateLines />
          <span className="plate__title">{fallback.title}</span>
          {fallback.sub ? <span className="plate__sub">{fallback.sub}</span> : null}
        </div>
      </figure>
    );
  }
  const ar = ratio === "natural" ? `${p.width}/${p.height}` : ratio;
  return (
    <figure className={`photo ${className ?? ""}`}>
      <div className="photo__frame" style={{ aspectRatio: ar }}>
        <Image
          src={p.src}
          alt={p.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover", objectPosition: p.focus ?? "50% 50%" }}
        />
      </div>
      {caption ? (
        <figcaption className="photo__caption">
          {caption === true ? <span className="photo__place">{p.isHiroshima ? p.caption ?? p.place : `${p.caption ?? ""}　${p.place}`}</span> : null}
          <span className="photo__credit">
            {p.credit.kind === "licensed" ? (
              <a href={p.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                {creditText(p)}
              </a>
            ) : (
              creditText(p)
            )}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

/** 写真のない面に敷く、川の流れのような細い線 */
export function PlateLines() {
  return (
    <svg className="plate__lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={i}
          d={`M-10 ${70 + i * 22} C 90 ${40 + i * 24}, 170 ${110 + i * 20}, 260 ${80 + i * 22} S 380 ${60 + i * 25}, 420 ${90 + i * 21}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}
