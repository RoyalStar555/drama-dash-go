import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertTriangle } from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  title?: string;
}

/**
 * HLS-capable <video> wrapper.
 * - Safari plays .m3u8 natively.
 * - Other browsers use hls.js with proper destroy() cleanup so subsequent
 *   episode switches don't leave a stale Hls instance attached to the element.
 */
export const HlsPlayer = ({
  src,
  poster,
  autoPlay = true,
  className,
  title,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fatal, setFatal] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setFatal(false);
    let hls: Hls | null = null;
    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) return;
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) video.addEventListener("loadedmetadata", tryPlay, { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      if (autoPlay) hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setFatal(true);
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      if (hls) {
        try { hls.destroy(); } catch { /* noop */ }
      }
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch { /* noop */ }
    };
  }, [src, autoPlay]);

  if (!src) {
    return (
      <div className={`${className ?? ""} flex items-center justify-center bg-black text-muted-foreground`}>
        <div className="flex flex-col items-center gap-2 text-sm">
          <AlertTriangle className="h-6 w-6" />
          Source unavailable
        </div>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        title={title}
        className={className}
      />
      {fatal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Playback error — source unreachable.
          </div>
        </div>
      )}
    </>
  );
};
