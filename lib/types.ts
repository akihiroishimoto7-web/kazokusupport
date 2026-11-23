/**
 * RUN LIFE HIROSHIMA — コンテンツの型定義
 *
 * すべてのデータ（記事・シューズ・道具・コース・写真）はここで型を決め、
 * content/ 以下のファイルで中身を管理します。表示コンポーネントは型だけを知っていればよく、
 * 中身の追加・更新は content/ を編集するだけで完結します。
 */

/** YYYY-MM-DD 形式の日付文字列 */
export type ISODate = string;

/** 出典 */
export type Source = {
  title: string;
  url?: string;
  publisher?: string;
  /** 内容を確認した日（YYYY-MM-DD） */
  checkedAt?: ISODate;
};

/**
 * 確認状態つきの事実。
 * - value が null … まだ調べていない（画面には「未確認」と表示）
 * - verified が false … 値はあるが一次情報で確認できていない（「要確認」と表示）
 * - verified が true … 出典つきで確認済み
 */
export type Fact<T> = {
  value: T | null;
  verified: boolean;
  source?: Source;
  note?: string;
};

/* ---------------------------------------------------------------- 写真 */

export type PhotoCredit =
  | { kind: "self"; note?: string }
  | {
      kind: "licensed";
      author: string;
      license: string;
      licenseUrl?: string;
      sourceUrl: string;
      /** 元ファイル名など */
      sourceTitle?: string;
    };

export type Photo = {
  id: string;
  /** public/ からのパス */
  src: string;
  width: number;
  height: number;
  alt: string;
  /** 画面に出すキャプション（撮影地など） */
  caption?: string;
  /** 撮影地が広島の特定の場所であると確認できている場合のみ true */
  isHiroshima: boolean;
  /** 撮影地の名称。isHiroshima が false のときは「イメージ」など */
  place: string;
  credit: PhotoCredit;
  /** object-position（例: "50% 60%"） */
  focus?: string;
};

/* ---------------------------------------------------------------- 記事 */

export type CategoryId =
  | "start"
  | "shoes"
  | "gear"
  | "hiroshima"
  | "care"
  | "race"
  | "essay";

export type Season = "spring" | "summer" | "autumn" | "winter";
export type Level = "first" | "beginner" | "intermediate";

export type ArticleMeta = {
  slug: string;
  title: string;
  /** 一覧やOGPに使う短い説明（80〜120字目安） */
  description: string;
  /** 記事冒頭のリード文（任意） */
  lede?: string;
  category: CategoryId;
  tags: string[];
  status: "published" | "draft";
  publishedAt: ISODate;
  updatedAt: ISODate;
  /** 写真ID（content/photos.ts） */
  hero?: string;
  seasons: Season[];
  levels: Level[];
  /** 連載・シリーズ（例: はじめてのランニング）の順番 */
  series?: { id: string; order: number };
  related: string[];
  sources: Source[];
  /** 医療・健康に関わる記事は true（免責表示が自動で付きます） */
  medical: boolean;
  /** トップの「何から始めよう？」で答える質問 */
  answers?: string;
  readingMinutes: number;
  /** 媒体ごとの公開可否（docs/EDITORIAL.md） */
  channels: ChannelPlan;
};

/**
 * 媒体ごとの公開可否
 *   site      … ホームページに掲載するか
 *   ameblo    … "publish"=アメブロにも掲載 / "link"=アメブロからHPの記事を紹介 / "none"=載せない
 *   instagram … Instagram で扱ってよいか（商品・セール・アフィリエイト関連は常に false）
 */
export type ChannelPlan = {
  site: boolean;
  ameblo: "publish" | "link" | "none";
  instagram: boolean;
};

export type Article = ArticleMeta & { body: string };

/* ---------------------------------------------------------------- シューズ */

export type BrandId =
  | "nike"
  | "asics"
  | "newbalance"
  | "hoka"
  | "adidas"
  | "on"
  | "brooks"
  | "mizuno"
  | "saucony";

export type Brand = { id: BrandId; name: string; nameJa: string; officialUrl: string };

export type ShoePurposeId =
  | "first"
  | "easy"
  | "cushion"
  | "stability"
  | "long"
  | "marathon"
  | "speed"
  | "value";

export type ShoePurpose = {
  id: ShoePurposeId;
  /** 例: はじめての一足 */
  title: string;
  /** 悩みの言葉。例: 何を買えばいいか分からない */
  question: string;
  summary: string;
  /** 選ぶときに見るポイント */
  points: string[];
  /** よくある誤解・注意 */
  caution?: string;
};

/** 5段階の評価。根拠が「実際に履いた」か「第三者情報の調査」かを必ず区別します */
export type Rating = { score: 1 | 2 | 3 | 4 | 5 | null; basis: "worn" | "research" | null };

export type ShopLinks = {
  /** 楽天市場の検索キーワード */
  rakuten?: string;
  /** Amazon の検索キーワード */
  amazon?: string;
  /** Yahoo!ショッピングの検索キーワード */
  yahoo?: string;
  /** メーカー公式の商品ページ（確認済みのURLのみ） */
  official?: string;
};

