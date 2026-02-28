// app/api/discogs-barcode/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawBarcode = searchParams.get("barcode")?.trim();

  if (!rawBarcode) {
    return Response.json(
      { error: "No barcode provided", results: [] },
      { status: 400 },
    );
  }

  const barcode = rawBarcode.replace(/\D/g, "");
  const token = process.env.DISCOGS_TOKEN;

  if (!token) {
    return Response.json(
      { error: "No Discogs token set", results: [] },
      { status: 500 },
    );
  }

  const RATE_LIMIT = 55;
  const RATE_WINDOW_MS = 60_000;
  const requestTimestamps: number[] = [];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForDiscogsSlot = async () => {
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
        return;
      }

      const waitMs = Math.max(
        RATE_WINDOW_MS - (now - requestTimestamps[0]) + 25,
        25,
      );
      await sleep(waitMs);
    }
  };

  type DiscogsBarcodeResult = {
    id?: number;
    master_id?: number;
    type?: string;
    [key: string]: unknown;
  };

  try {
    const headers = { Authorization: `Discogs token=${token}` };
    const types: ("master" | "release")[] = ["master", "release"];
    const results: DiscogsBarcodeResult[] = [];

    for (const type of types) {
      const params = new URLSearchParams();
      params.append("barcode", barcode);
      params.append("type", type);
      params.append("per_page", "5");
      params.append("sort", "have");
      params.append("sort_order", "desc");

      await waitForDiscogsSlot();
      let res = await fetch(
        `https://api.discogs.com/database/search?${params.toString()}`,
        { headers },
      );

      if (res.status === 429) {
        const retryAfterHeader = res.headers.get("Retry-After");
        const retryAfterMs =
          (retryAfterHeader ? Number(retryAfterHeader) : 60) * 1000;
        await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : 60_000);
        await waitForDiscogsSlot();
        res = await fetch(
          `https://api.discogs.com/database/search?${params.toString()}`,
          { headers },
        );
      }

      if (!res.ok) {
        continue;
      }

      const data = (await res.json()) as { results?: DiscogsBarcodeResult[] };
      if (Array.isArray(data.results)) results.push(...data.results);
    }

    const map = new Map<string, DiscogsBarcodeResult>();
    for (const r of results) {
      const masterId =
        typeof r.master_id === "number" && r.master_id > 0 ? r.master_id : null;
      const id = typeof r.id === "number" && r.id > 0 ? r.id : null;
      const key = masterId ? `m${masterId}` : id ? `r${id}` : "";
      if (!key) continue;
      if (!map.has(key)) map.set(key, r);
    }

    const deduped = Array.from(map.values());

    return Response.json({ results: deduped, total: deduped.length }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to fetch barcode data", results: [] },
      { status: 500 },
    );
  }
}
