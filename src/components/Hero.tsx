import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CATEGORY_META } from "@/lib/types";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 20%, hsl(var(--primary) / 0.5), transparent), radial-gradient(50% 40% at 80% 30%, hsl(var(--accent) / 0.4), transparent)",
        }}
      />
      <div className="container py-20 md:py-28">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary shadow-glow" />
            Your unified media universe
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Discover <span className="text-gradient">stories</span> worth your time.
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Search across anime, manga, movies, drama, and books — one beautiful place,
            zero distractions.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/anime">
                <Play className="mr-2 h-4 w-4 fill-current" /> Start exploring
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/search?q=one+piece">Try a search</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            {Object.entries(CATEGORY_META).map(([k, m]) => (
              <Link
                key={k}
                to={m.path}
                className={`rounded-full bg-gradient-to-r ${m.gradient} px-4 py-1.5 text-xs font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5`}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
