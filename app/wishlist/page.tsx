"use client";

import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";

export default function WishlistPage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-full flex items-center justify-center">
      <h1 className="text-2xl font-semibold">{t(locale, "wishlist")}</h1>
    </div>
  );
}
