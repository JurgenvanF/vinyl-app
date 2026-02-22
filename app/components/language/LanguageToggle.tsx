"use client";

import { useLanguage } from "../../../lib/LanguageContext";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
    >
      {locale === "en" ? "NL" : "EN"}
    </button>
  );
}
