"use client";

import { useEffect } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
import TopNav from "./components/topnav/TopNav";
import ThemeInitializer from "./components/theme/ThemeInitializer";
import Footer from "./components/footer/Footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/") {
      document.title = "Vinyl Vault";
      return;
    }

    const pageByPath: Record<string, string> = {
      "/collection": t(locale, "myCollection"),
      "/wishlist": t(locale, "wishlist"),
      "/profile": t(locale, "profile"),
    };
    const directTitle = pageByPath[pathname];
    if (directTitle) {
      document.title = `Vinyl Vault | ${directTitle}`;
      return;
    }

    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (firstSegment) {
      const fallbackLabel =
        firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
      document.title = `Vinyl Vault | ${fallbackLabel}`;
      return;
    }

    document.title = "Vinyl Vault";
  }, [pathname, locale]);

  const hideTopNav = pathname === "/";
  const isAuthPage = pathname === "/";

  return (
    <div className={isAuthPage ? "auth-page" : "app-page"}>
      <ThemeInitializer />
      <div className="app-shell">
        {!hideTopNav && <TopNav />}
        <main className={`app-main ${!isAuthPage && "my-10"}`}>{children}</main>
        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
}
