"use client";

export default function QuickShareBar({ title }: { title: string }) {
  const handlePrint = () => {
    document.getElementById("kazoku-share")?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new Event("kazoku-open-share"));
  };

  const handleLine = () => {
    const url  = window.location.href;
    const text = `${title}についての説明をご家族と共有します`;
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="no-print flex gap-2 mb-5">
      <button
        onClick={handlePrint}
        className="flex-1 inline-flex items-center justify-center gap-1.5
                   rounded-full border border-line bg-white text-ink py-2.5 text-sm font-medium
                   hover:bg-gray-50 transition"
      >
        📄 印刷・PDF
      </button>
      <button
        onClick={handleLine}
        className="flex-1 inline-flex items-center justify-center gap-1.5
                   rounded-full bg-[#06C755] text-white py-2.5 text-sm font-medium
                   hover:opacity-90 transition"
      >
        💬 LINEで送る
      </button>
    </div>
  );
}
