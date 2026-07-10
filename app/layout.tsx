import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "CMC Call Center AI — Africa Distributor PoC",
  description: "AI knowledge search & answer support for distributor call centers (Phase 1 mock)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
