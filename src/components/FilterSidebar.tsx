import { useMemo } from "react";
import { Filter, RotateCcw, Sparkles, Tags, CalendarDays, Activity, TrendingUp, Film, Tv, Sparkle, BookOpen, BookText } from "lucide-react";
import { MediaCategory } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type StatusFilter = "any" | "ongoing" | "completed";
export type SortFilter = "popularity" | "rating" | "year_desc" | "year_asc" | "az";

export interface Filters {
  categories: MediaCategory[]; // empty = all
  genres: string[]; // empty = all (substring match against title/overview)
  yearMin: number;
  yearMax: number;
  status: StatusFilter;
  sort: SortFilter;
}

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  genres: [],
  yearMin: 1980,
  yearMax: new Date().getFullYear(),
  status: "any",
  sort: "popularity",
};

const CATEGORIES: { key: MediaCategory; label: string; icon: typeof Film }[] = [
  { key: "movie", label: "Movies", icon: Film },
  { key: "drama", label: "Dramas", icon: Tv },
  { key: "anime", label: "Anime", icon: Sparkle },
  { key: "manga", label: "Manga", icon: BookText },
  { key: "book", label: "Books", icon: BookOpen },
];

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
  "Slice of Life", "Historical",
];

const SORTS: { key: SortFilter; label: string }[] = [
  { key: "popularity", label: "Popularity" },
  { key: "rating", label: "Rating" },
  { key: "year_desc", label: "Newest" },
  { key: "year_asc", label: "Oldest" },
  { key: "az", label: "A → Z" },
];

interface Props {
  open: boolean;
  filters: Filters;
  onChange: (next: Filters) => void;
  onClose?: () => void;
}

export const FilterSidebar = ({ open, filters, onChange, onClose }: Props) => {
  const isDefault = useMemo(
    () => JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS),
    [filters]
  );

  const toggleCategory = (k: MediaCategory) => {
    const has = filters.categories.includes(k);
    onChange({
      ...filters,
      categories: has
        ? filters.categories.filter((c) => c !== k)
        : [...filters.categories, k],
    });
  };

  const toggleGenre = (g: string) => {
    const has = filters.genres.includes(g);
    onChange({
      ...filters,
      genres: has ? filters.genres.filter((x) => x !== g) : [...filters.genres, g],
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden
      />
      <aside
        aria-label="Filters"
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[300px] border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300",
          "lg:sticky lg:top-[57px] lg:z-20 lg:h-[calc(100vh-57px)] lg:translate-x-0 lg:bg-card/40",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(DEFAULT_FILTERS)}
              disabled={isDefault}
              className="h-7 gap-1.5 text-xs"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-6 pb-8">
              {/* Categories */}
              <Group icon={Sparkles} title="Category">
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((c) => {
                    const active = filters.categories.includes(c.key);
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => toggleCategory(c.key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all",
                          active
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </Group>

              {/* Genre */}
              <Group icon={Tags} title="Genre">
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((g) => {
                    const active = filters.genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </Group>

              {/* Year range */}
              <Group icon={CalendarDays} title="Release Year">
                <div className="flex items-center gap-2">
                  <YearInput
                    value={filters.yearMin}
                    onChange={(v) =>
                      onChange({ ...filters, yearMin: Math.min(v, filters.yearMax) })
                    }
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <YearInput
                    value={filters.yearMax}
                    onChange={(v) =>
                      onChange({ ...filters, yearMax: Math.max(v, filters.yearMin) })
                    }
                  />
                </div>
              </Group>

              {/* Status */}
              <Group icon={Activity} title="Status">
                <div className="flex gap-1.5">
                  {(["any", "ongoing", "completed"] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onChange({ ...filters, status: s })}
                      className={cn(
                        "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-all",
                        filters.status === s
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Group>

              {/* Sort */}
              <Group icon={TrendingUp} title="Sort by">
                <div className="grid grid-cols-1 gap-1">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => onChange({ ...filters, sort: s.key })}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
                        filters.sort === s.key
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {s.label}
                      {filters.sort === s.key && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </Group>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
};

const Group = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Film;
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3 text-primary" />
      {title}
    </div>
    {children}
  </div>
);

const YearInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <input
    type="number"
    min={1900}
    max={new Date().getFullYear() + 2}
    value={value}
    onChange={(e) => {
      const n = Number(e.target.value);
      if (!Number.isNaN(n)) onChange(n);
    }}
    className="w-full rounded-md border border-border bg-background/60 px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
  />
);

// ---- Filter application helper --------------------------------------------
export const applyFilters = <T extends { category: MediaCategory; title: string; overview?: string; year?: string; rating?: number }>(
  items: T[],
  f: Filters
): T[] => {
  const list = items.filter((it) => {
    if (f.categories.length && !f.categories.includes(it.category)) return false;

    const y = it.year ? Number(it.year) : NaN;
    if (!Number.isNaN(y)) {
      if (y < f.yearMin || y > f.yearMax) return false;
    }

    if (f.genres.length) {
      const hay = `${it.title} ${it.overview || ""}`.toLowerCase();
      const ok = f.genres.some((g) => hay.includes(g.toLowerCase()));
      if (!ok) return false;
    }

    if (f.status !== "any") {
      // Heuristic: items with no year OR year >= currentYear treated as ongoing.
      const currentYear = new Date().getFullYear();
      const isOngoing = !it.year || (Number(it.year) >= currentYear);
      if (f.status === "ongoing" && !isOngoing) return false;
      if (f.status === "completed" && isOngoing) return false;
    }

    return true;
  });

  const sorted = [...list];
  switch (f.sort) {
    case "rating":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "year_desc":
      sorted.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
      break;
    case "year_asc":
      sorted.sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
      break;
    case "az":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "popularity":
    default:
      // keep API order (already popularity-ranked)
      break;
  }
  return sorted;
};
