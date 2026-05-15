"use client";

// PDF出力（印刷ダイアログ経由） / LINE共有 ボタン
// MVPでは window.print() を使い、ブラウザの「PDFとして保存」で出力します
export default function ShareButtons({ title }: { title: string }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleLine = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = `${title}についての説明をご家族と共有します`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text)}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="no-print flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        onClick={handlePrint}
        className="flex-1 rounded-full bg-ink text-white py-4 text-base font-medium
                   hover:opacity-90 transition active:scale-[0.99]"
      >
        📄  PDFで保存・印刷する
      </button>
      <button
        onClick={handleLine}
        className="flex-1 rounded-full bg-[#06C755] text-white py-4 text-base font-medium
                   hover:opacity-90 transition active:scale-[0.99]"
      >
        💬  LINEで家族に送る
      </button>
    </div>
  );
}
