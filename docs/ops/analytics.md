# アクセスと収益の測り方

## いま計測できること（2026-11-28）

GA4（測定ID `G-DMMCNRBP3E`、`content/analytics.ts`）で、次を記録しています。

| 知りたいこと | GA4 での見方 |
| --- | --- |
| ページ別アクセス数 | レポート → エンゲージメント → ページとスクリーン |
| 商品リンクのクリック数 | イベント `outbound_click`（`link_kind` = rakuten / amazon / yahoo / official） |
| アメブロへの送客 | イベント `outbound_click`（`link_kind` = ameblo）、`from_path` でどのページからか |
| アメブロからHPへの送客 | 集客 → トラフィック獲得（セッションの参照元 = ameblo）。下書き内のリンクには `utm_source=ameblo` |
| 診断の開始率・完了率 | イベント `finder_start` と `finder_complete` の数 ÷ `/tools/shoe-finder` の表示回数 |
| 診断結果から商品ページへの遷移率 | イベント `finder_result_click`（`link_type` = detail / compare / generation、`rank`、`shoe`）÷ `finder_complete` |
| 検索流入 | Search Console（下の手順で登録） |
| 実際のアフィリエイト報酬 | Ameba Pick などの管理画面 → `data/revenue/log.csv` に記入 |

## 運営者の作業（1回だけ）

### 1. GA4 のカスタム定義（10分）

イベントの項目をレポートで見られるようにします。GA4 → 管理 → データの表示 → カスタム定義 → カスタムディメンションを作成（範囲はすべて「イベント」）。

- `link_kind`、`link_domain`、`from_path`、`shoe`、`link_type`、`purpose`

### 2. Search Console（10分）

1. https://search.google.com/search-console で「URL プレフィックス」に `https://kazokusupport-u8zk.vercel.app/` を追加
2. 確認方法は「Google アナリティクス」を選ぶ（GA4 の管理者なら、サイト側の作業なしで確認できます）
3. サイトマップに `sitemap.xml` を送信

HTML タグでの確認を選んだ場合は、表示されるコード（`content="..."` の中身）をエージェントに渡してください。サイトに埋め込みます。

### 3. 収益の記録（毎月10分）

Ameba Pick などの管理画面で前月の確定報酬を見て、`data/revenue/log.csv` に追記します（数字をエージェントに伝えれば記入します）。

## 自動化（承認が必要）

GA4 Data API と Search Console API を使えば、週次レポート（`npm run weekly:report`）に数字を自動で入れられます。Google Cloud でサービスアカウントを作り、GA4 と Search Console に閲覧権限を付け、鍵をこの環境の認証情報として登録する必要があります。料金は通常の利用量なら無料枠の範囲ですが、Google Cloud のプロジェクト作成（課金アカウントの紐づけを求められる場合あり）が必要なため、運営者の承認を得てから進めます。
