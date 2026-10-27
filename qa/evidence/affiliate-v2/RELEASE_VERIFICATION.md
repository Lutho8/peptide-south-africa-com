# Partner release verification — 27 October 2026

The partner application, agreement, referral, verified-EFT commission, dashboard and payout flow was checked with synthetic fixtures only. No customer order, bank transfer or refund was performed.

- Full unit suite: 37 files / 290 tests passed. Type checking, lint (no errors), edge input validation and migration GRANT scanning passed.
- Isolated Postgres acceptance: facility, creator, hybrid and legacy R1,000 eligible orders each produce exactly R200 pending only after settlement; replay does not duplicate earnings. RLS/financial ACL, 14-day release, refund replay, R500 threshold, payout reservation, failed-statement retry and payment confirmation passed.
- Additional SQL checks: exact 30-day expiry, valid QR click persistence, Pets storefront rejection and professional-clearance enforcement passed.
- Actual checkout handler regression: failed attribution returns 503 with no payable order/email; retry freezes attribution before creating payment instructions; replay does not duplicate instructions.
- Dashboard browser replay uses data exported from the isolated SQL acceptance transaction, with intercepted API responses. All four journeys display the matching R200 pending balance. This is not a live authenticated production account test.
- All four generated QR PNGs decode to the correct synthetic partner code and `via=qr`; see `qr-verification.json`.
- Production mobile read-only checks: `/affiliate`, `/affiliate/terms`, `/affiliate/dashboard` return 200; no horizontal overflow at 390px. The dashboard prompts for login. Public terms include “strictly 30 days”.
- Production inspected deployment: `dpl_Azor5VsVmV4UwPE96Y84DnJacFQt`, READY, commit `4ded5db8053d13c9d1cac3be676f2651e74c158e`.
- Production policy verified: 2000 bps, 30 days, current agreement hash `45b6ed75d96f6361ce1f99c4cdae473a27783c80971eaf8f62e2ca5a0725e160`. Zero enrolments at inspection. Financial activation remains disabled pending final gate.

Release fixes: serialize refund status reads against payout reservation; re-reserve a failed/cancelled unpaid monthly statement on retry; require referral snapshot success before payment instructions. The refund migration has been applied to production and must be retained in source history.

Outstanding at this checkpoint: reproduce/repair clean-schema CI gate, publish final checkout handler, verify final release and financial activation. Do not use this checkpoint as completion evidence.
