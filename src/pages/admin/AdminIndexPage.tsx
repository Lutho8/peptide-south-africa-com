import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquareQuote, HelpCircle, Tag, Database, ExternalLink, Search, FlaskConical } from "lucide-react";

interface LogRow {
  id: string;
  action: string;
  status: string;
  created_at: string;
  error: string | null;
}

export default function AdminIndexPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [hasNocoConfig, setHasNocoConfig] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    supabase
      .from("integration_logs")
      .select("id, action, status, created_at, error")
      .eq("integration", "nocobase")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setLogs(data ?? []);
        // If any non-skipped log exists, treat as configured
        setHasNocoConfig((data ?? []).some((l) => l.status !== "skipped_not_configured"));
      });
  }, [user, isAdmin, loading]);

  const cards = [
    { to: "/admin/batches", icon: FlaskConical, title: "Lab Batches & COAs", desc: "Publish HPLC-tested batches and upload Janoshik COA PDFs." },
    { to: "/admin/testimonials", icon: MessageSquareQuote, title: "Testimonials", desc: "Manage social proof shown across the site." },
    { to: "/admin/faqs", icon: HelpCircle, title: "Product FAQs", desc: "Edit the global FAQ accordion on every product page." },
    { to: "/admin/discounts", icon: Tag, title: "Discount Eligibility", desc: "Check why PEPTIDESA10 is or isn't applied for a user." },
    { to: "/admin/seo-reindex", icon: Search, title: "SEO Re-indexing", desc: "Checklist to re-run URL Inspection after each sitemap update." },
  ];

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">Admin</h1>
      <p className="mt-2 text-muted-foreground">Operational tools for the Peptide South Africa team.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:border-primary hover:shadow-glow"
          >
            <c.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Nocobase status */}
      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Nocobase CRM Sync</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            hasNocoConfig ? "bg-trust/10 text-trust" : "bg-muted text-muted-foreground"
          }`}>
            {hasNocoConfig === null ? "checking…" : hasNocoConfig ? "configured" : "not configured"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Lead, order, quiz, and abandoned-cart events flow to Nocobase via the <code>nocobase-sync</code> edge function.
          See <code>NOCOBASE_SETUP.md</code> for setup steps.
        </p>
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent events</h4>
          {logs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                  <span className="font-medium text-foreground">{l.action}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${
                    l.status === "ok" ? "bg-trust/10 text-trust" :
                    l.status.includes("error") || l.status === "exception" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>{l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <a
          href="https://www.nocobase.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          About Nocobase <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
