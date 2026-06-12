import { Stethoscope, FlaskConical } from "lucide-react";
import type { ProductTrack } from "@/data/products";

interface Props {
  track?: ProductTrack;
  size?: "sm" | "md";
}

/**
 * Pathway badge — makes the buyer journey unambiguous.
 *  - RUO: standard research checkout with attestation
 *  - GP:  prescription — routes through quiz → GP review → partner pharmacy
 */
export default function TrackBadge({ track = "RUO", size = "sm" }: Props) {
  const isGP = track === "GP";
  const Icon = isGP ? Stethoscope : FlaskConical;
  const label = isGP ? "GP-Prescribed" : "Research Use Only";
  const cls =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-1.5 py-0.5 text-[10px]";
  const colors = isGP
    ? "bg-primary/10 text-primary ring-primary/20"
    : "bg-trust/10 text-trust ring-trust/20";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold ring-1 ${colors} ${cls}`}
      title={
        isGP
          ? "Prescription-only. Add-to-cart routes you to the medical quiz."
          : "Research compound — sold for laboratory research with researcher attestation."
      }
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
