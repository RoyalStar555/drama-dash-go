import { MediaItem, PLACEHOLDER } from "@/lib/api";
import { Play } from "lucide-react";

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

export const MediaCard = ({ item, onClick }: Props) => {
  return (
    <button
      onClick={() => onClick(item)}
      className="group relative flex-shrink-0 w-36 sm:w-44 md:w-48 overflow-hidden rounded-md bg-card text-left transition-transform duration-300 hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={`Open ${item.title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
          className="h-full w-full object-cover transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/95 shadow-2xl ring-2 ring-primary-foreground/20 transition-transform duration-300 group-hover:scale-110">
            <Play className="h-6 w-6 text-primary-foreground" fill="currentColor" />
          </span>
        </div>
        <span className="absolute left-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          {categoryLabels[item.category]}
        </span>
      </div>
      <div className="p-2">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {item.year || "—"}
          {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ""}
        </p>
      </div>
    </button>
  );
};
