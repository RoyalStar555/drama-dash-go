import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchTrending,
  fetchSecondary,
  MediaCategory,
  MediaItem,
} from "@/lib/api";
import { MOCK_BY_CATEGORY } from "@/lib/mockData";
import { cacheWatchItem } from "@/pages/Watch";

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  movie: "Movies",
  drama: "Dramas",
  anime: "Anime",
  manga: "Manga",
  book: "Books",
};

const VALID: MediaCategory[] = ["movie", "drama", "anime", "manga", "book"];

const Category = () => {
  const { category = "" } = useParams();
  const navigate = useNavigate();

  const cat = (VALID as string[]).includes(category)
    ? (category as MediaCategory)
    : null;

  const { data: trending = [], isLoading: loadingT } = useQuery({
    queryKey: ["category-trending", cat],
    queryFn: () => (cat ? fetchTrending(cat) : Promise.resolve([])),
    enabled: !!cat,
    staleTime: 1000 * 60 * 10,
  });

  const { data: secondary = [], isLoading: loadingS } = useQuery({
    queryKey: ["category-secondary", cat],
    queryFn: () => (cat ? fetchSecondary(cat) : Promise.resolve([])),
    enabled: !!cat,
    staleTime: 1000 * 60 * 10,
  });

  // Strict: only items whose `category` exactly matches. Always guarantee 5
  // unique high-quality entries by topping up from curated mocks.
  const items = useMemo<MediaItem[]>(() => {
    if (!cat) return [];
    const seen = new Set<string>();
    const out: MediaItem[] = [];
    const push = (list: MediaItem[]) => {
      for (const i of list) {
        if (i.category !== cat) continue;
        const key = i.title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(i);
      }
    };
    push(trending);
    push(secondary);
    push(MOCK_BY_CATEGORY[cat] || []);
    return out;
  }, [cat, trending, secondary]);

  const loading = loadingT && loadingS && items.length === 0;

  const handleSelect = (item: MediaItem) => {
    if (item.category === "drama") {
      cacheWatchItem(item);
      navigate(`/watch/${encodeURIComponent(item.id)}`);
      return;
    }
    try {
      sessionStorage.setItem(
        "storyhub_watch_" + item.id,
        JSON.stringify(item)
      );
    } catch {
      /* ignore */
    }
    // Reading content uses /read/:id, video content uses /title/:id
    const route =
      item.category === "manga" || item.category === "book" ? "read" : "title";
    navigate(`/${route}/${encodeURIComponent(item.id)}`);
  };

  if (!cat) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Home
        </Button>
        <p className="mt-6 text-muted-foreground">Unknown category.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <h1 className="text-xl font-extrabold sm:text-2xl">
            <span className="text-primary">Story</span>Hub
            <span className="ml-2 text-muted-foreground">
              · {CATEGORY_LABELS[cat]}
            </span>
          </h1>
          <span className="w-10 sm:w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h2 className="mb-6 text-2xl font-extrabold">
          All {CATEGORY_LABELS[cat]}
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.slice(0, 30).map((item) => (
              <div key={item.id} className="flex justify-center">
                <MediaCard item={item} onClick={handleSelect} />
              </div>
            ))}
          </div>
        )}
        {!loading && items.length < 5 && (
          <p className="mt-6 text-sm text-muted-foreground">
            Showing curated picks while live data loads.
          </p>
        )}
      </main>
    </div>
  );
};

export default Category;
