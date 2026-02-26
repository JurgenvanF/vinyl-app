"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { Trash } from "lucide-react";

export default function RemoveCollectionButton() {
  const { locale } = useLanguage();
  return (
    <div className="buttons__remove w-full text-center border rounded px-2 py-1 cursor-pointer">
      <button className="buttons__remove__collection flex items-center text-sm gap-2 transition-all duration-200 cursor-pointer">
        <Trash size={15} /> {t(locale, "remove")}
      </button>
    </div>
  );
}
