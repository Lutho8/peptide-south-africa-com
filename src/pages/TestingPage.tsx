import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Search,
  ShieldCheck,
} from "lucide-react";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { LabelStudioRecord } from "@/components/CoaLabelStudio";
import { supabase } from "@/integrations/supabase/client";
import { staticCoas } from "@/data/coas";
import { products } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";

const CoaLabelStudio = lazy(() => import("@/components/CoaLabelStudio"));

interface BatchRow {
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
  notes?: string | null;
}

interface PublishedCoa {
  id: string;
  productSlug: string;
  productName: string;
  productSku: string;
  strength: string;
  reference: string;
  taskNumber?: string;
  shortCode: string;
  labName: string;
  testDate: string;
  results: Array<{ label: string; value: string }>;
  reportUrl: string | null;
  reportImageUrl?: string;
  sourceNote?: string;
}

function isImageUrl(value: string | null): value is string {
  return Boolean(value && /\.(png|jpe?g|webp)(\?|$)/i.test(value));
}

function dynamicBatchToCoa(batch: BatchRow): PublishedCoa {
  const product = products.find((item) => item.slug === batch.product_slug);
  const strength = product?.variants?.[0]?.mgPerVial
    ? `${product.variants[0].mgPerVial} mg`
    : batch.variant_label ?? "";
  const results: Array<{ label: string; value: string }> = [];
  if (batch.hplc_purity != null) results.push({ label: "HPLC purity", value: `${Number(batch.hplc_purity).toFixed(2)}%` });
  if (batch.mass_spec_passed) results.push({ label: "Mass spectrometry", value: "Confirmed" });
  if (batch.endotoxin_eu_mg != null) results.push({ label: "Endotoxin", value: `${batch.endotoxin_eu_mg} EU/mg` });
  return {
    id: batch.id,
    productSlug: batch.product_slug,
    productName: product?.name ?? batch.product_slug,
    productSku: product?.sku ?? batch.product_slug,
    strength,
    reference: batch.lot_number,
    shortCode: batch.lot_number,
    labName: batch.lab_name,
    testDate: batch.test_date,
    results,
    reportUrl: batch.coa_pdf_url,
    reportImageUrl: isImageUrl(batch.coa_pdf_url) ? batch.coa_pdf_url : undefined,
    sourceNote: batch.notes ?? undefined,
  };
}

const baselineCoas: PublishedCoa[] = staticCoas.map((record) => ({
  id: record.id,
  productSlug: record.productSlug,
  productName: record.productName,
  productSku: record.productSku,
  strength: record.strength,
  reference: `Sample ${record.sampleReference}`,
  taskNumber: record.taskNumber,
  shortCode: record.shortCode,
  labName: record.labName,
  testDate: record.reportDate,
  results: record.results,
  reportUrl: record.verificationUrl,
  reportImageUrl: record.reportImageUrl,
  sourceNote: record.sourceNote,
}));

