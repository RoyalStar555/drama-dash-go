import { useEffect, useState } from "react";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem, PLACEHOLDER } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  items: MediaItem[];
  loading?: boolean;
  onPlay: (item: MediaItem) => void;
  onMore: (item: MediaItem) => void;
}

export const TrendingSlider = ({ items, loading, onPlay, onMore }: Props) => {
  const slides = items.filter((i) => i.backdrop).slice(0, 6);
  const [index, setIndex] = useState(0);

  // Autoplay
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000
    );
    return () => clearInterval(t);
  }, [slides.length]);

  // Reset if list changes
  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="mx-4 sm:mx-8">
        <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-muted sm:aspect-[21/9]" />
      </section>
    );
  }
  if (slides.length === 0) return null;

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section
      className="relative isolate mx-4 overflow-hidden rounded-2xl sm:mx-8"
      aria-label="Trending"
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <img
              src={s.backdrop || s.poster}
              alt={s.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
              }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 hero-vignette" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
              <div className="glass max-w-2xl rounded-xl p-5 sm:p-6">
                <span className="inline-block rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Trending · {s.category}
                </span>
                <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                  {s.title}
                </h2>
                {s.overview && (
                  <p className="mt-3 line-clamp-2 text-sm text-foreground/85 sm:text-base">
                    {s.overview}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onPlay(s)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    Watch Trailer
                  </button>
                  <button
                    type="button"
                    onClick={() => onMore(s)}
                    className="inline-flex items-center gap-2 rounded-md bg-secondary/80 px-5 py-2.5 text-sm font-semibold text-secondary-foreground backdrop-blur transition-colors hover:bg-secondary"
                  >
                    <Info className="h-4 w-4" />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/40 p-2 text-foreground backdrop-blur transition hover:bg-background/70 sm:block"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/40 p-2 text-foreground backdrop-blur transition hover:bg-background/70 sm:block"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-primary" : "w-2 bg-foreground/40"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
