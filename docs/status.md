# 進捗（次のエージェントへの引き継ぎ）

最終更新：2026-11-28
作業ブランチ：`claude/run-life-hiroshima-media-404u4a`／本番：https://kazokusupport-u8zk.vercel.app（main をデプロイ）

関連：事業戦略 `docs/strategy.md`／優先課題 `docs/backlog.md`／手順 `docs/agent/RUNBOOK.md`・`docs/ops/`／自動生成 `docs/agent/QUEUE.md`・`docs/seo/report.md`・`docs/reports/`

## いまの数字（2026-11-28）

- シューズのシリーズ：26。登録モデル：24（Nike・On・ミズノ・サッカニー・ブルックスは公式から自動収集、ASICS・NB はプレスリリースで手作業確認）
- 価格の記録：2回分（2026-11-25・11-28）。Brooks Ghost 18 が 19,800円 → 15,840円（セール）を検出
- 世代比較ページ：9／2足の比較ページ：25／記事：19
- Lighthouse（モバイル、本番）：性能 89〜95、アクセシビリティ 96〜97、SEO 100
- テスト：36件
- GA4：G-DMMCNRBP3E（2026-11-28 に CSP を直し、実際に計測が始まる状態）

## 作業履歴

| 日付 | 内容 | 状態 |
| --- | --- | --- |
| 2026-11-28 | 運営者の指示で、承認済みの情報源（ステップスポーツ・アルペン・ヒマラヤ・ラントリップ、`lib/trusted-sources.ts`）を使えるように。画面では「販売店／メディアの記載」と公式を区別。HOKA CLIFTON 10（前の世代。後継の CLIFTON 11 をアルペン・ヒマラヤで確認）・adidas ADIZERO EVO SL を追加。KAYANO 32/33・1080 v14/v15・Rebel v5 の重量・厚さ・ドロップを補完。比較「CLIFTON 10 vs Cloudmonster 3」「EVO SL vs Rebel v5」を公開（優先比較7本すべて完了） | 本番公開 |
| 2026-11-28 | 全体監査（Lighthouse・SEO・計測）。**GA がCSPで止まっていた問題を修正**。favicon.ico・コントラスト・アクセシブル名を修正。モデルDBを拡張（発売日・品番・前作からの変更の原文・項目ごとの出典、手作業確認モデル）。ASICS GEL-KAYANO 32/33、NB 1080 v14/v15・Rebel v5 をプレスリリースで確認、Pegasus 41 を追加。世代比較ページ（/shoes/models、9組）。記事「CW-X vs 2XU」「アミノサウルス vs アミノバイタル」。診断結果に価格帯・注意点・比較導線・計測イベント。SEO点検・週次レポート・GitHub Actions（check / weekly-data）。運営文書（strategy・status・backlog・docs/ops） | 本番公開 |
| 2026-11-25 | 特集「GYAKUSOU｜走る服に、なぜこんなに惹かれるのか」（/features/gyakusou）と特集一覧（/features）。第1弾 Nike × Gyakusou ズーム フライ SP。写真は0枚で成立、掲載条件を確認した実物写真を content/features/gyakusou.ts と public/features/gyakusou/ に追加できる | 本番公開（PR #17） |
| 2026-11-25 | Google アナリティクス 4 の組み込み（測定IDの設定待ち・未設定の間は読み込まない）、外部リンクのクリック計測、プライバシーの記載の自動切り替え、シューズページにアメブロへの導線 | 本番公開（運営者の指示） |
| 2026-11-25 | シューズDB新設（公式ページから仕様・価格を収集、値ごとに根拠の原文を保存）、価格履歴、前の世代の比較、2足の比較ページ25件、診断の予算判定を公式価格で、アメブロ下書き生成、点検スクリプト、事業分析、引き継ぎ文書 | 本番公開済み（PR #15、運営者の承認） |
| 2026-11-25 | コラム「大迫傑は、ランナーの「格好」を変えた」、トップのコラム枠を複数表示 | 本番公開済み（PR #14） |
| 〜2026-11-25 | サイト本体、コース図鑑、シューズ研究所、診断・比較・ペース・ランログ、アメブロRSS連携 | 本番公開済み |

