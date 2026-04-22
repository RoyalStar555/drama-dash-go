import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MediaGrid } from "@/components/MediaGrid";
import { DetailModal } from "@/components/DetailModal";
import { useGlobalSearch } from "@/hooks/useSearch";
import { CATEGORY_META, type MediaCategory, type MediaItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const ALL_CATS: MediaCategory[] = ["anime", "manga", "movies", "books"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<MediaCategory | "all">("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    setParams(next, { replace: true });
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError } = useGlobalSearch(q);
  const filtered = filter === "all" ? data : data?.filter((i) => i.category === filter);

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        <span className="text-gradient">Search</span> everything
      </h1>
      <p className="mt-1 text-muted-foreground">One query across all categories.</p>

      <div className="relative mt-6 w-full md:max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try: 'attack on titan', 'dune', 'breaking bad'…"
          className="h-12 pl-10 text-base"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {ALL_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {CATEGORY_META[c].label}
          </button>
        ))}
        {data ? <Badge variant="secondary" className="ml-auto">{data.length} results</Badge> : null}
      </div>

      <div className="mt-8">
        <MediaGrid
          items={filtered}
          isLoading={isLoading && q.length > 0}
          isError={isError}
          emptyMessage={q ? "No matches. Try another phrase." : "Type something to begin."}
          onSelect={setSelected}
        />
      </div>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
