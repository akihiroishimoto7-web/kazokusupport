/**
 * アフィリエイト設定。
 *
 * ここにIDを入れるだけで、サイト内のすべての購入リンクがアフィリエイトリンクに切り替わり、
 * 「広告」表示も自動で付きます。IDが null の間は、ふつうの検索リンクとして動作します。
 *
 * - 楽天アフィリエイト: https://affiliate.rakuten.co.jp/ の「アフィリエイトID」（例: "0a1b2c3d.4e5f6a7b.0a1b2c3d.4e5f6a7b"）
 * - Amazonアソシエイト: トラッキングID（例: "example-22"）
 * - Yahoo!ショッピング（バリューコマース）: sid と pid
 */
export const affiliate = {
  rakuten: { affiliateId: null as string | null },
  amazon: { associateTag: null as string | null },
  yahoo: { valuecommerceSid: null as string | null, valuecommercePid: null as string | null },
  /** 購入リンクに表示するショップ（表示順） */
  shops: ["rakuten", "amazon", "yahoo"] as const,
};
