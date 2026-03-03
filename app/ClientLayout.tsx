"use client";

import { useEffect } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
import TopNav from "./components/topnav/TopNav";
import ThemeInitializer from "./components/theme/ThemeInitializer";
import Footer from "./components/footer/Footer";
import { usePathname } from "next/navigation";

const getClientTitle = (path: string, locale: "en" | "nl"): string => {
  if (path === "/") return "Vinyl Vault";

  const pageByPath: Record<string, string> = {
    "/collection": t(locale, "myCollection"),
    "/wishlist": t(locale, "wishlist"),
    "/profile": t(locale, "profile"),
  };
  const directTitle = pageByPath[path];
  if (directTitle) return `Vinyl Vault | ${directTitle}`;

  const firstSegment = path.split("/").filter(Boolean)[0];
  if (!firstSegment) return "Vinyl Vault";

  const fallbackLabel =
    firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
  return `Vinyl Vault | ${fallbackLabel}`;
};

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
    const applyTitle = () => {
      const rawPath = (window.location.pathname || "/").trim();
      const normalizedPath =
        rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
      const nextTitle = getClientTitle(normalizedPath, locale);
      if (document.title !== nextTitle) {
        document.title = nextTitle;
      }
    };

    applyTitle();
    const frameId = window.requestAnimationFrame(applyTitle);
    const timeout0 = window.setTimeout(applyTitle, 0);
    const timeout100 = window.setTimeout(applyTitle, 100);
    const timeout300 = window.setTimeout(applyTitle, 300);

    const titleEl = document.querySelector("title");
    const observer = titleEl
      ? new MutationObserver(() => {
          applyTitle();
        })
      : null;
    if (titleEl && observer) {
      observer.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    window.addEventListener("pageshow", applyTitle);
    window.addEventListener("popstate", applyTitle);
    document.addEventListener("visibilitychange", applyTitle);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeout0);
      window.clearTimeout(timeout100);
      window.clearTimeout(timeout300);
      observer?.disconnect();
      window.removeEventListener("pageshow", applyTitle);
      window.removeEventListener("popstate", applyTitle);
      document.removeEventListener("visibilitychange", applyTitle);
    };
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
