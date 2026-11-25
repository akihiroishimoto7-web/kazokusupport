import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FeatureFigure } from "@/components/FeatureFigure";
import { JsonLd } from "@/components/JsonLd";
import { Arrow } from "@/components/Arrow";
import { gyakusouFeature as f, zoomFlySp as m, type FeaturePhotoCut } from "@/content/features/gyakusou";
import { formatDate } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: `${f.title}｜${f.subtitle}`,
  description: f.description,
  path: f.path,
  type: "article",
  publishedAt: f.publishedAt,
  updatedAt: f.updatedAt,
});

const photo = (cut: FeaturePhotoCut) => m.photos.find((p) => p.cut === cut);

function OfficialLink() {
  return (
    <p className="fx-official">
      <a href={m.officialUrl} target="_blank" rel="noopener noreferrer">
        Nike SNKRSで見る
      </a>
      <span>公式の写真は、Nike のサイトでご覧ください（外部サイト）。</span>
    </p>
  );
}

export default function GyakusouFeaturePage() {
  const crumbs = [
    { name: "特集", path: "/features" },
    { name: f.title, path: f.path },
  ];
  const hasPhotos = m.photos.length > 0;

  return (
    <article className="fx">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
      </div>

      <header className="fx-head">
        <p className="fx-kicker">
          <span>RUN LIFE HIROSHIMA の編集特集</span>
          <span>第{m.issue}弾</span>
        </p>
        <h1 className="fx-title">
          <span className="fx-title__main">{f.title}</span>
          <span className="fx-title__sub">{f.subtitle}</span>
        </h1>
        <p className="fx-lede">
          速さを測るための道具なのに、ずっと眺めていたくなる。ナイキと UNDERCOVER の高橋盾さんによるランニングライン「GYAKUSOU（ギャクソウ）」を、走る人の目で読んでみます。
        </p>
        <p className="fx-meta">
          <time dateTime={f.publishedAt}>{formatDate(f.publishedAt)}</time>
          <span>文：RUN LIFE HIROSHIMA</span>
        </p>
      </header>

      <div className={`fx-body ${hasPhotos ? "fx-body--photos" : ""}`}>
        <section className="fx-sec" aria-labelledby="name">
          <h2 id="name" className="fx-h2">
            「逆走」という名前
          </h2>
          <p>
            Gyakusou は、日本語の「逆走」をそのまま名前にしたラインです。ナイキの公式発表によれば、始まりは2010年。高橋盾さんの、デザイナーとして、そしてランナーとしての視点に、ナイキの技術を重ねてきました。
          </p>
          <p>
            同じ発表は、2010年ごろのランニングウェアは見た目がどれも似ていた、と振り返っています。Gyakusou はそこに、思いがけない色や組み立て、使い勝手を持ち込みました。それでいて、走る人が必要とするものからは離れなかった。
          </p>
          <blockquote className="fx-quote">
            <p>
              Gyakusou を始めたころから、ランニングのカルチャーは変わり、スポーツとしてもずっと大きくなった。新しい世代が自分なりの走る理由を見つけ、走ることで自分を表現している。だからこそ、Gyakusou の考え方は、いま特に意味があると感じている。
            </p>
            <footer>高橋盾（ナイキ公式発表より。英文を当サイトで訳しました）</footer>
          </blockquote>
          <p>
            走るための道具でありながら、見た目と機能を切り離さない。走る服に惹かれる理由の半分は、たぶんそこにあります。
          </p>
        </section>

        <section className="fx-sec" aria-labelledby="model">
          <p className="fx-sec__kicker">第{m.issue}弾</p>
          <h2 id="model" className="fx-h2">
            {m.name}
          </h2>
          <FeatureFigure photo={photo("side")} priority />
          <p>
            Nike SNKRS の商品ページは、この一足を「明かりのない道へと誘う」と紹介しています。半透明のアッパーに、光を返すリフレクティブ素材のディテール。カーボン混ナイロンプレートで、弾むような心地よさを狙った。Gyakusou のグラフィックには、速さと大胆なスタイルに対する高橋さんの美学を込めた、とあります。
          </p>
          <dl className="fx-facts">
            {m.facts.map((x) => (
              <div key={x.label}>
                <dt>{x.label}</dt>
                <dd>{x.value}</dd>
              </div>
            ))}
          </dl>
          <p className="fx-small">Nike SNKRS の商品ページの記載とデータから（2026年11月25日確認）。</p>
          <OfficialLink />
        </section>

        <section className="fx-sec" aria-labelledby="color">
          <h2 id="color" className="fx-h2">
            色を読む
          </h2>
          <p>
            色の名前は、ブラック、セイル（生成り）、ミネラルイエローの三つです。けれど Nike SNKRS の写真で見ると、目に入る面積のほとんどは黒。セイルは、ミッドソールに沿って細く引かれた一本の線として、ミネラルイエローは、靴底にのぞく小さな面として置かれています。
          </p>
          <p>
            夜の道では、黒は景色に溶けます。溶けた輪郭を、白い一本線がなぞり、蹴り出すたびに黄色が一瞬だけ見える。差し色を「見せる」場所ではなく、「動いたときに現れる」場所に置いているように見えます。
          </p>
        </section>

        <section className="fx-sec" aria-labelledby="material">
          <h2 id="material" className="fx-h2">
            素材を読む
          </h2>
          <FeatureFigure photo={photo("material")} />
          <p>
            半透明のアッパーは、内側の構造をうっすら透かします。写真では、アッパーの下に横方向の線が幾重にも重なって見えます。隠すのではなく、重ねたまま見せる素材の使い方です。
          </p>
          <p>
            そこに、リフレクティブのディテール。昼の光ではほとんど目立たず、光を受けたときにだけ浮かび上がる素材は、「明かりのない道」という公式の言葉とそのまま結びついています。
          </p>
        </section>

        <section className="fx-sec" aria-labelledby="silhouette">
          <h2 id="silhouette" className="fx-h2">
            走るときのシルエットを読む
          </h2>
          <FeatureFigure photo={photo("rear-quarter")} />
          <p>
            置かれた靴と、走っている靴とでは、見え方が違います。走っているあいだ、ほかの人の目に入るのは、すれ違う一瞬の真横の姿と、追い越されたあとの斜め後ろの姿です。
          </p>
          <p>
            写真では、交差した骨のグラフィックと「GYAKUSOU」の文字が、側面のかかと寄りに置かれています。向き合ったときではなく、通り過ぎたあとに見える位置。「逆走」という名前を思うと、少し面白い置き方です。
          </p>
          <p>実物を見る機会があれば、真横と斜め後ろから、少し離れて眺めてみてください。</p>
        </section>

        <section className="fx-sec" aria-labelledby="now">
          <h2 id="now" className="fx-h2">
            2026年、ふたたび
          </h2>
          <p>
            ナイキは2026年11月25日、Gyakusou の新しいコレクションを発表しました。2021年以来の新作で、寒い季節のランニングに向けたウェアと、Nike Alphafly 4 SP、Nike Vomero Plus SP が含まれます。
          </p>
          <p>
            これまで思いがけない配色で知られてきた Gyakusou が、今回は色を抑え、トーンをそろえた白と、土を思わせる緑で組み立てている、と発表は伝えています。発売は、12月3日に UNDERCOVER の店舗などで、12月11日に nike.com と SNKRS などで世界一斉に、とのことです。
          </p>
          <p>色を足すことで驚かせてきたラインが、色を引くことで驚かせにくる。続きは、この特集でも追いかけます。</p>
        </section>

        <aside className="fx-note" aria-label="この特集について">
          <p>
            運営者は、このシューズを実際に履いていません。そのため、履き心地には触れていません。高橋盾さんの考えは、公式に公開された発言だけを引用しています。色・素材・シルエットの観察は、Nike SNKRS の公式写真を見て書いたものです。
          </p>
        </aside>

        <section className="fx-sec fx-sources" aria-labelledby="sources">
          <h2 id="sources" className="fx-h3">
            出典
          </h2>
          <ol>
            {f.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                <span>
                  {s.publisher}、{formatDate(s.checkedAt)}確認
                </span>
              </li>
            ))}
          </ol>
        </section>

        <nav className="fx-next" aria-label="あわせて読む">
          <p className="fx-h3">あわせて読む</p>
          <ul role="list">
            <li>
              <Link href="/articles/column-osako-style">
                大迫傑は、ランナーの「格好」を変えた <Arrow />
              </Link>
            </li>
            <li>
              <Link href="/articles/column-kipchoge-form">
                キプチョゲのフォームは、なぜ美しいのか <Arrow />
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <JsonLd
        data={[
          articleJsonLd({
            title: `${f.title}｜${f.subtitle}`,
            description: f.description,
            path: f.path,
            publishedAt: f.publishedAt,
            updatedAt: f.updatedAt,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </article>
  );
}
