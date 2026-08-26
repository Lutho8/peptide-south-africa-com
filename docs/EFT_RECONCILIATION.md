# EFT reconciliation operator runbook

Use `scripts/reconcile-eft.ps1` only after the deposit is visible in the PSA bank
account. A proof-of-payment PDF, screenshot, SMS, or email is not bank evidence.

## Bank verification

1. Open the bank account transaction feed directly.
2. Match the full `PSA-...` reference and exact amount to the awaiting EFT order.
3. Check that the transaction is settled, not pending or reversed.
4. Record the bank transaction time. Never paste a bank password or the
   reconciliation secret into a terminal argument, file, ticket, or chat.

## Invocation

From the repository root in Windows PowerShell:

```powershell
.\scripts\reconcile-eft.ps1 `
  -Reference 'PSA-ABC123' `
  -OrderId '00000000-0000-0000-0000-000000000000' `
  -Amount 148.00 `
  -ReceivedAt '2026-08-26T08:30:00+02:00'
```

The script requires the exact confirmation text `DEPOSIT VERIFIED`, then prompts
for `EFT_RECONCILE_SECRET` as a secure string. The secret is used only in the
`x-eft-secret` request header, is not persisted or printed, and its unmanaged
memory is zeroed immediately after the request.

The response must contain the same payment reference (and order ID when supplied)
plus the resulting `payment_status`. Treat any mismatch, missing `order_state`, or
non-success response as a failed operation.

## Duplicate handling

The server deduplicates deposits by amount, normalized reference, and received
minute. Re-running the same bank transaction reports it as a duplicate and does
not create a second deposit or settle an order twice. Always reuse the original
bank transaction time when recovering a timed-out operator request.

## Recovery

- If confirmation was not entered, no request was sent.
- If the request timed out, rerun it with the identical reference, amount, and
  `ReceivedAt`; confirm the returned order state before taking another action.
- If the reference matches but the amount differs, leave the order unpaid and
  resolve the discrepancy manually. Do not alter the amount to force a match.
- If a wrong deposit was submitted, stop fulfilment and escalate with the order
  ID, payment reference, and bank transaction identifier. Never edit production
  settlement rows by hand.
