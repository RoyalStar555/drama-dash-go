import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Server, Play, Maximize2, Minimize2 } from "lucide-react";
import { fetchRelated, fetchTrailerKey, MediaItem, PLACEHOLDER, DEMO_HLS_URL } from "@/lib/api";
import { MediaRow } from "@/components/MediaRow";
import { MyListMenu } from "@/components/MyListMenu";
import { useMyList } from "@/hooks/useMyList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HlsPlayer } from "@/components/HlsPlayer";
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

// ---- Episode card with thumbnail skeleton ----------------------------------
interface EpisodeCardProps {
  number: number;
  title: string;
  runtime: string;
  active: boolean;
  watched?: boolean;
  poster?: string;
  onClick: () => void;
}

const EpisodeCard = ({
  number,
  title,
  runtime,
  active,
  watched,
  poster,
  onClick,
}: EpisodeCardProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-all",
        active
          ? "border-primary bg-primary/15"
          : watched
            ? "border-primary/30 bg-primary/5 hover:border-primary/60"
            : "border-border bg-background/40 hover:border-primary/50"
      )}
    >
      <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
        <img
          src={errored ? PLACEHOLDER : poster || PLACEHOLDER}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Play className="h-4 w-4 text-white" fill="currentColor" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {number}. {title}
        </p>
        <p className="text-xs text-muted-foreground">
          {runtime}
          {watched && <span className="ml-1.5 text-primary">· watched</span>}
        </p>
      </div>
    </button>
  );
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

  const { markEpisodeWatched, reportTotal, get } = useMyList();
  const watchedEntry = item ? get(item.id) : undefined;
  const watchedSet = new Set(watchedEntry?.watched || []);

  // Tell the list how many episodes exist so it can detect "new episode" later
  useEffect(() => {
    if (item) reportTotal(item, episodes.length);
  }, [item, episodes.length, reportTotal]);

  // Mark active episode as watched when the user selects one
  useEffect(() => {
    if (item) markEpisodeWatched(item, activeEpisode, episodes.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEpisode, item?.id]);

  const downloadHref = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : item?.externalUrl || "#";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80 sm:text-2xl"
            aria-label="Drama Dash Go home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-md">
              <Play className="h-4 w-4" fill="currentColor" />
            </span>
            <span>
              <span className="text-primary">Drama</span>Dash
            </span>
          </button>
          <span className="w-10 sm:w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div
          className={cn(
            "grid gap-6",
            theater ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_340px]"
          )}
        >
          {/* LEFT: Player + meta */}
          <div className="space-y-5">
            {/* Sticky on mobile so player stays pinned while episodes scroll */}
            <div className="sticky top-[57px] z-20 -mx-4 sm:mx-0 lg:static">
              <div className="overflow-hidden border-y border-border bg-black shadow-2xl sm:rounded-xl sm:border">
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
                    // Fallback: always provide a playable HLS stream so the
                    // user never sees a blank screen.
                    <HlsPlayer
                      key={`${server}-fallback-${activeEpisode}`}
                      src={item?.videoUrl || DEMO_HLS_URL}
                      poster={item?.backdrop || item?.poster}
                      title={item?.title || "Watch"}
                      className="absolute inset-0 h-full w-full"
                    />
                  )}
                </div>
                {/* Theater Mode button (desktop only — hidden on small) */}
                <div className="hidden items-center justify-end gap-2 border-t border-border bg-card/80 px-3 py-2 lg:flex">
                  <button
                    type="button"
                    onClick={() => setTheater((t) => !t)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary"
                    aria-pressed={theater}
                  >
                    {theater ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5" /> Exit Theater Mode
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5" /> Theater Mode
                      </>
                    )}
                  </button>
                </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  {item && <MyListMenu item={item} />}
                  <Button asChild size="lg" variant="secondary" className="gap-2">
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

          {/* RIGHT: Episodes (sidebar; collapses below in theater mode or on small screens) */}
          <aside
            aria-label="Episodes"
            className={cn(
              "rounded-xl border border-border bg-card/60 p-3 backdrop-blur",
              theater
                ? "lg:col-span-1"
                : "lg:sticky lg:top-20 lg:self-start"
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">Episodes</h2>
              <span className="text-xs text-muted-foreground">
                {episodes.length} total
              </span>
            </div>
            <ScrollArea
              className={cn(
                "pr-2",
                theater ? "h-[320px]" : "h-[420px] lg:h-[560px]"
              )}
            >
              <ul
                className={cn(
                  "gap-2",
                  theater
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    : "flex flex-col"
                )}
              >
                {episodes.map((ep) => {
                  const active = ep.number === activeEpisode;
                  return (
                    <li key={ep.number}>
                      <EpisodeCard
                        number={ep.number}
                        title={ep.title}
                        runtime={ep.runtime}
                        active={active}
                        watched={watchedSet.has(ep.number)}
                        poster={item?.poster}
                        onClick={() => setActiveEpisode(ep.number)}
                      />
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

