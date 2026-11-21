"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap notfound">
      <p className="hub__catch">エラー</p>
      <h1 className="notfound__title">うまく表示できませんでした。</h1>
      <p>時間をおいて、もう一度お試しください。</p>
      <p>
        <button type="button" className="button button--quiet button--inline" onClick={reset}>
          もう一度読み込む
        </button>
      </p>
    </div>
  );
}
