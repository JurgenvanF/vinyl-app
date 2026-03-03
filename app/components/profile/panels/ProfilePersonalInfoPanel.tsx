"use client";

import { ChangeEvent } from "react";
import type { UserProfileDocument } from "../profileTypes";
import {
  getProfileIconStyle,
  getProfileInitials,
  PROFILE_ICON_COLORS,
} from "../profileDisplay";

type ProfilePersonalInfoPanelProps = {
  profile: UserProfileDocument;
  draft: UserProfileDocument;
  editMode: boolean;
  onDraftChange: (next: UserProfileDocument) => void;
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
  profile,
  draft,
  editMode,
  onDraftChange,
  title,
  labels,
}: ProfilePersonalInfoPanelProps) {
  const updateField =
    (key: keyof UserProfileDocument) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onDraftChange({ ...draft, [key]: event.target.value });
    };

  const disabledClass = editMode ? "" : "profile__input--disabled";
  const initials = getProfileInitials(profile.firstName, profile.lastName);
  const selectedIconColor = draft.iconColor ?? profile.iconColor ?? "amber";

  return (
    <section className="profile__surface border rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <p className="profile__muted text-sm mt-1">
            {labels.name}: {profile.firstName} {profile.lastName}
          </p>
          <div
            className="mt-3 w-12 h-12 rounded-full border profile__surface__usericon flex items-center justify-center font-semibold text-sm"
            style={getProfileIconStyle(selectedIconColor)}
          >
            {initials}
          </div>
          {editMode && (
            <div className="mt-3">
              <div className="text-xs profile__muted mb-2">{labels.iconColor}</div>
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
                    onClick={() => onDraftChange({ ...draft, iconColor: color })}
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
            disabled={!editMode}
            inputMode="email"
          />
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
    </section>
  );
}
