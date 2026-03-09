"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
import TopNav from "./components/topnav/TopNav";
import ThemeInitializer from "./components/theme/ThemeInitializer";
import Footer from "./components/footer/Footer";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { type User, sendEmailVerification, signOut } from "firebase/auth";

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
  const router = useRouter();
  const { locale } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((next) => {
      setCurrentUser(next);
      setIsEmailVerified(next?.emailVerified ?? true);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const applyTitle = () => {
      const forcedTitle = document.body.dataset.forceTitle;
      if (forcedTitle) {
        if (document.title !== forcedTitle) {
          document.title = forcedTitle;
        }
        return;
      }

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
  const needsVerification =
    !isAuthPage && !authLoading && Boolean(currentUser) && !isEmailVerified;

  useEffect(() => {
    if (!needsVerification) return;

    setVerificationSent(false);

    let cancelled = false;
    const poll = async () => {
      const u = auth.currentUser;
      if (!u) return;
      await u.reload();
      if (cancelled) return;
      setIsEmailVerified(auth.currentUser?.emailVerified ?? true);
      if (u.emailVerified) {
        router.replace(pathname && pathname !== "/" ? pathname : "/collection");
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [needsVerification, pathname, router]);

  const handleResendVerification = async () => {
    const u = auth.currentUser;
    if (!u) return;

    setVerificationSending(true);
    try {
      auth.languageCode = locale === "nl" ? "nl" : "en";
      await sendEmailVerification(u);
      setVerificationSent(true);
    } finally {
      setVerificationSending(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  return (
    <div className={isAuthPage ? "auth-page" : "app-page"}>
      <ThemeInitializer />
      <div className="app-shell">
        {!hideTopNav && !needsVerification && <TopNav />}
        <main className={`app-main ${!isAuthPage && "my-10"}`}>
          {needsVerification ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="profile__surface border rounded-xl p-6 max-w-lg w-full">
                <h1 className="text-xl font-semibold">
                  {t(locale, "verifyAccountTitle")}
                </h1>
                <p className="profile__muted mt-2">
                  {t(locale, "verifyAccountMessage")}
                </p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={verificationSending}
                    className="profile__btn--primary border rounded-lg px-4 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t(locale, "sendVerificationEmailAgain")}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="profile__btn--secondary border rounded-lg px-4 py-2 cursor-pointer"
                  >
                    {t(locale, "logout")}
                  </button>
                </div>
                {verificationSent && (
                  <p className="text-sm profile__muted mt-3">
                    {t(locale, "verificationEmailSent")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
        {!isAuthPage && !needsVerification && <Footer />}
      </div>
    </div>
  );
}
