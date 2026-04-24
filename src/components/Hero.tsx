import { Play, Info } from "lucide-react";
import { MediaItem, PLACEHOLDER } from "@/lib/api";

interface Props {
  item: MediaItem | null;
  loading?: boolean;
  onPlay: (item: MediaItem) => void;
  onMore: (item: MediaItem) => void;
}

export const Hero = ({ item, loading, onPlay, onMore }: Props) => {
  return (
    <section
      className="relative isolate mx-4 overflow-hidden rounded-2xl sm:mx-8"
      aria-label="Featured trailer"
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {item ? (
          <img
            src={item.poster}
            alt={item.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
            }}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-muted" />
        )}
        <div className="absolute inset-0 hero-vignette" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
          <div className="glass max-w-2xl rounded-xl p-5 sm:p-6">
            <span className="inline-block rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Featured
            </span>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {loading ? "Loading featured title…" : item?.title || "Discover Stories"}
            </h1>
            {item?.overview && (
              <p className="mt-3 line-clamp-3 text-sm text-foreground/85 sm:text-base">
                {item.overview}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!item}
                onClick={() => item && onPlay(item)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                Watch Trailer
              </button>
              <button
                type="button"
                disabled={!item}
                onClick={() => item && onMore(item)}
                className="inline-flex items-center gap-2 rounded-md bg-secondary/80 px-5 py-2.5 text-sm font-semibold text-secondary-foreground backdrop-blur transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <Info className="h-4 w-4" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
