import { useState } from "react";

interface Props {
  name: string;
  src?: string | null;
  className?: string;
  alt?: string;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Avatar with graceful fallback. Renders the photo when present and loads OK,
 * otherwise renders an initials chip on the brand navy→teal gradient.
 */
export default function Avatar({ name, src, className = "", alt }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ?? name}
      className={`flex items-center justify-center bg-hero-gradient font-display font-semibold text-primary-foreground ${className}`}
    >
      <span className="text-[clamp(1rem,3vw,2rem)]">{initialsFor(name)}</span>
    </div>
  );
}
