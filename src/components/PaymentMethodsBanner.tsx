// Footer payment-methods strip — PayFast (South Africa).
const METHODS = [
  "Visa",
  "Mastercard",
  "Instant EFT",
  "Capitec Pay",
  "SnapScan",
  "Zapper",
  "Mobicred",
  "Masterpass",
];

export default function PaymentMethodsBanner() {
  return (
    <div className="border-t border-border bg-background/60 py-5">
      <div className="container flex flex-col items-center gap-3 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          We accept
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {METHODS.map((m) => (
            <li
              key={m}
              className="rounded-md border border-border bg-card/60 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {m}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground">
          Secure payments powered by{" "}
          <a
            href="https://www.payfast.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary"
          >
            PayFast
          </a>
          {" "}· PCI-DSS compliant · ZAR
        </p>
      </div>
    </div>
  );
}
