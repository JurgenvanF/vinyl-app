"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { Plus } from "lucide-react";

export default function CollectionButton() {
  const { locale } = useLanguage();
  return (
    <div className="buttons__collection w-full text-center border rounded px-2 py-1 cursor-pointer">
      <button className="flex items-center text-sm gap-2 transition-all duration-200 cursor-pointer">
        <Plus size={15} /> {t(locale, "addToCollection")}
      </button>
    </div>
  );
}
