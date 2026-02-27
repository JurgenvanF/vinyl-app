const normalizeArtistName = (name: string) =>
  name.replace(/\s+/g, " ").replace(/\(\d+\)$/, "").trim();

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const cache = new Map<string, { artists: string[]; timestamp: number }>();
const inFlight = new Map<string, Promise<string[]>>();

const extractArtists = (payload: any): string[] => {
  if (!Array.isArray(payload?.artists)) return [];
  const names = payload.artists
    .map((artist: any) => normalizeArtistName(String(artist?.name ?? "")))
    .filter(Boolean);
  return Array.from(new Set(names));
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const masterId = searchParams.get("master_id");
  const token = process.env.DISCOGS_TOKEN;
  const cacheKey = `id:${id ?? ""}|master:${masterId ?? ""}`;

  if (!token) return Response.json({ artists: [] }, { status: 200 });
  if (!id && !masterId) return Response.json({ artists: [] }, { status: 200 });

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json({ artists: cached.artists }, { status: 200 });
  }

  if (inFlight.has(cacheKey)) {
    const artists = await inFlight.get(cacheKey)!;
    return Response.json({ artists }, { status: 200 });
  }

  const headers = { Authorization: `Discogs token=${token}` };
  const urls = [
    masterId ? `https://api.discogs.com/masters/${masterId}` : null,
    id ? `https://api.discogs.com/releases/${id}` : null,
  ].filter((value): value is string => Boolean(value));

  const fetchArtists = (async () => {
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) continue;
        const data = await res.json();
        const artists = extractArtists(data);
        if (artists.length > 0) return artists;
      } catch (error) {
        console.error(error);
      }
    }

    return [];
  })();

  inFlight.set(cacheKey, fetchArtists);
  const artists = await fetchArtists;
  inFlight.delete(cacheKey);

  cache.set(cacheKey, { artists, timestamp: Date.now() });
  return Response.json({ artists }, { status: 200 });
}
