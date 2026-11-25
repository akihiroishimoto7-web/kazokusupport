/**
 * アクセス解析（Google アナリティクス 4）の設定。
 *
 * GA4 の「測定ID」（G- で始まる文字列）を入れると、計測が始まります。
 * Vercel の環境変数 NEXT_PUBLIC_GA_ID でも設定できます（こちらが優先）。
 * null の間は、解析用のスクリプトは一切読み込まれません。
 *
 * 計測するもの:
 *   - ページの表示（page_view）
 *   - 外部リンクのクリック（outbound_click）… アメブロ・ショップ・メーカー公式のどれに出ていったか
 * 個人を特定する情報や、診断・チェックリストの入力内容は送りません。
 */
const fromEnv = process.env.NEXT_PUBLIC_GA_ID?.trim() || null;

export const analytics = {
  gaMeasurementId: (fromEnv ?? "G-DMMCNRBP3E") as string | null,
};

export const gaId = (): string | null => {
  const id = analytics.gaMeasurementId;
  return id && /^G-[A-Z0-9]+$/.test(id) ? id : null;
};
