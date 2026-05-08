// Unified media API for StoryHub
// TMDB requests prefer direct CORS; fall back to corsproxy.io if blocked.

export type MediaCategory = "movie" | "drama" | "anime" | "manga" | "book";

// Smart switcher: 'video' opens the HLS player, 'reading' opens the webtoon reader.
export type ContentType = "video" | "reading";

export interface MediaEpisode {
  number: number;
  title: string;
  runtime?: string;
  hlsSrc?: string;
}

export interface MediaChapter {
  number: number;
  title: string;
  pages?: number;
}

export interface VideoMetadata {
  episodes: MediaEpisode[];
  studio?: string;
  duration?: string;
  status?: string;
}

export interface ReadingMetadata {
  chapters: MediaChapter[];
  author?: string;
  status?: string;
}

export interface MediaItem {
  id: string;
  category: MediaCategory;
  // Aliased pair: `title` is canonical, `description`/`posterUrl` are explicit
  // names required by the standardized contract.
  title: string;
  description?: string;
  poster: string;
  posterUrl?: string;
  backdrop?: string;
  year?: string;
  overview?: string;
  rating?: number;
  genre?: string[];
  // Smart switcher fields
  contentType?: ContentType;
  metadata?: VideoMetadata | ReadingMetadata;
  // Used for trailer / detail fetching
  tmdbId?: number;
  tmdbType?: "movie" | "tv";
  trailerQuery?: string; // YouTube search fallback
  externalUrl?: string;
  // Regional/i18n fields — used by Fuse.js alias matching and fallback overview fetch
  originalTitle?: string;
  originalLanguage?: string;
  // Alternate titles (release titles in other locales) — searched by Fuse.js
  alternativeTitles?: string[];
  // Optional direct stream (HLS .m3u8). When absent, MediaViewer falls back to YouTube trailer.
  hlsSrc?: string;
}

// ---- Public demo HLS pool ---------------------------------------------------
// Distinct, publicly-hosted test streams. Items without an explicit hlsSrc
// deterministically pick one based on item.id so different titles play
// visibly different videos (no more "Tears of Steel for everything").
export const DEMO_HLS_POOL: string[] = [
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
  "https://test-streams.mux.dev/test_001/stream.m3u8",
  "https://demo.unified-streaming.com/k8s/features/stable/video/sintel/sintel.ism/.m3u8",
  "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
];

const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const pickDemoHls = (id: string): string =>
  DEMO_HLS_POOL[hashString(id) % DEMO_HLS_POOL.length];

export const resolveHlsSrc = (item: MediaItem, episode: number = 1): string => {
  const meta = item.metadata as VideoMetadata | undefined;
  const epHls = meta?.episodes?.[episode - 1]?.hlsSrc;
  return epHls || item.hlsSrc || pickDemoHls(item.id);
};

// Derive contentType from category when not explicitly set.
export const getContentType = (item: MediaItem): ContentType =>
  item.contentType ??
  (item.category === "manga" || item.category === "book" ? "reading" : "video");

// ---- Genre maps -------------------------------------------------------------
// Explicit TMDB genre ID → human label translations. Used by mapTmdb so every
// MediaItem.genre is a readable string array, never raw numeric IDs.
export const TMDB_MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const TMDB_TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

const mapGenreIds = (ids: number[] | undefined, type: "movie" | "tv"): string[] | undefined => {
  if (!ids || ids.length === 0) return undefined;
  const dict = type === "tv" ? TMDB_TV_GENRES : TMDB_MOVIE_GENRES;
  const labels = ids.map((id) => dict[id]).filter(Boolean) as string[];
  return labels.length ? labels : undefined;
};

// ---- Config -----------------------------------------------------------------
// Public TMDB v3 demo key path; users can swap via localStorage `tmdb_key`.
const DEFAULT_TMDB_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const getTmdbKey = () =>
  (typeof window !== "undefined" && localStorage.getItem("tmdb_key")) ||
  DEFAULT_TMDB_KEY;

// TMDB supports CORS directly from browsers in most environments. When the
// deployed domain is blocked (CSP / privacy lists / region), we route through
// AllOrigins which has no domain whitelist (corsproxy.io now 403s lovable.app).
// Once a direct call fails, we remember it and skip future direct attempts to
// avoid sequential per-request timeouts on every row.
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const proxied = (url: string) => `${CORS_PROXY}${encodeURIComponent(url)}`;
let TMDB_DIRECT_BLOCKED = false;

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";
export const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'><rect width='100%' height='100%' fill='#1a1a1a'/><text x='50%' y='50%' fill='#666' font-family='sans-serif' font-size='20' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>`
  );