export default function TestingPage() {
  const [dynamicBatches, setDynamicBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookup, setLookup] = useState("");
  const [lookupResult, setLookupResult] = useState<PublishedCoa | null | "not-found">(null);
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("product_batches")
        .select("*")
        .eq("is_published", true)
        .order("test_date", { ascending: false })
        .limit(100);
      setDynamicBatches((data as BatchRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const records = useMemo(() => {
    const dynamic = dynamicBatches.map(dynamicBatchToCoa);
    return [...baselineCoas, ...dynamic.filter((item) => !baselineCoas.some((base) => base.reference === item.reference))];
  }, [dynamicBatches]);

  const labelRecords: LabelStudioRecord[] = records
    .filter((record) => record.reportUrl)
    .map((record) => ({
      id: record.id,
      shortCode: record.shortCode,
      productName: record.productName,
      strength: record.strength,
      productSku: record.productSku,
      taskNumber: record.taskNumber,
    }));

  const findRecord = (query: string) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return null;
    return records.find((record) => [record.reference, record.taskNumber, record.shortCode, record.productName, record.productSku]
      .some((value) => value?.toLowerCase().includes(needle))) ?? null;
  };

  useEffect(() => {
    if (loading) return;
    const initial = searchParams.get("lot");
    if (!initial) return;
    setLookup(initial);
    setLookupResult(findRecord(initial) ?? "not-found");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, records, searchParams]);

  const handleLookup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!lookup.trim()) return;
    setLookupResult(findRecord(lookup) ?? "not-found");
  };

  return (
    <>
      <SEO
        title="Lab Testing, COA Archive & Label Studio | Peptide South Africa"
        description="Review published independent lab reports, verify sample and lot references, and generate QR-linked vial labels for Nelko P21 or Brother VC-500W."
        path="/testing"
      />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Testing & COAs" }]} />

      <section className="border-b border-border bg-card">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <FlaskConical className="h-3.5 w-3.5" /> Source-linked verification
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              The report, the result and the label—in one place.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Review the exact tests reported for each published sample or lot, open the independent lab source, and create a vial label whose QR returns to that same record.
            </p>
            {isAdmin && (
              <Link to="/admin/batches" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <FilePlus2 className="h-4 w-4" /> Add another COA
              </Link>
            )}
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: FileText, label: "Exact report", sub: "Task, sample or lot reference shown" },
              { icon: CheckCircle2, label: "Reported results", sub: "Only tests present in the source are listed" },
              { icon: ShieldCheck, label: "Permanent QR path", sub: "Short PSA verification URL per record" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background p-5">
                <item.icon className="h-6 w-6 text-primary" />
                <p className="mt-3 font-display text-base font-bold text-foreground">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-12" id="verify">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Find a report</h2>
            <p className="mt-2 text-sm text-muted-foreground">Search by product, SKU, task number, sample reference or lot number.</p>
            <form onSubmit={handleLookup} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={lookup}
                  onChange={(event) => setLookup(event.target.value)}
                  placeholder="e.g. 164644, TSM10 or RTT-TES-5"
                  className="w-full rounded-lg border border-input bg-card py-3 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Verify</button>
            </form>
            {lookupResult === "not-found" && (
              <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                No published record matched that search. Check the reference or contact support before relying on the vial.
              </p>
            )}
          </div>
          {lookupResult && lookupResult !== "not-found" && (
            <div className="mx-auto mt-6 max-w-4xl"><CoaCard record={lookupResult} highlight /></div>
          )}
        </div>
      </section>

      <section className="bg-card py-12" id="archive">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Public archive</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">Published COAs</h2>
                <p className="mt-2 text-sm text-muted-foreground">The source note distinguishes a supplier sample report from a PSA-specific production lot.</p>
              </div>
              {isAdmin && <Link to="/admin/batches" className="text-sm font-semibold text-primary hover:underline">Manage archive →</Link>}
            </div>

            <div className="mt-6 space-y-5">
              {records.map((record) => <CoaCard key={record.id} record={record} />)}
              {!loading && records.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">No reports published yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-14" id="label-studio">
        <div className="container px-4">
          <div className="mx-auto mb-7 max-w-3xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Label studio</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">Print the verified record onto the vial.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Optimized for the Nelko P21 40 × 14 mm roll and Brother VC-500W 45 × 25 mm tape.</p>
          </div>
          <Suspense
            fallback={(
              <div className="mx-auto flex min-h-64 max-w-5xl items-center justify-center rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Loading the mobile label studio…
              </div>
            )}
          >
            <CoaLabelStudio records={labelRecords} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
function CoaCard({ record, highlight }: { record: PublishedCoa; highlight?: boolean }) {
  return (
    <article className={`overflow-hidden rounded-3xl border bg-background ${highlight ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
      <div className="grid md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        {record.reportImageUrl ? (
          <a href={record.reportUrl ?? record.reportImageUrl} target="_blank" rel="noopener noreferrer" className="relative flex min-h-72 items-center justify-center border-b border-border bg-white p-4 md:border-b-0 md:border-r">
            <img src={record.reportImageUrl} alt={`${record.productName} lab report`} className="max-h-[34rem] w-full object-contain" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
              <ImageIcon className="h-3 w-3" /> Open report
            </span>
          </a>
        ) : (
          <div className="flex min-h-52 items-center justify-center border-b border-border bg-muted/30 md:border-b-0 md:border-r">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">{record.reference}</span>
            {record.taskNumber && <span className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">Task #{record.taskNumber}</span>}
            {record.sourceNote?.includes("Zztai Peptide Ltd.") && (
              <span className="rounded bg-trust/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-trust">Supplier source report</span>
            )}
            <span className="text-xs text-muted-foreground">{new Date(record.testDate).toLocaleDateString("en-ZA")}</span>
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold text-foreground">{record.productName} {record.strength}</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{record.productSku} · {record.labName}</p>

          <dl className="mt-5 grid gap-2 sm:grid-cols-2">
            {record.results.length ? record.results.map((result) => (
              <div key={`${result.label}-${result.value}`} className="rounded-xl border border-border bg-card p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{result.label}</dt>
                <dd className="mt-1 font-display text-base font-bold text-foreground">{result.value}</dd>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-3 text-xs text-muted-foreground">See the source report for recorded results.</div>
            )}
          </dl>

          {record.sourceNote && (
            <p className="mt-5 rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
              <strong>Scope note:</strong> {record.sourceNote}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {record.reportUrl && (
              <a href={record.reportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                Verify source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <a href="#label-studio" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted">Create vial label</a>
            <Link to={`/product/${record.productSlug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted">View product</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
