# Affiliate programme launch decisions

Founder approved `wellness-b2b-v2.0-2026-10-27` on 27 October 2026, then set the attribution cookie to strictly 30 days for all partners: flat 20%; eligible merchandise after discounts excluding delivery and refunded value; entered code over latest valid click; fresh attribution for repeat orders; 14-day validation; monthly ZAR EFT at a R500 available balance; proportional partial-refund adjustments; no launch tiers or automatic customer discount.

Approval must produce a new policy version and an agreement hash. Activation is a separate database change setting `partner_programmes.financial_activation` for `wellness_b2b`; do not change it through the browser. Payout preparation and payment confirmation remain separate operations.

Rollback before activation: revert application/UI deployment and migrate only after confirming no v2 applications exist. Rollback after applications: stop accepting applications and retain the records. After financial activation, disable `financial_activation`; never delete ledger rows or legacy data.
