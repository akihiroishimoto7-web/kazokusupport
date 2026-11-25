import Image from "next/image";
import { CUT_LABEL, type FeaturePhoto } from "@/content/features/gyakusou";

/**
 * 特集の写真。スマートフォンでは画面幅いっぱいに写真を見せ、そのあとに短い一言と解説を置きます。
 * 写真がなければ何も出しません（空の枠や「準備中」は出さない）。
 */
export function FeatureFigure({ photo, priority }: { photo: FeaturePhoto | undefined; priority?: boolean }) {
  if (!photo) return null;
  return (
    <figure className="fx-figure">
      <div className="fx-figure__frame">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(min-width: 1080px) 760px, (min-width: 768px) 62vw, 100vw"
          priority={priority}
        />
      </div>
      <figcaption className="fx-figure__caption">
        <span className="fx-figure__cut">{CUT_LABEL[photo.cut]}</span>
        <span className="fx-figure__text">{photo.caption}</span>
        <span className="fx-figure__note">{photo.note}</span>
        <span className="fx-figure__credit">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}
