import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  title?: string;
  onReady?: () => void;
  onError?: () => void;
}

/**
 * HLS-capable <video> wrapper.
 * - Safari plays .m3u8 natively.
 * - Other browsers use hls.js.
 * - Calls .play() once metadata is ready (muted to satisfy autoplay rules).
 * - Reports load/error so the parent can show a spinner or "Content Unavailable".
 */
export const HlsPlayer = ({
  src,
  poster,
  autoPlay = true,
  className,
  title,
  onReady,
  onError,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    let cancelled = false;

    const ready = () => {
      if (cancelled) return;
      onReady?.();
    };
    const fail = () => {
      if (cancelled) return;
      onError?.();
    };

    const tryPlay = () => {
      ready();
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay blocked — user can press play. Mute and retry once.
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    const onVideoError = () => fail();
    video.addEventListener("error", onVideoError);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari, iOS)
      video.src = src;
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) tryPlay();
        else ready();
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data?.fatal) fail();
      });
    } else {
      // Last-resort: attempt direct src
      video.src = src;
      video.addEventListener("loadedmetadata", ready, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("error", onVideoError);
      if (hls) hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay, onReady, onError]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      poster={poster}
      title={title}
      className={className}
    />
  );
};
