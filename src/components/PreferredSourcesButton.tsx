import { useEffect, type MouseEvent } from "react";
import { ExternalLink, Sparkles } from "lucide-react";

type Props = {
  compact?: boolean;
  className?: string;
};

const PREFERRED_SOURCE_URL =
  "https://www.google.com/preferences/source?q=peptide-south-africa.com";
const PREFERRED_SOURCE_SCRIPT = "https://news.google.com/swg/js/v1/publisher.js";

type PreferredSourceClient = {
  init: (options: { theme: "light" | "dark"; lang: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: Array<(client: PreferredSourceClient) => void>;
  }
}

let preferredSourceClient: PreferredSourceClient | null = null;
let preferredSourceLoaderStarted = false;

function loadPreferredSourceClient() {
  if (typeof window === "undefined" || preferredSourceLoaderStarted) return;

  preferredSourceLoaderStarted = true;
  window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || [];
  window.PREFERRED_SOURCE.push((client) => {
    client.init({ theme: "light", lang: "en" });
    preferredSourceClient = client;
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = PREFERRED_SOURCE_SCRIPT;
  script.setAttribute("preferred-sources-control", "manual");
  document.head.appendChild(script);
}

/** Google-documented deep link to the Preferred Sources selection screen. */
export default function PreferredSourcesButton({ compact = false, className = "" }: Props) {
  useEffect(loadPreferredSourceClient, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!preferredSourceClient) return;

    event.preventDefault();
    preferredSourceClient.addPreferredSource();
  };

  return (
    <aside
      aria-label="Follow Peptide South Africa in Google"
      className={`rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 ${
        compact ? "p-4" : "p-5 md:p-6"
      } ${className}`}
    >
      <div className={`flex ${compact ? "flex-col gap-3 sm:flex-row sm:items-center" : "flex-col gap-4 md:flex-row md:items-center md:justify-between"}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              Make us a preferred source on Google
            </p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              See more of our new, research-cited South African peptide explainers in Google Search,
              Top Stories, AI Overviews and AI Mode when they are relevant.
            </p>
          </div>
        </div>
        <div className="shrink-0 pl-12 sm:pl-0">
          <a
            href={PREFERRED_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Add Peptide South Africa as a preferred source on Google"
          >
            Add as preferred source
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </aside>
  );
}
