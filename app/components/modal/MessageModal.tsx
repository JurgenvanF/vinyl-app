"use client";

import { createPortal } from "react-dom";
import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";

import "./MessageModal.scss";

type ColorOption = "blue" | "red" | "green";
type TextColorOption = "white" | "black";

type MessageModalProps = {
  open: boolean;
  title: string;
  message: string;
  background?: ColorOption;
  color?: TextColorOption;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function MessageModal({
  open,
  title,
  message,
  background = "blue",
  color = "white",
  onConfirm,
  onCancel,
}: MessageModalProps) {
  const { locale } = useLanguage();

  const bgColors: Record<ColorOption, string> = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    green: "bg-green-600",
  };

  const textColors: Record<TextColorOption, string> = {
    white: "text-white",
    black: "text-black",
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="message-modal p-6 rounded shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        {(onConfirm || onCancel) && (
          <div className="flex justify-end gap-2">
            {onCancel && (
              <button
                className="px-4 py-2 rounded border cursor-pointer"
                onClick={onCancel}
              >
                {t(locale, "cancel")}
              </button>
            )}
            {onConfirm && (
              <button
                className={`px-4 py-2 rounded cursor-pointer ${bgColors[background]} ${textColors[color]}`}
                onClick={onConfirm}
              >
                {t(locale, "confirm")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
