"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { t } from "../../../../lib/translations";
import DropDown, { type DropDownOption } from "../../albums/search/searchbar/dropdown/DropDown";
import type {
  ProfilePrivacyLevel,
  ProfilePrivacySettings,
  UserProfileDocument,
} from "../profileTypes";

const defaultPrivacy: ProfilePrivacySettings = {
  profile: "everyone",
  collection: "friends",
  wishlist: "friends",
};

type ProfilePrivacyPanelProps = {
  user: User;
  profile: UserProfileDocument;
  locale: "en" | "nl";
};

export default function ProfilePrivacyPanel({
  user,
  profile,
  locale,
}: ProfilePrivacyPanelProps) {
  const merged = useMemo(() => {
    return {
      ...defaultPrivacy,
      ...(profile.privacy ?? {}),
    } as ProfilePrivacySettings;
  }, [profile.privacy]);

  const [local, setLocal] = useState<ProfilePrivacySettings>(merged);
  const [savingKey, setSavingKey] = useState<null | keyof ProfilePrivacySettings>(
    null,
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLocal(merged);
  }, [merged]);

  const options: DropDownOption[] = [
    { value: "everyone", label: t(locale, "visibilityEveryone") },
    { value: "friends", label: t(locale, "visibilityFriends") },
    { value: "me", label: t(locale, "visibilityHidden") },
  ];

  const rank: Record<ProfilePrivacyLevel, number> = {
    me: 1,
    friends: 2,
    everyone: 3,
  };

  const setPrivacy = async (
    key: keyof ProfilePrivacySettings,
    value: ProfilePrivacyLevel,
  ) => {
    const previous = local;
    let next: ProfilePrivacySettings = { ...local, [key]: value };

    // Constraint:
    // profile visibility must be >= (as public as) collection/wishlist visibility.
    if (key === "profile") {
      if (rank[next.collection] > rank[next.profile]) next.collection = next.profile;
      if (rank[next.wishlist] > rank[next.profile]) next.wishlist = next.profile;
    } else {
      if (rank[next[key]] > rank[next.profile]) next.profile = next[key];
    }

    setLocal(next);
    setSavingKey(key);
    setError("");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        "privacy.profile": next.profile,
        "privacy.collection": next.collection,
        "privacy.wishlist": next.wishlist,
      });
    } catch {
      setLocal(previous);
      setError(t(locale, "saveFailed"));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="profile__surface border rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">
            {t(locale, "privacySettings")}
          </h2>
          <p className="profile__muted text-sm mt-1">{t(locale, "privacyHint")}</p>
        </div>
        {savingKey && (
          <span className="profile__muted text-sm">
            {t(locale, "saving")}…
          </span>
        )}
      </div>

      {error && <p className="text-sm mt-3 profile__error">{error}</p>}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t(locale, "profileVisibility")}
          </label>
          <DropDown
            options={options}
            value={local.profile}
            onChange={(value) =>
              setPrivacy("profile", value as ProfilePrivacyLevel)
            }
            align="left"
            collapseBreakpoint={0}
            wrapperClassName="h-auto"
            triggerClassName="h-auto"
          />
          <p className="profile__muted text-xs">
            {local.profile === "everyone" && t(locale, "profileVisibilityHintEveryone")}
            {local.profile === "friends" && t(locale, "profileVisibilityHintFriends")}
            {local.profile === "me" && t(locale, "profileVisibilityHintMe")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t(locale, "collectionVisibility")}
          </label>
          <DropDown
            options={options}
            value={local.collection}
            onChange={(value) =>
              setPrivacy("collection", value as ProfilePrivacyLevel)
            }
            align="left"
            collapseBreakpoint={0}
            wrapperClassName="h-auto"
            triggerClassName="h-auto"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t(locale, "wishlistVisibility")}
          </label>
          <DropDown
            options={options}
            value={local.wishlist}
            onChange={(value) =>
              setPrivacy("wishlist", value as ProfilePrivacyLevel)
            }
            align="left"
            collapseBreakpoint={0}
            wrapperClassName="h-auto"
            triggerClassName="h-auto"
          />
        </div>
      </div>
    </section>
  );
}
