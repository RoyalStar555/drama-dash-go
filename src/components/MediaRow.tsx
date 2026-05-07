import { MediaItem } from "@/lib/api";
import { MediaCard } from "./MediaCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  title: string;
  items: MediaItem[];
  loading?: boolean;
  onSelect: (item: MediaItem) => void;
  id?: string;
}

export const MediaRow = ({ title, items, loading, onSelect, id }: Props) => {
  return (
    <section id={id} className="scroll-mt-32 space-y-3">
      <h2 className="px-4 text-xl font-bold text-foreground sm:px-8 md:text-2xl">
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin]">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-36 sm:w-44 md:w-48 overflow-hidden rounded-xl ring-1 ring-border/60"
              >
                <Skeleton className="aspect-[2/3] w-full rounded-none" />
                <div className="space-y-1.5 p-2.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          : items.length === 0
            ? (
              <p className="text-sm text-muted-foreground">
                Nothing to show. The API may be temporarily unavailable.
              </p>
            )
            : items.map((item) => (
                <MediaCard key={item.id} item={item} onClick={onSelect} />
              ))}
      </div>
    </section>
  );
};
