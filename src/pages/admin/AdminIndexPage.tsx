import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquareQuote, HelpCircle, Database, Search, FlaskConical, PackageCheck, Users } from "lucide-react";

export default function AdminIndexPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [shipmentCounts, setShipmentCounts] = useState<{ total: number; open: number } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
    Promise.all([
      supabase.from("shipments").select("id", { count: "exact", head: true }).eq("channel", "b2c"),
      supabase.from("shipments").select("id", { count: "exact", head: true }).eq("channel", "b2c").not("status", "in", '("delivered","cancelled")'),
    ]).then(([total, open]) => setShipmentCounts({ total: total.count ?? 0, open: open.count ?? 0 }));
  }, [user, isAdmin, loading]);

  const cards = [
    { to: "/admin/fulfilment", icon: PackageCheck, title: "PostNet Fulfilment", desc: "Pick, allocate lots, complete packing checks, print handover sheets and record tracking." },
    { to: "/admin/customers", icon: Users, title: "Customers (CRM)", desc: "Enriched lifetime records, segments, tags, timeline, manual credits." },
    { to: "/admin/batches", icon: FlaskConical, title: "Lab Batches & COAs", desc: "Publish HPLC-tested batches and upload Janoshik COA PDFs." },
    { to: "/admin/testimonials", icon: MessageSquareQuote, title: "Testimonials", desc: "Manage social proof shown across the site." },
    { to: "/admin/faqs", icon: HelpCircle, title: "Product FAQs", desc: "Edit the global FAQ accordion on every product page." },
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

      {/* First-party CRM status */}
      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Supabase CRM &amp; Fulfilment Sync</h3>
          <span className="rounded-full bg-trust/10 px-2 py-0.5 text-xs font-semibold text-trust">connected</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Paid website orders are written into the existing <code>psa_orders</code> CRM record, linked to one <code>shipments</code> record,
          and tracked through the shared <code>fulfilment_events</code> audit trail.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-muted px-3 py-2 text-foreground"><strong>{shipmentCounts?.open ?? "…"}</strong> open parcels</span>
          <span className="rounded-lg bg-muted px-3 py-2 text-foreground"><strong>{shipmentCounts?.total ?? "…"}</strong> CRM shipments</span>
        </div>
        <Link to="/admin/fulfilment" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Open PostNet queue</Link>
      </div>
    </div>
  );
}
