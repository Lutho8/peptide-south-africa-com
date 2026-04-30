import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  scope: string;
  product_slug: string | null;
  display_order: number;
  is_published: boolean;
}

const empty: Omit<FAQ, "id"> = {
  question: "", answer: "", scope: "global", product_slug: "", display_order: 0, is_published: true,
};

export default function AdminFAQsPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<FAQ[]>([]);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState<Omit<FAQ, "id">>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    load();
  }, [user, isAdmin, loading]);

  const load = async () => {
    const { data, error } = await supabase
      .from("product_faqs")
      .select("*")
      .order("scope")
      .order("display_order");
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setItems(data ?? []);
  };

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (f: FAQ) => {
    setEditing(f);
    setForm({
      question: f.question, answer: f.answer, scope: f.scope,
      product_slug: f.product_slug ?? "", display_order: f.display_order, is_published: f.is_published,
    });
  };

  const save = async () => {
    setBusy(true);
    const payload = { ...form, product_slug: form.product_slug || null };
    const { error } = editing
      ? await supabase.from("product_faqs").update(payload).eq("id", editing.id)
      : await supabase.from("product_faqs").insert(payload);
    setBusy(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "FAQ updated" : "FAQ created" });
    startNew();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const { error } = await supabase.from("product_faqs").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "FAQ deleted" }); load(); }
  };

  if (loading) return <div className="container py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="container py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Product FAQs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit the FAQ accordion that appears on every product page.</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> New FAQ
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* List */}
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {items.length === 0 && <p className="p-6 text-sm text-muted-foreground">No FAQs yet.</p>}
          {items.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-3 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    f.scope === "global" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{f.scope}</span>
                  {!f.is_published && <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">draft</span>}
                  <span className="text-xs text-muted-foreground">#{f.display_order}</span>
                </div>
                <p className="mt-1 font-medium text-foreground">{f.question}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => startEdit(f)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(f.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-5 h-fit">
          <h3 className="font-display text-lg font-semibold text-foreground">{editing ? "Edit FAQ" : "New FAQ"}</h3>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question</span>
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Answer</span>
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scope</span>
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="global">global</option>
                  <option value="product">product</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</span>
                <input type="number" value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </label>
            </div>
            {form.scope === "product" && (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product slug</span>
                <input value={form.product_slug ?? ""} onChange={(e) => setForm({ ...form, product_slug: e.target.value })}
                  placeholder="e.g. retatrutide-10mg"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              Published
            </label>
            <button onClick={save} disabled={busy || !form.question.trim() || !form.answer.trim()}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? "Saving…" : editing ? "Save changes" : "Create FAQ"}
            </button>
            {editing && (
              <button onClick={startNew} className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground">Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