## 承認・作業が必要なもの（運営者）

- [ ] GitHub：Settings → Actions → General →「Allow GitHub Actions to create and approve pull requests」を有効に（週次データ更新の PR のため。無料）
- [ ] 週次データ更新を自動で本番まで反映するか（リポジトリ変数 `AUTO_MERGE_DATA=true`。初期は無効）
- [ ] GA4 のカスタム定義と Search Console の登録（各10分。手順 `docs/ops/analytics.md`）
- [ ] アメブロへの投稿（`drafts/ameblo/`。値下がりまとめは週1が目安）
- [ ] 毎月の報酬を `data/revenue/log.csv` に（または数字をエージェントへ）
- [ ] 有料・外部登録が必要なもの：GA4/Search Console API 連携（Google Cloud）、独自ドメイン、Claude の定期実行
- 決定（2026-11-25）：アフィリエイトは当面アメブロ経由。HP の `content/affiliate.ts` は未設定のまま

## 次にやること（エージェントが自律的に進めてよい）

1. 週1回：`npm run shoes:collect` → `npm run shoes:audit -- --write` → `npm run seo:audit -- --write` → `npm run ameblo:drafts` → `npm run weekly:report` → 確認 → PR → マージ → 本番確認（GitHub Actions が動けば自動）
2. 前の世代の追加：Nike Vomero 17、On Cloudmonster 2、ミズノ WAVE RIDER 29・WAVE INSPIRE 21 が公式ストアに残っていれば targets.json に previous で追加 → 世代比較が自動で増える
3. HOKA CLIFTON 11 の仕様を承認済み情報源で確認して登録 → CLIFTON 10 と 11 の世代比較が自動でできる
4. GA4 の数字が共有されたら、週次レポートの「改善の提案」を書き、`docs/backlog.md` を並べ替える
5. SEO 点検の P3（title の長さなど）を少しずつ

## 判断の記録（なぜそうしたか）

- **自動取得した値を「確認済み」として表示する根拠**：値ごとに公式ページの該当行を原文のまま保存し（evidence）、テストで「根拠の行に値が含まれていること」「厚さの差とドロップが一致すること」を検査している。ページには「公式ページの記載（原文）」として開示している
- **検索登録の条件**：レビュー済み、または現行モデルの重量と価格を公式で確認できたページだけ（`lib/shoe-db.ts` の `isIndexableShoe`）。中身の薄いページを登録しないため
- **比較ページの組み合わせ**：公式確認済みのシリーズ同士で、用途が2つ以上重なるものだけ。重量は計測サイズが同じときだけ差を書く（Nike は28cm、ブルックス・ミズノは27cm で単純比較できない）
- **予算判定**：公式ストアで確認できた価格だけを使う。価格不明のシリーズは加点も減点もしない。予算内に現行がなく前の世代があれば、前の世代を提示する
- **Playwright をリポジトリの依存に入れていない**：Vercel のビルドを重くしないため。収集はクラウド環境（導入済み）で実行する

- **CSP**：外部スクリプトは GA4（googletagmanager.com）だけを許可。それ以外を足すときは next.config.ts を見直す
- **HOKA・adidas**：第三者サイトの数字しか取れなかったため、掲載しない（公式で確認できるまで）
- **アミノサウルス**：エネルギー・価格・機能性表示の有無は公式で確認できず、記事では未確認と明記
- **情報源が食い違ったとき**：計測サイズの書かれた値を優先し、型番・世代の説明が合っている記事を優先する。例：GEL-KAYANO 33 のドロップは、ラントリップマガジン 8mm を採用（ラントリップストアの商品ページは 10mm だが、本文が前世代の技術の説明で、古い情報の流用とみられる）。1080v14 の重量は、サイズの明記されたアルペン（300g／27.5cm・2E）を採用（ラントリップマガジンの「約283g」はサイズの記載なし）
