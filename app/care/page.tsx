import { CategoryHub } from "@/components/CategoryHub";
import { categories } from "@/content/categories";
import { buildMetadata } from "@/lib/seo";

const cat = categories.care;
export const metadata = buildMetadata({ title: cat.name, description: cat.intro, path: cat.path, photo: cat.photo });

export default function CarePage() {
  return (
    <CategoryHub id="care">
      <section className="wrap hub__section">
        <aside className="medical-note">
          <p className="medical-note__title">このカテゴリーの書き方</p>
          <p>
            研究や公的機関の情報にもとづく内容には「根拠」、運営者が実際に試したことには「運営者の体験」とラベルを付けて区別します。どちらも、診断や治療効果を約束するものではありません。
          </p>
        </aside>
      </section>
    </CategoryHub>
  );
}
