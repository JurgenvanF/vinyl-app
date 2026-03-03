"use client";

import { User, Lock, Users } from "lucide-react";

export type ProfileTabKey = "profile" | "privacy" | "friends";

type ProfileTabsProps = {
  active: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
  labels: Record<ProfileTabKey, string>;
  badges?: Partial<Record<ProfileTabKey, number>>;
};

export default function ProfileTabs({
  active,
  onChange,
  labels,
  badges,
}: ProfileTabsProps) {
  const tabs: ProfileTabKey[] = ["profile", "privacy", "friends"];

  const icons: Record<ProfileTabKey, React.ElementType> = {
    profile: User,
    privacy: Lock,
    friends: Users,
  };

  return (
    <div className="flex mb-6">
      <div className="profile__tabs inline-flex gap-4 p-1 rounded-full">
        {tabs.map((tab) => {
          const Icon = icons[tab];

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`profile__tab ${
                active === tab ? "profile__tab--active" : ""
              } px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer`}
            >
              <Icon className="w-4 h-4" />

              <span className="hidden sm:inline">{labels[tab]}</span>

              {typeof badges?.[tab] === "number" &&
                (badges?.[tab] ?? 0) > 0 && (
                  <span className="profile__badge">{badges?.[tab]}</span>
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
