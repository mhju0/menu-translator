import type { Metadata } from "next";

import SiteNav from "@/components/SiteNav";

import "./globals.css";

export const metadata: Metadata = {
  title: "Korean Menu Translator",
  description: "Snap a Korean restaurant menu and get instant translations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-kakao-ink antialiased">
        <SiteNav />
        <main className="mx-auto max-w-content px-4 py-10 nav:py-16">
          {children}
        </main>
      </body>
    </html>
  );
}
