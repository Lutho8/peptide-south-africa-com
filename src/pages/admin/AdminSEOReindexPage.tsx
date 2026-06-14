import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, RefreshCw, CheckCheck, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

const SITE_URL = "https://www.peptide-south-africa.com";
const CYCLE_DAYS = 14;
const GSC_PROPERTY = encodeURIComponent(`${SITE_URL}/`);

interface Row {
  id: string;
  url: string;
  last_requested_at: string | null;
  cycle_started_at: string;
  notes: string | null;
}

interface SitemapMeta {
  generatedAt: string;
  urlCount: number;
}

function inspectUrl(path: string) {
  const full = `${SITE_URL}${path}`;
  return `https://search.google.com/search-console/inspect?resource_id=${GSC_PROPERTY}&id=${encodeURIComponent(full)}`;
}

function relative(ts: string | null) {
  if (!ts) return "never";
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function AdminSEOReindexPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<SitemapMeta | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    void load();
    void fetch("/sitemap-meta.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMeta)
      .catch(() => setMeta(null));
  }, [user, isAdmin, loading]);

  async function load() {
    const { data, error } = await supabase
      .from("seo_reindex_log")
      .select("id, url, last_requested_at, cycle_started_at, notes")
      .order("url");
    if (error) { toast.error(error.message); return; }
    const list = (data ?? []) as Row[];

    // Auto-reset rows older than CYCLE_DAYS
    const now = Date.now();
    const stale = list.filter((r) => now - new Date(r.cycle_started_at).getTime() >= CYCLE_DAYS * 86_400_000);
    if (stale.length) {
      await supabase
        .from("seo_reindex_log")
        .update({ last_requested_at: null, cycle_started_at: new Date().toISOString() })
        .in("id", stale.map((r) => r.id));
      const { data: refreshed } = await supabase
        .from("seo_reindex_log")
        .select("id, url, last_requested_at, cycle_started_at, notes")
        .order("url");
      setRows((refreshed ?? []) as Row[]);
      toast.info(`New ${CYCLE_DAYS}-day cycle started for ${stale.length} URL(s).`);
      return;
    }
    setRows(list);
  }

  async function markDone(row: Row, done: boolean) {
    const { error } = await supabase
      .from("seo_reindex_log")
      .update({ last_requested_at: done ? new Date().toISOString() : null })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, last_requested_at: done ? new Date().toISOString() : null } : r));
  }

  async function markAll() {
    setBusy(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("seo_reindex_log")
      .update({ last_requested_at: now })
      .in("id", rows.map((r) => r.id));
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setRows((rs) => rs.map((r) => ({ ...r, last_requested_at: now })));
    toast.success("Marked all URLs as re-indexed.");
  }

  async function resetCycle() {
    setBusy(true);
    const { error } = await supabase
      .from("seo_reindex_log")
      .update({ last_requested_at: null, cycle_started_at: new Date().toISOString() })
      .in("id", rows.map((r) => r.id));
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    void load();
    toast.success("Checklist reset — new cycle started.");
  }

  const sitemapDate = meta?.generatedAt ? new Date(meta.generatedAt) : null;
  const cycleStart = rows[0]?.cycle_started_at ? new Date(rows[0].cycle_started_at) : null;
  const daysIntoCycle = cycleStart ? Math.floor((Date.now() - cycleStart.getTime()) / 86_400_000) : 0;
  const daysLeft = Math.max(0, CYCLE_DAYS - daysIntoCycle);

  const staleAfterSitemap = useMemo(() => {
    if (!sitemapDate) return [];
    return rows.filter((r) => !r.last_requested_at || new Date(r.last_requested_at) < sitemapDate);
  }, [rows, sitemapDate]);

  const doneCount = rows.filter((r) => r.last_requested_at).length;

  return (
    <div className="container py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">SEO Re-indexing Checklist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            After every sitemap change, manually re-run URL Inspection in Google Search Console for the pages below.
            The list resets every {CYCLE_DAYS} days so nothing slips.
          </p>
        </div>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Status strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sitemap last built</p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">
            {sitemapDate ? sitemapDate.toLocaleString() : "unknown"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Cycle progress</p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">
            {doneCount}/{rows.length} done · {daysLeft}d left
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Search Console</p>
          <a
            href={`https://search.google.com/search-console?resource_id=${GSC_PROPERTY}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-display text-lg font-semibold text-primary hover:underline"
          >
            Open property <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Staleness banner */}
      {staleAfterSitemap.length > 0 && sitemapDate && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Sitemap updated {sitemapDate.toLocaleDateString()} — re-request indexing for {staleAfterSitemap.length} of {rows.length} pages.
            </p>
            <p className="mt-1 text-muted-foreground">
              Open each URL below in Search Console and click <strong>Request Indexing</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={markAll}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" /> Mark all done
        </button>
        <button
          disabled={busy}
          onClick={resetCycle}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> Reset checklist
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Last requested</th>
              <th className="w-44 px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const done = !!r.last_requested_at;
              const isStale = sitemapDate && (!r.last_requested_at || new Date(r.last_requested_at) < sitemapDate);
              return (
                <tr key={r.id} className={done ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={(e) => markDone(r, e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                      aria-label={`Mark ${r.url} re-indexed`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <code className="font-mono text-xs">{r.url}</code>
                    {isStale && !done && (
                      <span className="ml-2 inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        stale
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {relative(r.last_requested_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={inspectUrl(r.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Search className="h-3.5 w-3.5" /> Inspect <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Google has no public API for "Request Indexing" — this checklist tracks the manual clicks. Cycle: {CYCLE_DAYS} days.
      </p>
    </div>
  );
}
