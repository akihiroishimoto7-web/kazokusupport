import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Instrument_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/content/site";
import { buildMetadata, websiteJsonLd } from "@/lib/seo";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/prose.css";
import "@/styles/pages.css";
import "@/styles/tools.css";
import "@/styles/refresh.css";

// 見出し用の明朝体。日本語の字形はGoogle Fontsの分割配信で必要な文字だけ読み込まれます
const shippori = Shippori_Mincho({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-shippori",
});

// 欧文・数字用
const instrument = Instrument_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...buildMetadata({ path: "/" }),
  applicationName: site.name,
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { title: "RUN LIFE", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#161814" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${shippori.variable} ${instrument.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          本文へ移動
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
