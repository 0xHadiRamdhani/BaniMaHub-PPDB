import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PPDB SMK Bani Masum",
  description: "Penerimaan Peserta Didik Baru SMK Bani Masum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `(() => { try { const theme = localStorage.getItem("ppdb:theme"); if (theme === "dark") { document.documentElement.dataset.theme = "dark"; document.documentElement.style.colorScheme = "dark"; } } catch {} })()` }} />
      
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --btn-secondary-text: #216ba5; }
          html[data-theme="dark"] { --btn-secondary-text: #ffffff !important; }
          /* Emergency overrides to bypass stuck CSS cache */
          html[data-theme="dark"] .text-primary { color: #ffffff !important; }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
