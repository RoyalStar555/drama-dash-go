import { useState } from "react";
import { MediaItem, PLACEHOLDER } from "@/lib/api";
import { Play, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MyListMenu } from "@/components/MyListMenu";
import { cn } from "@/lib/utils";

interface Props {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

const categoryLabels: Record<string, string> = {
  movie: "Movie",
  drama: "Drama",
  anime: "Anime",
  manga: "Manga",
  book: "Book",
};

// Some items are originally subbed (live-action dramas / movies),
// others typically dubbed (anime). Lightweight badge to mimic streaming UIs.
const subDubLabel = (cat: string) => {
  if (cat === "anime") return "SUB · DUB";
  if (cat === "drama" || cat === "movie") return "SUB";
  return null;
};

export const MediaCard = ({ item, onClick }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const subDub = subDubLabel(item.category);

  return (
    <div
      className="group relative flex-shrink-0 w-36 sm:w-44 md:w-48 overflow-hidden rounded-xl bg-card text-left shadow-md ring-1 ring-border/60 transition-all duration-300 hover:scale-[1.06] hover:shadow-2xl hover:shadow-primary/20 hover:ring-primary/60 hover:z-10"
    >
      <button
        type="button"
        onClick={() => onClick(item)}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-ring rounded-xl"
        aria-label={`Open ${item.title}`}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <img
            src={errored ? PLACEHOLDER : item.poster}
            alt={item.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setErrored(true);
              setLoaded(true);
            }}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover:scale-110",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Top-left category chip */}
          <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-md ring-1 ring-border/60">
            {categoryLabels[item.category]}
          </span>

          {/* Top-right Sub/Dub or Rating badge */}
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
            {item.rating ? (
              <>
                <Star className="h-2.5 w-2.5" fill="currentColor" />
                {item.rating.toFixed(1)}
              </>
            ) : (
              subDub || "HD"
            )}
          </span>

          {/* Hover reveal: gradient + Quick Play + synopsis */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg ring-2 ring-primary-foreground/20">
              <Play className="h-3 w-3" fill="currentColor" /> Quick Play
            </span>
            {item.overview && (
              <p className="line-clamp-3 text-[11px] leading-snug text-foreground/90">
                {item.overview}
              </p>
            )}
          </div>
        </div>
        <div className="p-2.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {item.year || "—"}
            {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ""}
          </p>
        </div>
      </button>
      {/* Bookmark / list controls — outside the inner button to keep HTML valid */}
      <div className="absolute right-1.5 bottom-12 opacity-0 transition-opacity group-hover:opacity-100">
        <MyListMenu item={item} variant="icon" />
      </div>
    </div>
  );
};
