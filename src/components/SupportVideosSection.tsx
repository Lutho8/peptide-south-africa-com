import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Clip = {
  id: string;
  src: string;
  caption: string;
  tag: string;
};

const CLIPS: Clip[] = [
  {
    id: "recovery",
    src: "https://player.vimeo.com/progressive_redirect/playback/1197885475/rendition/540p/file.mp4%20(540p).mp4?loc=external&signature=a0fce7e26dc59facdb80bc6c56a5895113743940b784b9b6d60c74628763c8a1",
    tag: "Recovery",
    caption: "Faster bounce-back between sessions",
  },
  {
    id: "longevity",
    src: "https://player.vimeo.com/progressive_redirect/playback/1198867017/rendition/360p/file.mp4%20%28360p%29.mp4?loc=external&signature=4b05aa047ec26a22abab970319ba306b9eaea53446dc535ea2886aeb688e850f",
    tag: "Longevity",
    caption: "Daily protocols for the long game",
  },
  {
    id: "weight-loss",
    src: "https://player.vimeo.com/progressive_redirect/playback/1197885503/rendition/540p/file.mp4%20(540p).mp4?loc=external&signature=63ade134ad600c601acbe85f9dab5c4ca74f6a810b0d24e8f8e5e3ac79c13884",
    tag: "Weight loss",
    caption: "Visceral fat loss without the guesswork",
  },
  {
    id: "performance",
    src: "https://player.vimeo.com/progressive_redirect/playback/1198867018/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=3dfd6e072f8aa481e039919736121ac076907ea75363e54e9f5e6865d70e9ff1",
    tag: "Performance",
    caption: "Train harder, recover smarter",
  },
  {
    id: "sleep",
    src: "https://player.vimeo.com/progressive_redirect/playback/1197928742/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=78ef70209070004774f30bc4532296b564b11d660adac0d7cd3986f1746c97a7",
    tag: "Sleep & recovery",
    caption: "Deeper sleep, sharper mornings",
  },
];

interface TileProps {
  clip: Clip;
  activeId: string | null;
  onUnmute: (id: string) => void;
  eager?: boolean;
}

function VideoTile({ clip, activeId, onUnmute, eager = false }: TileProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const isUnmuted = activeId === clip.id;

  // Lazy-load + autoplay on intersection. Lower threshold on mobile so the
  // first tile in a horizontal carousel reliably triggers a load.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (eager && !el.src) {
      el.src = el.dataset.src ?? "";
      el.play().catch(() => {});
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            if (!v.src) v.src = v.dataset.src ?? "";
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  // Sync mute state with the section-level activeId (single-audio rule)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !isUnmuted;
    if (isUnmuted) {
      el.play().catch(() => {});
    }
  }, [isUnmuted]);

  const handleToggle = useCallback(() => {
    onUnmute(isUnmuted ? "" : clip.id);
  }, [clip.id, isUnmuted, onUnmute]);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-muted shadow-card-hover">
      <video
        ref={ref}
        data-src={clip.src}
        muted
        loop
        playsInline
        autoPlay
        preload={eager ? "auto" : "metadata"}
        className="h-full w-full object-cover"
        onClick={handleToggle}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
        {clip.tag}
      </span>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isUnmuted ? "Mute video" : "Unmute video"}
        aria-pressed={isUnmuted}
        className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur transition-all active:scale-95 ${
          isUnmuted
            ? "bg-primary text-primary-foreground shadow-glow"
            : "bg-white/95 text-foreground hover:bg-white"
        }`}
      >
        {isUnmuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        {isUnmuted ? "Sound on" : "Tap for sound"}
      </button>
    </div>
  );
}

export default function SupportVideosSection() {
  // Single-audio coordination: only one clip can be unmuted at a time.
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleUnmute = useCallback((id: string) => {
    setActiveId(id || null);
  }, []);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Real results
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            The support people keep coming back to.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Clinician-reviewed protocols, transparent lab data, and a community that
            shows up for each other — week after week.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Tap any clip for sound · one plays at a time
          </p>
        </div>

        <div className="mt-10 -mx-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          <ul className="flex snap-x snap-mandatory gap-4 md:gap-6">
            {CLIPS.map((c, idx) => (
              <li
                key={c.id}
                className="w-[78%] flex-shrink-0 snap-center sm:w-[48%] md:w-[32%] lg:w-[22%]"
              >
                <VideoTile clip={c} activeId={activeId} onUnmute={handleUnmute} eager={idx === 0} />
                <p className="mt-3 px-1 text-sm font-medium text-foreground">
                  {c.caption}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
