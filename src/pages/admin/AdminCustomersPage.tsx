import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Tag as TagIcon, Coins, Mail, MessageCircle, Loader2 } from "lucide-react";

interface CustomerRow {
  user_id: string;
  phone_e164: string | null;
  province: string | null;
  acquisition_source: string | null;
  first_order_at: string | null;
  last_order_at: string | null;
  order_count: number;
  lifetime_value_zar: number;
  marketing_optin: boolean;
}

interface RetentionEvent {
  id: string;
  event: string;
  meta: Record<string, unknown>;
  occurred_at: string;
}

function formatZAR(n: number) {
  return `R${Number(n || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

function segmentFor(row: CustomerRow): string {
  if (!row.first_order_at) return "lead";
  if (row.lifetime_value_zar >= 10000) return "vip";
  const last = row.last_order_at ? new Date(row.last_order_at).getTime() : 0;
  const days = (Date.now() - last) / 86400000;
  if (days > 90) return "at_risk";
  if (days < 30) return "new";
  return "active";
}

export default function AdminCustomersPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [events, setEvents] = useState<RetentionEvent[]>([]);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<{ id: string; tag: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    load();
  }, [user, isAdmin, loading]);

  const load = async () => {
    const { data } = await supabase
      .from("customer_profiles")
      .select("user_id, phone_e164, province, acquisition_source, first_order_at, last_order_at, order_count, lifetime_value_zar, marketing_optin")
      .order("lifetime_value_zar", { ascending: false })
      .limit(500);
    setRows((data ?? []) as CustomerRow[]);
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      r.user_id.toLowerCase().includes(t) ||
      (r.phone_e164 ?? "").toLowerCase().includes(t) ||
      (r.province ?? "").toLowerCase().includes(t),
    );
  }, [rows, q]);

  const openCustomer = async (r: CustomerRow) => {
    setSelected(r);
    const [{ data: ev }, { data: tg }] = await Promise.all([
      supabase.from("retention_events").select("id, event, meta, occurred_at").eq("user_id", r.user_id).order("occurred_at", { ascending: false }).limit(50),
      supabase.from("customer_tags").select("id, tag").eq("user_id", r.user_id),
    ]);
    setEvents((ev ?? []) as RetentionEvent[]);
    setTags((tg ?? []) as { id: string; tag: string }[]);
  };

  const addTag = async () => {
    if (!selected || !tag.trim()) return;
    setBusy(true);
    const { data } = await supabase.from("customer_tags").insert({
      user_id: selected.user_id, tag: tag.trim().toLowerCase(), created_by: user!.id,
    }).select("id, tag").single();
    if (data) setTags((t) => [...t, data as { id: string; tag: string }]);
    setTag("");
    setBusy(false);
  };

  const removeTag = async (id: string) => {
    await supabase.from("customer_tags").delete().eq("id", id);
    setTags((t) => t.filter((x) => x.id !== id));
  };

  const issueCredit = async () => {
    if (!selected) return;
    setBusy(true);
    await supabase.from("loyalty_credits").insert({
      user_id: selected.user_id, delta_zar: 100, reason: "admin_manual_credit",
    });
    await supabase.from("retention_events").insert({
      user_id: selected.user_id, event: "loyalty_credit_issued", meta: { amount: 100, by: "admin" },
    });
    setBusy(false);
    alert("R100 credit issued.");
  };

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enriched lifetime customer records, sorted by lifetime value.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by user id, phone, province…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">Segment</th>
                <th className="px-3 py-2 text-right">Orders</th>
                <th className="px-3 py-2 text-right">LTV</th>
                <th className="px-3 py-2 text-left">Last order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const seg = segmentFor(r);
                return (
                  <tr
                    key={r.user_id}
                    onClick={() => openCustomer(r)}
                    className={`cursor-pointer border-t border-border hover:bg-muted/30 ${selected?.user_id === r.user_id ? "bg-muted/40" : ""}`}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        seg === "vip" ? "bg-primary/10 text-primary" :
                        seg === "at_risk" ? "bg-destructive/10 text-destructive" :
                        seg === "new" ? "bg-trust/10 text-trust" :
                        seg === "lead" ? "bg-muted text-muted-foreground" :
                        "bg-secondary/10 text-secondary-foreground"
                      }`}>{seg}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{r.order_count}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatZAR(r.lifetime_value_zar)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.last_order_at ? new Date(r.last_order_at).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">No customers match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <aside className="rounded-xl border border-border bg-card p-4 space-y-4 lg:sticky lg:top-24 h-fit">
            <div>
              <h3 className="font-display text-lg font-semibold">Customer detail</h3>
              <p className="font-mono text-xs text-muted-foreground break-all">{selected.user_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><div className="text-xs text-muted-foreground">LTV</div><div className="font-mono">{formatZAR(selected.lifetime_value_zar)}</div></div>
              <div><div className="text-xs text-muted-foreground">Orders</div><div>{selected.order_count}</div></div>
              <div><div className="text-xs text-muted-foreground">Province</div><div>{selected.province ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Source</div><div>{selected.acquisition_source ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Phone</div><div className="font-mono">{selected.phone_e164 ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Opt-in</div><div>{selected.marketing_optin ? "✓ marketing" : "—"}</div></div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tags</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => removeTag(t.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs hover:bg-destructive/10 hover:text-destructive"
                    title="Click to remove"
                  >
                    <TagIcon className="h-3 w-3" />{t.tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="add tag" className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm" />
                <button onClick={addTag} disabled={busy} className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">Add</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={issueCredit} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-trust/10 px-3 py-1.5 text-sm text-trust hover:bg-trust/20">
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Coins className="h-3 w-3" />} Issue R100 credit
              </button>
              {selected.phone_e164 && (
                <a
                  href={`https://wa.me/${selected.phone_e164.replace(/\D/g, "")}?text=${encodeURIComponent("Hi from Peptide South Africa — checking in on your protocol.")}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </a>
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Timeline</div>
              <ul className="space-y-1 max-h-64 overflow-auto">
                {events.length === 0 && <li className="text-xs text-muted-foreground">No events yet.</li>}
                {events.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2 border-l-2 border-primary/30 pl-2 py-0.5 text-xs">
                    <span className="font-medium">{e.event}</span>
                    <span className="text-muted-foreground">{new Date(e.occurred_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
