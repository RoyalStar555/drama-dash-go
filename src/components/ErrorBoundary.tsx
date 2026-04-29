import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Generic error boundary used to keep the media viewer from crashing the app
 * if the player or reader throws during render.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[StoryHub MediaViewer] render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60 p-8 text-center">
            <p className="text-base font-semibold text-foreground">
              Content Unavailable
            </p>
            <p className="text-sm text-muted-foreground">
              Something went wrong while loading this title.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
