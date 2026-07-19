import { useState, useRef } from "react";
import { ZoomIn, X } from "lucide-react";
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
}

export default function ProductImageZoom({ src, alt }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxOrigin, setLightboxOrigin] = useState("center center");
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
        <div
          className={`${vialZoomFrameClasses} cursor-pointer`}
          onClick={() => setLightboxOpen(true)}
          data-testid={VIAL_TEST_ID}
        >
          <span aria-hidden className={vialAccentBarLgClasses} />
          <span aria-hidden className={vialAccentDotLgClasses} />
          <img src={src} alt={alt} className="h-full w-full object-cover" />
          <div className={vialZoomChipClasses}>
            <ZoomIn className="h-3.5 w-3.5" /> Tap to zoom
          </div>
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
                src={src}
                alt={alt}
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
    <div
      ref={containerRef}
      className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-vial-border bg-vial-surface shadow-vial"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
      data-testid="vial-frame"
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-2.5 bg-vial-accent" />
      <span aria-hidden className="pointer-events-none absolute right-1.5 top-4 z-10 h-2 w-2 rounded-full bg-vial-accent-strong" />
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 ease-out"
        style={{
          transform: zoomed ? "scale(2.5)" : "scale(1)",
          transformOrigin: origin,
        }}
      />
      {!zoomed && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-vial-surface/90 px-3 py-1.5 text-xs font-medium text-vial-ink backdrop-blur-sm animate-fade-in">
          <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom
        </div>
      )}
    </div>
  );
}
