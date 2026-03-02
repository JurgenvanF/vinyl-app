"use client";

import { Eye, Plus, Heart, Save } from "lucide-react";
import { t } from "../../../../../../lib/translations";
import type { SaveTarget } from "../customEntryTypes";

type ActionBarProps = {
  locale: "en" | "nl";
  mode: "create" | "edit";
  saveTarget: SaveTarget;
  setSaveTarget: (target: SaveTarget) => void;
  onOpenPreview: () => void;
  onSubmit: () => void;
  submitting: boolean;
  lockTarget?: boolean;
};

export default function ActionBar({
  locale,
  mode,
  saveTarget,
  setSaveTarget,
  onOpenPreview,
  onSubmit,
  submitting,
  lockTarget = false,
}: ActionBarProps) {
  const handleSave = (target: SaveTarget) => {
    if (!lockTarget) setSaveTarget(target);
    onSubmit();
  };

  return (
    <div className="buttons rounded-2xl p-4 custom-entry__panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Preview */}
      <button
        type="button"
        onClick={onOpenPreview}
        className="buttons__preview h-11 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 custom-entry__btn w-full sm:w-auto"
        title={t(locale, "preview")}
      >
        <Eye size={18} />
        {t(locale, "preview")}
      </button>

      {/* Save buttons */}
      {mode === "edit" ? (
        <div className="buttons flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSave(saveTarget)}
            disabled={submitting}
            className="buttons__collection h-11 px-5 rounded-xl cursor-pointer flex items-center justify-center gap-2 custom-entry__btn w-full sm:w-auto custom-entry__btn-primary"
          >
            <Save size={18} />
            {t(locale, "update")}
          </button>
        </div>
      ) : (
        <div className="buttons flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSave("collection")}
            disabled={submitting}
            className={`buttons__collection h-11 px-5 rounded-xl cursor-pointer flex items-center justify-center gap-2 custom-entry__btn w-full sm:w-auto ${
              saveTarget === "collection" ? "custom-entry__btn-primary" : ""
            }`}
          >
            <Plus size={18} />
            {t(locale, "saveToCollection")}
          </button>

          <button
            type="button"
            onClick={() => handleSave("wishlist")}
            disabled={submitting}
            className={`buttons__wishlist h-11 px-5 rounded-xl cursor-pointer flex items-center justify-center gap-2 custom-entry__btn w-full sm:w-auto ${
              saveTarget === "wishlist" ? "custom-entry__btn-primary" : ""
            }`}
          >
            <Heart size={18} />
            {t(locale, "saveToWishlist")}
          </button>
        </div>
      )}
    </div>
  );
}
