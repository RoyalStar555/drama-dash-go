import { useEffect, useState, useCallback } from "react";
import { MediaItem } from "@/lib/api";
import { toast } from "sonner";

export type ListStatus = "watching" | "plan" | "completed";

export interface MyListEntry {
  item: MediaItem;
  status: ListStatus;
  addedAt: number;
  // Track watched episodes / chapters
  watched: number[];
  // Last known total to detect "new episode" notifications
  knownTotal: number;
  // For Continue Watching ordering
  lastViewedAt?: number;
}

const STORAGE_KEY = "storyhub_my_list_v1";

// ---- Persistence -----------------------------------------------------------
const read = (): Record<string, MyListEntry> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MyListEntry>) : {};
  } catch {
    return {};
  }
};

const write = (data: Record<string, MyListEntry>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("storyhub:mylist-changed"));
  } catch {
    /* ignore */
  }
};

// ---- Hook ------------------------------------------------------------------
export const useMyList = () => {
  const [data, setData] = useState<Record<string, MyListEntry>>(() => read());

  useEffect(() => {
    const refresh = () => setData(read());
    window.addEventListener("storyhub:mylist-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("storyhub:mylist-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const setStatus = useCallback((item: MediaItem, status: ListStatus) => {
    const all = read();
    const prev = all[item.id];
    all[item.id] = {
      item,
      status,
      addedAt: prev?.addedAt || Date.now(),
      watched: prev?.watched || [],
      knownTotal: prev?.knownTotal || 0,
      lastViewedAt: prev?.lastViewedAt,
    };
    write(all);
    toast.success(
      status === "watching"
        ? `Added "${item.title}" to Watching`
        : status === "plan"
          ? `Added "${item.title}" to Plan to Watch`
          : `Marked "${item.title}" as Completed`
    );
  }, []);

  const remove = useCallback((id: string) => {
    const all = read();
    const removed = all[id];
    delete all[id];
    write(all);
    if (removed) toast(`Removed "${removed.item.title}" from your list`);
  }, []);

  const markEpisodeWatched = useCallback(
    (item: MediaItem, episode: number, totalEpisodes?: number) => {
      const all = read();
      const prev =
        all[item.id] ||
        ({
          item,
          status: "watching" as ListStatus,
          addedAt: Date.now(),
          watched: [] as number[],
          knownTotal: totalEpisodes || 0,
        } as MyListEntry);

      const watched = prev.watched.includes(episode)
        ? prev.watched
        : [...prev.watched, episode].sort((a, b) => a - b);

      all[item.id] = {
        ...prev,
        item, // refresh item snapshot
        watched,
        lastViewedAt: Date.now(),
        knownTotal: totalEpisodes || prev.knownTotal,
        // auto-advance status if user starts watching
        status:
          prev.status === "completed"
            ? "completed"
            : prev.status === "plan"
              ? "watching"
              : prev.status,
      };
      write(all);
    },
    []
  );

  const reportTotal = useCallback(
    (item: MediaItem, total: number) => {
      const all = read();
      const prev = all[item.id];
      if (!prev || prev.status !== "watching") return;
      if (total > prev.knownTotal && prev.knownTotal > 0) {
        const diff = total - prev.knownTotal;
        toast(`📺 New ${diff > 1 ? `${diff} episodes` : "episode"} for "${item.title}"`, {
          description: "Available now in your Watching list",
        });
      }
      all[item.id] = { ...prev, knownTotal: total };
      write(all);
    },
    []
  );

  return {
    entries: data,
    list: Object.values(data),
    get: (id: string) => data[id],
    setStatus,
    remove,
    markEpisodeWatched,
    reportTotal,
  };
};
