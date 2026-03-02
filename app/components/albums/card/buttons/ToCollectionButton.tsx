"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { ArrowRight } from "lucide-react";

type ToCollectionButtonProps = {
  onClick?: () => void;
  variant?: "card" | "modal";
};

export default function ToCollectionButton({
  onClick,
  variant = "card",
}: ToCollectionButtonProps) {
  const { locale } = useLanguage();

  if (variant === "modal") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="album-details-modal-action-btn--toCollection"
      >
        <ArrowRight size={15} /> {t(locale, "toCollection")}
      </button>
    );
  }

  return (
    <div className="buttons__details w-full text-center border rounded cursor-pointer">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center text-sm gap-2 px-2 py-1 w-full transition-all duration-200 cursor-pointer"
      >
        <ArrowRight size={15} /> {t(locale, "toCollection")}
      </button>
    </div>
  );
}
