import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, ShieldCheck, FileText, Search, ExternalLink, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";

interface Batch {
  id: string;
  product_slug: string;
  variant_label: string | null;
  lot_number: string;
  hplc_purity: number | null;
  mass_spec_passed: boolean | null;
  endotoxin_eu_mg: number | null;
  lab_name: string;
  test_date: string;
  coa_pdf_url: string | null;
  manufactured_at: string | null;
  expires_at: string | null;
}

export default function TestingPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookup, setLookup] = useState("");
  const [lookupResult, setLookupResult] = useState<Batch | null | "not-found">(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("product_batches")
        .select("*")
        .eq("is_published", true)
        .order("test_date", { ascending: false })
        .limit(50);
      setBatches((data as Batch[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const lot = lookup.trim().toUpperCase();
    if (!lot) return;
    const { data } = await supabase
      .from("product_batches")
      .select("*")
      .eq("lot_number", lot)
      .eq("is_published", true)
      .maybeSingle();
    setLookupResult((data as Batch | null) ?? "not-found");
  };

  return (
    <>
      <SEO
        title="Lab Testing & COA Verification | Peptide South Africa"
        description="Every batch is independently HPLC-tested by Janoshik Analytical. Verify any lot number or download a Certificate of Analysis."
        path="/testing"
      />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Lab Testing" }]} />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <FlaskConical className="h-3.5 w-3.5" /> Independently Verified
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              Every batch. Tested. Signed. Posted.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              We send every production batch to <strong className="text-foreground">Janoshik Analytical</strong> — the lab
              trusted across the research-peptide industry — for HPLC purity, mass spec confirmation, and endotoxin testing.
              The signed COA for your exact lot number is available here, free, before and after you order.
            </p>
          </div>

          {/* Test stack */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: FlaskConical, label: "HPLC Purity", sub: "≥99% threshold · quantitative" },
              { icon: CheckCircle2, label: "Mass Spectrometry", sub: "Confirms exact compound identity" },
              { icon: ShieldCheck, label: "Endotoxin (LAL)", sub: "Sterile-injection grade limits" },
            ].map((t) => (
              <div key={t.label} className="rounded-2xl border border-border bg-background p-5">
                <t.icon className="h-6 w-6 text-primary" />
                <p className="mt-3 font-display text-base font-bold text-foreground">{t.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verify lookup */}
      <section className="border-b border-border bg-background py-12">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Verify your batch
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the lot number printed on your vial or packing slip.
            </p>

            <form onSubmit={handleLookup} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={lookup}
                  onChange={(e) => setLookup(e.target.value)}
                  placeholder="e.g. RTT-RT3-2607A"
                  className="w-full rounded-lg border border-input bg-card py-3 pl-9 pr-3 text-sm uppercase tracking-wider text-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
              >
                Verify
              </button>
            </form>

            {lookupResult === "not-found" && (
              <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                That lot number isn't in our system. Double-check the spelling, or contact support if it's printed on a recent shipment.
              </p>
            )}
            {lookupResult && lookupResult !== "not-found" && (
              <BatchCard batch={lookupResult} highlight />
            )}
          </div>
        </div>
      </section>

      {/* Published batch list */}
      <section className="bg-card py-12">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Published batches
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Most recent COAs across the catalog. Every product page links to the lot you'll receive.
            </p>

            <div className="mt-6 space-y-3">
              {loading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Loading lab records…</p>
              ) : batches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No batches published yet.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    New batches appear here as soon as the lab signs off — typically within 5 business days of production.
                  </p>
                </div>
              ) : (
                batches.map((b) => <BatchCard key={b.id} batch={b} />)
              )}
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-background p-6 text-sm">
              <h3 className="font-display text-lg font-semibold text-foreground">Why Janoshik?</h3>
              <p className="mt-2 text-muted-foreground">
                Janoshik Analytical is the most-cited independent lab in the research-peptide community, used by every
                serious vendor and a long list of academic groups. Their reports are signed and dated, and they keep
                their own ledger of which vendors have submitted samples — which means you can cross-check us
                independently.
              </p>
              <Link to="/shop" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Browse the catalog →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BatchCard({ batch, highlight }: { batch: Batch; highlight?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between ${
        highlight ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
            {batch.lot_number}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {batch.product_slug}
            {batch.variant_label ? ` · ${batch.variant_label}` : ""}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
          {batch.hplc_purity != null && (
            <span><strong>HPLC:</strong> {Number(batch.hplc_purity).toFixed(2)}%</span>
          )}
          {batch.mass_spec_passed && <span><strong>MS:</strong> ✓ Confirmed</span>}
          {batch.endotoxin_eu_mg != null && (
            <span><strong>Endotoxin:</strong> {batch.endotoxin_eu_mg} EU/mg</span>
          )}
          <span className="text-muted-foreground">
            Tested {new Date(batch.test_date).toLocaleDateString()}
          </span>
        </div>
      </div>
      {batch.coa_pdf_url ? (
        <a
          href={batch.coa_pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted"
        >
          <FileText className="h-3.5 w-3.5" /> Download COA <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="rounded-lg border border-dashed border-border px-4 py-2 text-xs text-muted-foreground">
          COA pending upload
        </span>
      )}
    </div>
  );
}
