import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Send,
  Truck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type FulfilmentStatus =
  | "pending_pick"
  | "picking"
  | "packed"
  | "dispatched"
  | "ready_for_collection"
  | "delivered"
  | "exception"
  | "cancelled";

type ChecklistKey =
  | "items_verified"
  | "batch_verified"
  | "insulation_added"
  | "cold_pack_added"
  | "tamper_seal_applied"
  | "insert_added"
  | "final_check";

interface OrderItem {
  product_id?: string;
  product_slug: string;
  sku?: string | null;
  name: string;
  variant_label?: string | null;
  quantity: number;
  unit_price_zar?: number;
  is_accessory?: boolean;
  packing_profile?: string;
}

interface ShippingAddress {
  address1?: string | null;
  city?: string;
  province?: string;
  postal_code?: string;
  postnet_branch?: string | null;
}

interface Allocation {
  id: string;
  shipment_id: string;
  product_slug: string;
  variant_label: string | null;
  lot_number: string;
  expires_at: string | null;
  quantity: number;
}

interface WebOrder {
  id: string;
  public_ref: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress;
  shipping_method: string | null;
  order_items: OrderItem[];
  order_description: string | null;
  total: number;
  paid_at: string | null;
  created_at: string;
}

interface Fulfilment {
  id: string;
  web_order_id: string | null;
  status: FulfilmentStatus;
  courier: string | null;
  service: string;
  postnet_branch_name: string | null;
  tracking_number: string | null;
  packing_profile: "insulated" | "ambient_accessories";
  packing_checklist: Partial<Record<ChecklistKey, boolean>>;
  tamper_seal_number: string | null;
  weight_kg: number | null;
  packing_notes: string | null;
  packed_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  created_at: string;
  orders: WebOrder;
  shipment_batch_allocations: Allocation[];
}

const checklistLabels: Record<ChecklistKey, string> = {
  items_verified: "Items and quantities verified",
  batch_verified: "Lot and expiry recorded",
  insulation_added: "Insulated pouch or liner added",
  cold_pack_added: "Cold pack added without direct vial contact",
  tamper_seal_applied: "Tamper-evident seal applied",
  insert_added: "Quick-start card and support QR added",
  final_check: "Final name, service and parcel check complete",
};

const statusCopy: Record<FulfilmentStatus, { label: string; className: string }> = {
  pending_pick: { label: "To pick", className: "bg-amber-500/10 text-amber-700" },
  picking: { label: "Picking", className: "bg-blue-500/10 text-blue-700" },
  packed: { label: "Packed", className: "bg-violet-500/10 text-violet-700" },
  dispatched: { label: "Dispatched", className: "bg-primary/10 text-primary" },
  ready_for_collection: { label: "Ready to collect", className: "bg-cyan-500/10 text-cyan-700" },
  delivered: { label: "Delivered", className: "bg-trust/10 text-trust" },
  exception: { label: "Exception", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "—";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);

function asOrderItems(value: unknown): OrderItem[] {
  return Array.isArray(value) ? (value as OrderItem[]) : [];
}

function asAddress(value: unknown): ShippingAddress {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as ShippingAddress) : {};
}

