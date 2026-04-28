import { useEffect, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HlsPlayer } from "@/components/HlsPlayer";
import { MediaItem, PLACEHOLDER, getContentType, DEMO_HLS_URL, generatePages } from "@/lib/api";
import { cn } from "@/lib/utils";

// Re-export for callers that imported it from this module.
export const DEMO_HLS_SRC = DEMO_HLS_URL;

interface Props {
  item: MediaItem;
  /** Currently selected episode (video) or chapter (reading). */
  currentSelection: number;
  total: number;
  onClose: () => void;
  onSelectionChange: (n: number) => void;
  visible: boolean;
}

/**
 * Central conditional Media Engine.
 * - contentType === 'video'   → HLS player + Cinema Mode toggle
 * - contentType === 'reading' → Webtoon vertical reader + Dark/Light toggle
 */
export const MediaViewer = ({
  item,
  currentSelection,
  total,
  onClose,
  onSelectionChange,
  visible,
}: Props) => {
  const contentType = getContentType(item);
  const isReading = contentType === "reading";

  const [cinema, setCinema] = useState(false);
  const [readerLight, setReaderLight] = useState(false);

  // Reset modes when switching items
  useEffect(() => {
    setCinema(false);
    setReaderLight(false);
  }, [item.id]);

  const goPrev = () => {
    if (currentSelection > 1) onSelectionChange(currentSelection - 1);
  };
  const goNext = () => {
    if (currentSelection < total) onSelectionChange(currentSelection + 1);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col backdrop-blur-sm transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
        // Reader light mode flips the entire surface
        isReading && readerLight ? "bg-white/95" : "bg-background/95"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={isReading ? "Reader view" : "Video player"}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-8",
          isReading && readerLight
            ? "border-neutral-200 bg-white/90 text-neutral-900"
            : "border-border bg-background/80"
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            {isReading ? "Reader" : "Now Playing"}
          </p>
          <h2 className="truncate text-base font-bold sm:text-lg">
            {item.title}
            <span
              className={cn(
                "ml-2",
                isReading && readerLight
                  ? "text-neutral-500"
                  : "text-muted-foreground"
              )}
            >
              · {isReading ? `Chapter ${currentSelection}` : `Episode ${currentSelection}`}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isReading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCinema((c) => !c)}
              className="gap-1.5"
              aria-pressed={cinema}
              title="Toggle Cinema Mode"
            >
              {cinema ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {cinema ? "Exit Cinema" : "Cinema Mode"}
              </span>
            </Button>
          )}
          {isReading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReaderLight((l) => !l)}
              className="gap-1.5"
              aria-pressed={readerLight}
              title="Toggle reader theme"
            >
              {readerLight ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {readerLight ? "Dark" : "Light"}
              </span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-1.5"
            aria-label="Back to info"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Info</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {isReading ? (
          <ReaderBody
            item={item}
            chapter={currentSelection}
            total={total}
            onPrev={goPrev}
            onNext={goNext}
            light={readerLight}
          />
        ) : (
          <PlayerBody
            item={item}
            episode={currentSelection}
            total={total}
            onPrev={goPrev}
            onNext={goNext}
            cinema={cinema}
          />
        )}
      </div>
    </div>
  );
};

/* ---------- Webtoon-style reader ---------- */
const ReaderBody = ({
  item,
  chapter,
  total,
  onPrev,
  onNext,
  light,
}: {
  item: MediaItem;
  chapter: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  light: boolean;
}) => (
  <div
    className={cn(
      "mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-8 animate-fade-in",
      light ? "text-neutral-900" : "text-foreground"
    )}
  >
    <div className="mb-4 px-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
        Chapter {chapter}
      </p>
      <h3 className="mt-1 text-xl font-extrabold sm:text-2xl">{item.title}</h3>
    </div>

    {/* Vertical stack of high-quality placeholder pages */}
    <div
      className={cn(
        "space-y-1 overflow-hidden rounded-xl",
        light ? "bg-neutral-100 ring-1 ring-neutral-200" : "bg-black/60"
      )}
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const seed = `${item.id}-${chapter}-${i}`;
        const url = `https://picsum.photos/seed/${encodeURIComponent(
          seed
        )}/800/1100`;
        return (
          <img
            key={i}
            src={url}
            alt={`Chapter ${chapter} page ${i + 1}`}
            loading={i < 2 ? "eager" : "lazy"}
            className="block w-full"
            onError={(e) =>
              ((e.target as HTMLImageElement).src = PLACEHOLDER)
            }
          />
        );
      })}
    </div>

    <div
      className={cn(
        "mt-6 flex items-center justify-between gap-2 border-t pt-4",
        light ? "border-neutral-200" : "border-border"
      )}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={chapter <= 1}
        onClick={onPrev}
      >
        ← Previous
      </Button>
      <span
        className={cn(
          "text-xs",
          light ? "text-neutral-500" : "text-muted-foreground"
        )}
      >
        Chapter {chapter} of {total}
      </span>
      <Button size="sm" disabled={chapter >= total} onClick={onNext}>
        Next →
      </Button>
    </div>
  </div>
);

/* ---------- Video player ---------- */
const PlayerBody = ({
  item,
  episode,
  total,
  onPrev,
  onNext,
  cinema,
}: {
  item: MediaItem;
  episode: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  cinema: boolean;
}) => (
  <div
    className={cn(
      "mx-auto flex w-full flex-col gap-4 px-2 py-3 sm:px-6 sm:py-6 animate-fade-in",
      cinema ? "max-w-none" : "max-w-6xl"
    )}
  >
    <div
      className={cn(
        "overflow-hidden border border-border bg-black shadow-2xl",
        cinema ? "rounded-none border-0" : "rounded-xl sm:rounded-2xl"
      )}
    >
      <div className="relative aspect-video w-full">
        <HlsPlayer
          key={`${item.id}-${episode}`}
          src={DEMO_HLS_SRC}
          poster={item.backdrop || item.posterUrl || item.poster}
          title={`${item.title} — Episode ${episode}`}
          className="absolute inset-0 h-full w-full bg-black"
        />
      </div>
    </div>

    <p className="px-1 text-[11px] text-muted-foreground">
      Streaming demo content (Tears of Steel) for Episode {episode}.
    </p>

    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={episode <= 1}
        onClick={onPrev}
      >
        ← Previous
      </Button>
      <span className="text-xs text-muted-foreground">
        Episode {episode} of {total}
      </span>
      <Button size="sm" disabled={episode >= total} onClick={onNext}>
        Next →
      </Button>
    </div>
  </div>
);
