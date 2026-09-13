-- Anti-fraud layer for EFT payments: records every suspicious payment event.
-- Written only by the eft-reconcile edge function (service role). Read by CRM.
CREATE TABLE IF NOT EXISTS psa_fraud_signals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  signal_type text NOT NULL,           -- 'auth_fail' | 'ref_probe' | 'amount_mismatch' | 'velocity' | 'pop_submitted'
  severity    text NOT NULL DEFAULT 'medium',  -- 'low' | 'medium' | 'high'
  reference   text,
  payer_name  text,
  amount      numeric(12,2),
  deposit_id  uuid,
  order_id    text,
  details     jsonb,
  status      text NOT NULL DEFAULT 'open'     -- 'open' | 'reviewed' | 'dismissed' | 'confirmed_fraud'
);

CREATE INDEX IF NOT EXISTS psa_fraud_signals_status_idx ON psa_fraud_signals (status, created_at DESC);
CREATE INDEX IF NOT EXISTS psa_fraud_signals_reference_idx ON psa_fraud_signals (reference);

-- RLS: no direct client access; service role bypasses RLS for writes, CRM reads via FDW view.
ALTER TABLE psa_fraud_signals ENABLE ROW LEVEL SECURITY;;
