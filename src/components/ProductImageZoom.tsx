import { useState, useRef } from "react";
import { ZoomIn } from "lucide-react";

interface Props {
  src: string;
  alt: string;
}

export default function ProductImageZoom({ src, alt }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      ref={containerRef}
      className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-border bg-muted"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
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
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm animate-fade-in">
          <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom
        </div>
      )}
    </div>
  );
}
