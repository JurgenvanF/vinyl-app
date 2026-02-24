"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider, useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
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

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/wishlist") {
      document.title = `Vinyl Vault | ${t(locale, "wishlist")}`;
      return;
    }

    if (pathname === "/profile") {
      document.title = `Vinyl Vault | ${t(locale, "profile")}`;
      return;
    }

    document.title = "Vinyl Vault";
  }, [pathname, locale]);

  const hideTopNav = pathname === "/";
  const isAuthPage = pathname === "/";

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased ${isAuthPage ? "auth-page" : "app-page"}`}
    >
      <ThemeInitializer />
      <div className="app-shell">
        {!hideTopNav && <TopNav />}
        <main className={`app-main ${!isAuthPage && "my-10"} `}>
          {children}
        </main>
        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </LanguageProvider>
      </body>
    </html>
  );
}
