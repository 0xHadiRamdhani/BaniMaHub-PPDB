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
    <html lang="id" data-theme="dark" className={`${inter.variable} dark`} style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const saved = localStorage.getItem("ppdb:theme"); const theme = saved === "light" ? "light" : "dark"; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; document.documentElement.classList.toggle("dark", theme === "dark"); } catch {} })()`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --btn-secondary-text: #38bdf8; }
          html[data-theme="light"] { --btn-secondary-text: #1d4ed8 !important; }
          html[data-theme="dark"] { --btn-secondary-text: #38bdf8 !important; }
          html[data-theme="dark"] .text-primary { color: #38bdf8 !important; }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
