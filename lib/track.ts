/**
 * アクセス解析（GA4）へのイベント送信。GA が読み込まれていなければ何もしません。
 * 送るのは、ページ・ボタンの種類・シューズの slug などだけ。入力内容そのものや個人を特定する情報は送りません。
 *
 * イベント一覧（GA4 のカスタムディメンション登録は docs/ops/analytics.md）:
 *   finder_start          … 診断の最初の質問に答えた
 *   finder_complete       … 診断の結果を表示した（purpose: 主な用途）
 *   finder_result_click   … 結果の候補をクリック（shoe, rank, link_type: detail|compare|generation）
 *   outbound_click        … 外部リンク（components/Analytics.tsx が自動で送る）
 */
type Params = Record<string, string | number | boolean | undefined>;

export function track(name: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.("event", name, params);
}
