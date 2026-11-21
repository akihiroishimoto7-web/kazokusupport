import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseGpx, summarizeGpx } from "@/lib/gpx";

/** public/gpx/ のGPXから、ルート図と高低図、距離・累積標高を描きます */
export function CourseRoute({ file, name }: { file: string; name: string }) {
  const full = path.join(process.cwd(), "public", "gpx", path.basename(file));
  if (!fs.existsSync(full)) return null;
  const sum = summarizeGpx(parseGpx(fs.readFileSync(full, "utf8")));
  if (!sum) return null;
  return (
    <figure className="route">
      <svg viewBox={`0 0 1000 ${sum.routeHeight}`} className="route__map" role="img" aria-label={`${name}のルート図（北が上）`}>
        <path d={sum.routePath} className="route__line" />
        <circle cx={sum.start.x} cy={sum.start.y} r="9" className="route__start" />
        <circle cx={sum.end.x} cy={sum.end.y} r="5" className="route__end" />
      </svg>
      {sum.profilePath ? (
        <svg viewBox="0 0 1000 200" className="route__profile" role="img" aria-label="高低図" preserveAspectRatio="none">
          <path d={sum.profilePath} />
        </svg>
      ) : null}
      <figcaption className="route__caption">
        <span>
          GPXから計算した距離 <strong className="num">{sum.distanceKm.toFixed(2)}km</strong>
        </span>
        {sum.elevationGainM !== null ? (
          <span>
            累積標高 <strong className="num">{sum.elevationGainM}m</strong>
          </span>
        ) : null}
        <a href={`/gpx/${path.basename(file)}`} download>
          GPXファイルをダウンロード
        </a>
      </figcaption>
    </figure>
  );
}
