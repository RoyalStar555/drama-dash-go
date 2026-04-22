import type { MediaCategory, MediaItem } from "./types";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='%23222'/><stop offset='1' stop-color='%23000'/>
      </linearGradient></defs>
      <rect width='300' height='450' fill='url(%23g)'/>
      <text x='50%' y='50%' fill='%23888' font-family='sans-serif' font-size='20' text-anchor='middle'>No Image</text>
    </svg>`,
  );

export const fallbackImage = FALLBACK_IMAGE;

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

/* ---------- Anime / Manga via Jikan (MyAnimeList) ---------- */
async function searchJikan(kind: "anime" | "manga", query: string, limit = 24): Promise<MediaItem[]> {
  const url = query
    ? `https://api.jikan.moe/v4/${kind}?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`
    : `https://api.jikan.moe/v4/top/${kind}?limit=${limit}`;
  const data = await jsonFetch<{ data: any[] }>(url);
  return (data.data || []).map((d) => ({
    id: String(d.mal_id),
    category: kind,
    title: d.title_english || d.title,
    image: d.images?.webp?.large_image_url || d.images?.jpg?.large_image_url || FALLBACK_IMAGE,
    description: d.synopsis ?? undefined,
    rating: d.score ?? undefined,
    year: d.year ?? (d.aired?.from ? new Date(d.aired.from).getFullYear() : d.published?.from ? new Date(d.published.from).getFullYear() : undefined),
    genres: d.genres?.map((g: any) => g.name) ?? [],
    externalUrl: d.url,
  }));
}

/* ---------- Movies & Drama via TVMaze (no API key) ---------- */
async function searchMovies(query: string, limit = 24): Promise<MediaItem[]> {
  const url = query
    ? `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
    : `https://api.tvmaze.com/shows?page=0`;
  const data = await jsonFetch<any[]>(url);
  const list = query ? data.map((d: any) => d.show) : data;
  return list.slice(0, limit).map((d: any) => ({
    id: String(d.id),
    category: "movies" as const,
    title: d.name,
    image: d.image?.original || d.image?.medium || FALLBACK_IMAGE,
    description: d.summary ? d.summary.replace(/<[^>]+>/g, "") : undefined,
    rating: d.rating?.average ?? undefined,
    year: d.premiered ? new Date(d.premiered).getFullYear() : undefined,
    genres: d.genres ?? [],
    externalUrl: d.officialSite || d.url,
  }));
}

/* ---------- Books via Open Library ---------- */
async function searchBooks(query: string, limit = 24): Promise<MediaItem[]> {
  const q = query || "bestseller";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`;
  const data = await jsonFetch<{ docs: any[] }>(url);
  return (data.docs || []).map((d) => ({
    id: d.key,
    category: "books" as const,
    title: d.title,
    image: d.cover_i
      ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
      : FALLBACK_IMAGE,
    description: d.first_sentence?.[0] || (Array.isArray(d.subject) ? d.subject.slice(0, 6).join(" • ") : undefined),
    rating: d.ratings_average ?? undefined,
    year: d.first_publish_year ?? undefined,
    author: Array.isArray(d.author_name) ? d.author_name.join(", ") : undefined,
    genres: Array.isArray(d.subject) ? d.subject.slice(0, 5) : [],
    externalUrl: `https://openlibrary.org${d.key}`,
  }));
}

export async function searchCategory(
  category: MediaCategory,
  query: string,
): Promise<MediaItem[]> {
  switch (category) {
    case "anime":
      return searchJikan("anime", query);
    case "manga":
      return searchJikan("manga", query);
    case "movies":
      return searchMovies(query);
    case "books":
      return searchBooks(query);
  }
}

export async function searchAll(query: string): Promise<MediaItem[]> {
  if (!query) return [];
  const results = await Promise.allSettled([
    searchJikan("anime", query, 8),
    searchJikan("manga", query, 8),
    searchMovies(query, 8),
    searchBooks(query, 8),
  ]);
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
