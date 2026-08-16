import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FlaskConical, Loader2 } from "lucide-react";
import { staticCoas } from "@/data/coas";
import { supabase } from "@/integrations/supabase/client";

export default function CoaRedirectPage() {
  const { code = "" } = useParams<{ code: string }>();
  const [message, setMessage] = useState("Verifying report destination…");

  useEffect(() => {
    let cancelled = false;
    const normalized = decodeURIComponent(code).trim();
    const staticRecord = staticCoas.find((record) => record.shortCode.toLowerCase() === normalized.toLowerCase());
    if (staticRecord) {
      window.location.replace(staticRecord.verificationUrl);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("product_batches")
        .select("coa_pdf_url")
        .eq("lot_number", normalized.toUpperCase())
        .eq("is_published", true)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data?.coa_pdf_url) {
        setMessage("No published COA is linked to this verification code.");
        return;
      }
      window.location.replace(data.coa_pdf_url);
    })();

    return () => { cancelled = true; };
  }, [code]);

  return (
    <main className="container flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {message.startsWith("Verifying") ? <Loader2 className="h-6 w-6 animate-spin" /> : <FlaskConical className="h-6 w-6" />}
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-foreground">COA verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {!message.startsWith("Verifying") && (
          <Link to="/testing" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Search the COA archive
          </Link>
        )}
      </div>
    </main>
  );
}