// ---- Fetch helpers ----------------------------------------------------------
export class RateLimitError extends Error {
  status = 429;
  constructor(url: string) {
    super(`Rate limited (429): ${url}`);
    this.name = "RateLimitError";
  }
}

export class NetworkError extends Error {
  constructor(url: string, public cause?: unknown) {
    super(`Network/proxy error: ${url}`);
    this.name = "NetworkError";
  }
}

// Internal: track whether the most recent tmdb()/safeJson call hit a
// network/proxy error (vs a legitimate empty/null response).
let LAST_NETWORK_ERROR = false;
export const wasNetworkError = (): boolean => LAST_NETWORK_ERROR;

async function safeJson<T>(url: string): Promise<T | null> {
  LAST_NETWORK_ERROR = false;
  try {
    const res = await fetch(url);
    if (res.status === 429) throw new RateLimitError(url);
    if (res.status === 403 || res.status >= 500) {
      LAST_NETWORK_ERROR = true;
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    LAST_NETWORK_ERROR = true;
    return null;
  }
}

// ---- TMDB (Movies + Drama/TV) ----------------------------------------------
async function tmdb<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const qs = new URLSearchParams({
    api_key: getTmdbKey(),
    language: "en-US",
    ...params,
  });
  const url = `https://api.themoviedb.org/3${path}?${qs.toString()}`;
  if (!TMDB_DIRECT_BLOCKED) {
    const direct = await safeJson<T>(url);
    if (direct) return direct;
    if (LAST_NETWORK_ERROR) {
      // Mark direct as blocked for the rest of the session.
      TMDB_DIRECT_BLOCKED = true;
    } else {
      return null; // genuine empty
    }
  }
  return safeJson<T>(proxied(url));
}

interface TmdbResult {
  results?: Array<{
    id: number;
    title?: string;
    original_title?: string;
    name?: string;
    original_name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    vote_average?: number;
    original_language?: string;
    genre_ids?: number[];
  }>;
}

interface MapTmdbOptions {
  // Enforce that a result's original_language matches one of these codes
  // (e.g., ["te"] for Telugu). Mismatches are dropped to prevent leaks.
  enforceLanguages?: string[];
}

function mapTmdb(
  results: TmdbResult["results"] = [],
  type: "movie" | "tv",
  category: MediaCategory,
  opts: MapTmdbOptions = {}
): MediaItem[] {
  const out: MediaItem[] = [];
  for (const r of results) {
    if (
      opts.enforceLanguages &&
      opts.enforceLanguages.length > 0 &&
      (!r.original_language || !opts.enforceLanguages.includes(r.original_language))
    ) {
      continue; // discard "Hollywood leak" entries
    }
    const poster = r.poster_path ? `${TMDB_IMG}${r.poster_path}` : PLACEHOLDER;
    const title =
      r.title || r.name || r.original_title || r.original_name || "Untitled";
    const originalTitle = r.original_title || r.original_name;
    const overviewText = r.overview?.trim() || undefined;
    const ratingNum =
      typeof r.vote_average === "number"
        ? Number(r.vote_average.toFixed(1))
        : undefined;
    out.push({
      id: `tmdb-${type}-${r.id}`,
      category,
      title,
      // description and overview mirror the same TMDB field
      description: overviewText,
      overview: overviewText,
      poster,
      posterUrl: poster,
      backdrop: r.backdrop_path ? `${TMDB_BACKDROP}${r.backdrop_path}` : undefined,
      year: (r.release_date || r.first_air_date || "").slice(0, 4),
      rating: ratingNum,
      genre: mapGenreIds(r.genre_ids, type),
      contentType: "video" as const,
      tmdbId: r.id,
      tmdbType: type,
      originalTitle: originalTitle && originalTitle !== title ? originalTitle : undefined,
      originalLanguage: r.original_language,
      hlsSrc: pickDemoHls(`tmdb-${type}-${r.id}`),
    });
  }
  return out;
}

// ---- Jikan (Anime + Manga) --------------------------------------------------
interface JikanResp {
  data?: Array<{
    mal_id: number;
    title: string;
    title_english?: string;
    images?: { jpg?: { large_image_url?: string; image_url?: string } };
    aired?: { from?: string };
    published?: { from?: string };
    synopsis?: string;
    score?: number;
    trailer?: { youtube_id?: string };
    url?: string;
    genres?: Array<{ name?: string }>;
  }>;
}

