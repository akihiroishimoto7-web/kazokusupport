"use client";
import { useEffect, useState } from "react";

const HOSPITAL_KEY = "kazoku-hospital-name";
const DISMISS_KEY  = "kazoku-hospital-setup-dismissed";

export default function HospitalSetupBanner() {
  const [show, setShow]         = useState(false);
  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState("");

  // 病院名が未設定で、かつ閉じられていなければ表示
  useEffect(() => {
    try {
      const hospital  = localStorage.getItem(HOSPITAL_KEY);
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if ((!hospital || !hospital.trim()) && !dismissed) setShow(true);
    } catch { /* ignore */ }
  }, []);

  const save = () => {
    const name = value.trim();
    if (!name) return;
    try {
      localStorage.setItem(HOSPITAL_KEY, name);
    } catch { /* ignore */ }
    setShow(false);
    // ヘッダー等を即時更新するためリロード
    window.location.reload();
  };

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="no-print mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-5">
      {!editing ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-medium text-ink">
              この端末を使う病院・施設名を登録できます
            </p>
            <p className="text-sm text-sub mt-0.5">
              登録すると、配布資料に病院名が表示されます
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="rounded-full bg-accent text-white px-5 py-2 text-sm font-medium
                         hover:opacity-90 transition"
            >
              登録する
            </button>
            <button
              onClick={dismiss}
              aria-label="閉じる"
              className="text-sub hover:text-ink text-xl leading-none px-1 transition"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="text-sm text-sub block">病院・施設名</label>
          <input
            type="text"
            autoFocus
            placeholder="例：〇〇リハビリテーション病院"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            className="w-full border border-line rounded-xl px-4 py-3 text-base text-ink bg-white
                       focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex-1 rounded-full bg-ink text-white py-3 text-sm font-medium
                         hover:opacity-90 transition"
            >
              保存する
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-line bg-white text-sub px-5 py-3 text-sm
                         hover:text-ink transition"
            >
              キャンセル
            </button>
          </div>
          <p className="text-xs text-sub">※ 入力内容はこの端末にのみ保存されます</p>
        </div>
      )}
    </div>
  );
}
