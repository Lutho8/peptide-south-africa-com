import { Lock, ShieldCheck, CreditCard, EyeOff, FileLock2, RefreshCcw } from "lucide-react";

const items = [
  {
    icon: Lock,
    title: "256-bit SSL Encryption",
    desc: "Every field on this page is encrypted end-to-end before it leaves your browser.",
  },
  {
    icon: CreditCard,
    title: "PCI-DSS Compliant Payments",
    desc: "Card details are tokenised by our processor — we never see or store your full card number.",
  },
  {
    icon: EyeOff,
    title: "Discreet Billing & Packaging",
    desc: "Charges show as 'RTT Wellness' and parcels ship in plain, unbranded boxes.",
  },
  {
    icon: FileLock2,
    title: "POPIA-Compliant Privacy",
    desc: "Your data is stored in South Africa, never sold, and you can request deletion anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Lab-Tested Products",
    desc: "Every batch ships with a third-party HPLC Certificate of Analysis (≥99% purity).",
  },
  {
    icon: RefreshCcw,
    title: "30-Day Money-Back Guarantee",
    desc: "Not satisfied? Email us within 30 days for a full, no-questions-asked refund.",
  },
];

export default function SecurityChecklist() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-trust" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
          Your Order is Protected
        </h3>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.title} className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-trust/10 ring-1 ring-trust/20">
              <it.icon className="h-3.5 w-3.5 text-trust" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">{it.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {it.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
