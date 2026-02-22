"use client";

import { useLanguage } from "../../../lib/LanguageContext";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="toggle px-3 py-1 rounded-xl border transition-colors cursor-pointer"
    >
      {locale === "en" ? "🇳🇱" : "🇬🇧"}
    </button>
  );
}
