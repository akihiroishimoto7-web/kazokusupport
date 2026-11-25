import { buildShopLinks } from "@/lib/shop";
import { discountRate } from "@/lib/shoe-db";
import type { PriceObservation, ShoeModel } from "@/lib/shoe-db-types";
import { formatDate, formatYen } from "@/lib/format";

/**
 * 公式ストアの価格記録。
 * 観測した日の価格だけを並べます（間の日の価格は推測しません）。2回以上記録があれば線で示します。
 */
export function PriceHistory({ model, history }: { model: ShoeModel; history: PriceObservation[] }) {
  if (!history.length) return null;
  const points = history.slice(-24);
  return (
    <section className="shoe__section" aria-labelledby="price-history">
      <h2 id="price-history">公式ストアの価格の記録</h2>
      <p className="spec-help" style={{ marginTop: 0 }}>
        {model.name}（メンズ）の、メーカー公式オンラインストアでの販売価格（税込）を、確認した日ごとに記録しています。確認していない日の価格はわかりません。
      </p>
      {points.length >= 2 ? <Sparkline points={points} /> : null}
      <div className="table-wrap" tabIndex={0}>
        <table className="compare price-log">
          <thead>
            <tr>
              <th scope="col">確認日</th>
              <th scope="col">販売価格</th>
              <th scope="col">通常価格</th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((o) => (
              <tr key={`${o.date}-${o.url}`}>
                <th scope="row">{formatDate(o.date)}</th>
                <td>
                  {formatYen(o.priceJpy)}
                  {o.onSale ? <span className="price-log__sale">セール</span> : null}
                </td>
                <td>{o.regularPriceJpy ? formatYen(o.regularPriceJpy) : <span className="muted">表示なし</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {points.length < 2 ? <p className="spec-help">記録を始めたばかりです。確認するたびに、ここに増えていきます。</p> : null}
    </section>
  );
}

function Sparkline({ points }: { points: PriceObservation[] }) {
  const W = 320;
  const H = 72;
  const ys = points.map((p) => p.priceJpy);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = Math.max(max - min, 1);
  const xy = points.map((p, i) => [(i / (points.length - 1)) * (W - 8) + 4, H - 6 - ((p.priceJpy - min) / span) * (H - 16)] as const);
  return (
    <svg className="price-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`価格の推移。最安 ${formatYen(min)}、最高 ${formatYen(max)}`}>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={xy.map(([x, y]) => `${x},${y}`).join(" ")} />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * 一つ前の世代。公式ストアで値下がりしていることが多いので、比べて選べるようにします。
 */
export function PreviousModels({ current, previous, brandName }: { current: ShoeModel | null; previous: ShoeModel[]; brandName: string }) {
  const rows = [...(current ? [current] : []), ...previous];
  return (
    <section className="shoe__section" aria-labelledby="previous">
      <h2 id="previous">一つ前のモデルとくらべる</h2>
      <p className="spec-help" style={{ marginTop: 0 }}>
        新しいモデルが出ると、前の世代は値下がりすることがあります。最新でなくても、十分に走れます。
      </p>
      <div className="table-wrap" tabIndex={0}>
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">モデル</th>
              <th scope="col">重量</th>
              <th scope="col">ドロップ</th>
              <th scope="col">公式ストアの価格</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const off = discountRate(m);
              return (
                <tr key={m.id} className={m.lifecycle === "current" ? "is-current" : undefined}>
                  <th scope="row">
                    <span className="latin">{m.name}</span>
                    <span className="muted" style={{ display: "block", fontSize: "0.75rem" }}>
                      {m.lifecycle === "current" ? "現行" : "前の世代"}
                    </span>
                  </th>
                  <td>{m.specs.weightG ? `${m.specs.weightG.value}g` : <span className="muted">記載なし</span>}</td>
                  <td>{m.specs.dropMm ? `${m.specs.dropMm.value}mm` : <span className="muted">記載なし</span>}</td>
                  <td>
                    {m.officialPrice ? (
                      <>
                        {formatYen(m.officialPrice.priceJpy)}
                        {off ? <span className="price-log__sale price-log__sale--block">{off}%引き</span> : null}
                        <span className="muted" style={{ display: "block", fontSize: "0.75rem" }}>
                          {formatDate(m.officialPrice.checkedAt)}確認
                        </span>
                      </>
                    ) : (
                      <span className="muted">未確認</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ul role="list" className="prev-links">
        {previous.map((m) => {
          const shop = buildShopLinks({ rakuten: `${brandName} ${m.name}`, amazon: `${brandName} ${m.name}`, yahoo: `${brandName} ${m.name}` });
          const sponsored = shop.some((l) => l.sponsored);
          return (
            <li key={m.id}>
              <span className="latin">{m.name}</span>を探す：
              <a href={m.officialUrl} target="_blank" rel="noopener noreferrer">
                公式ストア
              </a>
              {shop.map((l) => (
                <a key={l.shop} href={l.url} target="_blank" rel={l.sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}>
                  {l.label}
                </a>
              ))}
              {sponsored ? <span className="muted">（広告を含みます）</span> : null}
            </li>
          );
        })}
      </ul>
      <p className="spec-help">価格・在庫・セールの期間は変わります。購入前に各ストアで確認してください。</p>
    </section>
  );
}
