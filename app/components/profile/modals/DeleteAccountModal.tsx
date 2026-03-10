"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, Loader2, Trash2, TriangleAlert } from "lucide-react";

import { useLanguage } from "../../../../lib/LanguageContext";
import { t } from "../../../../lib/translations";
import {
  acquireModalScrollLock,
  releaseModalScrollLock,
} from "../../../../lib/modalScrollLock";

import "./DeleteAccountModal.scss";
import "../../modal/MessageModal.scss";

type DeleteAccountModalProps = {
  open: boolean;
  email: string;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (password: string) => void | Promise<void>;
  onClearError?: () => void;
};

export default function DeleteAccountModal({
  open,
  email,
  loading = false,
  error,
  onCancel,
  onConfirm,
  onClearError,
}: DeleteAccountModalProps) {
  const { locale } = useLanguage();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputLocked, setInputLocked] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const unlockSoon = () => {
    window.setTimeout(() => setInputLocked(false), 0);
  };

  useEffect(() => {
    if (!open) return;
    acquireModalScrollLock();
    return () => releaseModalScrollLock();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="delete-account-modal-overlay fixed inset-0 flex items-center justify-center z-50"
      onClick={() => {
        if (loading) return;
        onCancel();
      }}
    >
      <div
        className="delete-account-modal p-6 m-4 rounded-xl shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="delete-account-modal__icon w-9 h-9 rounded-full flex items-center justify-center shrink-0">
            <Trash2 size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {t(locale, "deleteAccount")}
            </h2>
            <p className="text-sm mt-1 delete-account-modal__muted">
              {t(locale, "deleteAccountWarning")}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm delete-account-modal__muted">
            {t(locale, "deleteAccountConfirmPassword", email)}
          </p>
          <div className="relative mt-2">
            <input
              ref={inputRef}
              className="profile__input border rounded-lg px-3 py-2 w-full"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              name="delete-account-password"
              data-lpignore="true"
              data-1p-ignore="true"
              readOnly={inputLocked}
              onFocus={() => {
                // Delay unlocking to avoid triggering password manager suggestions on focus.
                unlockSoon();
              }}
              onMouseDown={() => {
                // Re-lock on every click so subsequent clicks don't trigger suggestions.
                setInputLocked(true);
                unlockSoon();
              }}
              onPointerDown={() => {
                setInputLocked(true);
                unlockSoon();
              }}
              onBlur={() => setInputLocked(true)}
              value={password}
              onChange={(e) => {
                if (error) onClearError?.();
                setPassword(e.target.value);
              }}
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-500 hover:text-gray-800 transition"
                disabled={loading}
                aria-label={t(locale, "password")}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm delete-account-modal__error flex items-start gap-2">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded border cursor-pointer message-modal__button message-modal__button--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {t(locale, "cancel")}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded cursor-pointer message-modal__button message-modal__button--danger message-modal__button--text-light flex items-center justify-center gap-2"
            onClick={() => onConfirm(password)}
            disabled={loading || password.trim().length === 0}
            aria-busy={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t(locale, "deleteAccount")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
