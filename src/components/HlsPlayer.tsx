import { useEffect, useRef } from "react";
import Hls from "hls.js";

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
 * - Other browsers use hls.js.
 * - Calls .play() once metadata is ready (muted to satisfy autoplay rules).
 */
export const HlsPlayer = ({
  src,
  poster,
  autoPlay = true,
  className,
  title,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay blocked — user can press play. Mute and retry once.
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari, iOS)
      video.src = src;
      if (autoPlay) {
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
      }
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      if (autoPlay) {
        hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      }
    } else {
      // Last-resort: attempt direct src
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay]);

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
