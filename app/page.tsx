"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
import LanguageToggle from "./components/language/LanguageToggle";

export default function Home() {
  const router = useRouter();
  const { locale } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col items-center justify-center gap-6 bg-white dark:bg-black p-12 rounded-lg shadow-md">
        <LanguageToggle />

        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          {t(locale, "welcome")}
        </h1>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
          >
            {t(locale, "login")}
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 rounded-full border border-black text-black hover:bg-zinc-200 transition-colors dark:border-white dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            {t(locale, "register")}
          </button>
        </div>
      </main>
    </div>
  );
}
