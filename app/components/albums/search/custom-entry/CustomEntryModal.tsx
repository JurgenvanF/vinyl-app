"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import CustomEntry from "./CustomEntry";
import type { SaveTarget } from "./customEntryTypes";

type CustomEntryModalProps = {
  open: boolean;
  mode: "create" | "edit";
  existingId?: number;
  existingTarget?: SaveTarget;
  onClose: () => void;
};

export default function CustomEntryModal({
  open,
  mode,
  existingId,
  existingTarget,
  onClose,
}: CustomEntryModalProps) {
  useEffect(() => {
    document.body.classList.toggle("custom-entry-modal-open", open);
    return () => {
      document.body.classList.remove("custom-entry-modal-open");
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="custom-entry__overlay fixed inset-0 z-50 p-4 flex items-center justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="custom-entry__panel relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-4"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 h-10 w-10 rounded cursor-pointer flex items-center justify-center custom-entry__btn"
          onClick={onClose}
          title="Close"
        >
          <X size={18} />
        </button>
        <div className="pt-10">
          <CustomEntry
            mode={mode}
            existingId={existingId}
            existingTarget={existingTarget}
            onDone={onClose}
          />
        </div>
      </div>
    </div>
  );
}
