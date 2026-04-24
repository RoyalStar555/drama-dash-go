import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MediaItem, fetchTrailerKey, PLACEHOLDER } from "@/lib/api";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cacheWatchItem } from "@/pages/Watch";

interface Props {
  item: MediaItem | null;
  onClose: () => void;
}

export const DetailModal = ({ item, onClose }: Props) => {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setTrailerKey(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setTrailerKey(null);
    fetchTrailerKey(item).then((key) => {
      if (!cancelled) {
        setTrailerKey(key);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl glass-strong border-0 p-0 text-foreground">
        {item && (
          <div className="overflow-hidden">
            <div className="relative aspect-video w-full bg-black">
              {trailerKey ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`${item.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative h-full w-full">
                  <img
                    src={item.poster}
                    alt={item.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                    }}
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    {loading ? "Loading trailer…" : "No trailer available"}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3 p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold">{item.title}</h2>
                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Source <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded bg-secondary px-2 py-0.5 uppercase">
                  {item.category}
                </span>
                {item.year && <span>{item.year}</span>}
                {item.rating ? <span>★ {item.rating.toFixed(1)}</span> : null}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {item.overview || "No description available."}
              </p>
              {item.category === "drama" && (
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => {
                      cacheWatchItem(item);
                      onClose();
                      navigate(`/watch/${encodeURIComponent(item.id)}`);
                    }}
                  >
                    <Play className="h-4 w-4" fill="currentColor" /> Watch Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
