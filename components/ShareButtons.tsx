"use client";
import { useEffect, useRef, useState } from "react";

const HOSPITAL_KEY = "kazoku-hospital-name";

function makePrintHeader(hospital: string, patient: string, date: string): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = "margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e5ea;";

  const label = document.createElement("div");
  label.style.cssText = "font-size:11px;color:#6e6e73;margin-bottom:4px;";
  label.textContent = "退院後の暮らしガイド";

  const info = document.createElement("div");
  info.style.cssText = "font-size:15px;font-weight:600;color:#1d1d1f;";
  info.textContent = `${hospital || "〇〇病院"}　患者: ${patient || "―"}　${date}`;

  wrap.appendChild(label);
  wrap.appendChild(info);
  return wrap;
}

export default function ShareButtons({ title }: { title: string }) {
  const [hospital, setHospital] = useState("");
  const [patient, setPatient]   = useState("");
  const [date, setDate]         = useState(() => new Date().toLocaleDateString("ja-JP"));
  const [open, setOpen]         = useState(false);
  const [saved, setSaved]       = useState(false); // 保存フィードバック用
  const headerRef               = useRef<HTMLDivElement>(null);

  // 起動時に病院名を復元
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HOSPITAL_KEY);
      if (stored) setHospital(stored);
    } catch { /* ignore */ }
  }, []);

  // 病院名が変わるたびに保存
  const handleHospitalChange = (value: string) => {
    setHospital(value);
    try {
      localStorage.setItem(HOSPITAL_KEY, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch { /* ignore */ }
  };

  const handlePrint = () => {
    if (headerRef.current) {
      headerRef.current.innerHTML = "";
      headerRef.current.appendChild(makePrintHeader(hospital, patient, date));
    }
    window.print();
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-sub">病院・施設名</label>
                {saved && (
                  <span className="text-xs text-accent">✓ 保存しました</span>
                )}
              </div>
              <input
                type="text"
                placeholder="例：〇〇リハビリテーション病院"
                value={hospital}
                onChange={(e) => handleHospitalChange(e.target.value)}
                className="w-full border border-line rounded-xl px-4 py-3 text-base text-ink
                           focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <p className="text-xs text-sub mt-1">※ 入力内容はこの端末に自動保存されます</p>
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
