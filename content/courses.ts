import type { Course, Fact } from "@/lib/types";

/**
 * 広島ランニングコース図鑑
 * ------------------------------------------------------------------
 * いま登録しているコースは、すべて「場所の紹介」までの outline です。
 * 距離・累積標高・トイレ・給水・信号などは、実際に走って確認するまで null（画面では「未確認」）にしています。
 * outline のページは検索エンジンに登録されません（noindex）。
 *
 * 実際に走ったら:
 *   1. facts の各値を入れ、自分で確認したものは verified: true にする
 *   2. GPX ファイルを public/gpx/ に置き、gpx にファイル名を書く
 *      （距離・累積標高・ルート図・高低図はGPXから自動で計算・表示されます）
 *   3. runReport に走った日と感想を書く
 *   4. status を "surveyed" にする
 */

const unknown = <T,>(note?: string): Fact<T> => ({ value: null, verified: false, ...(note ? { note } : {}) });

const blankFacts = (): Course["facts"] => ({
  start: unknown(),
  distanceKm: unknown(),
  elevationGainM: unknown(),
  surface: unknown(),
  signals: unknown(),
  toilets: unknown(),
  water: unknown(),
  shade: unknown(),
  access: unknown(),
  nightSafety: unknown(),
  bestTime: unknown(),
});

export const courses: Course[] = [
  {
    slug: "otagawa-riverside",
    name: "太田川河川敷",
    kana: "おおたがわ かせんじき",
    area: "広島市内（複数の区にまたがる）",
    catch: "広い空と、川の流れに沿って",
    description:
      "広島の街は、太田川とその分かれた川がつくるデルタの上に広がっています。太田川の河川敷は、散歩やランニングをする人の姿をよく見かける場所です。ただし、ひと口に河川敷といっても区間によって路面や設備はさまざまです。このページでは、実際に走った区間から順に、距離や設備の情報を追加していきます。",
    status: "outline",
    photo: "ota-floodway-embankment",
    facts: blankFacts(),
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "太田川 河川敷 広島市",
    runReport: null,
    tags: ["川沿い", "平坦（予定区間による）"],
    relatedArticles: ["hiroshima-where-to-start"],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "chuo-park",
    name: "中央公園周辺",
    kana: "ちゅうおうこうえん",
    area: "中区",
    catch: "街の真ん中にある、緑の広がり",
    description:
      "広島城や基町の川沿いの緑地に近い、市街地の中心にある公園です。周辺には川沿いの遊歩道もあり、街中にいながら緑の中を走れるのが魅力です。周回の距離やトイレの位置は、走って確認したうえで追記します。",
    status: "outline",
    photo: "motomachi-riverside-trees",
    facts: blankFacts(),
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "広島市 中央公園",
    runReport: null,
    tags: ["公園", "街なか"],
    relatedArticles: ["hiroshima-where-to-start"],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "peace-wing",
    name: "エディオンピースウイング広島周辺",
    kana: "えでぃおんぴーすういんぐひろしま",
    area: "中区",
    catch: "新しいスタジアムと、川沿いの道",
    description:
      "中央公園の一角にあるサッカースタジアムの周辺です。すぐそばを川が流れ、川沿いの道とあわせて走ることができます。試合やイベントのある日は人が多くなるため、走る日時には注意が必要です。",
    status: "outline",
    photo: "peace-wing-from-sorazaya",
    facts: { ...blankFacts(), bestTime: unknown("試合・イベント開催日は混雑が予想されます。開催日程は公式情報で確認してください。") },
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "エディオンピースウイング広島",
    runReport: null,
    tags: ["川沿い", "街なか", "スタジアム"],
    relatedArticles: [],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "ujina-minato-park",
    name: "宇品・広島みなと公園",
    kana: "うじな・ひろしまみなとこうえん",
    area: "南区",
    catch: "潮の香りと、瀬戸内の島影",
    description:
      "広島港（宇品）の周辺は、川沿いとはまた違う、海辺の景色を楽しめるエリアです。港の旅客ターミナルの近くには海に面した公園があります。海風の強さや日陰の有無など、季節による走りやすさの違いも含めて追記していきます。",
    status: "outline",
    photo: "hiroshima-port-ujina",
    facts: blankFacts(),
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "広島みなと公園",
    runReport: null,
    tags: ["海沿い", "港"],
    relatedArticles: [],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "ushitayama",
    name: "牛田山",
    kana: "うしたやま",
    area: "東区",
    catch: "街を見下ろす、身近な山",
    description:
      "市街地の東側にある山で、登った先から広島の街並みを見渡せます。平らな川沿いのコースとは違い、坂道や山道を含むため、走り始めたばかりの人は歩きを中心に楽しむのがおすすめです。登山道の状況や距離は、実際に歩いて・走って確認したうえで追記します。",
    status: "outline",
    photo: "ushitayama-view",
    facts: { ...blankFacts(), surface: unknown("山道を含みます（詳細は未確認）") },
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "牛田山 広島市東区",
    runReport: null,
    tags: ["山", "坂道", "眺望"],
    relatedArticles: [],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "peace-park",
    name: "平和記念公園周辺",
    kana: "へいわきねんこうえん",
    area: "中区",
    catch: "祈りの場所の、静かな川辺",
    description:
      "元安川と本川にはさまれた、広島を象徴する場所です。周辺の川沿いには遊歩道があり、朝の時間帯には散歩をする人の姿も見られます。ここは慰霊の場でもあります。公園内では周囲の方への配慮を忘れず、式典や行事のある日は走るのを控えるなど、場所への敬意を大切にしてください。",
    status: "outline",
    photo: "motoyasu-river-peace-bridge",
    facts: {
      ...blankFacts(),
      bestTime: unknown("式典・行事の日程は広島市の公式情報で確認してください。観光客の多い時間帯は避けるのがおすすめです。"),
    },
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "平和記念公園 広島",
    runReport: null,
    tags: ["川沿い", "街なか"],
    relatedArticles: [],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "seseragi-park",
    name: "せせらぎ公園",
    kana: "せせらぎこうえん",
    area: "調査中",
    catch: "コース情報を調査中です",
    description:
      "候補として挙がっているコースです。場所・距離・設備などの情報は、実際に訪れて確認したうえで掲載します。それまでは、所在地を含めて未確認の扱いとします。",
    status: "outline",
    facts: blankFacts(),
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "せせらぎ公園 広島",
    runReport: null,
    tags: ["調査中"],
    relatedArticles: [],
    sources: [],
    updatedAt: "2026-11-18",
  },
  {
    slug: "koyo",
    name: "高陽エリア",
    kana: "こうよう",
    area: "安佐北区",
    catch: "住宅地と川辺の、日常のランニング",
    description:
      "市の北部、安佐北区の高陽エリアです。住宅地の中の日常的なランニングコースとして、具体的な周回ルートを調査中です。ルートが決まり次第、距離や設備の情報とあわせて掲載します。",
    status: "outline",
    facts: blankFacts(),
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "広島市安佐北区 高陽",
    runReport: null,
    tags: ["住宅地", "調査中"],
    relatedArticles: [],
    sources: [],
    updatedAt: "2026-11-18",
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
export const publicCourses = () => courses.filter((c) => c.status !== "draft");
