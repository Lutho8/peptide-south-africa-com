# Partner programme operating runbook

Policy source: founder approval dated 27 October 2026, strict 30-day amendment. `src/lib/partnerPolicy.ts` is the canonical agreement text. No financial operation below transfers money itself.

Use a restricted service-role session in Supabase; never put its key in the browser or Buzz. Ordinary partner sessions cannot call staff operations.

1. Review `partner_applications_v2`; verify the applicant's authenticated email and professional clearance. Call `approve_partner_application(application_id, auth_user_id, uppercase_code, professional_clearance)`. Enquiry-only cases remain non-commercial; creator selection cannot bypass professional review.
2. The partner signs in and accepts the current agreement in `/affiliate/dashboard`. Acceptance stores the server policy version/hash and user. Campaign creation is available in the same dashboard. Approval alone cannot earn before acceptance.
3. Reconcile the actual EFT using the existing bank verification process. Only `awaiting_eft` → `complete` for `eft_capitec` creates a commission. Do not mark a screenshot as a settled deposit.
4. Run `release_partner_commissions()` during reconciliation and before statements. It releases only entries aged at least 14 days. Dashboard reads update within 30 seconds. Payout preparation also performs release.
5. On an independently verified refund, call `adjust_partner_refund(order_id, cumulative_refunded_eligible_cents, unique_bank_or_refund_reference)`. Supply cumulative eligible merchandise only; exclude delivery/BAC and recorded tax. A repeated reference is a no-op. Cancel any reserved statement before adjusting its entries. Paid-order adjustments become negative available carry-forward.
6. After month end call `prepare_partner_payout(enrolment_id, month_start, month_end)`. It reserves the available balance only at R500 or above; smaller balances carry forward. Repeated preparation returns the same statement. Export the partner-visible statement text file. Banking details stay in the restricted finance process, never the public application.
7. Transfer through the authorised bank process. After independently verifying settlement call `confirm_partner_payout(statement_id, verified_bank_reference)`. This marks the statement and its entries paid; it does not initiate an EFT. For failed/cancelled unexecuted transfers call `cancel_partner_payout(statement_id, failed_boolean)` to release the reserved amount. Never retry a bank transfer just because a statement failed.

`partner_operation_events` records approvals, refund source keys, payout confirmation and every ledger status transition. Monetary values and attribution snapshots cannot be edited; use correcting events. To stop new liabilities disable `partner_programmes.financial_activation` for `wellness_b2b`; retain all records. Pets remains separate and inactive.

Synthetic acceptance: `supabase/tests/partner_programme_acceptance.sql` runs in an isolated Postgres database with synthetic prerequisites. It rolls back all fixtures and does not send emails or move money. It proves the actual partner SQL and RLS, not the external banking network.
