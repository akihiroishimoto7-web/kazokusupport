import type { CategoryId, CategoryInfo } from "@/lib/types";

/**
 * カテゴリーの説明と「扱うテーマ」の一覧。
 * topics の article に記事のslugを書くと、その記事が公開されている場合にリンクになります。
 * まだ記事がないテーマは「準備中」と表示されます（リンクは作りません）。
 */
export const categories: Record<CategoryId, CategoryInfo> = {
  start: {
    id: "start",
    name: "はじめてのランニング",
    path: "/start",
    catch: "最初の一歩を、無理なく。",
    intro:
      "走ったことがない人、しばらく運動から離れていた人のための入門ガイドです。上から順番に読めば、最初の1か月の過ごし方がわかるように並べています。高価な道具は、まだ必要ありません。",
    photo: "own-riverside-lawn",
    topics: [
      { title: "最初に必要なもの", article: "start-what-you-need" },
      { title: "買わなくてもよいもの", article: "start-what-you-need", note: "上の記事の後半で扱っています" },
      { title: "最初の1週間の過ごし方", article: "start-first-week" },
      { title: "最初の1か月の練習方法", article: "start-first-month" },
      { title: "ウォーキングとランニングの組み合わせ", article: "start-first-month", note: "1か月の記事で扱っています" },
      { title: "無理のないペース", article: "start-easy-pace" },
      { title: "季節別の服装", article: "start-what-to-wear" },
      { title: "朝ランと夜ラン", article: "start-morning-or-night" },
      { title: "ランニングを習慣にする方法", article: "start-make-it-habit" },
    ],
  },
  shoes: {
    id: "shoes",
    name: "ランニングシューズ研究所",
    path: "/shoes",
    catch: "高い一足より、合う一足。",
    intro:
      "メーカーの名前からではなく、あなたの悩みや走り方から探せるようにしています。「買ったほうがいい理由」と同じだけ、「買わなくてもいい理由」も書きます。",
    topics: [
      { title: "はじめての一足の選び方", article: "shoes-first-pair" },
      { title: "ドロップ、スタックハイト。シューズの言葉", article: "shoes-glossary" },
    ],
  },
  gear: {
    id: "gear",
    name: "補給と道具",
    path: "/gear",
    catch: "持ち物は、少なくていい。",
    intro:
      "ポーチ、リュック、ウェア、補給食。ランキングではなく、あなたの走り方から必要な道具を考えます。最初に買うべきものは、実はほとんどありません。必要になったときに、必要なものだけを。",
    topics: [],
  },
  hiroshima: {
    id: "hiroshima",
    name: "広島ランニングコース図鑑",
    path: "/courses",
    catch: "川の街を、走る。",
    intro:
      "六つの川が流れるデルタの街、広島。川沿い、公園、港、そして街を見下ろす山。運営者が実際に走って確かめた情報から順に、距離や設備を掲載していきます。未確認の情報は、未確認と書いています。",
    photo: "ota-floodway-embankment",
    topics: [
      { title: "広島で、どこから走りはじめる？", article: "hiroshima-where-to-start" },
      { title: "7つのコースを距離と坂でくらべる", article: "hiroshima-courses-compared" },
    ],
  },
  care: {
    id: "care",
    name: "長く走る",
    path: "/care",
    catch: "壊れず、少しずつ強くなる。",
    intro:
      "ランニングを長く続けるための、からだのケアと健康についてのカテゴリーです。医学的な根拠と、市民ランナーとしての個人的な経験は、はっきり分けて書きます。診断や治療の代わりにはなりません。痛みが続くときは、医療機関に相談してください。",
    topics: [
      { title: "膝の痛み", article: "care-knee-pain" },
      { title: "足底の痛み" },
      { title: "疲労回復" },
      { title: "ストレッチ" },
      { title: "筋力トレーニング" },
      { title: "体幹" },
      { title: "睡眠" },
      { title: "栄養" },
      { title: "VO2maxとは何か" },
      { title: "健康寿命とランニング" },
      { title: "ランニングの科学（研究の読み方）" },
    ],
  },
  race: {
    id: "race",
    name: "はじめてのマラソン大会",
    path: "/race",
    catch: "完走という、大きな目標。",
    intro:
      "速いランナーのための大会攻略ではなく、はじめて大会に出る人、完走を目指す人のためのガイドです。5kmから、いつかのフルマラソンまで。",
    topics: [
      { title: "はじめての大会の選び方と、当日の流れ", article: "race-first-race" },
      { title: "大会の持ち物", article: "race-first-race", note: "チェックリストのツールもあります" },
      { title: "初めての5km・10km" },
      { title: "ハーフマラソン" },
      { title: "フルマラソン" },
      { title: "補給の考え方" },
      { title: "ペース配分", note: "ペース計算機のツールがあります" },
      { title: "大会前日の過ごし方" },
      { title: "初心者が失敗しやすいこと" },
    ],
  },
  essay: {
    id: "essay",
    name: "走ること、生きること",
    path: "/essays",
    catch: "走りながら、考えたこと。",
    intro:
      "ランニングと暮らし、健康、家族、心の余裕。頑張りすぎずに、自然体でいること。商品の話をしない、小さな読み物の場所です。",
    photo: "kyobashi-river-inari",
    topics: [],
  },
};

export const getCategory = (id: CategoryId) => categories[id];
