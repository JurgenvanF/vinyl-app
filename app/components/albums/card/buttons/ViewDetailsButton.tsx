"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { Eye } from "lucide-react";

export default function ViewDetailsButton() {
  const { locale } = useLanguage();
  return (
    <div className="buttons__details w-full text-center border rounded px-2 py-1 cursor-pointer">
      <button className="flex items-center text-sm gap-2 transition-all duration-200 cursor-pointer">
        <Eye size={15} /> {t(locale, "viewDetails")}
      </button>
    </div>
  );
}
