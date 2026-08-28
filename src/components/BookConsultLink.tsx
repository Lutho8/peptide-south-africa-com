import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { rememberOffer, trackEvent, type WeightLossOfferKey } from "@/lib/analytics";

export const CONSULTATION_PATH = "/quiz?intent=consult";

export default function BookConsultLink({
  className,
  offer = "monthly",
  children,
  onClick,
}: {
  className?: string;
  offer?: WeightLossOfferKey;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={CONSULTATION_PATH}
      className={className}
      onClick={() => {
        onClick?.();
        trackEvent({ event: "book_consult_clicked", props: rememberOffer(offer) });
      }}
    >
      {children ?? "BOOK CONSULT"}
    </Link>
  );
}
