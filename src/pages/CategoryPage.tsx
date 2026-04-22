import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MediaGrid } from "@/components/MediaGrid";
import { DetailModal } from "@/components/DetailModal";
import { useCategorySearch } from "@/hooks/useSearch";
import { CATEGORY_META, type MediaCategory, type MediaItem } from "@/lib/types";

interface CategoryPageProps {
  category: MediaCategory;
}

export default function CategoryPage({ category }: CategoryPageProps) {
  const meta = CATEGORY_META[category];
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const scrollKey = `scroll:${category}`;
  const restored = useRef(false);

  // Sync query to URL so back/forward preserves it.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    setParams(next, { replace: true });
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError, isFetching } = useCategorySearch(category, q);

  // Restore scroll position once data renders.
  useEffect(() => {
    if (restored.current || !data) return;
    const y = sessionStorage.getItem(scrollKey);
    if (y) window.scrollTo({ top: parseInt(y, 10) });
    restored.current = true;
  }, [data, scrollKey]);

  useEffect(() => {
    const onScroll = () => sessionStorage.setItem(scrollKey, String(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollKey]);

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            <span className={`bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>{meta.label}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            {q ? `Results for “${q}”` : `Explore the most loved ${meta.label.toLowerCase()}.`}
          </p>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${meta.label}…`}
            className="pl-9"
          />
          {isFetching ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Searching…</span>
          ) : null}
        </div>
      </div>

      <MediaGrid
        items={data}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={q ? "No matches. Try a different search." : "Loading trending titles…"}
        onSelect={setSelected}
      />

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
