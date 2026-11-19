import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/content/site";
import { affiliateActive } from "@/lib/shop";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "編集方針・広告・プライバシーについて",
  description: "RUN LIFE HIROSHIMA の編集方針、アフィリエイト広告の表示、プライバシー、免責事項について。",
  path: "/policy",
});

export default function PolicyPage() {
  return (
    <article className="article">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "編集方針・広告について", path: "/policy" }]} />
      </div>
      <header className="article__head wrap">
        <h1 className="article__title">編集方針・広告・プライバシーについて</h1>
      </header>
      <div className="article__layout wrap">
        <div className="article__body prose prose--article">
          <div className="prose__flow">
            <h2 id="ads">広告（アフィリエイト）について</h2>
            <p>
              {site.name}
              では、楽天市場・Amazon・Yahoo!ショッピングなどのアフィリエイトプログラムを利用することがあります。リンク先で商品を購入されると、運営者に紹介料が支払われる場合があります。
            </p>
            <p>
              アフィリエイトリンクを含むページや購入先の一覧には「広告」と表示します。
              {affiliateActive ? "" : "現在、アフィリエイトリンクは設定していません（購入先へのリンクは、ふつうの検索リンクです）。"}
            </p>
            <p>紹介料の有無や金額によって、記事の評価やおすすめの順番を変えることはありません。シューズ診断の結果も、用途と特徴だけをもとに計算しています。</p>

            <h2 id="facts">情報の正確さについて</h2>
            <p>
              価格・重量・コースの距離などの情報は、確認した日付と出典を記載するよう努めています。確認できていない情報は「未確認」と表示し、推測で数字を書くことはしません。価格や仕様は変わることがあるため、購入前には各ショップやメーカーの最新情報をご確認ください。
            </p>
            <p>セール情報は、運営者が確認したものだけを、確認日とともに掲載します。</p>

            <h2 id="health">からだ・健康に関する情報について</h2>
            <p>
              からだや健康に関する記事は、一般的な情報と、市民ランナーとしての個人的な経験をもとにしています。医師による診断・治療の代わりにはなりません。痛みが続く場合や持病のある方は、医療機関に相談してください。
            </p>

            <h2 id="photos">写真について</h2>
            <p>
              一部の写真は、Wikimedia Commons でクリエイティブ・コモンズ・ライセンス等により公開されている写真を、サイズを変更して使用しています。撮影者とライセンスは各写真の近くと「写真のクレジット」ページに記載しています。広島で撮影されたものではない写真には、その旨を併記しています。
            </p>

            <h2 id="privacy">プライバシーについて</h2>
            <p>
              このサイトは、現在アクセス解析ツールや広告配信のためのCookieを使用していません。診断ツールやチェックリストに入力した内容はサーバーに送信されず、チェックリストの状態はお使いの端末のブラウザにだけ保存されます。今後アクセス解析を導入する場合は、このページでお知らせします。
            </p>
            <p>アフィリエイトリンク先のショップでは、各社のプライバシーポリシーに従ってCookie等が使用される場合があります。</p>

            <h2 id="disclaimer">免責事項</h2>
            <p>
              掲載している情報は、できるかぎり正確であるよう努めていますが、その内容を保証するものではありません。このサイトの情報を利用したことによって生じた損害について、運営者は責任を負いかねます。ランニングは、ご自身の体調と相談しながら、無理のない範囲で楽しんでください。
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
