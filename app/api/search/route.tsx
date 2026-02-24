// ---------- In-memory cache ----------
const cache = new Map<string, { results: any[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const FETCH_BUFFER = 300; // ms delay before fetching

let lastTimeout: NodeJS.Timeout | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qRaw = (searchParams.get("q") ?? "").trim();
  const token = process.env.DISCOGS_TOKEN;

  if (!qRaw) return Response.json({ results: [], total: 0 });

  // ---------- Helpers ----------
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/\b(en|and)\b/g, "&")
      .replace(/[^a-z0-9&]+/g, "")
      .trim();

  const q = normalize(qRaw);

  // ---------- Check cache ----------
  const cached = cache.get(q);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json({
      results: cached.results,
      total: cached.results.length,
    });
  }

  const popularity = (r: any) => (r.have || 0) + (r.want || 0);

  // ---------- Buffer before fetching ----------
  if (lastTimeout) clearTimeout(lastTimeout);
  await new Promise<void>((resolve) => {
    lastTimeout = setTimeout(() => resolve(), FETCH_BUFFER);
  });

  // ---------- Fetch only masters & releases ----------
  const fetchSearch = async () => {
    const types: ("master" | "release")[] = ["master", "release"];
    const results: any[] = [];

    for (const type of types) {
      const params = new URLSearchParams();
      params.append("q", qRaw);
      params.append("type", type);
      params.append("per_page", "100");
      params.append("sort", "have");
      params.append("sort_order", "desc");

      const res = await fetch(
        `https://api.discogs.com/database/search?${params.toString()}`,
        { headers: { Authorization: `Discogs token=${token}` } },
      );
      const data = await res.json();
      results.push(...(data.results ?? []));
    }

    return results;
  };

  try {
    const allItems = await fetchSearch();

    // ---------- Deduplicate ----------
    const dedupe = (items: any[]) => {
      const map = new Map<string, any>();
      for (const r of items) {
        const key = r.master_id
          ? `m${r.master_id}`
          : r.id
            ? `r${r.id}`
            : `${r.title}-${r.artist}`;
        if (!map.has(key)) map.set(key, r);
      }
      return Array.from(map.values());
    };

    const items = dedupe(allItems);

    // ---------- Rank ----------
    const rankResults = (items: any[]) =>
      items
        .map((r) => {
          const artistNorm = normalize(r.artist || "");
          const titleNorm = normalize(r.title || "");

          let score = popularity(r);

          if (artistNorm === q)
            score += 10000; // exact artist match
          else if (artistNorm.includes(q)) score += 5000; // partial artist match
          if (titleNorm.includes(q)) score += 2000; // title match

          return { ...r, _score: score };
        })
        .sort((a, b) => b._score - a._score);

    const combined = rankResults(items).slice(0, 40);

    // ---------- Save to cache ----------
    cache.set(q, { results: combined, timestamp: Date.now() });

    return Response.json({ results: combined, total: combined.length });
  } catch (err) {
    console.error(err);
    return Response.json({ results: [], total: 0 });
  }
}
