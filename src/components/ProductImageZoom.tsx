import { useState, useRef } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  VIAL_TEST_ID,
  vialZoomFrameClasses,
  vialAccentBarLgClasses,
  vialAccentDotLgClasses,
  vialZoomChipClasses,
} from "@/lib/vialDesign";

interface Props {
  src: string;
  alt: string;
  media?: Array<{
    src: string;
    alt: string;
    label?: string;
    fit?: "cover" | "contain";
    href?: string;
  }>;
}

export default function ProductImageZoom({ src, alt, media }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxOrigin, setLightboxOrigin] = useState("center center");
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const items = media?.length ? media : [{ src, alt, fit: "cover" as const }];
  const active = items[Math.min(activeIndex, items.length - 1)];
  const hasCarousel = items.length > 1;

  const move = (direction: -1 | 1) => {
    setZoomed(false);
    setLightboxZoomed(false);
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  };

  const navigation = hasCarousel ? (
    <>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); move(-1); }}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur-sm hover:bg-background"
        aria-label="Previous product image"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); move(1); }}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2 text-foreground shadow-md backdrop-blur-sm hover:bg-background"
        aria-label="Next product image"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {active.label && (
        <span className="absolute left-3 top-3 z-20 rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
          {active.label}
        </span>
      )}
    </>
  ) : null;

  const thumbnails = hasCarousel ? (
    <div className="mt-3 flex gap-2" aria-label="Product media">
      {items.map((item, index) => (
        <button
          key={`${item.src}-${index}`}
          type="button"
          onClick={() => { setActiveIndex(index); setZoomed(false); }}
          className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-white ${activeIndex === index ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
          aria-label={`View ${item.label ?? item.alt}`}
        >
          <img src={item.src} alt="" className={`h-full w-full ${item.fit === "contain" ? "object-contain" : "object-cover"}`} />
        </button>
      ))}
      {active.href && (
        <a href={active.href} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 self-center text-xs font-semibold text-primary hover:underline">
          Verify at lab <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  ) : null;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setLightboxOrigin(`${x}% ${y}%`);
  };

  if (isMobile) {
    return (
      <>
        <div>
          <div
            className={`${vialZoomFrameClasses} cursor-pointer`}
            onClick={() => setLightboxOpen(true)}
            data-testid={VIAL_TEST_ID}
          >
            <span aria-hidden className={vialAccentBarLgClasses} />
            <span aria-hidden className={vialAccentDotLgClasses} />
            <img src={active.src} alt={active.alt} className={`h-full w-full ${active.fit === "contain" ? "object-contain bg-white" : "object-cover"}`} />
            {navigation}
            <div className={vialZoomChipClasses}>
              <ZoomIn className="h-3.5 w-3.5" /> Tap to zoom
            </div>
          </div>
          {thumbnails}
        </div>

        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => { setLightboxOpen(false); setLightboxZoomed(false); }}
          >
            <button
              className="absolute right-4 top-4 z-50 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); setLightboxZoomed(false); }}
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="h-full w-full overflow-hidden"
              onClick={(e) => { e.stopPropagation(); setLightboxZoomed(!lightboxZoomed); }}
              onTouchMove={lightboxZoomed ? handleTouchMove : undefined}
            >
              <img
                src={active.src}
                alt={active.alt}
                className="h-full w-full object-contain transition-transform duration-300 ease-out"
                style={{
                  transform: lightboxZoomed ? "scale(2.5)" : "scale(1)",
                  transformOrigin: lightboxOrigin,
                }}
              />
            </div>
            {!lightboxZoomed && (
              <p className="absolute bottom-6 text-center text-sm text-white/70">
                Tap to zoom · Pinch or tap again to exit
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className={`${vialZoomFrameClasses} cursor-zoom-in`}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        data-testid={VIAL_TEST_ID}
      >
        <span aria-hidden className={`${vialAccentBarLgClasses} z-10`} />
        <span aria-hidden className={`${vialAccentDotLgClasses} z-10`} />
        <img
          src={active.src}
          alt={active.alt}
          className={active.fit === "contain"
            ? "h-full w-full object-contain bg-white transition-transform duration-300 ease-out"
            : "h-full w-full object-cover transition-transform duration-300 ease-out"}
          style={{
            transform: zoomed ? "scale(2.5)" : "scale(1)",
            transformOrigin: origin,
          }}
        />
        {navigation}
        {!zoomed && (
          <div className={`${vialZoomChipClasses} animate-fade-in`}>
            <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom
          </div>
        )}
      </div>
      {thumbnails}
    </div>
  );
}
