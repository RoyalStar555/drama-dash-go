import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Server, Play, Maximize2, Minimize2 } from "lucide-react";
import { fetchRelated, fetchTrailerKey, MediaItem, PLACEHOLDER } from "@/lib/api";
import { MediaRow } from "@/components/MediaRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SERVERS = [
  { id: "s1", label: "Server 1", note: "HD · Recommended" },
  { id: "s2", label: "Server 2", note: "Backup" },
  { id: "s3", label: "Server 3", note: "Mirror" },
];

const STORAGE_PREFIX = "storyhub_watch_";

const loadCachedItem = (id: string): MediaItem | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + id);
    return raw ? (JSON.parse(raw) as MediaItem) : null;
  } catch {
    return null;
  }
};

const Watch = () => {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<MediaItem | null>(() => loadCachedItem(id));
  const [server, setServer] = useState(SERVERS[0].id);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [theater, setTheater] = useState(false);

  // Fallback: minimal item from URL params if no cache (deep link)
  useEffect(() => {
    if (!item && params.get("title")) {
      setItem({
        id,
        category: "drama",
        title: params.get("title") || "Untitled",
        poster: params.get("poster") || PLACEHOLDER,
        overview: params.get("overview") || undefined,
        tmdbId: params.get("tmdbId") ? Number(params.get("tmdbId")) : undefined,
        tmdbType: "tv",
      });
    }
  }, [item, params, id]);

  const { data: trailerKey, isLoading: trailerLoading } = useQuery({
    queryKey: ["trailer", item?.id],
    queryFn: () => (item ? fetchTrailerKey(item) : Promise.resolve(null)),
    enabled: !!item,
    staleTime: 1000 * 60 * 30,
  });

  const { data: related = [], isLoading: relatedLoading } = useQuery({
    queryKey: ["related", item?.id],
    queryFn: () => (item ? fetchRelated(item) : Promise.resolve([])),
    enabled: !!item,
    staleTime: 1000 * 60 * 30,
  });

  const handleRelatedSelect = (next: MediaItem) => {
    cacheWatchItem(next);
    setActiveEpisode(1);
    navigate(`/watch/${encodeURIComponent(next.id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate a dummy episode list (12 eps) — UI structure for the user request
  const episodes = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        number: i + 1,
        title: `Episode ${i + 1}`,
        runtime: `${40 + ((i * 3) % 12)} min`,
      })),
    []
  );

  const downloadHref = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : item?.externalUrl || "#";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xl font-extrabold tracking-tight"
            aria-label="StoryHub home"
          >
            <span className="text-primary">Story</span>Hub
          </button>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* LEFT: Player + meta */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-border bg-black shadow-2xl">
              <div className="relative aspect-video w-full">
                {trailerLoading ? (
                  <Skeleton className="absolute inset-0 rounded-none" />
                ) : trailerKey ? (
                  <iframe
                    key={`${server}-${trailerKey}-${activeEpisode}`}
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&modestbranding=1&rel=0`}
                    title={item?.title || "Watch"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Play className="h-10 w-10 opacity-50" />
                    <p className="text-sm">No stream available for this title.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Server Switcher */}
            <section
              aria-label="Server switcher"
              className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Server className="h-4 w-4 text-primary" />
                Choose Server
              </div>
              <div className="flex flex-wrap gap-2">
                {SERVERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServer(s.id)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border px-4 py-2 text-left text-sm transition-all",
                      server === s.id
                        ? "border-primary bg-primary/15 text-foreground shadow-md"
                        : "border-border bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                    )}
                  >
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-[11px] opacity-80">{s.note}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Title + description + download */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="inline-block rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    {item?.category || "Drama"}
                  </span>
                  <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                    {item?.title || "Loading…"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item?.year ? `${item.year}` : ""}
                    {item?.rating ? ` · ★ ${item.rating.toFixed(1)}` : ""}
                    {` · Episode ${activeEpisode}`}
                  </p>
                </div>
                <Button asChild size="lg" className="gap-2">
                  <a
                    href={downloadHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="h-4 w-4" /> Download
                  </a>
                </Button>
              </div>
              {item?.overview ? (
                <p className="max-w-3xl text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.overview}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description available.
                </p>
              )}
            </section>
          </div>

          {/* RIGHT: Episodes */}
          <aside
            aria-label="Episodes"
            className="rounded-xl border border-border bg-card/60 p-3 backdrop-blur lg:sticky lg:top-20 lg:self-start"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">Episodes</h2>
              <span className="text-xs text-muted-foreground">
                {episodes.length} total
              </span>
            </div>
            <ScrollArea className="h-[420px] lg:h-[560px] pr-2">
              <ul className="space-y-2">
                {episodes.map((ep) => {
                  const active = ep.number === activeEpisode;
                  return (
                    <li key={ep.number}>
                      <button
                        type="button"
                        onClick={() => setActiveEpisode(ep.number)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-all",
                          active
                            ? "border-primary bg-primary/15"
                            : "border-border bg-background/40 hover:border-primary/50"
                        )}
                      >
                        <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item?.poster || PLACEHOLDER}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                PLACEHOLDER;
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play
                              className="h-4 w-4 text-white"
                              fill="currentColor"
                            />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {ep.number}. {ep.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ep.runtime}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </aside>
        </div>

        <div className="mt-10">
          <MediaRow
            title="Related Videos"
            items={related}
            loading={relatedLoading}
            onSelect={handleRelatedSelect}
          />
        </div>
      </main>
    </div>
  );
};

export default Watch;

// Helper exported for callers that want to navigate to the Watch page
export const cacheWatchItem = (item: MediaItem) => {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + item.id, JSON.stringify(item));
  } catch {
    /* ignore */
  }
};
