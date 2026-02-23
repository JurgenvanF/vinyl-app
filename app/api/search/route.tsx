export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const token = process.env.DISCOGS_TOKEN;

  if (!q) return Response.json({ results: [], total: 0 });

  const fetchField = async (field: "artist" | "release_title" | "catno") => {
    const params = new URLSearchParams();
    params.append(field, q);
    params.append("type", "master"); // only master releases
    params.append("per_page", "50"); // fetch top 50
    params.append("sort", "have"); // most popular first
    params.append("sort_order", "desc");

    const res = await fetch(
      `https://api.discogs.com/database/search?${params.toString()}`,
      { headers: { Authorization: `Discogs token=${token}` } },
    );
    const data = await res.json();
    return data.results ?? [];
  };

  try {
    const [artistResults, titleResults, catnoResults] = await Promise.all([
      fetchField("artist"),
      fetchField("release_title"),
      fetchField("catno"),
    ]);

    // Merge all results
    const allResults = [...artistResults, ...titleResults, ...catnoResults];

    // Deduplicate by master_id
    const uniqueMap = new Map<string, any>();
    for (const r of allResults) {
      const key = r.master_id ? `m${r.master_id}` : `${r.title}-${r.artist}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, r);
    }

    // Sort by popularity and limit to 40
    const results = Array.from(uniqueMap.values())
      .sort(
        (a, b) =>
          (b.have || 0) + (b.want || 0) - ((a.have || 0) + (a.want || 0)),
      )
      .slice(0, 40);

    return Response.json({ results, total: results.length });
  } catch (err) {
    console.error(err);
    return Response.json({ results: [], total: 0 });
  }
}
