/**
 * サイト全体の設定。
 * URL やSNSのリンクが決まったら、null を実際のURLに書き換えてください。
 * null のままの項目は画面に表示されません（存在しないリンクは作りません）。
 */
export const site = {
  name: "RUN LIFE HIROSHIMA",
  nameJa: "ランライフ広島",
  tagline: "ただ、走る。",
  message: "走ることを、暮らしの一部に。",
  description:
    "広島在住の市民ランナーが運営する、はじめてのランニングから長く走り続けるためのシューズ選び、広島のランニングコースまでを扱う個人メディア。速さより継続を、記録より健康を大切にしています。",
  /** 本番のURL。Vercel の環境変数 NEXT_PUBLIC_SITE_URL で上書きできます */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kazokusupport-u8zk.vercel.app").replace(/\/$/, ""),
  locale: "ja_JP",
  /** 検索エンジンに登録するか。公開準備が整うまで false にしておけます */
  indexable: process.env.NEXT_PUBLIC_NOINDEX !== "1",
} as const;

/**
 * 運営者プロフィール。
 * 提供済みの情報だけを書いています。追記したい項目は null を文字列に置き換えてください。
 */
export const author = {
  /** 表示名（ニックネーム可）。未設定なら「運営者」と表示 */
  displayName: null as string | null,
  role: "広島在住の市民ランナー",
  ageGroup: "40代",
  summary:
    "ランニングシューズの比較・研究を続けながら、ハーフマラソン、フルマラソンへの挑戦、ランニングサークルでの活動を続けています。トップアスリートではありません。膝の痛み、疲れ、練習が続かないこと、シューズ選び、限られた予算。多くの市民ランナーと同じ悩みを抱えながら走ってきました。",
  /** 自己ベストなどの実績（本人確認済みのものだけ。例: { label: "ハーフマラソン", value: "1時間59分" }） */
  records: [] as { label: string; value: string; note?: string }[],
  /** 運営者の写真ID（content/photos.ts）。未設定なら表示しません */
  photo: null as string | null,
};

/** 外部メディア・アプリへのリンク。URLが決まったものだけ表示されます */
export const channels: {
  id: string;
  name: string;
  description: string;
  url: string | null;
}[] = [
  {
    id: "ameblo",
    name: "壊れず強くなるランニングシューズ研究所",
    description: "アメブロで続けているシューズ研究のブログ",
    url: null,
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "日々のランと、シューズの写真",
    url: null,
  },
  {
    id: "shoe-app",
    name: "ランニングシューズ診断アプリ",
    description: "別に公開している診断アプリ",
    url: null,
  },
  {
    id: "watch-app",
    name: "ランニングウォッチ診断アプリ",
    description: "別に公開している診断アプリ",
    url: null,
  },
];

/** お問い合わせ先（メールアドレスやフォームURL）。未設定なら表示しません */
export const contact = {
  url: null as string | null,
};
