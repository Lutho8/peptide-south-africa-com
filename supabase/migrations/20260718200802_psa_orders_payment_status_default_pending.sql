-- Prevent NULL payment_status on future order writes.
-- New rows default to 'pending' until a payment event (PayFast/Yoco/ITN or order-sync) sets the true state.
ALTER TABLE public.psa_orders
  ALTER COLUMN payment_status SET DEFAULT 'pending';;
