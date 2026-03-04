"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Disc3 } from "lucide-react";
import { devError } from "../lib/devLog";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { locale } = useLanguage();

  useEffect(() => {
    const title = "Vinyl Vault | 500";
    document.body.dataset.forceTitle = title;
    document.title = title;
    return () => {
      delete document.body.dataset.forceTitle;
    };
  }, []);

  useEffect(() => {
    devError("Unhandled app error", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="relative w-full max-w-xl rounded-2xl border bg-background/60 p-10 text-center shadow-sm backdrop-blur">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-black text-white shadow-md">
            <Disc3 className="not-found__icon h-10 w-10" />
          </div>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
          {t(locale, "errorBadge")}
        </p>

        <h1 className="mt-3 text-3xl font-bold">{t(locale, "errorTitle")}</h1>

        <p className="mt-4 text-sm opacity-80">{t(locale, "errorDescription")}</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="not-found__btn w-full sm:w-auto rounded-lg px-5 py-2 text-sm font-medium transition cursor-pointer"
          >
            {t(locale, "errorRetry")}
          </button>

          <Link
            href="/collection"
            className="w-full sm:w-auto rounded-lg border px-5 py-2 text-sm font-medium transition hover:bg-orange-500/10"
          >
            {t(locale, "errorBackHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
