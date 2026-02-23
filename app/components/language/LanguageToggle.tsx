"use client";

import { useLanguage } from "../../../lib/LanguageContext";

export default function LanguageToggle() {
  const { locale } = useLanguage();

  const nlFlag = "\u{1F1F3}\u{1F1F1}";
  const gbFlag = "\u{1F1EC}\u{1F1E7}";

  return <span className="text-xl">{locale === "en" ? nlFlag : gbFlag}</span>;
}
