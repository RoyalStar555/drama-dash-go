import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { CATEGORY_META } from "@/lib/types";
import { useEffect, useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // Hydrate from URL on first mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQ(initial);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg">Story<span className="text-gradient">Hub</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {Object.entries(CATEGORY_META).map(([key, m]) => (
            <NavLink
              key={key}
              to={m.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSubmit} className="ml-auto flex flex-1 items-center gap-2 md:max-w-sm">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search anime, manga, movies, books…"
              className="pl-9"
              aria-label="Search"
            />
          </div>
        </form>

        <ThemeToggle />
      </div>
    </header>
  );
}
