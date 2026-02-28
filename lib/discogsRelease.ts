type DiscogsReleaseParams = {
  id?: number | null;
  masterId?: number | null;
  resultType?: string | null;
};

export type DiscogsArtist = {
  name: string;
  role?: string;
  id?: number;
};

export type DiscogsTrack = {
  position: string;
  title: string;
  duration?: string;
  artists?: Array<{ name: string }>;
};

export type DiscogsLabel = {
  name: string;
  catno: string;
  id?: number;
};

export type DiscogsImage = {
  type: string;
  uri: string;
  width: number;
  height: number;
};

export type DiscogsReleaseDetails = {
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
  ratings: { average: number; count: number };
  images: DiscogsImage[];
  series: string;
};

const EMPTY_DETAILS: DiscogsReleaseDetails = {
  title: "",
  released: "",
  country: "",
  notes: "",
  artists: [],
  extraartists: [],
  genre: [],
  style: [],
  tracklist: [],
  format: [],
  text: "",
  qty: 0,
  labels: [],
  ratings: { average: 0, count: 0 },
  images: [],
  series: "",
};

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const CACHE_VERSION = "v2";
const cache = new Map<
  string,
  { details: DiscogsReleaseDetails; timestamp: number }
>();
const inFlight = new Map<string, Promise<DiscogsReleaseDetails>>();

export const fetchDiscogsReleaseDetails = async ({
  id,
  masterId,
  resultType,
}: DiscogsReleaseParams): Promise<DiscogsReleaseDetails> => {
  if (!id && !masterId) return EMPTY_DETAILS;
  const normalizedType =
    resultType === "master" || resultType === "release" ? resultType : "";
  const cacheKey = `${CACHE_VERSION}|id:${id ?? ""}|master:${masterId ?? ""}|type:${normalizedType}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.details;
  }

  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey)!;
  }

  const params = new URLSearchParams();
  if (id) params.set("id", String(id));
  if (masterId) params.set("master_id", String(masterId));
  if (normalizedType) params.set("result_type", normalizedType);

  const request = (async () => {
    try {
      const res = await fetch(`/api/discogs-release?${params.toString()}`);
      if (!res.ok) return EMPTY_DETAILS;
      const data = (await res.json()) as Partial<DiscogsReleaseDetails>;

      const details: DiscogsReleaseDetails = {
        title: typeof data.title === "string" ? data.title : "",
        released: typeof data.released === "string" ? data.released : "",
        country: typeof data.country === "string" ? data.country : "",
        notes: typeof data.notes === "string" ? data.notes : "",
        artists: Array.isArray(data.artists) ? data.artists : [],
        extraartists: Array.isArray(data.extraartists) ? data.extraartists : [],
        genre: Array.isArray(data.genre) ? data.genre : [],
        style: Array.isArray(data.style) ? data.style : [],
        tracklist: Array.isArray(data.tracklist) ? data.tracklist : [],
        format: Array.isArray(data.format) ? data.format : [],
        text: typeof data.text === "string" ? data.text : "",
        qty: typeof data.qty === "number" ? data.qty : 0,
        labels: Array.isArray(data.labels) ? data.labels : [],
        ratings:
          data.ratings &&
          typeof data.ratings.average === "number" &&
          typeof data.ratings.count === "number"
            ? data.ratings
            : { average: 0, count: 0 },
        images: Array.isArray(data.images) ? data.images : [],
        series: typeof data.series === "string" ? data.series : "",
      };

      cache.set(cacheKey, { details, timestamp: Date.now() });
      return details;
    } catch (error) {
      console.error(error);
      return EMPTY_DETAILS;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, request);
  return request;
};
