// ---------- In-memory cache ----------
const cache = new Map<string, { results: any[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 1; // 1 minute
const FETCH_BUFFER = 500; // ms delay before fetching
const RATE_LIMIT = 55;
const RATE_WINDOW_MS = 60_000;
const requestTimestamps: number[] = [];

let lastTimeout: NodeJS.Timeout | null = null;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForDiscogsSlot = async (): Promise<number> => {
  let waitedMs = 0;
  while (true) {
    const now = Date.now();
    while (
      requestTimestamps.length > 0 &&
      now - requestTimestamps[0] >= RATE_WINDOW_MS
    ) {
      requestTimestamps.shift();
    }

    if (requestTimestamps.length < RATE_LIMIT) {
      requestTimestamps.push(now);
      return waitedMs;
    }

    const waitMs = Math.max(
      RATE_WINDOW_MS - (now - requestTimestamps[0]) + 25,
      25,
    );
    waitedMs += waitMs;
    await sleep(waitMs);
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawInput = (searchParams.get("q") ?? "").trim();
  const token = process.env.DISCOGS_TOKEN;
  const master_id = searchParams.get("master_id");
  const id = searchParams.get("id");
  const barcode = searchParams.get("barcode");

  if (!rawInput && !master_id && !id && !barcode)
    return Response.json({ results: [], total: 0 });

  // ---------- Detect catno-only search with # ----------
  let catnoOnly = false;
  let qRaw = rawInput;

  // If user starts with #, treat it as a catno search
  if (rawInput.startsWith("#")) {
    catnoOnly = true;
    qRaw = rawInput.slice(1).trim(); // remove the '#' from the query
  }

  // ---------- Helpers ----------
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/\b(en|and)\b/g, "&")
      .replace(/[^a-z0-9&]+/g, "")
      .trim();

  const q = normalize(qRaw);

  // ---------- Check cache ----------
  const cacheKey = master_id || id || (catnoOnly ? `{${qRaw}}` : q);
  const cached = cache.get(cacheKey);
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

  try {
    let results: any[] = [];

    // ---------- Fetch by master_id or release id if provided ----------
    if (master_id) {
      await waitForDiscogsSlot();
      const res = await fetch(`https://api.discogs.com/masters/${master_id}`, {
        headers: { Authorization: `Discogs token=${token}` },
      });
      if (res.ok) results.push(await res.json());
    } else if (id) {
      await waitForDiscogsSlot();
      const res = await fetch(`https://api.discogs.com/releases/${id}`, {
        headers: { Authorization: `Discogs token=${token}` },
      });
      if (res.ok) results.push(await res.json());
    } else if (barcode) {
      const cleanBarcode = barcode.replace(/\D/g, "");

      await waitForDiscogsSlot();
      const res = await fetch(
        `https://api.discogs.com/database/search?barcode=${cleanBarcode}&type=release&per_page=1`,
        {
          headers: { Authorization: `Discogs token=${token}` },
        },
      );

      const data = await res.json();
      const release = data.results?.[0];

      if (!release) {
        return Response.json({ found: false });
      }

      const releaseId = String(release.id);

      // 🔥 CHECK FIRESTORE HERE
      const admin = await import("firebase-admin");

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
      }

      const db = admin.firestore();
      const doc = await db.collection("details").doc(releaseId).get();

      if (doc.exists) {
        return Response.json({ found: true, id: releaseId });
      }

      return Response.json({ found: false });
    } else if (qRaw) {
      // ---------- Text search ----------
      const types: ("master" | "release")[] = ["master", "release"];
      for (const type of types) {
        const params = new URLSearchParams();
        params.append("q", qRaw);
        params.append("type", type);
        params.append("per_page", "40");
        params.append("sort", "have");
        params.append("sort_order", "desc");

        // Only add catno if this is a catno-only search
        if (catnoOnly) params.append("catno", qRaw);

        await waitForDiscogsSlot();
        let res = await fetch(
          `https://api.discogs.com/database/search?${params.toString()}`,
          { headers: { Authorization: `Discogs token=${token}` } },
        );

        if (res.status === 429) {
          const retryAfterHeader = res.headers.get("Retry-After");
          const retryAfterMs =
            (retryAfterHeader ? Number(retryAfterHeader) : 60) * 1000;
          await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : 60_000);
          await waitForDiscogsSlot();
          res = await fetch(
            `https://api.discogs.com/database/search?${params.toString()}`,
            { headers: { Authorization: `Discogs token=${token}` } },
          );
        }

        const data = await res.json();
        results.push(...(data.results ?? []));
      }
    }

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

    const items = dedupe(results);

    // ---------- Ranking ----------
    const qCatno = qRaw.trim().toLowerCase();
    const rankResults = (items: any[]) =>
      items
        .map((r) => {
          const artistNorm = normalize(r.artist || r.artists?.[0]?.name || "");
          const titleNorm = normalize(r.title || "");

          let score = popularity(r);

          // Huge boost for exact catno matches
          if ((r.catno || "").trim().toLowerCase() === qCatno) score += 20000;

          // Exact or partial title match
          if (!catnoOnly) {
            if (titleNorm === q) score += 15000;
            else if (titleNorm.includes(q)) score += 2000;
          }

          // Exact or partial artist match, treat "Various" as wildcard
          if (!catnoOnly) {
            if (artistNorm === q) score += 10000;
            else if (artistNorm.includes(q)) score += 5000;
            else if (artistNorm === "various" || artistNorm === "va")
              score += 5000;
          }

          return { ...r, _score: score };
        })
        .sort((a, b) => b._score - a._score);

    const combined = rankResults(items).slice(0, 40);

    // ---------- Save to cache ----------
    cache.set(cacheKey, { results: combined, timestamp: Date.now() });

    return Response.json({
      results: combined,
      total: combined.length,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ results: [], total: 0 });
  }
}
