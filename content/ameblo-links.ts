import type { ShoePurposeId } from "../lib/types.ts";

/**
 * アメブロ記事と、サイトのシューズ・用途の結びつけ
 * ------------------------------------------------------------------
 * アメブロの新しい記事（RSSの最新10件）は、タイトルに含まれる言葉で自動的に結びつけます。
 * RSSに出てこない古い記事を結びつけたいときは、curated に手で追加してください。
 *
 * 結びつけは「読みたい人が自然に見つけられる」ためのもので、診断の順位には一切影響しません。
 */

/** サイトのシューズ（content/shoes.ts の slug）と、記事タイトルで探す言葉 */
export const shoeKeywords: Record<string, string[]> = {
  "asics-novablast": ["NOVABLAST", "ノヴァブラスト", "ノバブラスト"],
  "asics-gel-nimbus": ["NIMBUS", "ニンバス"],
  "asics-gel-kayano": ["KAYANO", "カヤノ"],
  "asics-gt-2000": ["GT-2000", "GT2000"],
  "asics-jolt": ["JOLT", "ジョルト"],
  "nike-pegasus": ["Pegasus", "ペガサス"],
  "nike-vomero": ["Vomero", "ボメロ"],
  "nike-revolution": ["Revolution", "レボリューション"],
  "nb-1080": ["1080"],
  "nb-880": ["880"],
  "nb-rebel": ["Rebel", "レベル"],
  "hoka-clifton": ["Clifton", "クリフトン"],
  "hoka-bondi": ["Bondi", "ボンダイ"],
  "hoka-arahi": ["Arahi", "アラヒ"],
  "adidas-adizero-boston": ["BOSTON", "ボストン"],
  "adidas-adizero-evo-sl": ["EVO SL", "エヴォ SL", "エボ SL"],
  "adidas-duramo": ["DURAMO", "デュラモ"],
  "on-cloudmonster": ["Cloudmonster", "クラウドモンスター"],
  "brooks-ghost": ["Ghost", "ゴースト"],
  "brooks-adrenaline": ["Adrenaline", "アドレナリン"],
  "brooks-glycerin": ["Glycerin", "グリセリン"],
  "mizuno-wave-rider": ["WAVE RIDER", "ウエーブライダー", "ウェーブライダー"],
  "mizuno-wave-inspire": ["WAVE INSPIRE", "インスパイア"],
  "saucony-ride": ["Saucony RIDE", "サッカニー ライド", "ライド18", "ライド19"],
  "saucony-guide": ["GUIDE", "ガイド"],
  "saucony-endorphin-speed": ["ENDORPHIN SPEED", "エンドルフィン スピード", "エンドルフィンスピード"],
};

/** サイトに登録していないモデルも、用途で結びつけるための言葉 */
export const purposeKeywords: Partial<Record<ShoePurposeId, string[]>> = {
  stability: ["860", "Structure", "ストラクチャー", "KAYANO", "カヤノ", "GT-2000", "Adrenaline", "Arahi", "安定"],
  cushion: ["1080", "Vomero", "ボメロ", "NIMBUS", "ニンバス", "Bondi", "Glycerin", "Clifton", "クッション"],
  speed: ["ズーム フライ", "ズームフライ", "ZOOM FLY", "ライバルフライ", "Rival Fly", "Rebel", "BOSTON", "ENDORPHIN", "EVO SL", "スピード"],
  marathon: ["フルマラソン", "マラソン", "ズーム フライ", "BOSTON"],
  first: ["初心者", "はじめて", "Revolution", "JOLT", "DURAMO"],
  value: ["OFF", "半額", "円！", "セール"],
  easy: ["Pegasus", "ペガサス", "NOVABLAST", "Ghost", "880", "ジョグ"],
  long: ["ロング", "長距離", "1080", "NIMBUS"],
};

/** RSSに出てこない過去の記事を、手で結びつける（新しいものを上に） */
export const curated: { url: string; title: string; date: string; shoes?: string[]; purposes?: ShoePurposeId[] }[] = [];
