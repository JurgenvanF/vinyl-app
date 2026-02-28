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

  const confirmToneClass: Record<ColorOption, string> = {
    blue: "message-modal__button--primary",
    red: "message-modal__button--danger",
    green: "message-modal__button--success",
  };

  const confirmTextClass: Record<TextColorOption, string> = {
    white: "message-modal__button--text-light",
    black: "message-modal__button--text-dark",
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="message-modal-overlay fixed inset-0 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="message-modal p-6 m-4 rounded-xl shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4 message-modal__message">{message}</p>
        {(onConfirm || onCancel) && (
          <div className="flex justify-end gap-2 message-modal__actions">
            {onCancel && (
              <button
                className="px-4 py-2 rounded border cursor-pointer message-modal__button message-modal__button--cancel"
                onClick={onCancel}
              >
                {t(locale, "cancel")}
              </button>
            )}
            {onConfirm && (
              <button
                className={`px-4 py-2 rounded cursor-pointer message-modal__button ${confirmToneClass[background]} ${confirmTextClass[color]}`}
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