export type Shoe = {
  slug: string;
  brand: BrandId;
  /** シリーズ名（例: NOVABLAST） */
  series: string;
  /** 世代まで特定したモデル名（例: NOVABLAST 5）。シリーズ単位の情報なら null */
  model: string | null;
  /**
   * outline … シリーズの位置づけのみ。スペック未確認（検索エンジンには登録しません）
   * review  … スペック確認済み・レビュー公開
   * draft   … 非公開
   */
  status: "outline" | "review" | "draft";
  purposes: ShoePurposeId[];
  /** 診断ツールで使う特徴タグ（メーカーの製品分類に基づく編集部の整理） */
  traits: ShoeTrait[];
  /** 一言で（例: 毎日のジョグに使いやすい万能型） */
  catch: string;
  positioning: string;
  specs: {
    priceJpy: Fact<number>;
    weightG: Fact<number> & { size?: string };
    stackHeelMm: Fact<number>;
    stackForefootMm: Fact<number>;
    dropMm: Fact<number>;
  };
  ratings: { cushion: Rating; stability: Rating; response: Rating; fit: Rating };
  bestFor: string[];
  recommendFor: string[];
  notFor: string[];
  /** 「買わなくてもよい理由」— 必須 */
  reasonsNotToBuy: string[];
  cautions: string[];
  /** 実際に履いた感想（未着用なら null） */
  worn: null | { summary: string; distanceKm?: number; period?: string; size?: string };
  /** 第三者レビュー・公式情報の調査メモ（調査前なら null） */
  research: null | { summary: string };
  similar: string[];
  links: ShopLinks;
  photo?: string;
  sources: Source[];
  checkedAt: ISODate | null;
  updatedAt: ISODate;
};

export type ShoeTrait =
  | "neutral"
  | "stability"
  | "soft"
  | "max-cushion"
  | "light"
  | "bouncy"
  | "plate"
  | "budget"
  | "wide-option";

/* ---------------------------------------------------------------- 道具 */

export type GearCategory = {
  slug: string;
  name: string;
  /** 一言で */
  catch: string;
  whatFor: string;
  /** なくても始められる？ */
  needed: "always" | "sometimes" | "later";
  needWhen: string[];
  skipWhen: string[];
  points: string[];
  cautions: string[];
  links: ShopLinks;
  relatedArticles: string[];
};

export type GearScene = {
  slug: string;
  /** 悩み・場面の言葉（例: スマートフォンだけ持って走りたい） */
  title: string;
  summary: string;
  /** おすすめする道具カテゴリーと理由 */
  picks: { gear: string; why: string }[];
  /** 買わなくてもいいもの */
  skip?: string;
  tips: string[];
  relatedArticles: string[];
};

/* ---------------------------------------------------------------- コース */

export type CourseArea = "中区" | "南区" | "東区" | "西区" | "安佐南区" | "安佐北区" | "西区・中区";

export type CourseRoute = {
  /** public/gpx/ のファイル名 */
  gpx: string;
  /** public/maps/ の地図画像 */
  /** zoom と bbox は地図画像の投影（ルートと地図を正確に重ねるため） */
  map: { src: string; width: number; height: number; zoom: number; bbox: [number, number, number, number] };
  kind: "loop" | "out-and-back" | "one-way";
  /** ルートの説明（どこからどこまで） */
  summary: string;
  /** ルートの作り方の注記 */
  note: string;
};

export type Course = {
  slug: string;
  name: string;
  /** よみがな（任意） */
  kana?: string;
  area: CourseArea | string;
  /** 一言で */
  catch: string;
  /** 場所の性格を説明する文章（推測で設備や距離を書かない） */
  description: string;
  /**
   * outline  … 場所の紹介のみ
   * routed   … 地図データから想定ルートを作成（現地未走）
   * surveyed … 運営者が実際に走って確認
   * draft    … 非公開
   */
  status: "outline" | "routed" | "surveyed" | "draft";
  photo?: string;
  route?: CourseRoute;
  /** コースの特徴・魅力 */
  features: string[];
  /** 夏場・夜間などの注意点 */
  cautions: string[];
  /** おすすめのシューズ（用途ID と理由） */
  shoes: { purpose?: ShoePurposeId; text: string }[];
  /** 周辺の立ち寄りスポット（地図上で確認できるもの） */
  nearby: string[];
  facts: {
    start: Fact<string>;
    distanceKm: Fact<number>;
    elevationGainM: Fact<number>;
    hills: Fact<string>;
    surface: Fact<string>;
    signals: Fact<"なし" | "少ない" | "ふつう" | "多い">;
    toilets: Fact<string>;
    water: Fact<string>;
    shade: Fact<"多い" | "ところどころ" | "少ない">;
    access: Fact<string>;
    nightSafety: Fact<string>;
    bestTime: Fact<string>;
  };
  difficulty: Fact<1 | 2 | 3 | 4 | 5>;
  beginnerScore: Fact<1 | 2 | 3 | 4 | 5>;
  /** 地図検索に使う語（Googleマップで開く） */
  mapQuery: string;
  /** 実際に走った感想（まだ走っていなければ null） */
  runReport: null | { date: ISODate; text: string; distanceKm?: number };
  tags: string[];
  relatedArticles: string[];
  sources: Source[];
  updatedAt: ISODate;
};

/* ---------------------------------------------------------------- カテゴリー */

export type Topic = { title: string; article?: string; note?: string };

export type CategoryInfo = {
  id: CategoryId;
  name: string;
  path: string;
  /** 一言の説明 */
  catch: string;
  intro: string;
  photo?: string;
  topics: Topic[];
};

/* ---------------------------------------------------------------- セール */

export type SaleInfo = {
  id: string;
  title: string;
  shop: string;
  url: string;
  /** 確認した日時（必須） */
  checkedAt: ISODate;
  startsAt?: ISODate;
  endsAt: ISODate;
  note?: string;
};
