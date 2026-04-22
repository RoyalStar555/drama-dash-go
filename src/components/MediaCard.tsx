import { Star } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { fallbackImage } from "@/lib/api";
import { useState } from "react";

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
}

export function MediaCard({ item, onSelect }: MediaCardProps) {
  const [src, setSrc] = useState(item.image || fallbackImage);

  return (
    <button
      type="button"
      data-id={item.id}
      data-category={item.category}
      onClick={() => onSelect(item)}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-card text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={src}
          alt={item.title}
          loading="lazy"
          onError={() => setSrc(fallbackImage)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {item.rating ? (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {item.rating.toFixed(1)}
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
            View details
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {[item.year, item.author, item.genres?.[0]].filter(Boolean).join(" • ") || "—"}
        </p>
      </div>
    </button>
  );
}
