/**
 * Unified media types for StoryHub.
 * All API providers normalize to MediaItem.
 */
export type MediaCategory = "anime" | "manga" | "movies" | "books";

export interface MediaItem {
  id: string;
  category: MediaCategory;
  title: string;
  image: string;
  description?: string;
  rating?: number;
  year?: number;
  author?: string;
  genres?: string[];
  externalUrl?: string;
}

export const CATEGORY_META: Record<
  MediaCategory,
  { label: string; path: string; cta: string; gradient: string }
> = {
  anime: { label: "Anime", path: "/anime", cta: "Watch Now", gradient: "from-rose-500 to-orange-500" },
  manga: { label: "Manga", path: "/manga", cta: "Read Now", gradient: "from-violet-500 to-fuchsia-500" },
  movies: { label: "Movies & Drama", path: "/movies", cta: "Watch Now", gradient: "from-sky-500 to-indigo-500" },
  books: { label: "Books", path: "/books", cta: "Read Now", gradient: "from-emerald-500 to-teal-500" },
};
