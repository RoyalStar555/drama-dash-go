import { useState } from "react";
import { Hero } from "@/components/Hero";
import { MediaGrid } from "@/components/MediaGrid";
import { DetailModal } from "@/components/DetailModal";
import { useCategorySearch } from "@/hooks/useSearch";
import { CATEGORY_META } from "@/lib/types";
import type { MediaItem, MediaCategory } from "@/lib/types";
import { Link } from "react-router-dom";

function TrendingRow({ category, onSelect }: { category: MediaCategory; onSelect: (i: MediaItem) => void }) {
  const { data, isLoading } = useCategorySearch(category, "");
  const meta = CATEGORY_META[category];
  return (
    <section className="container py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Trending in <span className="text-gradient">{meta.label}</span>
        </h2>
        <Link to={meta.path} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          See all →
        </Link>
      </div>
      <MediaGrid items={data?.slice(0, 12)} isLoading={isLoading} onSelect={onSelect} />
    </section>
  );
}

const Index = () => {
  const [selected, setSelected] = useState<MediaItem | null>(null);
  return (
    <>
      <Hero />
      <TrendingRow category="anime" onSelect={setSelected} />
      <TrendingRow category="movies" onSelect={setSelected} />
      <TrendingRow category="manga" onSelect={setSelected} />
      <TrendingRow category="books" onSelect={setSelected} />
      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default Index;
