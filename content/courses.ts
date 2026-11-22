import type { Course, Fact, Source } from "@/lib/types";

/**
 * 広島ランニングコース図鑑
 * ------------------------------------------------------------------
 * status
 *   outline  … 場所の紹介のみ（検索エンジンに登録しない）
 *   routed   … 地図データから想定ルートを作成。距離・累積標高はルートデータからの計算値（現地未走）
 *   surveyed … 運営者が実際に走って確認
 *
 * 想定ルートの作り方（scripts/README-routes.md も参照）
 *   ルート … OpenStreetMap の道路データを使った徒歩ルート検索（routing.openstreetmap.de）
 *   標高   … 国土地理院 標高API（主に1mメッシュ・レーザ測量）を約25mごとに取得
 *   地図   … 地理院タイル（淡色地図）を加工し、ルートを重ねて作成
 *   距離・累積標高は public/gpx/ のGPXから画面表示時に自動計算されます（3m未満の上下は数えません）
 *
 * トイレ・駅や電停は OpenStreetMap に登録されている情報です（2026年11月22日確認）。
 * 設置場所・利用時間・通行制限は変わることがあるため、すべて「現地確認が必要」としています。
 */

const CHECKED = "2026-11-22";

const OSM: Source = { title: "OpenStreetMap", url: "https://www.openstreetmap.org/", publisher: "OpenStreetMap contributors", checkedAt: CHECKED };
const ROUTER: Source = {
  title: "OpenStreetMap 徒歩ルート検索（FOSSGIS routing）",
  url: "https://routing.openstreetmap.de/",
  publisher: "FOSSGIS e.V.",
  checkedAt: CHECKED,
};
const GSI_DEM: Source = {
  title: "標高API",
  url: "https://maps.gsi.go.jp/development/elevation_s.html",
  publisher: "国土地理院",
  checkedAt: CHECKED,
};
const GSI_TILE: Source = {
  title: "地理院タイル（淡色地図）",
  url: "https://maps.gsi.go.jp/development/ichiran.html",
  publisher: "国土地理院",
  checkedAt: CHECKED,
};
const ROUTE_SOURCES = [ROUTER, GSI_DEM, GSI_TILE, OSM];

const unknown = <T,>(note?: string): Fact<T> => ({ value: null, verified: false, ...(note ? { note } : {}) });
const onSite = <T,>(): Fact<T> => unknown<T>("現地確認が必要です");
const fromOsm = (value: string, note = "OpenStreetMap の登録情報です。現地確認が必要です"): Fact<string> => ({
  value,
  verified: false,
  source: OSM,
  note,
});
const fromRoute = <T,>(value: T, note = "想定ルートのデータからの計算値・目安です（現地未走）"): Fact<T> => ({
  value,
  verified: false,
  source: ROUTER,
  note,
});

const SUMMER = "夏は早朝か日没後に。熱中症警戒アラートが出ている日は走らない判断も大切です。";
const NIGHT_RIVER = "夜は川沿いの暗い区間に注意。明るい色の服と反射材、ライトを。";
const ROUTE_NOTE =
  "OpenStreetMap の道路データで作った想定ルートです。運営者はまだこのルートを走っていません。工事や通行止めで通れないことがあります。";

const map = (slug: string) => ({ src: `/maps/${slug}.webp`, width: 1600, height: 1200 });

