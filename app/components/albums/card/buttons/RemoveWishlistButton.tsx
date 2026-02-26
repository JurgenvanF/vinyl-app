"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { Heart, HeartOff } from "lucide-react";

export default function RemoveWishlistButton() {
  const { locale } = useLanguage();
  return (
    <div className="buttons__remove w-full text-center border rounded px-2 py-1 cursor-pointer">
      <button className="buttons__remove__wishlist flex items-center text-sm gap-2 transition-all duration-200 cursor-pointer">
        <HeartOff size={15} /> {t(locale, "remove")}
      </button>
    </div>
  );
}
