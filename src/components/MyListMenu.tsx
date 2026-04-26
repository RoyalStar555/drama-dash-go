import { Bookmark, Check, Clock, Eye, Trash2 } from "lucide-react";
import { MediaItem } from "@/lib/api";
import { useMyList, ListStatus } from "@/hooks/useMyList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  item: MediaItem;
  variant?: "icon" | "button";
  className?: string;
}

const STATUS_LABELS: Record<ListStatus, string> = {
  watching: "Watching",
  plan: "Plan to Watch",
  completed: "Completed",
};

export const MyListMenu = ({ item, variant = "button", className }: Props) => {
  const { get, setStatus, remove } = useMyList();
  const entry = get(item.id);
  const current = entry?.status;

  const trigger =
    variant === "icon" ? (
      <Button
        variant={current ? "default" : "secondary"}
        size="icon"
        className={cn("h-8 w-8", className)}
        aria-label="Add to My List"
      >
        {current === "completed" ? (
          <Check className="h-4 w-4" />
        ) : current === "watching" ? (
          <Eye className="h-4 w-4" />
        ) : current === "plan" ? (
          <Clock className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>
    ) : (
      <Button
        variant={current ? "default" : "secondary"}
        size="lg"
        className={cn("gap-2", className)}
      >
        {current === "completed" ? (
          <Check className="h-4 w-4" />
        ) : current === "watching" ? (
          <Eye className="h-4 w-4" />
        ) : current === "plan" ? (
          <Clock className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {current ? STATUS_LABELS[current] : "Add to My List"}
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="text-xs">Save to My List</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setStatus(item, "watching")}>
          <Eye className="mr-2 h-4 w-4" /> Watching
          {current === "watching" && <Check className="ml-auto h-3.5 w-3.5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus(item, "plan")}>
          <Clock className="mr-2 h-4 w-4" /> Plan to Watch
          {current === "plan" && <Check className="ml-auto h-3.5 w-3.5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus(item, "completed")}>
          <Check className="mr-2 h-4 w-4" /> Completed
          {current === "completed" && <Check className="ml-auto h-3.5 w-3.5" />}
        </DropdownMenuItem>
        {current && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => remove(item.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
