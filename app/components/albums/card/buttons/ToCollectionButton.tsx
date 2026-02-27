"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { ArrowRight } from "lucide-react";

type ToCollectionButtonProps = {
  onClick?: () => void;
};

export default function ToCollectionButton({ onClick }: ToCollectionButtonProps) {
  const { locale } = useLanguage();
  return (
    <div className="buttons__details w-full text-center border rounded cursor-pointer">
      <button
        onClick={onClick}
        className="flex items-center text-sm gap-2 px-2 py-1 w-full transition-all duration-200 cursor-pointer"
      >
        <ArrowRight size={15} /> {t(locale, "toCollection")}
      </button>
    </div>
  );
}
