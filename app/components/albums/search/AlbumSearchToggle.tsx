"use client";

import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";
import { Search, Barcode, Pencil } from "lucide-react";

export type SearchMode = "search" | "barcode" | "custom";

type AlbumSearchToggleProps = {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
};

export default function AlbumSearchToggle({
  mode,
  setMode,
}: AlbumSearchToggleProps) {
  const { locale } = useLanguage();

  return (
    <div className="flex justify-center mb-6">
      <div className="search-toggle inline-flex gap-4 p-1 rounded-full">
        {/* Search Button */}
        <button
          onClick={() => setMode("search")}
          className={`search-toggle__button ${
            mode === "search" ? "search-toggle__button--active" : ""
          } px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer`}
        >
          <Search className="w-5 h-5 block sm:hidden" />
          <span className="hidden sm:inline">
            {t(locale, "searchDatabase")}
          </span>
        </button>

        {/* Barcode Button */}
        <button
          onClick={() => setMode("barcode")}
          className={`search-toggle__button ${
            mode === "barcode" ? "search-toggle__button--active" : ""
          } px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer`}
        >
          <Barcode className="w-5 h-5 block sm:hidden" />
          <span className="hidden sm:inline">{t(locale, "scanBarcode")}</span>
        </button>

        {/* Custom Entry Button */}
        <button
          onClick={() => setMode("custom")}
          className={`search-toggle__button ${
            mode === "custom" ? "search-toggle__button--active" : ""
          } px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer`}
        >
          <Pencil className="w-5 h-5 block sm:hidden" />
          <span className="hidden sm:inline">{t(locale, "customEntry")}</span>
        </button>
      </div>
    </div>
  );
}
