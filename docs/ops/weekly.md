# 週次の分析と改善提案

## 自動（GitHub Actions：`.github/workflows/weekly-data.yml`、毎週火曜 6:23）

1. `npm run shoes:collect`：公式の仕様・価格を収集（価格の記録が増える）
2. `npm run shoes:audit -- --write`：作業キュー `docs/agent/QUEUE.md`
3. `npm run seo:audit -- --write`：`docs/seo/report.md`
4. `npm run ameblo:drafts`：値下がりまとめ・モデル記事の下書き
5. `npm run weekly:report`：`docs/reports/weekly-YYYY-MM-DD.md`
6. 確認（check・build）が通れば PR を作成（自動マージは任意）

## エージェント（週1回、または運営者に頼まれたとき）

1. 最新の週次レポートと QUEUE、SEO レポートを読む
2. GA4 の数字（運営者が共有、または API 接続後）を見て、レポートの「改善の提案」に3つまで書く
   - 例：アメブロへの送客が多いページの種類を増やす／完了率の低い診断の質問を見直す
3. P1 から実装 → 確認 → PR → マージ → 本番確認（`CLAUDE.md` の方針）
4. `docs/status.md` を更新

## 運営者（週15分）

- 値下がりまとめの下書きを確認して、アメブロに投稿（Ameba Pick のリンクを入れる）
- 月初に、前月の報酬を `data/revenue/log.csv` に（または数字をエージェントに伝える）
