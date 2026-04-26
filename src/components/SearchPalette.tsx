import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchAll, MediaItem, MediaCategory, PLACEHOLDER } from "@/lib/api";
import { cacheWatchItem } from "@/pages/Watch";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  movie: "Movie",
  drama: "Drama",
  anime: "Anime",
  manga: "Manga",
  book: "Book",
};

interface Props {
  onSelect: (item: MediaItem) => void;
  initialQuery?: string;
  onQueryChange?: (q: string) => void;
}

export const SearchPalette = ({ onSelect, initialQuery = "", onQueryChange }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery.trim());
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onQueryChange?.(query);
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, onQueryChange]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data = [], isFetching } = useQuery({
    queryKey: ["palette-search", debounced],
    queryFn: () => searchAll(debounced),
    enabled: debounced.length > 1,
    staleTime: 1000 * 60 * 5,
  });

  const results = data.slice(0, 8);
  const showDropdown = open && debounced.length > 1;

  const pick = (it: MediaItem) => {
    setOpen(false);
    setQuery("");
    if (it.category === "drama") {
      cacheWatchItem(it);
      navigate(`/watch/${encodeURIComponent(it.id)}`);
    } else {
      onSelect(it);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full sm:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search movies, dramas, anime, manga, books…"
        className="pl-9 pr-9"
        aria-label="Search StoryHub"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover/95 shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Instant Results</span>
            {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          {isFetching && results.length === 0 ? (
            <ul className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 p-1.5">
                  <Skeleton className="h-14 w-10 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </li>
              ))}
            </ul>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{debounced}”
            </p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto p-1.5">
              {results.map((it, i) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(it)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                      i === active ? "bg-primary/15" : "hover:bg-muted/60"
                    )}
                  >
                    <img
                      src={it.poster || PLACEHOLDER}
                      alt=""
                      loading="lazy"
                      onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
                      className="h-14 w-10 flex-shrink-0 rounded-md object-cover ring-1 ring-border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {it.title}
                        </p>
                        <span className="flex-shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {CATEGORY_LABELS[it.category]}
                        </span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{it.year || "—"}</span>
                        {typeof it.rating === "number" && it.rating > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-primary">
                            <Star className="h-3 w-3" fill="currentColor" />
                            {it.rating.toFixed(1)}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
            <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">↑↓</kbd> navigate ·{" "}
            <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">↵</kbd> open ·{" "}
            <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">esc</kbd> close
          </div>
        </div>
      )}
    </div>
  );
};
