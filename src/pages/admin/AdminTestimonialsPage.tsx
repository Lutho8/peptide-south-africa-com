import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  photo_url: string | null;
  display_order: number;
  is_published: boolean;
}

const empty: Omit<Testimonial, "id"> = {
  name: "", location: "", quote: "", rating: 5, photo_url: "", display_order: 0, is_published: true,
};

export default function AdminTestimonialsPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    load();
  }, [user, isAdmin, loading]);

  const load = async () => {
    const { data, error } = await supabase.from("testimonials").select("*").order("display_order");
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setItems(data ?? []);
  };

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, location: t.location ?? "", quote: t.quote, rating: t.rating, photo_url: t.photo_url ?? "", display_order: t.display_order, is_published: t.is_published });
  };

  const handlePhoto = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("testimonial-photos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("testimonial-photos").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    }
    setUploading(false);
  };

  const save = async () => {
    setBusy(true);
    const payload = { ...form, location: form.location || null, photo_url: form.photo_url || null };
    const { error } = editing
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: editing ? "Updated" : "Created" });
      setEditing(null); setForm(empty); await load();
    }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); await load(); }
  };

  if (loading) return <div className="container py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="container py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Testimonials</h1>
        <button onClick={startNew} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-5 lg:order-2">
          <h2 className="mb-3 font-display text-lg font-semibold">{editing ? "Edit" : "New"} testimonial</h2>
          <div className="flex flex-col gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (e.g. Sarah M.)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location (e.g. Johannesburg)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="Quote" rows={4} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <label className="text-xs text-muted-foreground">Rating: {form.rating}
              <input type="range" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} className="block w-full" />
            </label>
            <label className="text-xs text-muted-foreground">Display order
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: +e.target.value })} className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              Published
            </label>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Photo</p>
              {form.photo_url && <img src={form.photo_url} alt="" className="mb-2 h-20 w-20 rounded-lg object-cover" />}
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])} className="text-xs" />
              {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>}
            </div>
            <button disabled={busy || !form.name || !form.quote} onClick={save} className="rounded-lg bg-hero-gradient py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              {busy ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm(empty); }} className="text-xs text-muted-foreground hover:underline">Cancel edit</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            {items.map((t) => (
              <div key={t.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                {t.photo_url ? <img src={t.photo_url} alt={t.name} className="h-16 w-16 rounded-lg object-cover" /> : <div className="h-16 w-16 rounded-lg bg-muted" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    {t.location && <span className="text-xs text-muted-foreground">· {t.location}</span>}
                    {!t.is_published && <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">Draft</span>}
                  </div>
                  <div className="mt-0.5 flex">
                    {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 fill-badge text-badge" />)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.quote}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Order: {t.display_order}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(t)} className="rounded p-2 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(t.id)} className="rounded p-2 text-destructive hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-muted-foreground">No testimonials yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
