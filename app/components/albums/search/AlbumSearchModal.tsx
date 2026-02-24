"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";
import AlbumSearchToggle, { SearchMode } from "./AlbumSearchToggle";
import SearchModal from "./searchbar/SearchModal";
import Barcode from "./barcode/Barcode";
import CustomEntry from "./custom-entry/CustomEntry";

import { X } from "lucide-react";

import "./AlbumSearchModal.scss";

type AlbumSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AlbumSearchModal({
  open,
  onClose,
}: AlbumSearchModalProps) {
  const { locale } = useLanguage();
  const [mode, setMode] = useState<SearchMode>("search");

  useEffect(() => {
    document.body.classList.toggle("album-search-modal-open", open);

    return () => {
      document.body.classList.remove("album-search-modal-open");
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="search-container rounded-lg p-4 m-4 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 gap-6">
          <h2 className="text-xl font-semibold">
            {t(locale, "addToCollectionTitle")}
          </h2>
          <button onClick={onClose} className="font-bold">
            <X className="cursor-pointer" />
          </button>
        </div>

        <AlbumSearchToggle mode={mode} setMode={setMode} />

        {mode === "search" && <SearchModal />}
        {mode === "barcode" && <Barcode />}
        {mode === "custom" && <CustomEntry />}
      </div>
    </div>
  );
}
