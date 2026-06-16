import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "psa-quiz-result";

interface StoredResult {
  protocolName?: string;
  subtitle?: string;
}

export default function QuizResultBanner() {
  const [params] = useSearchParams();
  const [data, setData] = useState<StoredResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (params.get("from") !== "quiz") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch { /* noop */ }
  }, [params]);

  if (!data || dismissed || params.get("from") !== "quiz") return null;

  return (
    <div className="border-b border-primary/20 bg-primary/5">
      <div className="container flex items-center gap-3 px-4 py-2.5 text-sm">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 truncate text-foreground">
          <span className="font-semibold">From your quiz:</span>{" "}
          {data.protocolName ?? "Your personalized stack"}
          {data.subtitle ? ` — ${data.subtitle}` : ""}
        </p>
        <Link
          to="/quiz"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View protocol <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss quiz banner"
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
