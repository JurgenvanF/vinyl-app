type DiscogsArtist = {
  name: string;
  role?: string;
  id?: number;
};

type DiscogsTrack = {
  position: string;
  title: string;
  duration?: string;
  artists?: Array<{ name: string }>;
};

type DiscogsLabel = {
  name: string;
  catno: string;
  id?: number;
};

type DiscogsImage = {
  type: string;
  uri: string;
  width: number;
  height: number;
};

type DiscogsRatings = {
  average: number;
  count: number;
};

type DiscogsReleaseDetails = {
  title: string;
  released: string;
  country: string;
  notes: string;
  artists: DiscogsArtist[];
  extraartists: DiscogsArtist[];
  genre: string[];
  style: string[];
  tracklist: DiscogsTrack[];
  format: string[];
  text: string;
  qty: number;
  labels: DiscogsLabel[];
  ratings: DiscogsRatings;
  images: DiscogsImage[];
  series: string;
};

type DiscogsArtistPayload = {
  name?: string;
  role?: string;
  id?: number;
};

type DiscogsTrackPayload = {
  position?: string;
  title?: string;
  duration?: string;
  artists?: DiscogsArtistPayload[];
  sub_tracks?: DiscogsTrackPayload[];
};

type DiscogsFormatPayload = {
  name?: string;
  qty?: string;
  descriptions?: string[];
  text?: string;
};

type DiscogsLabelPayload = {
  name?: string;
  catno?: string;
  id?: number;
};

type DiscogsImagePayload = {
  type?: string;
  uri?: string;
  width?: number;
  height?: number;
};

type DiscogsSeriesPayload = {
  name?: string;
};

type DiscogsCommunityPayload = {
  rating?: {
    average?: number;
    count?: number;
  };
};

type DiscogsReleasePayload = {
  title?: string;
  released?: string;
  country?: string;
  main_release?: number;
  notes?: string;
  artists?: DiscogsArtistPayload[];
  extraartists?: DiscogsArtistPayload[];
  genres?: string[];
  styles?: string[];
  tracklist?: DiscogsTrackPayload[];
  formats?: DiscogsFormatPayload[];
  labels?: DiscogsLabelPayload[];
  images?: DiscogsImagePayload[];
  series?: DiscogsSeriesPayload[];
  community?: DiscogsCommunityPayload;
};

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_VERSION = "v2";
const cache = new Map<
  string,
  { details: DiscogsReleaseDetails; timestamp: number }
>();
const inFlight = new Map<string, Promise<DiscogsReleaseDetails>>();
const RATE_LIMIT = 55;
const RATE_WINDOW_MS = 60_000;
const requestTimestamps: number[] = [];

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

const normalizeTrackArtists = (
  artists?: DiscogsArtistPayload[],
): Array<{ name: string }> | undefined => {
  if (!Array.isArray(artists)) return undefined;
  const names = artists
    .map((artist) =>
      typeof artist.name === "string" ? artist.name.trim() : "",
    )
    .filter(Boolean)
    .map((name) => ({ name }));
  return names.length > 0 ? names : undefined;
};

const normalizeArtists = (artists?: DiscogsArtistPayload[]): DiscogsArtist[] => {
  if (!Array.isArray(artists)) return [];
  return artists
    .map((artist) => ({
      name: typeof artist.name === "string" ? artist.name.trim() : "",
      role: typeof artist.role === "string" ? artist.role.trim() : undefined,
      id: typeof artist.id === "number" ? artist.id : undefined,
    }))
    .filter((artist) => Boolean(artist.name));
};

const normalizeTrack = (track: DiscogsTrackPayload): DiscogsTrack => ({
  position:
    typeof track?.position === "string" && track.position.trim()
      ? track.position.trim()
      : "",
  title: typeof track?.title === "string" ? track.title.trim() : "",
  duration:
    typeof track?.duration === "string" && track.duration.trim()
      ? track.duration.trim()
      : undefined,
  artists: normalizeTrackArtists(track.artists),
});

const extractTracklist = (payload: DiscogsReleasePayload): DiscogsTrack[] => {
  if (!Array.isArray(payload?.tracklist)) return [];

  const results: DiscogsTrack[] = [];
  for (const track of payload.tracklist) {
    const normalized = normalizeTrack(track);
    if (normalized.title) {
      results.push(normalized);
    }

    if (Array.isArray(track?.sub_tracks)) {
      for (const subTrack of track.sub_tracks) {
        const subNormalized = normalizeTrack(subTrack);
        if (subNormalized.title) {
          results.push(subNormalized);
        }
      }
    }
  }

  return results;
};

