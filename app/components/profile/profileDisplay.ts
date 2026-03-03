import type { ProfileIconColor } from "./profileTypes";

const NAME_CONNECTORS = new Set([
  // Dutch
  "van",
  "de",
  "der",
  "den",
  "te",
  "ter",
  "ten",
  "vander",
  "vanden",
  "vanderde",
  // English
  "of",
  "and",
  "the",
  "for",
  "from",
  // French
  "la",
  "le",
  "du",
  "des",
  "d'",
  // Italian
  "di",
  "del",
  "della",
  "delle",
  "degli",
  // Spanish/Portuguese
  "y",
  "da",
  "das",
  "do",
  "dos",
  // German
  "von",
  "zu",
  "vom",
  "zur",
  // Misc/Other
  "mc",
  "mac",
]);

export const PROFILE_ICON_COLORS: ProfileIconColor[] = [
  "amber",
  "red",
  "green",
  "blue",
  "pink",
  "purple",
  "teal",
  "indigo",
  "lime",
  "rose",
  "cyan",
];

export function isProfileIconColor(value: unknown): value is ProfileIconColor {
  return (
    typeof value === "string" &&
    PROFILE_ICON_COLORS.includes(value as ProfileIconColor)
  );
}

export function normalizeProfileIconColor(value: unknown): ProfileIconColor {
  return isProfileIconColor(value) ? value : "amber";
}

export function getProfileIconStyle(iconColor: ProfileIconColor = "amber") {
  const color = normalizeProfileIconColor(iconColor);
  return {
    backgroundColor: `var(--profile-user-icon-bg-${color})`,
    borderColor: `var(--profile-user-icon-border-${color})`,
    color: `var(--profile-user-icon-text-${color})`,
  };
}

export function getProfileInitials(
  firstName?: string,
  lastName?: string,
  fallback = "?",
) {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (!fullName) return fallback;

  const tokens = fullName
    .split(/\s+/)
    .map((token) => token.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);
  if (tokens.length === 0) return fallback;

  const significant = tokens.filter(
    (token) => !NAME_CONNECTORS.has(token.toLowerCase()),
  );
  const source = significant.length > 0 ? significant : tokens;

  if (source.length === 1) return source[0].charAt(0).toUpperCase();
  return `${source[0].charAt(0)}${source[source.length - 1].charAt(0)}`.toUpperCase();
}

export function isVariousArtistName(name: string) {
  const normalized = name.trim().toLowerCase();
  return normalized === "various" || normalized === "various artists";
}
