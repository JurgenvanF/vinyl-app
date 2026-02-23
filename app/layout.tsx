"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "../lib/LanguageContext";
import TopNav from "./components/topnav/TopNav";
import ThemeInitializer from "./components/theme/ThemeInitializer";
import Footer from "./components/footer/Footer";
import { usePathname } from "next/navigation";
import "./styles/main.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const hideTopNav = pathname === "/";
  const isAuthPage = pathname === "/";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${isAuthPage ? "auth-page" : "app-page"}`}
      >
        <LanguageProvider>
          <ThemeInitializer />
          <div className="app-shell">
            {!hideTopNav && <TopNav />}
            <main className="app-main my-20">{children}</main>
            {!isAuthPage && <Footer />}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