function mapJikan(
  d: JikanResp["data"] = [],
  category: "anime" | "manga"
): MediaItem[] {
  return d.map((r) => {
    const poster =
      r.images?.jpg?.large_image_url ||
      r.images?.jpg?.image_url ||
      PLACEHOLDER;
    const synopsis = r.synopsis?.trim() || undefined;
    const ratingNum =
      typeof r.score === "number" ? Number(r.score.toFixed(1)) : undefined;
    return {
      id: `jikan-${category}-${r.mal_id}`,
      category,
      title: r.title_english || r.title,
      description: synopsis,
      overview: synopsis,
      poster,
      posterUrl: poster,
      year: (r.aired?.from || r.published?.from || "").slice(0, 4),
      rating: ratingNum,
      genre: r.genres?.map((g) => g.name).filter(Boolean) as string[] | undefined,
      contentType: category === "manga" ? ("reading" as const) : ("video" as const),
      trailerQuery: r.trailer?.youtube_id
        ? r.trailer.youtube_id
        : `${r.title} ${category} trailer`,
      externalUrl: r.url,
      originalTitle: r.title_english && r.title_english !== r.title ? r.title : undefined,
      hlsSrc: pickDemoHls(`jikan-${category}-${r.mal_id}`),
    };
  });
}

// ---- Open Library (Books) ---------------------------------------------------
interface OLResp {
  docs?: Array<{
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    subject?: string[];
  }>;
}

function mapOL(d: OLResp["docs"] = []): MediaItem[] {
  return d.map((r) => {
    const poster = r.cover_i
      ? `https://covers.openlibrary.org/b/id/${r.cover_i}-L.jpg`
      : PLACEHOLDER;
    const desc = r.author_name ? `By ${r.author_name.join(", ")}` : undefined;
    return {
      id: `ol-${r.key}`,
      category: "book" as const,
      title: r.title,
      description: desc,
      overview: desc,
      poster,
      posterUrl: poster,
      year: r.first_publish_year ? String(r.first_publish_year) : undefined,
      genre: r.subject?.slice(0, 4),
      contentType: "reading" as const,
      trailerQuery: `${r.title} book review`,
      externalUrl: `https://openlibrary.org${r.key}`,
    };
  });
}

// ---- Public API -------------------------------------------------------------
import { MOCK_BY_CATEGORY, MOCK_INDIAN_BY_LANG, MOCK_INDIAN_MIX } from "./mockData";

// Always merge mock items so categories never appear empty.
function withFallback(items: MediaItem[], category: MediaCategory): MediaItem[] {
  const mocks = MOCK_BY_CATEGORY[category] || [];
  if (items.length >= 5) return items;
  const seen = new Set(items.map((i) => i.title.toLowerCase()));
  const extras = mocks.filter((m) => !seen.has(m.title.toLowerCase()));
  return [...items, ...extras];
}

export async function fetchTrending(
  category: MediaCategory
): Promise<MediaItem[]> {
  switch (category) {
    case "movie": {
      const r = await tmdb<TmdbResult>("/trending/movie/week");
      return withFallback(mapTmdb(r?.results, "movie", "movie"), "movie");
    }
    case "drama": {
      const r = await tmdb<TmdbResult>("/trending/tv/week");
      return withFallback(mapTmdb(r?.results, "tv", "drama"), "drama");
    }
    case "anime": {
      const r = await safeJson<JikanResp>(
        "https://api.jikan.moe/v4/top/anime?limit=20"
      );
      return withFallback(mapJikan(r?.data, "anime"), "anime");
    }
    case "manga": {
      const r = await safeJson<JikanResp>(
        "https://api.jikan.moe/v4/top/manga?limit=20"
      );
      return withFallback(mapJikan(r?.data, "manga"), "manga");
    }
    case "book": {
      const r = await safeJson<OLResp>(
        "https://openlibrary.org/search.json?q=bestseller&limit=20"
      );
      return withFallback(mapOL(r?.docs), "book");
    }
  }
}

