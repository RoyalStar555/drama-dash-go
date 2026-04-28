import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Play,
  Star,
  Clock as ClockIcon,
  Building2,
  Calendar,
  MessageCircle,
  ListVideo,
  Sparkles,
  BookOpen,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaItem, PLACEHOLDER, fetchRelated, getContentType } from "@/lib/api";
import { useMyList } from "@/hooks/useMyList";
import { MyListMenu } from "@/components/MyListMenu";
import { MediaRow } from "@/components/MediaRow";
import { MediaViewer } from "@/components/MediaViewer";
import { cacheWatchItem } from "@/pages/Watch";
import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "storyhub_watch_";
const loadCachedItem = (id: string): MediaItem | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + id);
    return raw ? (JSON.parse(raw) as MediaItem) : null;
  } catch {
    return null;
  }
};

// Mock comments — purely UI to satisfy the "Comments" tab requirement
const MOCK_COMMENTS = [
  { user: "Aria", time: "2h ago", text: "The pacing in the latest arc is incredible." },
  { user: "Kenji", time: "5h ago", text: "Visuals are stunning. Best of the season." },
  { user: "Mira", time: "1d ago", text: "Anyone know when the next chapter drops?" },
];

const TitleDetail = () => {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<MediaItem | null>(() => loadCachedItem(id));
  const [synopsisOpen, setSynopsisOpen] = useState(true);
  const [activeEp, setActiveEp] = useState<number | null>(null);
  const [hasPicked, setHasPicked] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false); // for fade-out
  

  const { get, markEpisodeWatched, reportTotal } = useMyList();

  // Deep-link fallback
  useEffect(() => {
    if (!item && params.get("title")) {
      setItem({
        id,
        category: (params.get("category") as MediaItem["category"]) || "movie",
        title: params.get("title") || "Untitled",
        poster: params.get("poster") || PLACEHOLDER,
        overview: params.get("overview") || undefined,
      });
    }
  }, [item, params, id]);

  const isReader = item ? getContentType(item) === "reading" : false;
  const totalUnits = isReader ? 24 : 12; // chapters for manga/book, episodes otherwise

  // Notify hook of total so it can detect "new episode" when total grows
  useEffect(() => {
    if (item) reportTotal(item, totalUnits);
  }, [item, totalUnits, reportTotal]);

  const entry = item ? get(item.id) : undefined;
  const watched = entry?.watched || [];

  const { data: related = [], isLoading: relatedLoading } = useQuery({
    queryKey: ["related", item?.id],
    queryFn: () => (item ? fetchRelated(item) : Promise.resolve([])),
    enabled: !!item,
    staleTime: 1000 * 60 * 30,
  });

  // Mock metadata derived deterministically from id so it's stable
  const meta = useMemo(() => {
    const studios = ["StoryHub Studios", "Aurora Pictures", "Kaze Animation", "Northlight Media"];
    const idx = (item?.id?.length || 0) % studios.length;
    return {
      studio: studios[idx],
      duration: isReader ? `${15 + (idx * 2)} min/chapter` : `${40 + idx * 3} min/ep`,
      status: "Ongoing",
    };
  }, [item?.id, isReader]);

  const episodes = useMemo(
    () =>
      Array.from({ length: totalUnits }).map((_, i) => ({
        number: i + 1,
        title: isReader ? `Chapter ${i + 1}` : `Episode ${i + 1}`,
      })),
    [totalUnits, isReader]
  );

  const openViewer = () => {
    if (!hasPicked || activeEp == null || !item) return;
    markEpisodeWatched(item, activeEp, totalUnits);
    setViewerOpen(true);
    // Trigger fade-in next frame
    requestAnimationFrame(() => setViewerVisible(true));
  };

  const closeViewer = () => {
    setViewerVisible(false);
    // Wait for fade-out before unmounting
    setTimeout(() => setViewerOpen(false), 250);
  };

  const pickEpisode = (n: number) => {
    setActiveEp(n);
    setHasPicked(true);
  };

  // Close viewer with Escape
  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="text-primary">Story</span>Hub
          </button>
          <span className="w-10 sm:w-16" />
        </div>
      </header>

      {/* Backdrop hero */}
      {item?.backdrop && (
        <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-80">
          <img
            src={item.backdrop}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      )}

      <main
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-8",
          item?.backdrop ? "-mt-32 pb-12" : "py-8"
        )}
      >
        {!item ? (
          <div className="space-y-4">
            <Skeleton className="h-72 w-48" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full max-w-2xl" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr]">
            {/* LEFT — Poster + meta */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border">
                <img
                  src={item.poster || PLACEHOLDER}
                  alt={item.title}
                  onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur space-y-3">
                <MetaRow icon={Star} label="Rating">
                  {typeof item.rating === "number" && item.rating > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Star className="h-3.5 w-3.5" fill="currentColor" />
                      {item.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </MetaRow>
                <MetaRow icon={Building2} label="Studio">
                  {meta.studio}
                </MetaRow>
                <MetaRow icon={ClockIcon} label="Duration">
                  {meta.duration}
                </MetaRow>
                <MetaRow icon={Calendar} label="Year">
                  {item.year || "—"}
                </MetaRow>
                <MetaRow icon={Sparkles} label="Status">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                    {meta.status}
                  </span>
                </MetaRow>
              </div>
            </div>

            {/* RIGHT — Info + tabs */}
            <div className="space-y-6 min-w-0">
              <div>
                <span className="inline-block rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  {item.category}
                </span>
                <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                  {item.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="gap-2 transition-all"
                    onClick={openViewer}
                    disabled={!hasPicked || activeEp == null}
                    title={
                      !hasPicked
                        ? `Select ${isReader ? "a chapter" : "an episode"} below first`
                        : undefined
                    }
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {hasPicked
                      ? isReader
                        ? `Read Chapter ${activeEp}`
                        : `Watch Episode ${activeEp}`
                      : isReader
                        ? "Pick a Chapter"
                        : "Pick an Episode"}
                  </Button>
                  <MyListMenu item={item} />
                </div>
                {!hasPicked && (
                  <p className="mt-2 text-xs text-muted-foreground animate-fade-in">
                    Choose {isReader ? "a chapter" : "an episode"} below to enable the {isReader ? "reader" : "player"}.
                  </p>
                )}
              </div>

              {/* Collapsible synopsis */}
              <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setSynopsisOpen((o) => !o)}
                  className="flex w-full items-center justify-between text-left"
                  aria-expanded={synopsisOpen}
                >
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Synopsis
                  </h2>
                  {synopsisOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {synopsisOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90 animate-fade-in">
                    {item.overview || "No description available."}
                  </p>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="episodes">
                <TabsList>
                  <TabsTrigger value="episodes" className="gap-1.5">
                    {isReader ? (
                      <BookOpen className="h-4 w-4" />
                    ) : (
                      <ListVideo className="h-4 w-4" />
                    )}
                    {isReader ? "Chapters" : "Episodes"}
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="related" className="gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Related
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="episodes" className="mt-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {watched.length}/{totalUnits} {isReader ? "chapters" : "episodes"} watched
                    </span>
                    <span>
                      Select to enable {isReader ? "the reader" : "the player"}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                    {episodes.map((ep) => {
                      const isWatched = watched.includes(ep.number);
                      const isActive = ep.number === activeEp;
                      return (
                        <button
                          key={ep.number}
                          type="button"
                          onClick={() => pickEpisode(ep.number)}
                          className={cn(
                            "relative aspect-square rounded-lg border text-sm font-semibold transition-all",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                              : isWatched
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-border bg-background/40 text-foreground hover:border-primary/60"
                          )}
                          aria-label={`${ep.title}${isWatched ? " (watched)" : ""}`}
                        >
                          {ep.number}
                          {isWatched && !isActive && (
                            <Check className="absolute right-0.5 top-0.5 h-2.5 w-2.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4 space-y-3">
                  {MOCK_COMMENTS.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-card/60 p-3 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{c.user}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {c.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/85">{c.text}</p>
                    </div>
                  ))}
                  <p className="px-1 text-[11px] text-muted-foreground">
                    Comments are a static preview in this demo.
                  </p>
                </TabsContent>

                <TabsContent value="related" className="mt-4">
                  {relatedLoading ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
                      ))}
                    </div>
                  ) : related.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No related titles found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                      {related.slice(0, 10).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            sessionStorage.setItem(
                              STORAGE_PREFIX + r.id,
                              JSON.stringify(r)
                            );
                            if (r.category === "drama") {
                              cacheWatchItem(r);
                              navigate(`/watch/${encodeURIComponent(r.id)}`);
                            } else {
                              navigate(`/title/${encodeURIComponent(r.id)}`);
                              setItem(r);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="group overflow-hidden rounded-lg bg-card text-left ring-1 ring-border transition-all hover:scale-105 hover:ring-primary"
                        >
                          <img
                            src={r.poster || PLACEHOLDER}
                            alt={r.title}
                            loading="lazy"
                            onError={(e) =>
                              ((e.target as HTMLImageElement).src = PLACEHOLDER)
                            }
                            className="aspect-[2/3] w-full object-cover"
                          />
                          <p className="line-clamp-1 p-2 text-xs font-medium">
                            {r.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Smart Content Switcher — central MediaViewer (HLS player or webtoon reader) */}
        {item && viewerOpen && activeEp != null && (
          <MediaViewer
            item={item}
            currentSelection={activeEp}
            total={totalUnits}
            visible={viewerVisible}
            onClose={closeViewer}
            onSelectionChange={(n) => {
              setActiveEp(n);
              markEpisodeWatched(item, n, totalUnits);
            }}
          />
        )}

        {related.length > 0 && (
          <div className="mt-12">
            <MediaRow
              title="More Like This"
              items={related}
              loading={relatedLoading}
              onSelect={(r) => {
                if (r.category === "drama") {
                  cacheWatchItem(r);
                  navigate(`/watch/${encodeURIComponent(r.id)}`);
                } else {
                  sessionStorage.setItem(
                    STORAGE_PREFIX + r.id,
                    JSON.stringify(r)
                  );
                  navigate(`/title/${encodeURIComponent(r.id)}`);
                  setItem(r);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

const MetaRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Star;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2 text-sm">
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
    <span className="text-right text-foreground/90">{children}</span>
  </div>
);

export default TitleDetail;
