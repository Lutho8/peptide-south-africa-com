import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatZAR } from "@/lib/price";

interface RecentOrder {
  id: string;
  total: number;
  discount_code: string | null;
  created_at: string;
}

interface Result {
  found: boolean;
  eligible: boolean;
  code?: string;
  reasons: string[];
  user?: { id: string; email: string | null; created_at: string };
  order_count?: number;
  recent_orders?: RecentOrder[];
}

export default function AdminDiscountEligibilityPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }
  }, [user, isAdmin, loading]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("admin-discount-eligibility", {
        body: { email: email.trim() },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">Discount Eligibility</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Check whether the <code className="rounded bg-muted px-1 py-0.5 text-xs">PEPTIDESA10</code> first-order discount applies to a given customer, and why.
      </p>

      <form onSubmit={lookup} className="mt-6 flex max-w-xl gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Check
        </button>
      </form>

      {error && <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-8 max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            {result.eligible ? (
              <><CheckCircle2 className="h-7 w-7 text-trust" /><h2 className="font-display text-xl font-bold text-foreground">Eligible — PEPTIDESA10 will auto-apply</h2></>
            ) : (
              <><XCircle className="h-7 w-7 text-destructive" /><h2 className="font-display text-xl font-bold text-foreground">Not eligible</h2></>
            )}
          </div>

          {result.user && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{result.user.email}</span> · {result.order_count} order(s)
            </p>
          )}

          <ul className="mt-4 space-y-1.5 text-sm">
            {result.reasons.map((r, i) => (
              <li key={i} className="text-foreground">{r}</li>
            ))}
          </ul>

          {result.recent_orders && result.recent_orders.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent orders</h4>
              <table className="mt-2 w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr><th className="py-1 text-left">Date</th><th className="text-left">Code</th><th className="text-right">Total</th></tr>
                </thead>
                <tbody>
                  {result.recent_orders.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="py-1.5">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>{o.discount_code ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="text-right font-semibold">{formatZAR(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