export async function fetchSecondary(
  category: MediaCategory
): Promise<MediaItem[]> {
  switch (category) {
    case "movie": {
      const r = await tmdb<TmdbResult>("/movie/now_playing");
      return withFallback(mapTmdb(r?.results, "movie", "movie"), "movie");
    }
    case "drama": {
      const r = await tmdb<TmdbResult>("/tv/top_rated");
      return withFallback(mapTmdb(r?.results, "tv", "drama"), "drama");
    }
    case "anime": {
      const r = await safeJson<JikanResp>(
        "https://api.jikan.moe/v4/seasons/now?limit=20"
      );
      return withFallback(mapJikan(r?.data, "anime"), "anime");
    }
    case "manga": {
      const r = await safeJson<JikanResp>(
        "https://api.jikan.moe/v4/manga?order_by=popularity&limit=20"
      );
      return withFallback(mapJikan(r?.data, "manga"), "manga");
    }
    case "book": {
      const r = await safeJson<OLResp>(
        "https://openlibrary.org/search.json?q=fantasy&limit=20"
      );
      return withFallback(mapOL(r?.docs), "book");
    }
  }
}

// ---- Indian / Regional discover --------------------------------------------
// Uses TMDB /discover/movie with original_language filters. `lang` may be a
// single ISO 639-1 code ("hi") or pipe-separated for "any of" ("hi|ta|te|ml|kn").
// When a single language is supplied we strictly enforce the match in the
// mapper to prevent Hollywood-language leaks.
export async function fetchIndianMovies(
  lang: string = "hi|ta|te|ml|kn|bn"
): Promise<MediaItem[]> {
  const allowedLangs = lang.split("|").map((s) => s.trim()).filter(Boolean);
  const isSingleLang = allowedLangs.length === 1;
  const params: Record<string, string> = {
    with_original_language: lang,
    sort_by: "popularity.desc",
    region: "IN",
    "vote_count.gte": "20",
    include_adult: "false",
  };
  if (isSingleLang) params.with_origin_country = "IN";
  const r = await tmdb<TmdbResult>("/discover/movie", params);
  const mapped = mapTmdb(r?.results, "movie", "movie", {
    enforceLanguages: allowedLangs,
  });
  // If TMDB returned real regional results, use them as-is.
  if (mapped.length >= 5) return mapped;

  // Otherwise, pick a language-correct mock pool — never the global Hollywood
  // pool — so Bollywood/Tamil/Telugu rows never leak en-language content.
  const regionalMock = isSingleLang
    ? (MOCK_INDIAN_BY_LANG[allowedLangs[0]] || [])
    : MOCK_INDIAN_MIX;

  const seen = new Set(mapped.map((i) => i.title.toLowerCase()));
  const extras = regionalMock.filter((m) => !seen.has(m.title.toLowerCase()));
  return [...mapped, ...extras];
}

