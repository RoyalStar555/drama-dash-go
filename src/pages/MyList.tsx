import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Eye, Clock, Check, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyList, ListStatus } from "@/hooks/useMyList";
import { MyListMenu } from "@/components/MyListMenu";
import { PLACEHOLDER, MediaItem } from "@/lib/api";
import { cacheWatchItem } from "@/pages/Watch";

const MyList = () => {
  const navigate = useNavigate();
  const { list } = useMyList();

  const buckets: Record<ListStatus, typeof list> = {
    watching: list.filter((e) => e.status === "watching"),
    plan: list.filter((e) => e.status === "plan"),
    completed: list.filter((e) => e.status === "completed"),
  };

  const open = (item: MediaItem) => {
    if (item.category === "drama") {
      cacheWatchItem(item);
      navigate(`/watch/${encodeURIComponent(item.id)}`);
    } else {
      navigate(`/title/${encodeURIComponent(item.id)}`);
    }
  };

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h1 className="text-3xl font-extrabold">My List</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track everything you're watching, planning, and completed.
        </p>

        <Tabs defaultValue="watching" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="watching" className="gap-2">
              <Eye className="h-4 w-4" />
              Watching
              <span className="rounded bg-muted px-1.5 text-[10px] font-bold">
                {buckets.watching.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <Clock className="h-4 w-4" />
              Plan to Watch
              <span className="rounded bg-muted px-1.5 text-[10px] font-bold">
                {buckets.plan.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <Check className="h-4 w-4" />
              Completed
              <span className="rounded bg-muted px-1.5 text-[10px] font-bold">
                {buckets.completed.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {(["watching", "plan", "completed"] as ListStatus[]).map((s) => (
            <TabsContent key={s} value={s}>
              {buckets[s].length === 0 ? (
                <EmptyState status={s} />
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {buckets[s].map((entry) => {
                    const total = entry.knownTotal || 12;
                    const pct = entry.watched.length
                      ? Math.min(100, Math.round((entry.watched.length / total) * 100))
                      : 0;
                    return (
                      <li
                        key={entry.item.id}
                        className="group relative overflow-hidden rounded-xl bg-card shadow-md ring-1 ring-border/60 transition-all hover:scale-[1.03] hover:ring-primary/60"
                      >
                        <button
                          type="button"
                          onClick={() => open(entry.item)}
                          className="block w-full text-left"
                        >
                          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                            <img
                              src={entry.item.poster || PLACEHOLDER}
                              alt={entry.item.title}
                              loading="lazy"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).src = PLACEHOLDER)
                              }
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl">
                                <Play className="h-5 w-5" fill="currentColor" />
                              </span>
                            </span>
                            {s === "watching" && (
                              <div className="absolute inset-x-0 bottom-0 h-1 bg-background/60">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 p-2.5">
                            <p className="line-clamp-1 text-sm font-semibold">
                              {entry.item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.item.year || "—"}
                              {s === "watching" &&
                                ` · ${entry.watched.length}/${total} eps`}
                            </p>
                          </div>
                        </button>
                        <div className="absolute right-2 top-2">
                          <MyListMenu item={entry.item} variant="icon" />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

const EmptyState = ({ status }: { status: ListStatus }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
    <Inbox className="h-10 w-10 text-muted-foreground" />
    <p className="mt-3 text-sm font-medium text-foreground">
      Nothing in {status === "plan" ? "Plan to Watch" : status === "watching" ? "Watching" : "Completed"} yet
    </p>
    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
      Add titles from the home page or any detail view using the bookmark menu.
    </p>
  </div>
);

export default MyList;
