# Affiliate programme launch decisions

Production financial activation remains blocked until the founder approves the exact versioned policy covering attribution precedence, cookie duration, repeat orders, eligible product value, tier thresholds, validation period, refund treatment, payout cutoff, minimum balance and dispute window. Existing individual agreements continue to control their holders.

Approval must produce a new policy version and an agreement hash. Activation is a separate database change setting `partner_programmes.financial_activation` for `wellness_b2b`; do not change it through the browser. Payout preparation and payment confirmation remain separate operations.

Rollback before activation: revert application/UI deployment and migrate only after confirming no v2 applications exist. Rollback after applications: stop accepting applications and retain the records. After financial activation, disable `financial_activation`; never delete ledger rows or legacy data.
