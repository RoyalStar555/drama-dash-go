import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MediaRow } from "@/components/MediaRow";
import { DetailModal } from "@/components/DetailModal";
import {
  fetchTrending,
  searchAll,
  MediaCategory,
  MediaItem,
} from "@/lib/api";

const CATEGORIES: { key: MediaCategory; label: string; navLabel: string }[] = [
  { key: "movie", label: "Trending Movies", navLabel: "Movies" },
  { key: "drama", label: "Popular Dramas", navLabel: "Dramas" },
  { key: "anime", label: "Top Anime", navLabel: "Anime" },
  { key: "manga", label: "Top Manga", navLabel: "Manga" },
  { key: "book", label: "Bestselling Books", navLabel: "Books" },
];

const scrollToSection = (key: string) => {
  const el = document.getElementById(`section-${key}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const Index = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  // Restore search on back-nav
  useEffect(() => {
    const saved = sessionStorage.getItem("storyhub_query");
    if (saved) setQuery(saved);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("storyhub_query", query);
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const trendingQueries = CATEGORIES.map((c) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["trending", c.key],
      queryFn: () => fetchTrending(c.key),
      staleTime: 1000 * 60 * 10,
    })
  );

  const searchQuery = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchAll(debounced),
    enabled: debounced.length > 1,
    staleTime: 1000 * 60 * 5,
  });

  const isSearching = debounced.length > 1;
  const grouped = useMemo(() => {
    const g: Record<MediaCategory, MediaItem[]> = {
      movie: [],
      drama: [],
      anime: [],
      manga: [],
      book: [],
    };
    (searchQuery.data || []).forEach((it) => g[it.category].push(it));
    return g;
  }, [searchQuery.data]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={scrollToTop}
              className="self-start text-2xl font-extrabold tracking-tight transition-opacity hover:opacity-80"
              aria-label="StoryHub home"
            >
              <span className="text-primary">Story</span>Hub
            </button>
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, dramas, anime, manga, books…"
                className="pl-9"
                aria-label="Search StoryHub"
              />
            </div>
          </div>
          <nav aria-label="Categories">
            <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(c.key)}
                    className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {c.navLabel}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 py-8">
        {!isSearching && (
          <div className="px-4 sm:px-8">
            <div className="rounded-xl bg-gradient-to-r from-primary/30 via-primary/10 to-transparent p-6 sm:p-10">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Discover stories worth watching, reading & loving.
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Movies, K-dramas, anime, manga, and books — all in one place.
                Click any title to watch the trailer.
              </p>
            </div>
          </div>
        )}

        {isSearching ? (
          <>
            <h2 className="px-4 text-lg text-muted-foreground sm:px-8">
              {searchQuery.isLoading
                ? `Searching for "${debounced}"…`
                : `Results for "${debounced}"`}
            </h2>
            {CATEGORIES.map((c) =>
              grouped[c.key].length > 0 ? (
                <MediaRow
                  key={c.key}
                  title={c.label.replace(/^(Trending |Popular |Top |Bestselling )/, "")}
                  items={grouped[c.key]}
                  onSelect={setSelected}
                />
              ) : null
            )}
            {!searchQuery.isLoading &&
              (searchQuery.data?.length || 0) === 0 && (
                <p className="px-4 text-muted-foreground sm:px-8">
                  No results found.
                </p>
              )}
          </>
        ) : (
          CATEGORIES.map((c, i) => (
            <MediaRow
              key={c.key}
              id={`section-${c.key}`}
              title={c.label}
              items={trendingQueries[i].data || []}
              loading={trendingQueries[i].isLoading}
              onSelect={setSelected}
            />
          ))
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Data: TMDB · Jikan (MyAnimeList) · Open Library — TMDB requests proxied
        via corsproxy.io
      </footer>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Index;
