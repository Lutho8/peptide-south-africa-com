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

## Match a bank statement for staff review

1. Export posted transactions directly from Capitec Business. Check that the
   account and statement period are correct. In a working CSV, map the bank
   reference (or narration containing the full PSA reference) to `reference`
   and the signed ZAR value to `amount`. Use decimal dots without grouping,
   positive values for credits and negative values for debits. Keep the
   original bank export open for review.
2. Export `order_id,payment_reference,order_total,payment_status` from
   `public.psa_orders` using authorized read-only reporting. Keep both
   files and the report in an access-controlled folder outside the repository.
3. Run `python3 scripts/match-eft-statement.py statement.csv awaiting-orders.csv`
   and review the report. Use `--statement-delimiter ';'` if applicable.
   `statement_line` identifies the source row in the working CSV. The script
   proposes only exact amount and reference matches with one credit and one
   awaiting order. Duplicate, conflicting and unmatched credits go to review.
4. For each `candidate_staff_approval`, verify the original bank transaction
   and its timestamp and confirm that it has settled and has not been reversed.
   Submit that approved deposit individually through the procedure above.
   The matcher reads local files only and has no access to payment credentials.