export async function searchAll(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const q = encodeURIComponent(query);

  const settled = await Promise.allSettled([
    tmdb<TmdbResult>("/search/movie", { query, include_adult: "false" }),
    tmdb<TmdbResult>("/search/tv", { query, include_adult: "false" }),
    tmdb<TmdbResult>("/search/movie", { query, region: "IN", include_adult: "false" }),
    tmdb<TmdbResult>("/search/tv", { query, region: "IN", include_adult: "false" }),
    safeJson<JikanResp>(`https://api.jikan.moe/v4/anime?q=${q}&limit=10`),
    safeJson<JikanResp>(`https://api.jikan.moe/v4/manga?q=${q}&limit=10`),
    safeJson<OLResp>(`https://openlibrary.org/search.json?q=${q}&limit=10`),
  ]);

  const val = <T,>(i: number): T | null =>
    settled[i].status === "fulfilled"
      ? ((settled[i] as PromiseFulfilledResult<T | null>).value ?? null)
      : null;

  const movie = val<TmdbResult>(0);
  const tv = val<TmdbResult>(1);
  const movieIn = val<TmdbResult>(2);
  const tvIn = val<TmdbResult>(3);
  const anime = val<JikanResp>(4);
  const manga = val<JikanResp>(5);
  const books = val<OLResp>(6);

  const out: MediaItem[] = [
    ...mapTmdb(movie?.results, "movie", "movie"),
    ...mapTmdb(movieIn?.results, "movie", "movie"),
    ...mapTmdb(tv?.results, "tv", "drama"),
    ...mapTmdb(tvIn?.results, "tv", "drama"),
    ...mapJikan(anime?.data, "anime"),
    ...mapJikan(manga?.data, "manga"),
    ...mapOL(books?.docs),
  ];

  const seen = new Set<string>();
  const deduped = out.filter((it) => {
    const key = `${it.category}::${it.title.toLowerCase().replace(/[^a-z0-9]/g, "")}::${it.year || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Hydrate alternative_titles for the top TMDB hits so Fuse.js can match
  // release titles in other locales (e.g., "RRR" ↔ "Rise Roar Revolt").
  const tmdbHits = deduped.filter((it) => it.tmdbId && it.tmdbType).slice(0, 8);
  await Promise.all(
    tmdbHits.map(async (it) => {
      const path =
        it.tmdbType === "tv"
          ? `/tv/${it.tmdbId}/alternative_titles`
          : `/movie/${it.tmdbId}/alternative_titles`;
      const resp = await tmdb<{
        titles?: Array<{ title: string }>;
        results?: Array<{ title: string }>;
      }>(path);
      const list = resp?.titles || resp?.results || [];
      const alts = Array.from(
        new Set(list.map((t) => t.title).filter((t) => !!t && t !== it.title))
      ).slice(0, 6);
      if (alts.length) it.alternativeTitles = alts;
    })
  );

  return deduped;
}

// ---- Trailer (YouTube) ------------------------------------------------------
export async function fetchTrailerKey(item: MediaItem): Promise<string | null> {
  if (item.tmdbId && item.tmdbType) {
    const r = await tmdb<{
      results?: Array<{ key: string; site: string; type: string }>;
    }>(`/${item.tmdbType}/${item.tmdbId}/videos`);
    const yt = r?.results?.filter((v) => v.site === "YouTube") || [];
    // Priority: Trailer → Teaser → Clip → Featurette
    const order = ["Trailer", "Teaser", "Clip", "Featurette"];
    for (const t of order) {
      const hit = yt.find((v) => new RegExp(t, "i").test(v.type));
      if (hit) return hit.key;
    }
  }
  // Jikan trailerQuery may be either an 11-char YouTube ID or a search string.
  if (item.trailerQuery && /^[A-Za-z0-9_-]{11}$/.test(item.trailerQuery)) {
    return item.trailerQuery;
  }
  return null;
}

// Fetch overview in original language when English overview is empty/missing.
export async function fetchLocalizedOverview(item: MediaItem): Promise<string | null> {
  if (!item.tmdbId || !item.tmdbType || !item.originalLanguage) return null;
  const r = await tmdb<{ overview?: string }>(
    `/${item.tmdbType}/${item.tmdbId}`,
    { language: item.originalLanguage }
  );
  return r?.overview?.trim() || null;
}

// ---- Related (TMDB recommendations) ----------------------------------------
// For regional Indian titles (Hindi, Tamil, Telugu, etc.) we filter the
// recommendations through /discover with the same original_language so the
// suggested list stays inside the same regional industry.
const INDIAN_LANGS = new Set(["hi", "ta", "te", "ml", "kn", "bn", "mr", "pa", "gu"]);

export async function fetchRelated(item: MediaItem): Promise<MediaItem[]> {
  if (!item.tmdbId || !item.tmdbType) return [];

  const recs = await tmdb<TmdbResult>(
    `/${item.tmdbType}/${item.tmdbId}/recommendations`
  );
  const cat: MediaCategory = item.tmdbType === "tv" ? "drama" : "movie";

  const lang = item.originalLanguage;
  const isRegional = !!lang && INDIAN_LANGS.has(lang);

  if (isRegional && lang) {
    // Strict: only same-language recommendations
    const sameLang = mapTmdb(recs?.results, item.tmdbType, cat, {
      enforceLanguages: [lang],
    });
    if (sameLang.length >= 4) return sameLang;

    // Top up via /discover so the row never looks empty
    const discoverPath =
      item.tmdbType === "tv" ? "/discover/tv" : "/discover/movie";
    const langKey =
      item.tmdbType === "tv" ? "with_original_language" : "with_original_language";
    const extra = await tmdb<TmdbResult>(discoverPath, {
      [langKey]: lang,
      sort_by: "popularity.desc",
      region: "IN",
      "vote_count.gte": "20",
      include_adult: "false",
    });
    const extraMapped = mapTmdb(extra?.results, item.tmdbType, cat, {
      enforceLanguages: [lang],
    }).filter((x) => x.tmdbId !== item.tmdbId);

    const seen = new Set(sameLang.map((s) => s.id));
    for (const m of extraMapped) {
      if (!seen.has(m.id)) {
        sameLang.push(m);
        seen.add(m.id);
      }
    }
    return sameLang;
  }

  return mapTmdb(recs?.results, item.tmdbType, cat);
}
