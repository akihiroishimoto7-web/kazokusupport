import Link from "next/link";
import { Arrow } from "@/components/Arrow";

export default function NotFound() {
  return (
    <div className="wrap notfound">
      <p className="hub__catch">ページが見つかりません</p>
      <h1 className="notfound__title">道を、少し間違えたようです。</h1>
      <p>お探しのページは移動したか、まだ準備中かもしれません。</p>
      <ul role="list" className="index-list">
        <li>
          <Link href="/" className="index-item">
            <span className="index-item__body">
              <span className="index-item__title">ホームへ戻る</span>
            </span>
            <Arrow className="index-item__arrow" />
          </Link>
        </li>
        <li>
          <Link href="/start" className="index-item">
            <span className="index-item__body">
              <span className="index-item__title">はじめてのランニング</span>
            </span>
            <Arrow className="index-item__arrow" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
