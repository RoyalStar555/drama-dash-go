import { MediaCard } from "./MediaCard";
import { SkeletonGrid } from "./SkeletonGrid";
import type { MediaItem } from "@/lib/types";

interface MediaGridProps {
  items: MediaItem[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  emptyMessage?: string;
  onSelect: (item: MediaItem) => void;
}

export function MediaGrid({ items, isLoading, isError, emptyMessage = "No results yet.", onSelect }: MediaGridProps) {
  if (isLoading && (!items || items.length === 0)) return <SkeletonGrid />;
  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        Something went wrong loading results. Please try again.
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="grid animate-fade-in grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <MediaCard key={`${item.category}-${item.id}`} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
