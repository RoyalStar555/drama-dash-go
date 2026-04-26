import { useNavigate } from "react-router-dom";
import { Play, X } from "lucide-react";
import { useMyList } from "@/hooks/useMyList";
import { PLACEHOLDER } from "@/lib/api";
import { cacheWatchItem } from "@/pages/Watch";
import { cn } from "@/lib/utils";

export const ContinueWatchingRow = () => {
  const { list, remove } = useMyList();

  const items = list
    .filter((e) => e.status === "watching" && (e.lastViewedAt || e.watched.length > 0))
    .sort((a, b) => (b.lastViewedAt || 0) - (a.lastViewedAt || 0))
    .slice(0, 12);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between px-4 sm:px-8">
        <h2 className="text-xl font-bold md:text-2xl">Continue Watching</h2>
        <span className="text-xs text-muted-foreground">
          {items.length} in progress
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin]">
        {items.map((entry) => {
          const total = entry.knownTotal || 12;
          const watchedCount = entry.watched.length;
          const pct = Math.min(100, Math.round((watchedCount / total) * 100));
          const nextEp =
            entry.watched.length === 0
              ? 1
              : Math.max(...entry.watched) + 1;
          const item = entry.item;

          const onPlay = () => {
            if (item.category === "drama") {
              cacheWatchItem(item);
              location.assign(`/watch/${encodeURIComponent(item.id)}`);
            } else {
              location.assign(`/title/${encodeURIComponent(item.id)}`);
            }
          };

          return (
            <div
              key={item.id}
              className="group relative w-64 flex-shrink-0 overflow-hidden rounded-xl bg-card shadow-md ring-1 ring-border/60 transition-all hover:scale-[1.03] hover:ring-primary/60"
            >
              <button
                type="button"
                onClick={onPlay}
                className="block w-full text-left"
                aria-label={`Continue watching ${item.title}`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={item.backdrop || item.poster || PLACEHOLDER}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl ring-2 ring-primary-foreground/20">
                      <Play className="h-5 w-5" fill="currentColor" />
                    </span>
                  </span>
                  {/* Progress bar */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-background/60">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {watchedCount > 0
                      ? `Up next · Episode ${nextEp}`
                      : `Start watching`}
                    {" · "}
                    <span className={cn("font-medium", pct > 0 && "text-primary")}>
                      {pct}%
                    </span>
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                }}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100"
                aria-label="Remove from continue watching"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
