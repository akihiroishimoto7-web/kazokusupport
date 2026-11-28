import { Breadcrumbs } from "@/components/Breadcrumbs";
import { photos } from "@/content/photos";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "写真のクレジット",
  description: "RUN LIFE HIROSHIMA で使用している写真の撮影者とライセンスの一覧です。運営者が撮影した写真と、クリエイティブ・コモンズ等で公開されている写真を区別して記載しています。",
  path: "/credits",
});

export default function CreditsPage() {
  const list = Object.values(photos);
  return (
    <div className="hub">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "写真のクレジット", path: "/credits" }]} />
      </div>
      <header className="hub__head wrap">
        <div className="hub__title-block">
          <h1 className="hub__title">写真のクレジット</h1>
          <p className="hub__intro">
            このサイトで使用している写真の撮影地・撮影者・ライセンスです。Wikimedia Commons の写真は、サイズと色調を調整して掲載しています。
          </p>
        </div>
      </header>
      <section className="wrap hub__section">
        <div className="table-wrap" tabIndex={0}>
          <table className="credits">
            <thead>
              <tr>
                <th scope="col">写真</th>
                <th scope="col">撮影地</th>
                <th scope="col">撮影者・ライセンス</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.caption ?? p.alt}</th>
                  <td>{p.place}</td>
                  <td>
                    {p.credit.kind === "self" ? (
                      "運営者撮影"
                    ) : (
                      <>
                        <a href={p.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {p.credit.author}
                        </a>
                        {" / "}
                        {p.credit.licenseUrl ? (
                          <a href={p.credit.licenseUrl} target="_blank" rel="noopener noreferrer license">
                            {p.credit.license}
                          </a>
                        ) : (
                          p.credit.license
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