export default function AdminFulfilmentPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<Fulfilment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"open" | "all" | FulfilmentStatus>("open");
  const [draft, setDraft] = useState({ tracking: "", seal: "", weight: "", notes: "" });
  const [allocationDrafts, setAllocationDrafts] = useState<Record<string, { lot: string; expiry: string; quantity: string }>>({});

  const refresh = useCallback(async (keepSelection = true) => {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        *,
        orders!shipments_web_order_id_fkey(
          id, public_ref, customer_name, customer_email, customer_phone,
          shipping_address, shipping_method, order_items, order_description,
          total, paid_at, created_at
        ),
        shipment_batch_allocations(*)
      `)
      .eq("channel", "b2c")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Queue unavailable", description: error.message, variant: "destructive" });
      setRows([]);
    } else {
      const normalized = ((data ?? []) as unknown as Fulfilment[]).map((row) => ({
        ...row,
        orders: {
          ...row.orders,
          order_items: asOrderItems(row.orders.order_items),
          shipping_address: asAddress(row.orders.shipping_address),
        },
        packing_checklist: (row.packing_checklist ?? {}) as Partial<Record<ChecklistKey, boolean>>,
        shipment_batch_allocations: row.shipment_batch_allocations ?? [],
      }));
      setRows(normalized);
      setSelectedId((current) => {
        if (!keepSelection || !current || !normalized.some((row) => row.id === current)) return normalized[0]?.id ?? null;
        return current;
      });
    }
    setLoadingRows(false);
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?next=/admin/fulfilment"); return; }
    if (!isAdmin) { navigate("/"); return; }
    refresh(false);
  }, [user, isAdmin, loading, navigate, refresh]);

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    setDraft({
      tracking: selected.tracking_number ?? "",
      seal: selected.tamper_seal_number ?? "",
      weight: selected.weight_kg ? String(Math.round(selected.weight_kg * 1000)) : "",
      notes: selected.packing_notes ?? "",
    });
    const next: Record<string, { lot: string; expiry: string; quantity: string }> = {};
    selected.orders.order_items.forEach((item) => {
      const key = `${item.product_slug}::${item.variant_label ?? ""}`;
      const saved = selected.shipment_batch_allocations.find(
        (allocation) => allocation.product_slug === item.product_slug && (allocation.variant_label ?? "") === (item.variant_label ?? ""),
      );
      next[key] = {
        lot: saved?.lot_number ?? "",
        expiry: saved?.expires_at ?? "",
        quantity: String(saved?.quantity ?? item.quantity ?? 1),
      };
    });
    setAllocationDrafts(next);
  }, [selected]);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const statusMatch = filter === "all"
        ? true
        : filter === "open"
          ? !["delivered", "cancelled"].includes(row.status)
          : row.status === filter;
      if (!statusMatch) return false;
      if (!needle) return true;
      const haystack = [
        row.orders.public_ref,
        row.orders.customer_name,
        row.orders.customer_email,
        row.orders.customer_phone,
        row.tracking_number,
        row.postnet_branch_name,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [rows, query, filter]);

  const counts = useMemo(() => ({
    toPick: rows.filter((row) => row.status === "pending_pick").length,
    packing: rows.filter((row) => ["picking", "packed"].includes(row.status)).length,
    outbound: rows.filter((row) => ["dispatched", "ready_for_collection"].includes(row.status)).length,
  }), [rows]);

  const saveFulfilment = async (patch: Record<string, unknown>, success?: string) => {
    if (!selected) return false;
    setSaving(true);
    const { error } = await supabase.from("shipments").update(patch).eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return false;
    }
    if (success) toast({ title: success });
    await refresh();
    return true;
  };

  const saveParcelDetails = () => saveFulfilment({
    tracking_number: draft.tracking.trim() || null,
    tamper_seal_number: draft.seal.trim() || null,
    weight_kg: draft.weight ? Number(draft.weight) / 1000 : null,
    packing_notes: draft.notes.trim() || null,
  }, "Parcel details saved");

  const toggleCheck = async (key: ChecklistKey) => {
    if (!selected) return;
    await saveFulfilment({
      packing_checklist: { ...selected.packing_checklist, [key]: !selected.packing_checklist[key] },
      status: selected.status === "pending_pick" ? "picking" : selected.status,
    });
  };

  const saveAllocation = async (item: OrderItem) => {
    if (!selected || !user) return;
    const key = `${item.product_slug}::${item.variant_label ?? ""}`;
    const allocation = allocationDrafts[key];
    if (!allocation?.lot.trim()) {
      toast({ title: "Lot number required", description: `Record the lot for ${item.name}.`, variant: "destructive" });
      return;
    }
    const existing = selected.shipment_batch_allocations.find(
      (row) => row.product_slug === item.product_slug && (row.variant_label ?? "") === (item.variant_label ?? ""),
    );
    const payload = {
      shipment_id: selected.id,
      product_slug: item.product_slug,
      variant_label: item.variant_label ?? null,
      lot_number: allocation.lot.trim().toUpperCase(),
      expires_at: allocation.expiry || null,
      quantity: Math.max(1, Number(allocation.quantity) || 1),
      allocated_by: user.id,
    };
    const result = existing
      ? await supabase.from("shipment_batch_allocations").update(payload).eq("id", existing.id)
      : await supabase.from("shipment_batch_allocations").insert(payload);
    if (result.error) {
      toast({ title: "Allocation not saved", description: result.error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Lot allocated", description: `${item.name} · ${payload.lot_number}` });
    await refresh();
  };

  const markPacked = async () => {
    if (!selected || !user) return;
    const required: ChecklistKey[] = ["items_verified", "batch_verified", "tamper_seal_applied", "insert_added", "final_check"];
    if (selected.packing_profile === "insulated") required.push("insulation_added", "cold_pack_added");
    const missingChecks = required.filter((key) => !selected.packing_checklist[key]);
    const peptideLines = selected.orders.order_items.filter((item) => !item.is_accessory);
    const missingLots = peptideLines.filter((item) => !selected.shipment_batch_allocations.some(
      (allocation) => allocation.product_slug === item.product_slug && (allocation.variant_label ?? "") === (item.variant_label ?? ""),
    ));
    if (missingChecks.length || missingLots.length || !draft.seal.trim() || !Number(draft.weight)) {
      toast({
        title: "Parcel is not pack-ready",
        description: "Complete every required check, record all peptide lots, add the seal number and enter the parcel weight.",
        variant: "destructive",
      });
      return;
    }
    await saveFulfilment({
      status: "packed",
      packed_by: user.id,
      tamper_seal_number: draft.seal.trim(),
      weight_kg: Number(draft.weight) / 1000,
      packing_notes: draft.notes.trim() || null,
    }, "Parcel marked packed");
  };

  const markDispatched = async () => {
    if (!selected) return;
    if (!draft.tracking.trim()) {
      toast({ title: "Tracking number required", description: "Add the PostNet tracking number before handover.", variant: "destructive" });
      return;
    }
    await saveFulfilment({ status: "dispatched", tracking_number: draft.tracking.trim().toUpperCase() }, "PostNet handover recorded");
  };

  if (loading || !user || !isAdmin) {
    return <div className="container flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Cape Town packing desk</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground">PostNet fulfilment</h1>
          <p className="mt-2 text-sm text-muted-foreground">Paid orders move from batch allocation to packed parcel and PostNet handover.</p>
        </div>
        <button onClick={() => refresh()} disabled={loadingRows} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loadingRows ? "animate-spin" : ""}`} /> Refresh queue
        </button>
      </div>

      <div className="no-print mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Waiting to pick", value: counts.toPick, icon: Clock3 },
          { label: "At packing desk", value: counts.packing, icon: Box },
          { label: "With PostNet", value: counts.outbound, icon: Truck },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><stat.icon className="h-5 w-5" /></span>
            <div><p className="font-display text-2xl font-bold text-foreground">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
          </div>
        ))}
      </div>

      <div className="no-print mt-6 grid min-h-[680px] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-border bg-muted/20 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-border p-4">
            <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order, customer or tracking" className="w-full bg-transparent py-2.5 text-sm outline-none" />
            </label>
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
              <option value="open">All open work</option>
              <option value="pending_pick">Waiting to pick</option>
              <option value="picking">Picking</option>
              <option value="packed">Packed</option>
              <option value="dispatched">Dispatched</option>
              <option value="ready_for_collection">Ready for collection</option>
              <option value="delivered">Delivered</option>
              <option value="exception">Exceptions</option>
              <option value="all">All records</option>
            </select>
          </div>
          <div className="max-h-[590px] overflow-y-auto">
            {loadingRows ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : visibleRows.length === 0 ? (
              <div className="p-8 text-center"><PackageCheck className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-semibold text-foreground">Queue is clear</p><p className="mt-1 text-xs text-muted-foreground">Paid orders will appear here automatically.</p></div>
            ) : visibleRows.map((row) => (
              <button key={row.id} onClick={() => setSelectedId(row.id)} className={`w-full border-b border-border p-4 text-left transition-colors hover:bg-background ${selectedId === row.id ? "bg-background shadow-[inset_3px_0_0_hsl(var(--primary))]" : ""}`}>
                <span className="flex items-start justify-between gap-2">
                  <span><span className="block font-mono text-xs font-semibold text-primary">{row.orders.public_ref}</span><span className="mt-1 block text-sm font-semibold text-foreground">{row.orders.customer_name || "Customer"}</span></span>
                  <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                </span>
                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusCopy[row.status].className}`}>{statusCopy[row.status].label}</span>
                  <span className="text-[11px] text-muted-foreground">{row.service === "postnet_to_postnet" ? "Branch" : "Door"}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 p-5 lg:p-7">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-center"><div><Box className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Select an order to begin packing.</p></div></div>
          ) : (
            <div className="space-y-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-bold text-primary">{selected.orders.public_ref}</span><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusCopy[selected.status].className}`}>{statusCopy[selected.status].label}</span></div>
                  <h2 className="mt-2 font-display text-2xl font-bold text-foreground">{selected.orders.customer_name || "Customer order"}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Paid {formatDate(selected.orders.paid_at)} · {formatMoney(Number(selected.orders.total))}</p>
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary"><Printer className="h-4 w-4" /> Print handover sheet</button>
              </div>

              <section className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p><p className="mt-2 font-semibold text-foreground">{selected.orders.customer_name || "—"}</p><p className="text-sm text-muted-foreground">{selected.orders.customer_phone || "No phone"}</p><p className="text-sm text-muted-foreground">{selected.orders.customer_email || "No email"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PostNet service</p><p className="mt-2 flex items-start gap-2 font-semibold text-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{selected.service === "postnet_to_postnet" ? selected.postnet_branch_name || "Branch not recorded" : [selected.orders.shipping_address.address1, selected.orders.shipping_address.city, selected.orders.shipping_address.province, selected.orders.shipping_address.postal_code].filter(Boolean).join(", ")}</p></div>
              </section>

              <section>
                <h3 className="font-display text-lg font-bold text-foreground">1. Pick items and record lots</h3>
                <div className="mt-3 space-y-3">
                  {selected.orders.order_items.length === 0 ? (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mr-2 inline h-4 w-4" />This older order has no item snapshot. Use the order description: {selected.orders.order_description || "not available"}</div>
                  ) : selected.orders.order_items.map((item, index) => {
                    const key = `${item.product_slug}::${item.variant_label ?? ""}`;
                    const allocation = allocationDrafts[key] ?? { lot: "", expiry: "", quantity: String(item.quantity) };
                    return (
                      <div key={`${key}-${index}`} className="rounded-xl border border-border bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.variant_label || item.sku || item.product_slug}</p></div><span className="rounded bg-muted px-2 py-1 text-xs font-bold">Qty {item.quantity}</span></div>
                        {!item.is_accessory && (
                          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_150px_90px_auto]">
                            <input value={allocation.lot} onChange={(event) => setAllocationDrafts((prev) => ({ ...prev, [key]: { ...allocation, lot: event.target.value } }))} placeholder="Lot number" className="rounded-lg border border-input bg-card px-3 py-2 text-sm uppercase" />
                            <input type="date" value={allocation.expiry} onChange={(event) => setAllocationDrafts((prev) => ({ ...prev, [key]: { ...allocation, expiry: event.target.value } }))} className="rounded-lg border border-input bg-card px-3 py-2 text-sm" />
                            <input type="number" min="1" value={allocation.quantity} onChange={(event) => setAllocationDrafts((prev) => ({ ...prev, [key]: { ...allocation, quantity: event.target.value } }))} aria-label={`Quantity for ${item.name}`} className="rounded-lg border border-input bg-card px-3 py-2 text-sm" />
                            <button onClick={() => saveAllocation(item)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save lot</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="font-display text-lg font-bold text-foreground">2. Packing checks</h3>
                <p className="mt-1 text-xs text-muted-foreground">Profile: {selected.packing_profile === "insulated" ? "Insulated parcel" : "Ambient accessories"}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(Object.keys(checklistLabels) as ChecklistKey[]).filter((key) => selected.packing_profile === "insulated" || !["insulation_added", "cold_pack_added"].includes(key)).map((key) => (
                    <button key={key} onClick={() => toggleCheck(key)} className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${selected.packing_checklist[key] ? "border-trust/40 bg-trust/5 text-foreground" : "border-border bg-background text-muted-foreground"}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected.packing_checklist[key] ? "border-trust bg-trust text-white" : "border-input"}`}>{selected.packing_checklist[key] && <Check className="h-3.5 w-3.5" />}</span>{checklistLabels[key]}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-display text-lg font-bold text-foreground">3. Parcel and PostNet handover</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-muted-foreground">Seal number<input value={draft.seal} onChange={(event) => setDraft({ ...draft, seal: event.target.value })} placeholder="TE-000123" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal text-foreground uppercase" /></label>
                  <label className="text-xs font-semibold text-muted-foreground">Weight (grams)<input type="number" min="1" value={draft.weight} onChange={(event) => setDraft({ ...draft, weight: event.target.value })} placeholder="350" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                  <label className="text-xs font-semibold text-muted-foreground">PostNet tracking<input value={draft.tracking} onChange={(event) => setDraft({ ...draft, tracking: event.target.value })} placeholder="Tracking number" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal text-foreground uppercase" /></label>
                </div>
                <label className="mt-3 block text-xs font-semibold text-muted-foreground">Packing notes<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={2} placeholder="Exception, replacement, or handover note" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={saveParcelDetails} disabled={saving} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary disabled:opacity-50">Save details</button>
                  {selected.status === "pending_pick" && <button onClick={() => saveFulfilment({ status: "picking" }, "Picking started")} disabled={saving} className="rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-foreground">Start picking</button>}
                  {["pending_pick", "picking"].includes(selected.status) && <button onClick={markPacked} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"><PackageCheck className="h-4 w-4" /> Mark packed</button>}
                  {selected.status === "packed" && <button onClick={markDispatched} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /> Record PostNet handover</button>}
                  {selected.status === "dispatched" && selected.service === "postnet_to_postnet" && <button onClick={() => saveFulfilment({ status: "ready_for_collection" }, "Ready for collection")} disabled={saving} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white">Ready at branch</button>}
                  {["dispatched", "ready_for_collection"].includes(selected.status) && <button onClick={() => saveFulfilment({ status: "delivered" }, "Order completed")} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-trust px-4 py-2.5 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" /> Mark delivered</button>}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {selected && (
        <section className="postnet-print-sheet hidden bg-white p-8 text-black">
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em]">Peptide South Africa</p><h1 className="mt-1 text-2xl font-bold">PostNet handover sheet</h1></div>
            <div className="text-right"><p className="font-mono text-lg font-bold">{selected.orders.public_ref}</p><p className="text-xs">Packed: {selected.packed_at ? formatDate(selected.packed_at) : "pending"}</p></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-8">
            <div><p className="text-xs font-bold uppercase">Recipient</p><p className="mt-1 text-lg font-bold">{selected.orders.customer_name}</p><p>{selected.orders.customer_phone}</p><p>{selected.orders.customer_email}</p></div>
            <div><p className="text-xs font-bold uppercase">Service</p><p className="mt-1 text-lg font-bold">{selected.service === "postnet_to_postnet" ? "PostNet to PostNet" : "PostNet to Door"}</p><p>{selected.service === "postnet_to_postnet" ? selected.postnet_branch_name : [selected.orders.shipping_address.address1, selected.orders.shipping_address.city, selected.orders.shipping_address.province, selected.orders.shipping_address.postal_code].filter(Boolean).join(", ")}</p></div>
          </div>
          <table className="mt-6 w-full border-collapse text-left text-sm"><thead><tr className="border-y-2 border-black"><th className="py-2">Qty</th><th>Item</th><th>Variant</th><th>Lot / Expiry</th></tr></thead><tbody>{selected.orders.order_items.map((item, index) => { const allocation = selected.shipment_batch_allocations.find((row) => row.product_slug === item.product_slug && (row.variant_label ?? "") === (item.variant_label ?? "")); return <tr key={index} className="border-b border-gray-400"><td className="py-2 font-bold">{item.quantity}</td><td>{item.name}</td><td>{item.variant_label || item.sku || "—"}</td><td className="font-mono">{allocation ? `${allocation.lot_number}${allocation.expires_at ? ` / ${allocation.expires_at}` : ""}` : item.is_accessory ? "N/A" : "NOT RECORDED"}</td></tr>; })}</tbody></table>
          <div className="mt-6 grid grid-cols-3 gap-5 border-y-2 border-black py-4"><div><p className="text-xs font-bold uppercase">Seal</p><p className="font-mono text-lg">{selected.tamper_seal_number || "—"}</p></div><div><p className="text-xs font-bold uppercase">Weight</p><p className="text-lg">{selected.weight_kg ? `${Math.round(selected.weight_kg * 1000)} g` : "—"}</p></div><div><p className="text-xs font-bold uppercase">Tracking</p><p className="font-mono text-lg">{selected.tracking_number || "Add at counter"}</p></div></div>
          <div className="mt-8 grid grid-cols-2 gap-10"><div className="border-t border-black pt-2 text-xs">Packer signature</div><div className="border-t border-black pt-2 text-xs">PostNet handover / date</div></div>
          <p className="mt-8 text-center text-[10px] uppercase tracking-wider">Internal handover sheet — attach the official PostNet consignment label separately.</p>
        </section>
      )}
    </div>
  );
}
