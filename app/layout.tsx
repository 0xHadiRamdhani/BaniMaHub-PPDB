import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPDB SMK Bani Masum",
  description: "Penerimaan Peserta Didik Baru SMK Bani Masum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `(() => { try { const theme = localStorage.getItem("ppdb:theme"); if (theme === "dark") { document.documentElement.dataset.theme = "dark"; document.documentElement.style.colorScheme = "dark"; } } catch {} })()` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