export const courses: Course[] = [
  /* ------------------------------------------------------------ 1. 太田川 */
  {
    slug: "otagawa-riverside",
    name: "太田川河川敷（基町の川沿い）",
    kana: "おおたがわ かせんじき",
    area: "中区",
    catch: "街の真ん中で、川と並んで走る",
    description:
      "広島の中心部を流れる太田川（本川）の東岸、基町の川沿いをたどるルートです。原爆ドームのそばの相生橋から、空鞘橋の先、三篠橋までを往復します。地図上ではほとんど高低差がなく、街なかにいながら長く信号を気にせず走れる区間があるのが魅力です。",
    status: "routed",
    photo: "motomachi-riverside-path",
    route: {
      gpx: "otagawa-riverside.gpx",
      map: map("otagawa-riverside"),
      kind: "out-and-back",
      summary: "相生橋 → 空鞘橋 → 三篠橋で折り返し",
      note: ROUTE_NOTE,
    },
    features: [
      "川を左右に見ながら走れる、ほぼ平らなルート",
      "基町河川公園など、川沿いの緑地を通ります",
      "橋ごとに折り返せるので、距離を自分で調整しやすい",
    ],
    cautions: [SUMMER, NIGHT_RIVER, "散歩や自転車の人も多い道です。すれ違うときはペースを落として。"],
    shoes: [
      { purpose: "first", text: "舗装された平らな道が中心なので、はじめての一足で十分走れます。" },
      { purpose: "easy", text: "長めに往復するなら、着地のやわらかいジョグ用シューズが楽です。" },
    ],
    nearby: ["原爆ドーム（相生橋のたもと）", "広島城", "中央公園"],
    facts: {
      start: fromRoute("相生橋（原爆ドームのそば）", "想定ルートの出発点です"),
      distanceKm: fromRoute(3.9),
      elevationGainM: fromRoute(11),
      hills: fromRoute("ほぼ平ら"),
      surface: onSite(),
      signals: onSite(),
      toilets: fromOsm("ルート周辺に複数の登録あり"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("広島電鉄「原爆ドーム前」電停、アストラムライン「城北」駅などが近く"),
      nightSafety: onSite(),
      bestTime: { value: "早朝・夕方", verified: false, note: "一般的な目安です。夏は日中を避けてください" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(2),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(5),
    mapQuery: "基町河川公園 広島市",
    runReport: null,
    tags: ["川沿い", "平坦", "街なか"],
    relatedArticles: ["hiroshima-where-to-start", "start-first-month"],
    sources: ROUTE_SOURCES,
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 2. 宇品 */
  {
    slug: "ujina-minato-park",
    name: "宇品・広島みなと公園",
    kana: "うじな・ひろしまみなとこうえん",
    area: "南区",
    catch: "潮の香りと、瀬戸内の島影",
    description:
      "広島港（宇品）の旅客ターミナルと、その隣の広島みなと公園をめぐる短い周回です。川沿いとは違う、開けた海の景色が魅力。1周は短めなので、慣れてきたら周回を重ねたり、港の周辺へ足を延ばしたりして距離を調整できます。",
    status: "routed",
    photo: "hiroshima-port-ujina",
    route: {
      gpx: "ujina-minato-park.gpx",
      map: map("ujina-minato-park"),
      kind: "loop",
      summary: "元宇品口電停 → 広島みなと公園 → 旅客ターミナル → 元宇品口",
      note: ROUTE_NOTE,
    },
    features: ["海を見ながら走れる、ほぼ平らな周回", "電停から近く、公共交通で行きやすい", "1周が短いので、はじめての「続けて走る」練習に"],
    cautions: [SUMMER, "海辺は風が強い日があります。冬は体感温度が下がるので一枚多めに。", "港の車や歩行者の動きに注意してください。"],
    shoes: [{ purpose: "first", text: "平らで短い周回。はじめての一足で十分です。" }],
    nearby: ["広島港宇品旅客ターミナル", "元宇品（ルートの南側の緑の丘）"],
    facts: {
      start: fromRoute("広島電鉄「元宇品口」電停付近"),
      distanceKm: fromRoute(1.7),
      elevationGainM: fromRoute(0),
      hills: fromRoute("ほぼ平ら"),
      surface: onSite(),
      signals: onSite(),
      toilets: fromOsm("ルート周辺に登録あり"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("広島電鉄「広島港」電停・「元宇品口」電停"),
      nightSafety: onSite(),
      bestTime: { value: "早朝・夕方", verified: false, note: "一般的な目安です" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(1),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(5),
    mapQuery: "広島みなと公園",
    runReport: null,
    tags: ["海沿い", "平坦", "短い周回"],
    relatedArticles: ["hiroshima-where-to-start"],
    sources: ROUTE_SOURCES,
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 3. 牛田山 */
  {
    slug: "ushitayama",
    name: "牛田山",
    kana: "うしたやま",
    area: "東区",
    catch: "街を見下ろす、身近な山",
    description:
      "アストラムライン牛田駅の近くから、標高約260mの牛田山の山頂へ向かう片道ルートです。地図データ上の登りは約300m。平らな川沿いとはまったく違う、脚と心肺を使うコースです。走り始めの時期は、歩いて登ることを楽しむ場所と考えてください。",
    status: "routed",
    photo: "ushitayama-view",
    route: {
      gpx: "ushitayama.gpx",
      map: map("ushitayama"),
      kind: "one-way",
      summary: "牛田駅付近 → 牛田山山頂（片道）",
      note: `${ROUTE_NOTE} 山道の区間は、地図データの登山道を使っています。道の状態は季節や天候で変わります。`,
    },
    features: ["山頂付近から広島の街を見渡せます", "駅から歩いて取り付ける、街に近い山", "上り坂の練習・脚づくりに"],
    cautions: [
      "山道を含みます。雨のあとは滑りやすく、暗くなる前に下山してください。",
      "地図データ上、ルート周辺にトイレの登録がありません。出発前に済ませておきましょう。",
      "水は自分で持って行きましょう。",
      "ひとりで入るときは、行き先を家族に伝えておくと安心です。",
    ],
    shoes: [
      { text: "土の山道を含むため、靴底の溝が深く滑りにくいシューズ（トレイル用など）が安心です。" },
      { purpose: "stability", text: "下りで足首が不安な人は、安定感のあるシューズを。" },
    ],
    nearby: ["牛田山山頂（標高260.5m、地理院地図より）"],
    facts: {
      start: fromRoute("アストラムライン「牛田」駅付近"),
      distanceKm: fromRoute(2.7, "片道の計算値です（現地未走）"),
      elevationGainM: fromRoute(298, "片道の計算値です（現地未走）"),
      hills: fromRoute("急な上りが続く"),
      surface: fromOsm("住宅地の舗装路から、山道（登山道）へ", "OpenStreetMap の道の種類から読み取った情報です。現地確認が必要です"),
      signals: onSite(),
      toilets: fromOsm("ルート周辺に登録なし", "OpenStreetMap 上で見つかりませんでした。現地確認が必要です"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("アストラムライン「牛田」駅"),
      nightSafety: { value: "夜間は避ける", verified: false, note: "山道を含むため、明るい時間帯をおすすめします" },
      bestTime: { value: "朝〜昼", verified: false, note: "下山まで明るさに余裕のある時間に" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(5),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(1),
    mapQuery: "牛田山 広島市東区",
    runReport: null,
    tags: ["山", "坂道", "眺望"],
    relatedArticles: [],
    sources: ROUTE_SOURCES,
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 4. 広島城 */
  {
    slug: "chuo-park",
    name: "広島城・中央公園",
    kana: "ひろしまじょう・ちゅうおうこうえん",
    area: "中区",
    catch: "お堀の水面に、石垣が映る",
    description:
      "広島城のお堀の外側をぐるりと一周し、西側は中央公園の中を通るルートです。1周約2km、地図データ上は高低差がほとんどありません。石垣と水面、季節の木々。街の中心とは思えない静けさのなかを走れます。",
    status: "routed",
    photo: "castle-west-moat",
    route: {
      gpx: "chuo-park.gpx",
      map: map("chuo-park"),
      kind: "loop",
      summary: "広島城のお堀の外周（西側は中央公園内）を1周",
      note: ROUTE_NOTE,
    },
    features: ["1周約2kmの、わかりやすい周回", "お堀と石垣を眺めながら走れる", "周回数で距離を調整しやすい"],
    cautions: [SUMMER, "観光の人も多い場所です。お城の周辺では歩く人を優先して。", "試合やイベントの日は中央公園周辺が混み合います。"],
    shoes: [
      { purpose: "first", text: "平らな周回なので、はじめての一足で十分です。" },
      { purpose: "easy", text: "何周も重ねるなら、クッションのあるジョグ用を。" },
    ],
    nearby: ["広島城", "広島護国神社", "中央公園", "エディオンピースウイング広島"],
    facts: {
      start: fromRoute("広島城の北側（城北付近）"),
      distanceKm: fromRoute(2.1),
      elevationGainM: fromRoute(0, "3m以上の上り下りはルートデータ上ありません（現地未走）"),
      hills: fromRoute("ほぼ平ら"),
      surface: onSite(),
      signals: onSite(),
      toilets: fromOsm("ルート周辺に複数の登録あり"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("アストラムライン「城北」駅、広島電鉄「紙屋町」電停などが近く"),
      nightSafety: onSite(),
      bestTime: { value: "早朝・夕方", verified: false, note: "一般的な目安です" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(1),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(5),
    mapQuery: "広島城",
    runReport: null,
    tags: ["お城", "公園", "平坦", "周回"],
    relatedArticles: ["hiroshima-where-to-start"],
    sources: ROUTE_SOURCES,
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 5. 平和記念公園 */
  {
    slug: "peace-park",
    name: "平和記念公園周辺",
    kana: "へいわきねんこうえん",
    area: "中区",
    catch: "祈りの場所の、静かな川辺",
    description:
      "元安川と本川にはさまれた平和記念公園のまわりを、川沿いと平和大通りでつなぐ約2kmの周回です。ここは慰霊の場でもあります。公園内では周囲の方への配慮を忘れず、式典や行事のある日は走るのを控えるなど、場所への敬意を大切にしてください。",
    status: "routed",
    photo: "own-dome-night",
    route: {
      gpx: "peace-park.gpx",
      map: map("peace-park"),
      kind: "loop",
      summary: "相生橋 → 元安川沿い → 平和大橋 → 西平和大橋 → 本川沿い → 相生橋",
      note: ROUTE_NOTE,
    },
    features: ["二つの川を感じながら走る、平らな周回", "平和大通りの広い歩道を通ります", "電停から近く、出発しやすい"],
    cautions: [
      "慰霊の場です。公園内では静かに、走るペースを落として。",
      "8月6日をはじめ、式典や行事の日程は広島市の公式情報で確認してください。",
      "観光客の多い時間帯は避け、早朝がおすすめです。",
      SUMMER,
    ],
    shoes: [{ purpose: "first", text: "平らな舗装路が中心。はじめての一足で十分です。" }],
    nearby: ["原爆ドーム", "平和記念公園", "平和記念資料館"],
    facts: {
      start: fromRoute("相生橋（原爆ドームのそば）"),
      distanceKm: fromRoute(2.0),
      elevationGainM: fromRoute(3),
      hills: fromRoute("ほぼ平ら"),
      surface: onSite(),
      signals: onSite(),
      toilets: fromOsm("ルート周辺に複数の登録あり"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("広島電鉄「原爆ドーム前」「本川町」「袋町」電停など"),
      nightSafety: onSite(),
      bestTime: { value: "早朝", verified: false, note: "観光客の少ない時間帯がおすすめです" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(1),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(4),
    mapQuery: "平和記念公園 広島",
    runReport: null,
    tags: ["川沿い", "平坦", "街なか"],
    relatedArticles: [],
    sources: [...ROUTE_SOURCES, { title: "平和記念式典などの行事予定", url: "https://www.city.hiroshima.lg.jp/", publisher: "広島市", checkedAt: CHECKED }],
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 6. 寺山公園 */
  {
    slug: "terayama-park",
    name: "寺山公園（可部）",
    kana: "てらやまこうえん",
    area: "安佐北区",
    catch: "駅から、小さな山の公園へ",
    description:
      "JR可部駅から、東側の寺山公園へ上る片道約1.2kmのルートです。地図データ上の上りは約56m。短い距離で坂道の練習ができます。なお、OpenStreetMap 上の「寺山公園」は安佐北区可部にあり、高陽地区のコースは別に調査しています。",
    status: "routed",
    route: {
      gpx: "terayama-park.gpx",
      map: map("terayama-park"),
      kind: "one-way",
      summary: "JR可部駅 → 寺山公園（片道）",
      note: ROUTE_NOTE,
    },
    features: ["駅から近い、短い上り坂", "坂道に慣れるための練習に", "可部の街並みを見下ろせる位置へ"],
    cautions: ["上り坂を含みます。最初は歩いて上ってもかまいません。", "暗くなる前に下りましょう。", SUMMER],
    shoes: [{ purpose: "first", text: "舗装路が中心と見られます。足に合ったジョグ用シューズで。" }],
    nearby: ["JR可部駅"],
    facts: {
      start: fromRoute("JR可部駅"),
      distanceKm: fromRoute(1.2, "片道の計算値です（現地未走）"),
      elevationGainM: fromRoute(56, "片道の計算値です（現地未走）"),
      hills: fromRoute("上り坂が続く"),
      surface: onSite(),
      signals: onSite(),
      toilets: fromOsm("ルート周辺に登録あり"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("JR可部線「可部」駅"),
      nightSafety: onSite(),
      bestTime: { value: "朝〜夕方", verified: false, note: "明るい時間帯がおすすめです" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(3),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(3),
    mapQuery: "寺山公園 広島市安佐北区可部",
    runReport: null,
    tags: ["坂道", "公園", "駅から近い"],
    relatedArticles: [],
    sources: ROUTE_SOURCES,
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 7. 比治山 */
  {
    slug: "hijiyama",
    name: "比治山公園",
    kana: "ひじやまこうえん",
    area: "南区",
    catch: "街なかの小さな山で、坂を楽しむ",
    description:
      "比治山下電停から比治山公園に上り、公園の中を巡って戻る約2.2kmの周回です。地図データ上の上りは約66m。市街地のすぐそばで、ほどよい坂道と緑を楽しめます。公園内には広島市現代美術館があります。",
    status: "routed",
    route: {
      gpx: "hijiyama.gpx",
      map: map("hijiyama"),
      kind: "loop",
      summary: "比治山下電停 → 現代美術館 → 公園の南側 → 比治山下電停",
      note: ROUTE_NOTE,
    },
    features: ["電停から歩いてすぐの坂道コース", "緑の多い公園の中を走れる", "短い距離で、坂の上り下りを練習できる"],
    cautions: ["坂道を含みます。下りはスピードを出しすぎないように。", "公園内は散歩の人も多い場所です。", SUMMER],
    shoes: [
      { purpose: "cushion", text: "下り坂の衝撃をやわらげたいなら、クッションのあるシューズを。" },
      { purpose: "first", text: "距離は短め。はじめての一足でも楽しめます。" },
    ],
    nearby: ["広島市現代美術館", "比治山公園"],
    facts: {
      start: fromRoute("広島電鉄「比治山下」電停"),
      distanceKm: fromRoute(2.2),
      elevationGainM: fromRoute(66),
      hills: fromRoute("上り下りあり"),
      surface: onSite(),
      signals: onSite(),
      toilets: fromOsm("公園内に複数の登録あり"),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("広島電鉄「比治山下」電停"),
      nightSafety: onSite(),
      bestTime: { value: "朝〜夕方", verified: false, note: "一般的な目安です" },
    },
    difficulty: fromRoute<1 | 2 | 3 | 4 | 5>(3),
    beginnerScore: fromRoute<1 | 2 | 3 | 4 | 5>(3),
    mapQuery: "比治山公園",
    runReport: null,
    tags: ["公園", "坂道", "街なか"],
    relatedArticles: [],
    sources: ROUTE_SOURCES,
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ 8. 瀬野川 */
  {
    slug: "senogawa",
    name: "瀬野川河川敷",
    kana: "せのがわ かせんじき",
    area: "安芸区",
    catch: "東部の川沿いを、のびやかに",
    description:
      "市の東部、安芸区を流れる瀬野川の川沿いです。地図データで想定ルートを作りましたが、道が川沿いをたどっているかを確認できなかったため、ルートの掲載を見送っています。実際に走って確かめてから掲載します。",
    status: "outline",
    features: [],
    cautions: [SUMMER],
    shoes: [],
    nearby: [],
    facts: {
      start: onSite(),
      distanceKm: unknown(),
      elevationGainM: unknown(),
      hills: unknown(),
      surface: onSite(),
      signals: onSite(),
      toilets: onSite(),
      water: onSite(),
      shade: onSite(),
      access: fromOsm("JR山陽本線「中野東」駅・「瀬野」駅が流域の近くにあります"),
      nightSafety: onSite(),
      bestTime: unknown(),
    },
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "瀬野川 広島市安芸区",
    runReport: null,
    tags: ["川沿い", "調査中"],
    relatedArticles: [],
    sources: [OSM],
    updatedAt: CHECKED,
  },
  /* ------------------------------------------------------------ そのほか */
  {
    slug: "peace-wing",
    name: "エディオンピースウイング広島周辺",
    kana: "えでぃおんぴーすういんぐひろしま",
    area: "中区",
    catch: "新しいスタジアムと、川沿いの道",
    description:
      "中央公園の一角にあるサッカースタジアムの周辺です。すぐそばを川が流れ、川沿いの道とあわせて走ることができます。広島城・中央公園の周回や、太田川の川沿いのルートと組み合わせるのもおすすめです。試合やイベントのある日は人が多くなります。",
    status: "outline",
    photo: "own-peace-wing",
    features: ["広島城・中央公園、太田川の川沿いのルートと組み合わせやすい"],
    cautions: ["試合・イベント開催日は混雑します。開催日程は公式情報で確認してください。"],
    shoes: [],
    nearby: ["中央公園", "広島城"],
    facts: {
      start: onSite(),
      distanceKm: unknown(),
      elevationGainM: unknown(),
      hills: unknown(),
      surface: onSite(),
      signals: onSite(),
      toilets: onSite(),
      water: onSite(),
      shade: onSite(),
      access: onSite(),
      nightSafety: onSite(),
      bestTime: unknown("試合・イベント開催日は混雑が予想されます"),
    },
    difficulty: unknown(),
    beginnerScore: unknown(),
    mapQuery: "エディオンピースウイング広島",
    runReport: null,
    tags: ["スタジアム", "街なか"],
    relatedArticles: [],
    sources: [],
    updatedAt: CHECKED,
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
export const publicCourses = () => courses.filter((c) => c.status !== "draft");
/** 検索エンジンに登録するコース（想定ルートあり・走って確認済み） */
export const indexableCourse = (c: Course) => c.status === "routed" || c.status === "surveyed";
