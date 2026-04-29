// Unified media API for StoryHub
// TMDB requests are routed through corsproxy.io to bypass ISP/region blocks.

export type MediaCategory = "movie" | "drama" | "anime" | "manga" | "book";

// Smart switcher: 'video' opens the HLS player, 'reading' opens the webtoon reader.
export type ContentType = "video" | "reading";

export interface MediaEpisode {
  number: number;
  title: string;
  runtime?: string;
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
}

// Derive contentType from category when not explicitly set.
export const getContentType = (item: MediaItem): ContentType =>
  item.contentType ??
  (item.category === "manga" || item.category === "book" ? "reading" : "video");

// ---- Config -----------------------------------------------------------------
// Public TMDB v3 demo key path; users can swap via localStorage `tmdb_key`.
const DEFAULT_TMDB_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const getTmdbKey = () =>
  (typeof window !== "undefined" && localStorage.getItem("tmdb_key")) ||
  DEFAULT_TMDB_KEY;

const CORS_PROXY = "https://corsproxy.io/?";
const proxied = (url: string) => `${CORS_PROXY}${encodeURIComponent(url)}`;

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";
export const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'><rect width='100%' height='100%' fill='#1a1a1a'/><text x='50%' y='50%' fill='#666' font-family='sans-serif' font-size='20' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>`
  );

// ---- Fetch helpers ----------------------------------------------------------
async function safeJson<T>(url: string, useProxy = false): Promise<T | null> {
  try {
    const res = await fetch(useProxy ? proxied(url) : url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---- TMDB (Movies + Drama/TV) via CORS proxy --------------------------------
async function tmdb<T>(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ api_key: getTmdbKey(), ...params });
  const url = `https://api.themoviedb.org/3${path}?${qs.toString()}`;
  return safeJson<T>(url, true);
}

interface TmdbResult {
  results?: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    vote_average?: number;
  }>;
}

function mapTmdb(
  results: TmdbResult["results"] = [],
  type: "movie" | "tv",
  category: MediaCategory
): MediaItem[] {
  return results.map((r) => ({
    id: `tmdb-${type}-${r.id}`,
    category,
    title: r.title || r.name || "Untitled",
    poster: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : PLACEHOLDER,
    backdrop: r.backdrop_path ? `${TMDB_BACKDROP}${r.backdrop_path}` : undefined,
    year: (r.release_date || r.first_air_date || "").slice(0, 4),
    overview: r.overview,
    rating: r.vote_average,
    tmdbId: r.id,
    tmdbType: type,
  }));
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
  }>;
}

function mapJikan(
  d: JikanResp["data"] = [],
  category: "anime" | "manga"
): MediaItem[] {
  return d.map((r) => ({
    id: `jikan-${category}-${r.mal_id}`,
    category,
    title: r.title_english || r.title,
    poster:
      r.images?.jpg?.large_image_url ||
      r.images?.jpg?.image_url ||
      PLACEHOLDER,
    year: (r.aired?.from || r.published?.from || "").slice(0, 4),
    overview: r.synopsis,
    rating: r.score,
    trailerQuery: r.trailer?.youtube_id
      ? r.trailer.youtube_id
      : `${r.title} ${category} trailer`,
    externalUrl: r.url,
  }));
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
  return d.map((r) => ({
    id: `ol-${r.key}`,
    category: "book" as const,
    title: r.title,
    poster: r.cover_i
      ? `https://covers.openlibrary.org/b/id/${r.cover_i}-L.jpg`
      : PLACEHOLDER,
    year: r.first_publish_year ? String(r.first_publish_year) : undefined,
    overview: r.author_name ? `By ${r.author_name.join(", ")}` : undefined,
    trailerQuery: `${r.title} book review`,
    externalUrl: `https://openlibrary.org${r.key}`,
  }));
}

// ---- Public API -------------------------------------------------------------
import { MOCK_BY_CATEGORY } from "./mockData";

// Always merge mock items so categories never appear empty.
function withFallback(items: MediaItem[], category: MediaCategory): MediaItem[] {
  const mocks = MOCK_BY_CATEGORY[category] || [];
  if (items.length >= 5) return items;
  // Append mocks that aren't already present (by title) until we have plenty.
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

// Secondary feeds — used to populate distinct rows like "Recent Movies",
// "Trending Anime This Season", etc. Falls back to mocks when offline.
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

export async function searchAll(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const q = encodeURIComponent(query);

  const [movie, tv, anime, manga, books] = await Promise.all([
    tmdb<TmdbResult>("/search/movie", { query }),
    tmdb<TmdbResult>("/search/tv", { query }),
    safeJson<JikanResp>(`https://api.jikan.moe/v4/anime?q=${q}&limit=10`),
    safeJson<JikanResp>(`https://api.jikan.moe/v4/manga?q=${q}&limit=10`),
    safeJson<OLResp>(`https://openlibrary.org/search.json?q=${q}&limit=10`),
  ]);

  return [
    ...mapTmdb(movie?.results, "movie", "movie"),
    ...mapTmdb(tv?.results, "tv", "drama"),
    ...mapJikan(anime?.data, "anime"),
    ...mapJikan(manga?.data, "manga"),
    ...mapOL(books?.docs),
  ];
}

// ---- Trailer (YouTube) ------------------------------------------------------
export async function fetchTrailerKey(item: MediaItem): Promise<string | null> {
  if (item.tmdbId && item.tmdbType) {
    const r = await tmdb<{
      results?: Array<{ key: string; site: string; type: string }>;
    }>(`/${item.tmdbType}/${item.tmdbId}/videos`);
    const yt = r?.results?.find(
      (v) => v.site === "YouTube" && /Trailer|Teaser/i.test(v.type)
    );
    if (yt) return yt.key;
  }
  // For Jikan items we may already have a YouTube ID
  if (item.trailerQuery && /^[A-Za-z0-9_-]{11}$/.test(item.trailerQuery)) {
    return item.trailerQuery;
  }
  return null;
}

// ---- Related (TMDB recommendations) ----------------------------------------
export async function fetchRelated(item: MediaItem): Promise<MediaItem[]> {
  if (item.tmdbId && item.tmdbType) {
    const r = await tmdb<TmdbResult>(
      `/${item.tmdbType}/${item.tmdbId}/recommendations`
    );
    return mapTmdb(
      r?.results,
      item.tmdbType,
      item.tmdbType === "tv" ? "drama" : "movie"
    );
  }
  return [];
}
