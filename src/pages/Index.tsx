import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaRow } from "@/components/MediaRow";
import { DetailModal } from "@/components/DetailModal";
import { TrendingSlider } from "@/components/TrendingSlider";
import { SearchPalette } from "@/components/SearchPalette";
import { FilterSidebar, applyFilters, DEFAULT_FILTERS, Filters } from "@/components/FilterSidebar";
import { cacheWatchItem } from "@/pages/Watch";
import {
  fetchTrending,
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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Drama → Watch page directly. Other categories → modal.
  const handleSelect = (item: MediaItem) => {
    if (item.category === "drama") {
      cacheWatchItem(item);
      navigate(`/watch/${encodeURIComponent(item.id)}`);
      return;
    }
    setSelected(item);
  };

  // Restore search on back-nav
  useEffect(() => {
    const saved = sessionStorage.getItem("storyhub_query");
    if (saved) setQuery(saved);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("storyhub_query", query);
  }, [query]);

  const trendingQueries = CATEGORIES.map((c) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["trending", c.key],
      queryFn: () => fetchTrending(c.key),
      staleTime: 1000 * 60 * 10,
    })
  );

  // Apply filters per row, and hide categories not selected (when filter active)
  const filteredRows = useMemo(() => {
    return CATEGORIES.map((c, i) => {
      const items = trendingQueries[i].data || [];
      const filtered = applyFilters(items, filters);
      const visible =
        filters.categories.length === 0 || filters.categories.includes(c.key);
      return {
        ...c,
        items: filtered,
        visible,
        loading: trendingQueries[i].isLoading,
      };
    });
  }, [trendingQueries, filters]);

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
            <SearchPalette
              initialQuery={query}
              onQueryChange={setQuery}
              onSelect={handleSelect}
            />
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

      <div className="mx-auto flex max-w-[1500px]">
        <FilterSidebar
          open={sidebarOpen}
          filters={filters}
          onChange={setFilters}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 space-y-8 py-8">
          <TrendingSlider
            items={trendingQueries[1].data || trendingQueries[0].data || []}
            loading={trendingQueries[1].isLoading}
            onPlay={handleSelect}
            onMore={handleSelect}
          />

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

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Index;
