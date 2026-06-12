import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Trash2, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";

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
  is_published: boolean;
}

const empty = {
  product_slug: products[0]?.slug ?? "",
  variant_label: "",
  lot_number: "",
  hplc_purity: "",
  mass_spec_passed: true,
  endotoxin_eu_mg: "",
  lab_name: "Janoshik Analytical",
  test_date: new Date().toISOString().slice(0, 10),
  manufactured_at: "",
  expires_at: "",
  is_published: true,
};

export default function AdminBatchesPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    refresh();
  }, [user, isAdmin, loading]);

  const refresh = async () => {
    const { data } = await supabase
      .from("product_batches")
      .select("*")
      .order("test_date", { ascending: false })
      .limit(100);
    setBatches((data as Batch[]) ?? []);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);

    let coa_pdf_url: string | null = null;
    if (file) {
      const path = `${form.product_slug}/${form.lot_number}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("coa-pdfs").upload(path, file, {
        contentType: "application/pdf",
        upsert: false,
      });
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        setBusy(false);
        return;
      }
      const { data: signed } = await supabase.storage
        .from("coa-pdfs")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5); // 5-year signed link
      coa_pdf_url = signed?.signedUrl ?? null;
    }

    const { error } = await supabase.from("product_batches").insert({
      product_slug: form.product_slug,
      variant_label: form.variant_label || null,
      lot_number: form.lot_number.toUpperCase(),
      hplc_purity: form.hplc_purity ? Number(form.hplc_purity) : null,
      mass_spec_passed: form.mass_spec_passed,
      endotoxin_eu_mg: form.endotoxin_eu_mg ? Number(form.endotoxin_eu_mg) : null,
      lab_name: form.lab_name,
      test_date: form.test_date,
      manufactured_at: form.manufactured_at || null,
      expires_at: form.expires_at || null,
      is_published: form.is_published,
      coa_pdf_url,
    });
    setBusy(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Batch published", description: `Lot ${form.lot_number.toUpperCase()} is live.` });
    setForm(empty);
    setFile(null);
    refresh();
  };

  const togglePublish = async (b: Batch) => {
    await supabase.from("product_batches").update({ is_published: !b.is_published }).eq("id", b.id);
    refresh();
  };

  const deleteBatch = async (b: Batch) => {
    if (!confirm(`Delete lot ${b.lot_number}? This cannot be undone.`)) return;
    await supabase.from("product_batches").delete().eq("id", b.id);
    refresh();
  };

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">Lab Batches</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Publish a new batch with its COA. Customers verify lots on the public <code>/testing</code> page.
      </p>

      {/* Create form */}
      <form onSubmit={handleSubmit} className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
        <select
          required
          value={form.product_slug}
          onChange={(e) => setForm({ ...form, product_slug: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name} ({p.sku ?? p.slug})</option>
          ))}
        </select>
        <input
          placeholder="Variant (optional, e.g. 10-Pack)"
          value={form.variant_label}
          onChange={(e) => setForm({ ...form, variant_label: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Lot number — e.g. RTT-RT3-2607A"
          value={form.lot_number}
          onChange={(e) => setForm({ ...form, lot_number: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm uppercase"
        />
        <input
          placeholder="HPLC purity %"
          type="number"
          step="0.01"
          value={form.hplc_purity}
          onChange={(e) => setForm({ ...form, hplc_purity: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="Endotoxin EU/mg"
          type="number"
          step="0.001"
          value={form.endotoxin_eu_mg}
          onChange={(e) => setForm({ ...form, endotoxin_eu_mg: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="Lab name"
          value={form.lab_name}
          onChange={(e) => setForm({ ...form, lab_name: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Test date
          <input
            required
            type="date"
            value={form.test_date}
            onChange={(e) => setForm({ ...form, test_date: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Manufactured
          <input
            type="date"
            value={form.manufactured_at}
            onChange={(e) => setForm({ ...form, manufactured_at: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Expires
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.mass_spec_passed}
            onChange={(e) => setForm({ ...form, mass_spec_passed: e.target.checked })}
          />
          Mass spec passed
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          Publish immediately
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Upload className="h-4 w-4 text-primary" />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="sm:col-span-3 inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> {busy ? "Publishing…" : "Publish batch"}
        </button>
      </form>

      {/* List */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-foreground">Published & Draft batches</h2>
        <div className="mt-4 space-y-2">
          {batches.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No batches yet — add your first above.
            </p>
          ) : (
            batches.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                  {b.lot_number}
                </span>
                <span className="text-foreground">{b.product_slug}{b.variant_label ? ` · ${b.variant_label}` : ""}</span>
                {b.hplc_purity != null && <span className="text-xs text-muted-foreground">{Number(b.hplc_purity).toFixed(2)}% HPLC</span>}
                <span className="text-xs text-muted-foreground">{new Date(b.test_date).toLocaleDateString()}</span>
                {b.coa_pdf_url && (
                  <a href={b.coa_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <FileText className="h-3.5 w-3.5" /> COA <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <span className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(b)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${b.is_published ? "bg-trust/10 text-trust" : "bg-muted text-muted-foreground"}`}
                  >
                    {b.is_published ? <><CheckCircle2 className="mr-1 inline h-3 w-3" /> Live</> : "Draft"}
                  </button>
                  <button
                    onClick={() => deleteBatch(b)}
                    className="rounded-md border border-destructive/40 bg-destructive/5 p-1.5 text-destructive hover:bg-destructive/10"
                    aria-label="Delete batch"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
