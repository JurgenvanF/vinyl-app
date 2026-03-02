"use client";

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

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`profile__tab ${active === tab ? "profile__tab--active" : ""} border px-4 py-2 rounded-lg transition-colors`}
        >
          <span className="inline-flex items-center gap-2">
            {labels[tab]}
            {typeof badges?.[tab] === "number" && (badges?.[tab] ?? 0) > 0 && (
              <span className="profile__badge">{badges?.[tab]}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
