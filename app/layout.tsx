import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "退院後の暮らしガイド",
  description: "退院後の選択肢をご家族と一緒に考えるためのやさしいガイド",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans">{children}</body>
    </html>
  );
}
