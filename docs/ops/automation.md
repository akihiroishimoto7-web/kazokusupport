# 自動化の選択肢（権限・費用・条件）

| 方法 | 何を自動化 | 費用 | 必要な権限・条件 | 状態 |
| --- | --- | --- | --- | --- |
| GitHub Actions `check` | PR ごとの型・テスト・ビルド | 無料（公開リポジトリの標準ランナー） | なし | 追加済み |
| GitHub Actions `weekly-data` | 週次の収集・点検・下書き・レポート → PR | 無料（同上） | Settings → Actions → General →「Allow GitHub Actions to create and approve pull requests」を有効に | 追加済み・設定待ち |
| 自動マージ | 週次 PR を確認後に本番へ | 無料 | リポジトリ変数 `AUTO_MERGE_DATA` = `true` | 任意（初期は無効） |
| Claude のスケジュール実行（クラウドのタスク） | 週次レポートを読んで改善提案・実装まで | プランの利用量を消費 | 運営者の承認 | 未設定（提案） |
| GA4 Data API / Search Console API | レポートに数字を自動で入れる | 通常は無料枠 | Google Cloud のサービスアカウント、承認 | 未着手 |

注意：公式サイトの中には、GitHub のサーバーなどデータセンターからのアクセスを拒否するものがあります。週次の収集で失敗したモデルは `data/shoes/last-run.json` に記録され、前回の値が残ります。
