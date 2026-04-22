import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { fallbackImage } from "@/lib/api";
import { useState } from "react";

interface DetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function DetailModal({ item, onClose }: DetailModalProps) {
  const [src, setSrc] = useState<string>("");

  if (!item) return null;
  const meta = CATEGORY_META[item.category];

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden border-border bg-card p-0">
        <div className="grid gap-0 md:grid-cols-[280px_1fr]">
          <div className="relative aspect-[2/3] md:aspect-auto md:h-full">
            <img
              src={src || item.image || fallbackImage}
              alt={item.title}
              onError={() => setSrc(fallbackImage)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col gap-4 p-6">
            <DialogHeader className="space-y-2 text-left">
              <Badge className="w-fit bg-gradient-primary text-primary-foreground">{meta.label}</Badge>
              <DialogTitle className="text-2xl font-bold leading-tight md:text-3xl">{item.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-3 text-sm">
                {item.rating ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {item.rating.toFixed(1)}
                  </span>
                ) : null}
                {item.year ? <span>{item.year}</span> : null}
                {item.author ? <span>by {item.author}</span> : null}
              </DialogDescription>
            </DialogHeader>

            {item.genres && item.genres.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.genres.slice(0, 6).map((g) => (
                  <Badge key={g} variant="secondary" className="font-normal">
                    {g}
                  </Badge>
                ))}
              </div>
            ) : null}

            <p className="line-clamp-[10] overflow-y-auto text-sm leading-relaxed text-muted-foreground">
              {item.description || "No description available."}
            </p>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                  {meta.cta} <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
