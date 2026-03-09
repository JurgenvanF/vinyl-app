"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  EmailAuthProvider,
  type User,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { LogIn, TriangleAlert } from "lucide-react";
import type { UserProfileDocument } from "../profileTypes";
import {
  getProfileIconStyle,
  getProfileInitials,
  PROFILE_ICON_COLORS,
} from "../profileDisplay";
import { t } from "../../../../lib/translations";
import { devError } from "../../../../lib/devLog";
import { auth } from "../../../../lib/firebase";

type Locale = Parameters<typeof t>[0];

type ProfilePersonalInfoPanelProps = {
  locale: Locale;
  user: User;
  profile: UserProfileDocument;
  draft: UserProfileDocument;
  editMode: boolean;
  onDraftChange: (next: UserProfileDocument) => void;
  emailError?: string | null;
  title: string;
  labels: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    biography: string;
    iconColor: string;
  };
};

export default function ProfilePersonalInfoPanel({
  locale,
  user,
  profile,
  draft,
  editMode,
  onDraftChange,
  emailError,
  title,
  labels,
}: ProfilePersonalInfoPanelProps) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verified, setVerified] = useState(user.emailVerified);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    setVerified(user.emailVerified);
  }, [user.emailVerified]);

  const showToast = (
    message: string,
    icon: typeof LogIn,
    bgColor: string,
    textColor: string,
    iconBgColor: string,
    iconBorderColor: string,
  ) => {
    if (typeof window === "undefined") return;
    const toastWindow = window as Window & {
      addToast?: (toast: {
        message: string;
        icon: typeof LogIn;
        bgColor: string;
        textColor: string;
        iconBgColor: string;
        iconBorderColor: string;
      }) => void;
    };

    toastWindow.addToast?.({
      message,
      icon,
      bgColor,
      textColor,
      iconBgColor,
      iconBorderColor,
    });
  };

  const handleSendVerification = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setVerificationLoading(true);
    try {
      auth.languageCode = locale === "nl" ? "nl" : "en";
      await sendEmailVerification(currentUser);
      showToast(
        t(locale, "verificationEmailSent"),
        LogIn,
        "bg-green-100",
        "text-green-900",
        "bg-green-200",
        "border-green-400",
      );
    } catch (error: unknown) {
      devError(error);
      showToast(
        t(locale, "verificationEmailFailed"),
        TriangleAlert,
        "bg-red-100",
        "text-red-900",
        "bg-red-200",
        "border-red-400",
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleReloadVerification = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setVerificationLoading(true);
    try {
      await currentUser.reload();
      setVerified(currentUser.emailVerified);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent) => {
    event.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (passwordLoading) return;

    if (!currentPassword.trim() || !newPassword.trim()) {
      showToast(
        t(locale, "required"),
        TriangleAlert,
        "bg-red-100",
        "text-red-900",
        "bg-red-200",
        "border-red-400",
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast(
        t(locale, "passwordsDoNotMatch"),
        TriangleAlert,
        "bg-red-100",
        "text-red-900",
        "bg-red-200",
        "border-red-400",
      );
      return;
    }

    if (newPassword.length < 8) {
      showToast(
        t(locale, "passwordTooShort"),
        TriangleAlert,
        "bg-red-100",
        "text-red-900",
        "bg-red-200",
        "border-red-400",
      );
      return;
    }

    const userEmail = currentUser.email ?? "";
    if (!userEmail) {
      showToast(
        t(locale, "passwordUpdateFailed"),
        TriangleAlert,
        "bg-red-100",
        "text-red-900",
        "bg-red-200",
        "border-red-400",
      );
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        userEmail,
        currentPassword,
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      showToast(
        t(locale, "passwordUpdated"),
        LogIn,
        "bg-green-100",
        "text-green-900",
        "bg-green-200",
        "border-green-400",
      );
    } catch (error: unknown) {
      devError(error);
      showToast(
        t(locale, "passwordUpdateFailed"),
        TriangleAlert,
        "bg-red-100",
        "text-red-900",
        "bg-red-200",
        "border-red-400",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateField =
    (key: keyof UserProfileDocument) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onDraftChange({ ...draft, [key]: event.target.value });
    };

  const disabledClass = editMode ? "" : "profile__input--disabled";
  const initials = getProfileInitials(profile.firstName, profile.lastName);
  const selectedIconColor = draft.iconColor ?? profile.iconColor ?? "amber";

  const trimmedEmail = (draft.email ?? "").trim();
  const isLikelyValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailFormatError =
    editMode && emailTouched && !isLikelyValidEmail(trimmedEmail)
      ? t(locale, "invalidEmail")
      : null;

  const effectiveEmailError = emailError ?? emailFormatError;
  const showVerification = !verified;
  const showPasswordUpdate = editMode;
  const showAccountSecurity = showVerification || showPasswordUpdate;

  return (
    <section className="profile__surface border rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <p className="profile__muted text-sm mt-1">
            {labels.name}: {profile.firstName} {profile.lastName}
          </p>
          <div
            className="mt-5 w-12 h-12 rounded-full border profile__surface__usericon flex items-center justify-center font-semibold text-sm"
            style={getProfileIconStyle(selectedIconColor)}
          >
            {initials}
          </div>
          {editMode && (
            <div className="mt-3">
              <div className="text-xs profile__muted mb-2">
                {labels.iconColor}
              </div>
              <div className="flex flex-wrap gap-2">
                {PROFILE_ICON_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                      selectedIconColor === color
                        ? "ring-2 ring-offset-1 ring-orange-400"
                        : ""
                    }`}
                    style={getProfileIconStyle(color)}
                    onClick={() =>
                      onDraftChange({ ...draft, iconColor: color })
                    }
                    aria-label={`${labels.iconColor}: ${color}`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{labels.firstName}</label>
          <input
            className={`profile__input ${disabledClass} border rounded-lg px-3 py-2`}
            value={draft.firstName}
            onChange={updateField("firstName")}
            disabled={!editMode}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{labels.lastName}</label>
          <input
            className={`profile__input ${disabledClass} border rounded-lg px-3 py-2`}
            value={draft.lastName}
            onChange={updateField("lastName")}
            disabled={!editMode}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">{labels.email}</label>
          <input
            className={`profile__input ${disabledClass} border rounded-lg px-3 py-2`}
            value={draft.email}
            onChange={updateField("email")}
            onBlur={() => setEmailTouched(true)}
            disabled={!editMode}
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            aria-invalid={Boolean(effectiveEmailError)}
          />
          {effectiveEmailError && (
            <p className="text-sm mt-1 profile__error">{effectiveEmailError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">{labels.biography}</label>
          <textarea
            className={`profile__input ${disabledClass} border rounded-lg px-3 py-2 min-h-[100px]`}
            value={draft.bio ?? ""}
            onChange={updateField("bio")}
            disabled={!editMode}
          />
        </div>
      </div>

      {showAccountSecurity && (
        <div className="mt-6 pt-5 border-t">
          <h3 className="text-sm font-semibold">
            {t(locale, "accountSecurity")}
          </h3>

          <div className="mt-3 flex flex-col gap-4">
            {showVerification && (
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <p className="text-sm profile__muted">
                  {t(locale, "emailNotVerified")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between md:justify-center w-full md:w-100 gap-2">
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verificationLoading}
                    className="profile__btn--primary border rounded-lg px-3 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t(locale, "sendVerificationEmail")}
                  </button>
                  <button
                    type="button"
                    onClick={handleReloadVerification}
                    disabled={verificationLoading}
                    className="profile__btn--secondary border rounded-lg px-3 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t(locale, "reloadVerificationStatus")}
                  </button>
                </div>
              </div>
            )}

            {showPasswordUpdate && (
              <form onSubmit={handlePasswordUpdate} className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {t(locale, "currentPassword")}
                    </label>
                    <input
                      className="profile__input border rounded-lg px-3 py-2"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {t(locale, "newPassword")}
                    </label>
                    <input
                      className="profile__input border rounded-lg px-3 py-2"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                      minLength={8}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {t(locale, "confirmNewPassword")}
                    </label>
                    <input
                      className="profile__input border rounded-lg px-3 py-2"
                      type="password"
                      autoComplete="new-password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={passwordLoading}
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="profile__btn--primary border rounded-lg px-4 py-2 w-full md:w-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {passwordLoading
                      ? t(locale, "saving")
                      : t(locale, "updatePassword")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