const formatReleaseDate = (rawDate?: string): string => {
  if (!rawDate || typeof rawDate !== "string") return "";
  const trimmed = rawDate.trim();
  const fullDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!fullDateMatch) return trimmed;

  const [, year, month, day] = fullDateMatch;
  const monthNum = Number(month);
  const dayNum = Number(day);
  const hasMonth = monthNum >= 1 && monthNum <= 12;
  const hasDay = dayNum >= 1 && dayNum <= 31;

  if (hasMonth && hasDay) return `${year}-${month}-${day}`;
  if (hasMonth) return `${year}-${month}`;
  return year;
};

const extractFormats = (formats?: DiscogsFormatPayload[]) => {
  if (!Array.isArray(formats) || formats.length === 0) {
    return { format: [] as string[], text: "", qty: 0 };
  }

  const names = Array.from(
    new Set(
      formats
        .map((format) => (typeof format.name === "string" ? format.name : ""))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

  const descriptions = formats
    .flatMap((format) =>
      Array.isArray(format.descriptions) ? format.descriptions : [],
    )
    .map((value) => value.trim())
    .filter(Boolean);

  const textValues = formats
    .map((format) => (typeof format.text === "string" ? format.text : ""))
    .map((value) => value.trim())
    .filter(Boolean);

  const qty = formats.reduce((total, format) => {
    const parsed = Number(format.qty);
    return Number.isFinite(parsed) ? total + parsed : total;
  }, 0);

  return {
    format: names,
    text: [...descriptions, ...textValues].join(", "),
    qty,
  };
};

const extractLabels = (labels?: DiscogsLabelPayload[]): DiscogsLabel[] => {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => ({
      name: typeof label.name === "string" ? label.name.trim() : "",
      catno: typeof label.catno === "string" ? label.catno.trim() : "",
      id: typeof label.id === "number" ? label.id : undefined,
    }))
    .filter((label) => Boolean(label.name || label.catno));
};

const extractImages = (images?: DiscogsImagePayload[]): DiscogsImage[] => {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => ({
      type: typeof image.type === "string" ? image.type.trim() : "",
      uri: typeof image.uri === "string" ? image.uri.trim() : "",
      width: typeof image.width === "number" ? image.width : 0,
      height: typeof image.height === "number" ? image.height : 0,
    }))
    .filter((image) => Boolean(image.uri));
};

const extractRatings = (payload: DiscogsReleasePayload): DiscogsRatings => ({
  average:
    typeof payload.community?.rating?.average === "number"
      ? payload.community.rating.average
      : 0,
  count:
    typeof payload.community?.rating?.count === "number"
      ? payload.community.rating.count
      : 0,
});

const extractSeries = (payload: DiscogsReleasePayload): string => {
  if (!Array.isArray(payload.series)) return "";
  return payload.series
    .map((entry) => (typeof entry.name === "string" ? entry.name.trim() : ""))
    .filter(Boolean)
    .join(", ");
};

const normalizeDetails = (payload: DiscogsReleasePayload): DiscogsReleaseDetails => {
  const { format, text, qty } = extractFormats(payload.formats);

  return {
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    released: formatReleaseDate(payload.released),
    country: typeof payload.country === "string" ? payload.country.trim() : "",
    notes: typeof payload.notes === "string" ? payload.notes.trim() : "",
    artists: normalizeArtists(payload.artists),
    extraartists: normalizeArtists(payload.extraartists),
    genre: Array.isArray(payload.genres)
      ? payload.genres.map((item) => item.trim()).filter(Boolean)
      : [],
    style: Array.isArray(payload.styles)
      ? payload.styles.map((item) => item.trim()).filter(Boolean)
      : [],
    tracklist: extractTracklist(payload),
    format,
    text,
    qty,
    labels: extractLabels(payload.labels),
    ratings: extractRatings(payload),
    images: extractImages(payload.images),
    series: extractSeries(payload),
  };
};

