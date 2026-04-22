import { useQuery } from "@tanstack/react-query";
import { searchAll, searchCategory } from "@/lib/api";
import type { MediaCategory } from "@/lib/types";
import { useEffect, useState } from "react";

/** Debounce a value so search doesn't fire on every keystroke. */
export function useDebounced<T>(value: T, delay = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useCategorySearch(category: MediaCategory, query: string) {
  const debounced = useDebounced(query, 450);
  return useQuery({
    queryKey: ["search", category, debounced],
    queryFn: () => searchCategory(category, debounced),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}

export function useGlobalSearch(query: string) {
  const debounced = useDebounced(query, 500);
  return useQuery({
    queryKey: ["search", "all", debounced],
    queryFn: () => searchAll(debounced),
    enabled: debounced.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
