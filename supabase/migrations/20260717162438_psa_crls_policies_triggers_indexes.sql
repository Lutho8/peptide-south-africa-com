-- PSA CRM Water-Tightness Fixes — Part 2 (RLS, Triggers, Indexes)

-- 1. ADD RLS INSERT POLICIES for anonymous form submissions
DROP POLICY IF EXISTS "Allow anonymous lead capture" ON psa_leads;
CREATE POLICY "Allow anonymous lead capture" ON psa_leads
  FOR INSERT TO anon 
  WITH CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

DROP POLICY IF EXISTS "Allow anonymous cart abandon" ON psa_cart_abandons;
CREATE POLICY "Allow anonymous cart abandon" ON psa_cart_abandons
  FOR INSERT TO anon 
  WITH CHECK (cart_subtotal > 0);

DROP POLICY IF EXISTS "Allow anonymous event registration" ON psa_event_registrations;
CREATE POLICY "Allow anonymous event registration" ON psa_event_registrations
  FOR INSERT TO anon 
  WITH CHECK (email IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own customer record" ON psa_customers;
CREATE POLICY "Users can insert own customer record" ON psa_customers
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- 2. ADD EVENT REGISTRATION → LEAD SYNC TRIGGER
CREATE OR REPLACE FUNCTION psa_sync_event_to_lead()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO psa_leads (email, source_site, stage, first_touch_at, consent_email)
  VALUES (NEW.email, 'capetownpeptideclub.co.za', 'event_attendee', NOW(), true)
  ON CONFLICT (email) DO UPDATE SET
    stage = CASE WHEN psa_leads.stage = 'visitor' THEN 'event_attendee' ELSE psa_leads.stage END,
    last_touch_at = NOW(),
    lead_score = LEAST(COALESCE(psa_leads.lead_score, 0) + 5, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS psa_event_to_lead_sync ON psa_event_registrations;
CREATE TRIGGER psa_event_to_lead_sync
AFTER INSERT ON psa_event_registrations
FOR EACH ROW EXECUTE FUNCTION psa_sync_event_to_lead();

-- 3. ADD REALTIME CART ABANDONMENT TRIGGER
CREATE OR REPLACE FUNCTION psa_cart_abandon_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cart_subtotal > 2000 THEN
    NEW.status := 'high_value_abandoned';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS psa_cart_abandon_alert ON psa_cart_abandons;
CREATE TRIGGER psa_cart_abandon_alert
BEFORE INSERT ON psa_cart_abandons
FOR EACH ROW EXECUTE FUNCTION psa_cart_abandon_alert();

-- 4. ENSURE all tables have updated_at triggers
CREATE OR REPLACE FUNCTION psa_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS psa_leads_updated_at ON psa_leads;
CREATE TRIGGER psa_leads_updated_at
BEFORE UPDATE ON psa_leads
FOR EACH ROW EXECUTE FUNCTION psa_update_timestamp();

DROP TRIGGER IF EXISTS psa_cart_abandons_updated_at ON psa_cart_abandons;
CREATE TRIGGER psa_cart_abandons_updated_at
BEFORE UPDATE ON psa_cart_abandons
FOR EACH ROW EXECUTE FUNCTION psa_update_timestamp();

DROP TRIGGER IF EXISTS psa_event_registrations_updated_at ON psa_event_registrations;
CREATE TRIGGER psa_event_registrations_updated_at
BEFORE UPDATE ON psa_event_registrations
FOR EACH ROW EXECUTE FUNCTION psa_update_timestamp();

-- 5. ADD INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_psa_leads_email ON psa_leads(email);
CREATE INDEX IF NOT EXISTS idx_psa_leads_source_site ON psa_leads(source_site);
CREATE INDEX IF NOT EXISTS idx_psa_leads_stage ON psa_leads(stage);
CREATE INDEX IF NOT EXISTS idx_psa_cart_abandons_email ON psa_cart_abandons(email);
CREATE INDEX IF NOT EXISTS idx_psa_cart_abandons_status ON psa_cart_abandons(status);
CREATE INDEX IF NOT EXISTS idx_psa_cart_abandons_abandoned_at ON psa_cart_abandons(abandoned_at);
CREATE INDEX IF NOT EXISTS idx_psa_customers_email ON psa_customers(email);
CREATE INDEX IF NOT EXISTS idx_psa_event_registrations_email ON psa_event_registrations(email);;
