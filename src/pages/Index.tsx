import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaRow } from "@/components/MediaRow";
import { TrendingSlider } from "@/components/TrendingSlider";
import { SearchPalette } from "@/components/SearchPalette";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { FilterSidebar, applyFilters, DEFAULT_FILTERS, Filters } from "@/components/FilterSidebar";
import { cacheWatchItem } from "@/pages/Watch";
import {
  fetchTrending,
  fetchSecondary,
  MediaCategory,
  MediaItem,
} from "@/lib/api";

interface RowDef {
  key: string;
  category: MediaCategory;
  label: string;
  navLabel: string;
  source: "trending" | "secondary";
  showInNav?: boolean;
}

// Distinct, horizontally scrolling sections — every category gets at least
// one primary row, plus a secondary row to make the home page feel full.
const ROWS: RowDef[] = [
  { key: "movie", category: "movie", label: "Trending Movies", navLabel: "Movies", source: "trending", showInNav: true },
  { key: "drama", category: "drama", label: "Popular Dramas", navLabel: "Dramas", source: "trending", showInNav: true },
  { key: "anime", category: "anime", label: "Trending Anime", navLabel: "Anime", source: "trending", showInNav: true },
  { key: "manga", category: "manga", label: "Top Manga", navLabel: "Manga", source: "trending", showInNav: true },
  { key: "book", category: "book", label: "Bestselling Books", navLabel: "Books", source: "trending", showInNav: true },
  { key: "movie-recent", category: "movie", label: "Recent Movies in Theaters", navLabel: "Recent Movies", source: "secondary" },
  { key: "anime-season", category: "anime", label: "This Season's Anime", navLabel: "Seasonal Anime", source: "secondary" },
  { key: "drama-top", category: "drama", label: "Top Rated Dramas", navLabel: "Top Dramas", source: "secondary" },
  { key: "manga-popular", category: "manga", label: "Most Popular Manga", navLabel: "Popular Manga", source: "secondary" },
  { key: "book-fantasy", category: "book", label: "Fantasy Bookshelf", navLabel: "Fantasy Books", source: "secondary" },
];

const NAV_CATEGORIES = ROWS.filter((r) => r.showInNav);

const scrollToSection = (key: string) => {
  const el = document.getElementById(`section-${key}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Smart routing: dramas → /watch, reading → /read, others → /title
  const handleSelect = (item: MediaItem) => {
    if (item.category === "drama") {
      cacheWatchItem(item);
      navigate(`/watch/${encodeURIComponent(item.id)}`);
      return;
    }
    try {
      sessionStorage.setItem("storyhub_watch_" + item.id, JSON.stringify(item));
    } catch { /* ignore */ }
    const route =
      item.category === "manga" || item.category === "book" ? "read" : "title";
    navigate(`/${route}/${encodeURIComponent(item.id)}`);
  };

  // Restore search on back-nav
  useEffect(() => {
    const saved = sessionStorage.getItem("storyhub_query");
    if (saved) setQuery(saved);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("storyhub_query", query);
  }, [query]);

  const rowQueries = ROWS.map((r) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["row", r.key],
      queryFn: () =>
        r.source === "trending"
          ? fetchTrending(r.category)
          : fetchSecondary(r.category),
      staleTime: 1000 * 60 * 10,
    })
  );

  // Apply filters per row, and hide categories not selected (when filter active)
  const filteredRows = useMemo(() => {
    return ROWS.map((r, i) => {
      const items = rowQueries[i].data || [];
      const filtered = applyFilters(items, filters);
      const visible =
        filters.categories.length === 0 ||
        filters.categories.includes(r.category);
      return {
        ...r,
        items: filtered,
        visible,
        loading: rowQueries[i].isLoading,
      };
    });
  }, [rowQueries, filters]);

  const activeFilterCount =
    filters.categories.length +
    filters.genres.length +
    (filters.status !== "any" ? 1 : 0) +
    (filters.sort !== "popularity" ? 1 : 0) +
    (filters.yearMin !== DEFAULT_FILTERS.yearMin ||
    filters.yearMax !== DEFAULT_FILTERS.yearMax
      ? 1
      : 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen((v) => !v)}
                className="gap-2 lg:hidden"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <button
                type="button"
                onClick={scrollToTop}
                className="text-2xl font-extrabold tracking-tight transition-opacity hover:opacity-80"
                aria-label="StoryHub home"
              >
                <span className="text-primary">Story</span>Hub
              </button>
            </div>
            <div className="flex flex-1 items-center gap-2 sm:justify-end">
              <SearchPalette
                initialQuery={query}
                onQueryChange={setQuery}
                onSelect={handleSelect}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/my-list")}
                className="gap-1.5"
                aria-label="My List"
              >
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">My List</span>
              </Button>
            </div>
          </div>
          <nav aria-label="Categories">
            <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {NAV_CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => navigate(`/category/${c.category}`)}
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

      <div className="mx-auto flex max-w-[1500px]">
        <FilterSidebar
          open={sidebarOpen}
          filters={filters}
          onChange={setFilters}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 space-y-8 py-8">
          <TrendingSlider
            items={rowQueries[1].data || rowQueries[0].data || []}
            loading={rowQueries[1].isLoading}
            onPlay={handleSelect}
            onMore={handleSelect}
          />

          <ContinueWatchingRow />

          {filteredRows.map((row) =>
            row.visible ? (
              <MediaRow
                key={row.key}
                id={`section-${row.key}`}
                title={row.label}
                items={row.items}
                loading={row.loading}
                onSelect={handleSelect}
              />
            ) : null
          )}

          {filteredRows.every((r) => !r.visible || r.items.length === 0) &&
            !filteredRows.some((r) => r.loading) && (
              <p className="px-4 text-muted-foreground sm:px-8">
                No results match your filters. Try resetting them.
              </p>
            )}
        </main>
      </div>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Data: TMDB · Jikan (MyAnimeList) · Open Library — TMDB requests proxied
        via corsproxy.io
      </footer>
    </div>
  );
};

export default Index;
