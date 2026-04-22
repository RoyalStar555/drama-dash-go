import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-xs text-muted-foreground">
          StoryHub — built with ❤. Data via Jikan, TVMaze, Open Library.
        </div>
      </footer>
    </div>
  );
}
