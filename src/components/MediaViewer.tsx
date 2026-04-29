import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  ListVideo,
  BookOpen,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HlsPlayer } from "@/components/HlsPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  MediaItem,
  PLACEHOLDER,
  getContentType,
  DEMO_HLS_URL,
  generatePages,
} from "@/lib/api";
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
  /** Optional set of "watched" episode/chapter numbers for highlighting. */
  watched?: number[];
}

/**
 * Central conditional Media Engine.
 * - mediaType === 'video'   → HLS player + Cinema Mode toggle
 * - mediaType === 'reading' → Webtoon vertical reader + Dark/Light toggle
 *
 * On mobile, episode/chapter selection lives in a slide-over Sheet so it never
 * covers the media content.
 */
export const MediaViewer = ({
  item,
  currentSelection,
  total,
  onClose,
  onSelectionChange,
  visible,
  watched = [],
}: Props) => {
  const contentType = item?.mediaType ?? getContentType(item);
  const isReading = contentType === "reading";

  const [cinema, setCinema] = useState(false);
  const [readerLight, setReaderLight] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Reset modes when switching items
  useEffect(() => {
    setCinema(false);
    setReaderLight(false);
  }, [item?.id]);

  const goPrev = () => {
    if (currentSelection > 1) onSelectionChange(currentSelection - 1);
  };
  const goNext = () => {
    if (currentSelection < total) onSelectionChange(currentSelection + 1);
  };

  const pickAndClose = (n: number) => {
    onSelectionChange(n);
    setDrawerOpen(false);
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
          "flex items-center justify-between gap-2 border-b px-3 py-3 sm:px-8",
          isReading && readerLight
            ? "border-neutral-200 bg-white/90 text-neutral-900"
            : "border-border bg-background/80"
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            {isReading ? "Reader" : "Now Playing"}
          </p>
          <h2 className="truncate text-sm font-bold sm:text-lg">
            {item?.title ?? "Untitled"}
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile selector — slide-over sheet keeps the media uncovered */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 lg:hidden"
                aria-label={isReading ? "Open chapter list" : "Open episode list"}
                title={isReading ? "Chapters" : "Episodes"}
              >
                {isReading ? (
                  <BookOpen className="h-4 w-4" />
                ) : (
                  <ListVideo className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isReading ? "Chapters" : "Episodes"}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {isReading ? "Chapters" : "Episodes"}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-5 gap-2 pb-8 sm:grid-cols-6">
                {Array.from({ length: total }).map((_, i) => {
                  const n = i + 1;
                  const isWatched = watched.includes(n);
                  const isActive = n === currentSelection;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => pickAndClose(n)}
                      className={cn(
                        "relative aspect-square rounded-lg border text-sm font-semibold transition-all",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : isWatched
                            ? "border-primary/40 bg-primary/15 text-primary"
                            : "border-border bg-background/40 text-foreground hover:border-primary/60"
                      )}
                    >
                      {n}
                      {isWatched && !isActive && (
                        <Check className="absolute right-0.5 top-0.5 h-2.5 w-2.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

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

      {/* Body — wrapped in ErrorBoundary so a broken stream/page never blanks the app */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <ErrorBoundary>
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
        </ErrorBoundary>
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
}) => {
  // Prefer strict structured chapters, then flat pages, then deterministic gen.
  const pages =
    item?.chapters?.[chapter - 1]?.pages?.length
      ? item.chapters[chapter - 1].pages
      : item?.pages && item.pages.length >= 5
        ? item.pages
        : generatePages(`${item?.id || "fallback"}-${chapter}`, 8);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl px-3 py-4 sm:px-6 sm:py-8 animate-fade-in",
        light ? "text-neutral-900" : "text-foreground"
      )}
    >
      <div className="mb-4 px-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Chapter {chapter}
        </p>
        <h3 className="mt-1 text-xl font-extrabold sm:text-2xl">
          {item?.title}
        </h3>
      </div>

      {!pages?.length ? (
        <div className="rounded-xl border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          Content Unavailable — this chapter could not be loaded.
        </div>
      ) : (
        <div
          className={cn(
            "space-y-1 overflow-hidden rounded-xl",
            light ? "bg-neutral-100 ring-1 ring-neutral-200" : "bg-black/60"
          )}
        >
          {pages.map((url, i) => (
            <img
              key={`${chapter}-${i}`}
              src={url}
              alt={`Chapter ${chapter} page ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              className="mx-auto block h-auto w-full max-w-full object-contain"
              onError={(e) =>
                ((e.target as HTMLImageElement).src = PLACEHOLDER)
              }
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "mt-6 flex items-center justify-between gap-2 border-t pt-4 pb-8",
          light ? "border-neutral-200" : "border-border"
        )}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={chapter <= 1}
          onClick={onPrev}
        >
          ← Previous Chapter
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
          Next Chapter →
        </Button>
      </div>
    </div>
  );
};

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
}) => {
  const ep = item?.episodes?.[episode - 1];
  const src = ep?.videoUrl || item?.videoUrl || DEMO_HLS_SRC;

  return (
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
        {/* Fixed aspect-video w-full so the container can never collapse */}
        <div className="relative aspect-video w-full">
          <PlayerInner
            src={src}
            poster={item?.backdrop || item?.posterUrl || item?.poster}
            title={`${item?.title || "Video"} — Episode ${episode}`}
            itemId={item?.id || "unknown"}
            episode={episode}
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
};

/* ---------- Player inner with loading spinner + error guard ---------- */
const PlayerInner = ({
  src,
  poster,
  title,
  itemId,
  episode,
}: {
  src: string;
  poster?: string;
  title: string;
  itemId: string;
  episode: number;
}) => {
  const [errored, setErrored] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset on source change
  useEffect(() => {
    setErrored(false);
    setLoading(true);
  }, [src, episode]);

  if (errored) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black p-6 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Content Unavailable</p>
        <p>This stream could not be loaded. Try the next episode.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <HlsPlayer
        key={`${itemId}-${episode}`}
        src={src}
        poster={poster}
        title={title}
        className="h-full w-full bg-black"
        onReady={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setErrored(true);
        }}
      />
      {loading && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40"
          aria-live="polite"
          aria-label="Loading video"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
