export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const PER_PAGE = parseInt(searchParams.get("per_page") || "50", 10);
  const token = process.env.DISCOGS_TOKEN;

  if (!q) return Response.json({ results: [], total: 0 });

  const type = "release";
  const FETCH_COUNT = 150; // fetch more to account for deduplication

  const fetchField = async (field: string) => {
    const params = new URLSearchParams();
    params.append(field, q);
    params.append("type", type);
    params.append("per_page", FETCH_COUNT.toString());
    params.append("page", "1");

    const res = await fetch(
      `https://api.discogs.com/database/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Discogs token=${token}`,
        },
      },
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

    // Deduplicate by master_id first, then title+artist
    const uniqueMap = new Map<string, any>();
    for (const r of allResults) {
      const key = r.master_id ? `m${r.master_id}` : `${r.title}-${r.artist}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, r);
    }
    const uniqueResults = Array.from(uniqueMap.values());

    // Sort masters first, then by popularity
    const popularityScore = (release: any) =>
      (release.have || 0) + (release.want || 0);
    const masters = uniqueResults
      .filter((r) => r.master_id)
      .sort((a, b) => popularityScore(b) - popularityScore(a));
    const nonMasters = uniqueResults
      .filter((r) => !r.master_id)
      .sort((a, b) => popularityScore(b) - popularityScore(a));
    const sortedResults = [...masters, ...nonMasters];

    // Pagination slice
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pagedResults = sortedResults.slice(start, end);

    return Response.json({
      results: pagedResults,
      total: sortedResults.length,
      page,
      per_page: PER_PAGE,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ results: [], total: 0, page, per_page: PER_PAGE });
  }
}
