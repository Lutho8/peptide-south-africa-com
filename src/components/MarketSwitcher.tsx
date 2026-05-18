import { useNavigate } from "react-router-dom";
import { useMarket, detectMarket, stripMarket, marketPath, type Market } from "@/hooks/useMarket";
import { useLocation } from "react-router-dom";

const OPTIONS: { value: Market; label: string; flag: string }[] = [
  { value: "default", label: "Global", flag: "🌐" },
  { value: "de", label: "DE", flag: "🇩🇪" },
  { value: "za", label: "ZA", flag: "🇿🇦" },
];

export default function MarketSwitcher() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = detectMarket(pathname);
  const generic = stripMarket(pathname);

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 text-xs">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            type="button"
            aria-label={`Switch to ${opt.label} market`}
            onClick={() => navigate(marketPath(generic, opt.value))}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span aria-hidden>{opt.flag}</span>
            <span className="ml-1 hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
