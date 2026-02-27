type DiscogsArtistsParams = {
  id?: number | null;
  masterId?: number | null;
};

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, { artists: string[]; timestamp: number }>();
const inFlight = new Map<string, Promise<string[]>>();

export const fetchDiscogsArtists = async ({
  id,
  masterId,
}: DiscogsArtistsParams): Promise<string[]> => {
  if (!id && !masterId) return [];
  const cacheKey = `id:${id ?? ""}|master:${masterId ?? ""}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.artists;
  }

  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey)!;
  }

  const params = new URLSearchParams();
  if (id) params.set("id", String(id));
  if (masterId) params.set("master_id", String(masterId));

  const request = (async () => {
    try {
      const res = await fetch(`/api/discogs-artists?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data?.artists)) return [];
      const artists = data.artists.filter(
        (value: unknown): value is string => typeof value === "string",
      );
      cache.set(cacheKey, { artists, timestamp: Date.now() });
      return artists;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, request);
  return request;
};
