"use client";

import { useLanguage } from "../../../../../lib/LanguageContext";
import { t } from "../../../../../lib/translations";

import { Heart } from "lucide-react";

export default function WishlistButton() {
  const { locale } = useLanguage();
  return (
    <div className="buttons__wishlist w-full text-center border rounded px-2 py-1 cursor-pointer">
      <button className="flex items-center text-sm gap-2 transition-all duration-200 cursor-pointer">
        <Heart size={15} className="buttons__wishlist__icon" />
        {""}
        {t(locale, "addToWishlist")}
      </button>
    </div>
  );
}
