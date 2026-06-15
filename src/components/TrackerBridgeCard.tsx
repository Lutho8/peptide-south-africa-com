import { ArrowRight, LineChart } from "lucide-react";

interface Props {
  productName: string;
  productSlug: string;
}

const TRACKER_URL = "https://ridethetide.info";

export default function TrackerBridgeCard({ productName, productSlug }: Props) {
  const href = `${TRACKER_URL}?utm_source=store&utm_medium=product_page&utm_campaign=${encodeURIComponent(
    productSlug,
  )}`;

  return (
    <aside
      className="mt-4 rounded-lg border border-border bg-card p-4 text-sm"
      style={{ borderLeft: "3px solid #06b6d4" }}
      aria-label={`Track ${productName} in the Peptide Tracker`}
    >
      <div className="flex items-start gap-3">
        <LineChart className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#06b6d4" }} />
        <div className="flex-1">
          <p className="font-semibold text-foreground">Track this protocol free</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Load into the Peptide Tracker and monitor your results from day one.
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 self-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Open Tracker <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </aside>
  );
}