const mergeDetails = (
  primary: DiscogsReleaseDetails,
  fallback: DiscogsReleaseDetails,
): DiscogsReleaseDetails => ({
  title: primary.title || fallback.title,
  released: primary.released || fallback.released,
  country: primary.country || fallback.country,
  notes: primary.notes || fallback.notes,
  artists: primary.artists.length > 0 ? primary.artists : fallback.artists,
  extraartists:
    primary.extraartists.length > 0
      ? primary.extraartists
      : fallback.extraartists,
  genre: primary.genre.length > 0 ? primary.genre : fallback.genre,
  style: primary.style.length > 0 ? primary.style : fallback.style,
  tracklist:
    primary.tracklist.length > 0 ? primary.tracklist : fallback.tracklist,
  format: primary.format.length > 0 ? primary.format : fallback.format,
  text: primary.text || fallback.text,
  qty: primary.qty > 0 ? primary.qty : fallback.qty,
  labels: primary.labels.length > 0 ? primary.labels : fallback.labels,
  ratings:
    primary.ratings.count > 0 || primary.ratings.average > 0
      ? primary.ratings
      : fallback.ratings,
  images: primary.images.length > 0 ? primary.images : fallback.images,
  series: primary.series || fallback.series,
});

const fetchDiscogsPayload = async (
  url: string,
  headers: { Authorization: string },
): Promise<DiscogsReleasePayload | null> => {
  await waitForDiscogsSlot();
  let res = await fetch(url, { headers });

  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("Retry-After");
    const retryAfterMs = (retryAfterHeader ? Number(retryAfterHeader) : 60) * 1000;
    await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : 60_000);
    await waitForDiscogsSlot();
    res = await fetch(url, { headers });
  }

  if (!res.ok) return null;
  return (await res.json()) as DiscogsReleasePayload;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const masterId = searchParams.get("master_id");
  const resultTypeRaw = searchParams.get("result_type");
  const resultType =
    resultTypeRaw === "master" || resultTypeRaw === "release"
      ? resultTypeRaw
      : "";
  const token = process.env.DISCOGS_TOKEN;
  const cacheKey = `${CACHE_VERSION}|id:${id ?? ""}|master:${masterId ?? ""}|type:${resultType}`;

  if (!token) return Response.json(normalizeDetails({}), { status: 200 });
  if (!id && !masterId) return Response.json(normalizeDetails({}), { status: 200 });

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json(cached.details, { status: 200 });
  }

  if (inFlight.has(cacheKey)) {
    const details = await inFlight.get(cacheKey)!;
    return Response.json(details, { status: 200 });
  }

  const headers = { Authorization: `Discogs token=${token}` };
  const urls =
    resultType === "master"
      ? [
          id ? `https://api.discogs.com/masters/${id}` : null,
          masterId ? `https://api.discogs.com/masters/${masterId}` : null,
          id ? `https://api.discogs.com/releases/${id}` : null,
        ]
      : resultType === "release"
        ? [
            id ? `https://api.discogs.com/releases/${id}` : null,
            masterId ? `https://api.discogs.com/masters/${masterId}` : null,
          ]
        : [
            masterId && id && masterId === id
              ? `https://api.discogs.com/masters/${masterId}`
              : null,
            id ? `https://api.discogs.com/releases/${id}` : null,
            masterId ? `https://api.discogs.com/masters/${masterId}` : null,
          ];

  const dedupedUrls = Array.from(
    new Set(urls.filter((value): value is string => Boolean(value))),
  );

  const fetchDetails = (async () => {
    for (const url of dedupedUrls) {
      try {
        const data = await fetchDiscogsPayload(url, headers);
        if (!data) continue;

        const baseDetails = normalizeDetails(data);
        if (!url.includes("/masters/")) {
          return baseDetails;
        }

        const mainReleaseId =
          typeof data.main_release === "number" ? data.main_release : undefined;
        if (!mainReleaseId) return baseDetails;

        const mainReleaseData = await fetchDiscogsPayload(
          `https://api.discogs.com/releases/${mainReleaseId}`,
          headers,
        );
        if (!mainReleaseData) return baseDetails;

        const mainReleaseDetails = normalizeDetails(mainReleaseData);
        return mergeDetails(mainReleaseDetails, baseDetails);
      } catch (error) {
        console.error(error);
      }
    }

    return normalizeDetails({});
  })();

  inFlight.set(cacheKey, fetchDetails);
  const details = await fetchDetails;
  inFlight.delete(cacheKey);

  cache.set(cacheKey, { details, timestamp: Date.now() });
  return Response.json(details, { status: 200 });
}
