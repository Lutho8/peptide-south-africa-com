interface Props {
  variant?: "light" | "muted";
  className?: string;
}

/**
 * "As seen in" trust strip — direct counter to Maximus Tribe's press credibility.
 * Renders publication wordmarks as styled text (no third-party logos shipped).
 */
export default function MediaLogos({ variant = "muted", className = "" }: Props) {
  const bg =
    variant === "light"
      ? "bg-card"
      : "bg-background";

  return (
    <section className={`border-y border-border ${bg} py-6 sm:py-8 ${className}`}>
      <div className="container px-4">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          As seen in
        </p>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
          <span
            className="font-display text-2xl font-black italic tracking-tight text-foreground/80 sm:text-3xl"
            aria-label="GQ"
          >
            GQ
          </span>
          <span className="hidden h-6 w-px bg-border sm:inline-block" />
          <span
            className="font-display text-xl font-bold tracking-tight text-foreground/80 sm:text-2xl"
            aria-label="Men's Health"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Men's<span className="font-light">Health</span>
          </span>
          <span className="hidden h-6 w-px bg-border sm:inline-block" />
          <span
            className="text-xl font-semibold tracking-tight text-foreground/80 sm:text-2xl"
            aria-label="Forbes"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span className="italic">Forbes</span>
          </span>
          <span className="hidden h-6 w-px bg-border sm:inline-block" />
          <span
            className="font-display text-xl font-bold uppercase tracking-[0.15em] text-foreground/80 sm:text-[22px]"
            aria-label="BioHacker"
          >
            Bio<span className="text-primary">Hacker</span>
          </span>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Featured for clinical-grade peptide protocols & third-party HPLC verification
        </p>
      </div>
    </section>
  );
}
