"use client";

import Link from "next/link";
import { Disc3 } from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";

export default function NotFound() {
  const { locale } = useLanguage();

  useEffect(() => {
    const title = "Vinyl Vault | 404";
    document.body.dataset.forceTitle = title;
    document.title = title;
    return () => {
      delete document.body.dataset.forceTitle;
    };
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="relative w-full max-w-xl rounded-2xl border bg-background/60 p-10 text-center shadow-sm backdrop-blur">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-black text-white shadow-md">
            <Disc3 className="not-found__icon h-10 w-10" />
          </div>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
          {t(locale, "notFoundBadge")}
        </p>

        <h1 className="mt-3 text-3xl font-bold">{t(locale, "notFoundTitle")}</h1>

        <p className="mt-4 text-sm opacity-80">
          {t(locale, "notFoundDescription")}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/collection"
            className="not-found__btn w-full sm:w-auto rounded-lg px-5 py-2 text-sm font-medium transition"
          >
            {t(locale, "notFoundAction")}
          </Link>
        </div>
      </div>
    </div>
  );
}
