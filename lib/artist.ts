export type ArtistValue = string | { name?: string | null } | null | undefined;

const normalizeArtist = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\(\d+\)$/, "").trim();

export const getArtistsFromValues = (values: ArtistValue[]): string[] => {
  const artists = values
    .map((value) => {
      if (!value) return "";
      if (typeof value === "string") return normalizeArtist(value);
      return normalizeArtist(value.name ?? "");
    })
    .filter(Boolean);

  return Array.from(new Set(artists));
};

export const splitArtistsFromString = (artist?: string): string[] => {
  if (!artist?.trim()) return [];

  // Deliberately do not split on "and" to avoid false positives like "Simon And Garfunkel".
  const separators = /,|;/;
  if (!separators.test(artist)) return [normalizeArtist(artist)];

  return getArtistsFromValues(artist.split(separators));
};

export const deriveArtists = (
  artist?: string,
  artists?: ArtistValue[],
): string[] => {
  const fromArray = getArtistsFromValues(artists ?? []);
  if (fromArray.length > 0) return fromArray;
  return splitArtistsFromString(artist);
};

export const derivePrimaryArtist = (
  primaryArtist?: string,
  artists?: ArtistValue[],
  artist?: string,
): string => {
  if (primaryArtist?.trim()) return normalizeArtist(primaryArtist);

  const artistList = deriveArtists(artist, artists);
  if (artistList.length > 0) return artistList[0];

  return "Unknown artist";
};
