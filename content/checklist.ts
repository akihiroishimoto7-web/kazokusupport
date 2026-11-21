/**
 * 大会持ち物チェックリスト。
 * 項目の追加・削除はここを編集するだけで反映されます（id は変えないでください。チェック状態の保存に使います）。
 */
export const raceChecklist = [
  {
    id: "before",
    title: "前日までに",
    items: [
      { id: "bib", label: "ナンバーカード（ゼッケン）と安全ピン", note: "事前送付か当日受付かを、大会の案内で確認" },
      { id: "chip", label: "計測チップ", note: "シューズに付けるタイプは前日に付けておく" },
      { id: "guide", label: "大会の案内・参加証" },
      { id: "shoes", label: "履き慣れたシューズ", note: "新品は避ける" },
      { id: "wear", label: "レース用のウェア一式", note: "天気予報に合わせて" },
      { id: "socks", label: "走り慣れたソックス" },
      { id: "watch", label: "時計の充電" },
      { id: "route", label: "会場までの交通手段と時間" },
    ],
  },
  {
    id: "morning",
    title: "当日の朝",
    items: [
      { id: "breakfast", label: "朝ごはん", note: "スタートの3時間ほど前までに、食べ慣れたものを" },
      { id: "gel", label: "補給ジェル（使う人）", note: "練習で試したものだけ" },
      { id: "drink", label: "スタート前の飲み物" },
      { id: "toilet", label: "トイレの時間に余裕を", note: "会場のトイレは混みます" },
      { id: "rain", label: "雨具・使い捨てのポンチョ" },
      { id: "cold", label: "防寒用の手袋・アームカバー（冬）" },
      { id: "sun", label: "帽子・日焼け止め（夏）" },
      { id: "vaseline", label: "ワセリンなど擦れ対策", note: "脇、内もも、足の指など" },
      { id: "money", label: "現金・交通系ICカード" },
      { id: "phone", label: "スマートフォン" },
    ],
  },
  {
    id: "after",
    title: "ゴールのあとに",
    items: [
      { id: "change", label: "着替え（下着・靴下も）" },
      { id: "towel", label: "タオル" },
      { id: "warm", label: "羽織るもの", note: "走り終えると急に冷えます" },
      { id: "bag", label: "汚れ物を入れる袋" },
      { id: "snack", label: "軽い食べ物・飲み物" },
    ],
  },
];
