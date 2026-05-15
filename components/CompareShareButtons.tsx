"use client";
import { useRef, useState } from "react";

// XSS対策: DOMノードで安全に挿入
function makePrintHeader(hospital: string, patient: string, date: string, titles: string[]): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = "margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e5ea;";

  const label = document.createElement("div");
  label.style.cssText = "font-size:11px;color:#6e6e73;margin-bottom:4px;";
  label.textContent = "退院後の暮らしガイド";

  const info = document.createElement("div");
  info.style.cssText = "font-size:15px;font-weight:600;color:#1d1d1f;";
  info.textContent = `${hospital || "〇〇病院"}　患者: ${patient || "―"}　${date}`;

  const comp = document.createElement("div");
  comp.style.cssText = "font-size:12px;color:#6e6e73;margin-top:4px;";
  comp.textContent = `比較: ${titles.join(" vs ")}`;

  wrap.appendChild(label);
  wrap.appendChild(info);
  wrap.appendChild(comp);
  return wrap;
}

type Props = { titles: string[] };

export default function CompareShareButtons({ titles }: Props) {
  const [hospital, setHospital] = useState("");
  const [patient, setPatient]   = useState("");
  const [date, setDate]         = useState(() => new Date().toLocaleDateString("ja-JP"));
  const [open, setOpen]         = useState(false);
  const headerRef               = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (headerRef.current) {
      headerRef.current.innerHTML = "";
      headerRef.current.appendChild(makePrintHeader(hospital, patient, date, titles));
    }
    window.print();
  };

  const handleLine = () => {
    const url  = window.location.href;
    const text = `${titles.join("と")}の比較をご共有します`;
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <div ref={headerRef} className="hidden print:block" />

      <div className="no-print space-y-3">
        <button
          onClick={() => setOpen(!open)}
          className="w-full rounded-full border border-line bg-white text-ink py-4 text-base font-medium
                     hover:bg-gray-50 transition"
        >
          📄  PDFで保存する（病院名・患者名を入力）
        </button>

        {open && (
          <div className="rounded-2xl bg-white border border-line p-5 space-y-3">
            <div>
              <label className="text-sm text-sub block mb-1">病院・施設名</label>
              <input
                type="text"
                placeholder="例：〇〇リハビリテーション病院"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full border border-line rounded-xl px-4 py-3 text-base text-ink
                           focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-sub block mb-1">患者イニシャル</label>
                <input
                  type="text"
                  placeholder="例：T.K"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  className="w-full border border-line rounded-xl px-4 py-3 text-base text-ink
                             focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div>
                <label className="text-sm text-sub block mb-1">日付</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-line rounded-xl px-4 py-3 text-base text-ink
                             focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="w-full rounded-full bg-ink text-white py-4 text-base font-medium
                         hover:opacity-90 transition"
            >
              印刷・PDFとして保存する
            </button>
          </div>
        )}

        <button
          onClick={handleLine}
          className="w-full rounded-full bg-[#06C755] text-white py-4 text-base font-medium
                     hover:opacity-90 transition"
        >
          💬  LINEで家族に送る
        </button>
      </div>
    </>
  );
}
