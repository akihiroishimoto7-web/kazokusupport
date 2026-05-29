"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kazoku-hospital-name";

export default function HospitalEyebrow() {
  const [hospital, setHospital] = useState<string | null>(null);
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) setHospital(saved.trim());
    } catch {
      // localStorage が使えない環境では無視
    }
    setLoaded(true);
  }, []);

  // ハイドレーション不一致を防ぐため、読み込み完了まで既定テキストを表示
  if (!loaded || !hospital) {
    return <p className="text-sub text-sm sm:text-base mb-3">退院後の暮らしガイド</p>;
  }

  return (
    <p className="text-accent text-sm sm:text-base font-medium mb-3">
      {hospital}　退院支援ガイド
    </p>
  );
}
