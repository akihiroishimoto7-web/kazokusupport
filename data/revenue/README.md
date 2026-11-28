# 収益の記録

`log.csv` に、月ごとの実際の報酬を1行ずつ追記します（推測の数字は入れない）。

| 列 | 内容 |
| --- | --- |
| month | 対象月（例: 2026-12） |
| source | ameba-pick / rakuten / amazon / yahoo / other |
| amount_jpy | 確定報酬（円）。未確定なら空欄にして note に「未確定」 |
| clicks | 管理画面のクリック数（わかれば） |
| orders | 成果件数（わかれば） |
| note | 補足 |

運営者が各サービスの管理画面（Ameba Pick など）を見て記入するか、数字をエージェントに伝えて記入してもらってください。
`npm run weekly:report` が集計して、週次レポートに載せます。
