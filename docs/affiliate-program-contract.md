# Affiliate programme contract

`wellness_b2b` serves facility/practitioner and creator/influencer partners through one enrolment and one financial identity. `pets_b2b` remains a separate programme. Every application, enrolment, agreement, attribution, commission entry and payout statement carries programme identity.

The public application uses the versioned `submit_partner_application_v2` RPC. Partner type is descriptive and never grants approval, a rate, privileged access, or professional clearance. Marketing consent is separate. Public applications never collect payout identity or bank details.

Approved links use `?partner=CODE&campaign=KEY`; QR links add `via=qr`. Checkout passes the candidate attribution through the same-origin server. The trusted checkout edge validates programme, storefront, approved enrolment, code and campaign, then writes one immutable order attribution with its rate and policy snapshot. A unique order constraint prevents hybrid roles or multiple campaigns from earning twice.

EFT reconciliation is the payment authority. The commission trigger runs only on the guarded `awaiting_eft` to `complete` transition. Its unique `cleared-payment:<order-id>` key makes replay safe. Money is stored as integer cents and rates as basis points. `financial_activation` is false until the launch gate is approved, so staged data cannot create live liabilities.

Partner RLS resolves ownership through `partner_accounts.auth_user_id`. Partners can read only their enrolment, campaigns, attribution summaries, ledger and payout statements. Customer identity, addresses and health information are absent from these tables. All financial writes and approval actions remain service-role only.

Legacy `psa_ambassadors` rows are bridged additively. Original rows, codes, rates, balances and histories remain unchanged. Ownership is not guessed; an operator must verify an existing partner before linking `auth_user_id`.
