-- Migration: PSA CRM Schema v2 — Prefixed tables (avoiding existing e-commerce schema)
-- Project: Peptide South Africa (Supabase eutszmrsukoqqeilzrbv)
-- Created: 2026-07-20
-- Note: Existing tables orders, subscriptions, customer_profiles already exist with different schemas
-- These PSA tables are the CRM layer that Make.com agents will interact with

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. psa_customers
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  persona_tag VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(20),
  city VARCHAR(100),
  suburb VARCHAR(100),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  income_bracket VARCHAR(50),
  ltv DECIMAL(10,2) DEFAULT 0.00,
  order_count INTEGER DEFAULT 0,
  last_order_date TIMESTAMP,
  last_order_value DECIMAL(10,2),
  segment VARCHAR(50),
  tracker_user_id VARCHAR(100),
  ambassador_id VARCHAR(100),
  ambassador_tier VARCHAR(20),
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  referral_credit_balance DECIMAL(10,2) DEFAULT 0.00,
  consent_email BOOLEAN DEFAULT FALSE,
  consent_whatsapp BOOLEAN DEFAULT FALSE,
  consent_sms BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMP,
  consent_source VARCHAR(100),
  email_unsubscribed BOOLEAN DEFAULT FALSE,
  phone_opt_out BOOLEAN DEFAULT FALSE,
  sms_opt_out BOOLEAN DEFAULT FALSE,
  first_order_date TIMESTAMP,
  first_order_source VARCHAR(100),
  preferred_payment_method VARCHAR(50),
  subscription_status VARCHAR(50),
  subscription_id VARCHAR(100),
  subscription_start_date TIMESTAMP,
  subscription_next_billing_date TIMESTAMP,
  subscription_plan VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_cust_email ON psa_customers(email);
CREATE INDEX IF NOT EXISTS idx_psa_cust_phone ON psa_customers(phone);
CREATE INDEX IF NOT EXISTS idx_psa_cust_segment ON psa_customers(segment);
CREATE INDEX IF NOT EXISTS idx_psa_cust_persona ON psa_customers(persona_tag);
CREATE INDEX IF NOT EXISTS idx_psa_cust_ambassador ON psa_customers(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_psa_cust_referral ON psa_customers(referral_code);
CREATE INDEX IF NOT EXISTS idx_psa_cust_consent_email ON psa_customers(consent_email, email_unsubscribed);
CREATE INDEX IF NOT EXISTS idx_psa_cust_consent_wa ON psa_customers(consent_whatsapp, phone_opt_out);
CREATE INDEX IF NOT EXISTS idx_psa_cust_ltv ON psa_customers(ltv DESC);
CREATE INDEX IF NOT EXISTS idx_psa_cust_last_order ON psa_customers(last_order_date DESC);
CREATE INDEX IF NOT EXISTS idx_psa_cust_tracker ON psa_customers(tracker_user_id);
CREATE INDEX IF NOT EXISTS idx_psa_cust_subscription ON psa_customers(subscription_status, subscription_next_billing_date);

-- ============================================================
-- 2. psa_products
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  description TEXT,
  factory_price_usd DECIMAL(10,2),
  cogs_zar DECIMAL(10,2),
  retail_price_zar DECIMAL(10,2),
  retail_price_3pack_zar DECIMAL(10,2),
  gross_margin_percent DECIMAL(5,2),
  net_margin_percent DECIMAL(5,2),
  markup DECIMAL(5,2),
  hplc_purity VARCHAR(20),
  coa_url VARCHAR(500),
  batch_number VARCHAR(100),
  expiry_date DATE,
  stock_quantity INTEGER DEFAULT 0,
  stock_status VARCHAR(50),
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_components JSONB,
  is_subscription_eligible BOOLEAN DEFAULT TRUE,
  persona_tags JSONB,
  marketing_priority INTEGER DEFAULT 0,
  research_papers JSONB,
  competitor_prices JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_prod_sku ON psa_products(sku);
CREATE INDEX IF NOT EXISTS idx_psa_prod_category ON psa_products(category);
CREATE INDEX IF NOT EXISTS idx_psa_prod_stock ON psa_products(stock_status);
CREATE INDEX IF NOT EXISTS idx_psa_prod_bundle ON psa_products(is_bundle);
CREATE INDEX IF NOT EXISTS idx_psa_prod_persona ON psa_products USING GIN(persona_tags);

-- ============================================================
-- 3. psa_competitors
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_competitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  website VARCHAR(500),
  price_page_url VARCHAR(500),
  positioning VARCHAR(255),
  key_products JSONB,
  price_range VARCHAR(50),
  our_edge TEXT,
  threat_level VARCHAR(20),
  last_price_scrape TIMESTAMP,
  price_data JSONB,
  price_vs_psa JSONB,
  last_alert TEXT,
  marketing_tactics JSONB,
  social_followers JSONB,
  seo_metrics JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_comp_name ON psa_competitors(name);
CREATE INDEX IF NOT EXISTS idx_psa_comp_threat ON psa_competitors(threat_level);

-- ============================================================
-- 4. psa_events
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(100) UNIQUE NOT NULL,
  event_name VARCHAR(255),
  event_type VARCHAR(50),
  city VARCHAR(100),
  venue VARCHAR(255),
  event_date TIMESTAMP,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  max_attendees INTEGER,
  registered_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  gp_present BOOLEAN DEFAULT FALSE,
  gp_name VARCHAR(100),
  cost_per_attendee DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  revenue_generated DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50),
  registration_url VARCHAR(500),
  whatsapp_group_link VARCHAR(500),
  follow_up_email_sent BOOLEAN DEFAULT FALSE,
  follow_up_whatsapp_sent BOOLEAN DEFAULT FALSE,
  post_event_survey_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_events_date ON psa_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_psa_events_city ON psa_events(city);
CREATE INDEX IF NOT EXISTS idx_psa_events_status ON psa_events(status);
CREATE INDEX IF NOT EXISTS idx_psa_events_type ON psa_events(event_type);

-- ============================================================
-- 5. psa_analytics_daily
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_analytics_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  hour INTEGER,
  tracker_signups INTEGER DEFAULT 0,
  tracker_active_users INTEGER DEFAULT 0,
  protocol_completions INTEGER DEFAULT 0,
  avg_adherence DECIMAL(5,2) DEFAULT 0.00,
  quiz_completion_rate DECIMAL(5,2) DEFAULT 0.00,
  top_persona VARCHAR(50),
  device_breakdown JSONB,
  source_breakdown JSONB,
  content_gap TEXT,
  ecommerce_orders INTEGER DEFAULT 0,
  ecommerce_revenue DECIMAL(10,2) DEFAULT 0.00,
  ecommerce_aov DECIMAL(10,2) DEFAULT 0.00,
  ad_spend DECIMAL(10,2) DEFAULT 0.00,
  cac DECIMAL(10,2) DEFAULT 0.00,
  new_customers INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_analytics_date ON psa_analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_psa_analytics_date_hour ON psa_analytics_daily(date, hour);

-- ============================================================
-- 6. psa_orders
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES psa_customers(id),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  order_total DECIMAL(10,2) NOT NULL,
  order_subtotal DECIMAL(10,2),
  order_discount DECIMAL(10,2) DEFAULT 0.00,
  order_shipping DECIMAL(10,2) DEFAULT 0.00,
  order_tax DECIMAL(10,2) DEFAULT 0.00,
  order_status VARCHAR(50),
  payment_status VARCHAR(50),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  payment_processor_fee DECIMAL(10,2) DEFAULT 0.00,
  payment_settled_at TIMESTAMP,
  line_items JSONB,
  coupon_codes JSONB,
  shipping_address JSONB,
  billing_address JSONB,
  subscription_id VARCHAR(100),
  affiliate_id VARCHAR(100),
  commission_amount DECIMAL(10,2) DEFAULT 0.00,
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(100),
  device VARCHAR(50),
  persona_tag VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_orders_oid ON psa_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_psa_orders_customer ON psa_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_psa_orders_email ON psa_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_psa_orders_status ON psa_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_psa_orders_pay_status ON psa_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_psa_orders_created ON psa_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_psa_orders_source ON psa_orders(source, medium, campaign);
CREATE INDEX IF NOT EXISTS idx_psa_orders_sub ON psa_orders(subscription_id);
CREATE INDEX IF NOT EXISTS idx_psa_orders_affiliate ON psa_orders(affiliate_id);

-- ============================================================
-- 7. psa_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_subscriptions (
  id SERIAL PRIMARY KEY,
  subscription_id VARCHAR(100) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES psa_customers(id),
  customer_email VARCHAR(255),
  plan_type VARCHAR(50),
  status VARCHAR(50),
  start_date TIMESTAMP,
  next_billing_date TIMESTAMP,
  end_date TIMESTAMP,
  billing_frequency VARCHAR(50),
  discount_percent DECIMAL(5,2) DEFAULT 15.00,
  products JSONB,
  current_order_count INTEGER DEFAULT 0,
  max_order_count INTEGER,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  pause_reason VARCHAR(255),
  pause_start_date TIMESTAMP,
  cancel_reason VARCHAR(255),
  cancel_feedback TEXT,
  win_back_attempted BOOLEAN DEFAULT FALSE,
  win_back_offer VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_subs_id ON psa_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_psa_subs_customer ON psa_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_psa_subs_status ON psa_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_psa_subs_next_billing ON psa_subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_psa_subs_cust_status ON psa_subscriptions(customer_id, status);

-- ============================================================
-- 8. psa_content
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_content (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500),
  content_type VARCHAR(50),
  platform VARCHAR(50),
  persona_tag VARCHAR(50),
  product_sku VARCHAR(50),
  status VARCHAR(50),
  url VARCHAR(500),
  file_path VARCHAR(500),
  hook_text TEXT,
  body_text TEXT,
  cta_text TEXT,
  seo_keywords JSONB,
  meta_title VARCHAR(100),
  meta_description VARCHAR(300),
  publish_date TIMESTAMP,
  performance_views INTEGER DEFAULT 0,
  performance_engagement INTEGER DEFAULT 0,
  performance_ctr DECIMAL(5,2),
  performance_conversions INTEGER DEFAULT 0,
  performance_cac DECIMAL(10,2),
  created_by_agent VARCHAR(100),
  reviewed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_content_type ON psa_content(content_type);
CREATE INDEX IF NOT EXISTS idx_psa_content_platform ON psa_content(platform);
CREATE INDEX IF NOT EXISTS idx_psa_content_persona ON psa_content(persona_tag);
CREATE INDEX IF NOT EXISTS idx_psa_content_status ON psa_content(status);
CREATE INDEX IF NOT EXISTS idx_psa_content_product ON psa_content(product_sku);
CREATE INDEX IF NOT EXISTS idx_psa_content_pub_date ON psa_content(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_psa_content_agent ON psa_content(created_by_agent);

-- ============================================================
-- 9. psa_ambassadors
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_ambassadors (
  id SERIAL PRIMARY KEY,
  ambassador_id VARCHAR(100) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES psa_customers(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  social_handles JSONB,
  follower_count INTEGER DEFAULT 0,
  tier VARCHAR(20),
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  commission_earned DECIMAL(10,2) DEFAULT 0.00,
  commission_paid DECIMAL(10,2) DEFAULT 0.00,
  commission_balance DECIMAL(10,2) DEFAULT 0.00,
  referral_code VARCHAR(20) UNIQUE,
  referral_count INTEGER DEFAULT 0,
  referral_revenue DECIMAL(10,2) DEFAULT 0.00,
  content_submissions INTEGER DEFAULT 0,
  content_approved INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  status VARCHAR(50),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  contract_signed BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50),
  payment_details JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_amb_id ON psa_ambassadors(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_psa_amb_customer ON psa_ambassadors(customer_id);
CREATE INDEX IF NOT EXISTS idx_psa_amb_code ON psa_ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_psa_amb_tier ON psa_ambassadors(tier);
CREATE INDEX IF NOT EXISTS idx_psa_amb_status ON psa_ambassadors(status);

-- ============================================================
-- 10. psa_tracker_events
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_tracker_events (
  id SERIAL PRIMARY KEY,
  tracker_event_id VARCHAR(100) UNIQUE NOT NULL,
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  customer_id INTEGER REFERENCES psa_customers(id),
  event_type VARCHAR(100),
  protocol_id VARCHAR(100),
  protocol_name VARCHAR(255),
  completion_rate DECIMAL(5,2),
  quiz_score INTEGER,
  device VARCHAR(50),
  source VARCHAR(100),
  event_timestamp TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_trk_user ON psa_tracker_events(user_email);
CREATE INDEX IF NOT EXISTS idx_psa_trk_customer ON psa_tracker_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_psa_trk_type ON psa_tracker_events(event_type);
CREATE INDEX IF NOT EXISTS idx_psa_trk_protocol ON psa_tracker_events(protocol_id);
CREATE INDEX IF NOT EXISTS idx_psa_trk_timestamp ON psa_tracker_events(event_timestamp DESC);

-- ============================================================
-- 11. psa_email_sends
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_email_sends (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255),
  customer_id INTEGER REFERENCES psa_customers(id),
  template_id VARCHAR(100),
  sequence_name VARCHAR(100),
  sequence_step INTEGER,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT FALSE,
  spam_reported BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  device VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_email_cust ON psa_email_sends(customer_email);
CREATE INDEX IF NOT EXISTS idx_psa_email_template ON psa_email_sends(template_id);
CREATE INDEX IF NOT EXISTS idx_psa_email_seq ON psa_email_sends(sequence_name, sequence_step);
CREATE INDEX IF NOT EXISTS idx_psa_email_sent ON psa_email_sends(sent_at DESC);

-- ============================================================
-- 12. psa_whatsapp_sends
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_whatsapp_sends (
  id SERIAL PRIMARY KEY,
  customer_phone VARCHAR(20),
  customer_id INTEGER REFERENCES psa_customers(id),
  template_name VARCHAR(100),
  message_type VARCHAR(50),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed BOOLEAN DEFAULT FALSE,
  fail_reason TEXT,
  whatsapp_message_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_wa_phone ON psa_whatsapp_sends(customer_phone);
CREATE INDEX IF NOT EXISTS idx_psa_wa_customer ON psa_whatsapp_sends(customer_id);
CREATE INDEX IF NOT EXISTS idx_psa_wa_template ON psa_whatsapp_sends(template_name);

-- ============================================================
-- 13. psa_payment_discrepancies
-- ============================================================
CREATE TABLE IF NOT EXISTS psa_payment_discrepancies (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100),
  expected_amount DECIMAL(10,2),
  actual_amount DECIMAL(10,2),
  discrepancy_type VARCHAR(50),
  payment_processor VARCHAR(50),
  transaction_reference VARCHAR(255),
  status VARCHAR(50),
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_psa_disc_order ON psa_payment_discrepancies(order_id);
CREATE INDEX IF NOT EXISTS idx_psa_disc_status ON psa_payment_discrepancies(status);
CREATE INDEX IF NOT EXISTS idx_psa_disc_created ON psa_payment_discrepancies(created_at DESC);

-- ============================================================
-- Seed Data: 16 Products
-- ============================================================
INSERT INTO psa_products (sku, name, category, subcategory, factory_price_usd, cogs_zar, retail_price_zar, retail_price_3pack_zar, gross_margin_percent, net_margin_percent, markup, hplc_purity, is_subscription_eligible, persona_tags, marketing_priority, stock_status) VALUES
('PSA-SS31', 'SS-31 (Elamipretide)', 'Wellness & Longevity', 'Mitochondrial Health', 58.00, 237.00, 1615.00, 4118.00, 85.30, 73.20, 6.80, '99.0%', TRUE, '["Executive Woman", "Corporate Man", "Active Ager"]', 10, 'in_stock'),
('RTT-RT3', 'RT3 (Reta) 10mg', 'Weight Loss', 'GLP-1 Agonist', 58.00, 237.00, 1250.00, 3188.00, 81.10, 66.40, 5.30, '99.5%', TRUE, '["Executive Woman", "Active Ager", "Biohacker"]', 10, 'in_stock'),
('PSA-KPV', 'KPV', 'Recovery', 'Anti-Inflammatory', 47.00, 216.00, 1120.00, 2856.00, 80.70, 64.70, 5.20, '99.0%', TRUE, '["Injury Recoverer", "Active Ager"]', 9, 'in_stock'),
('RTT-TZ2', 'TZ-2 (Tirz) 10mg', 'Weight Loss', 'GLP-1/GIP Dual', 38.00, 200.00, 895.00, 2282.00, 77.70, 58.50, 4.50, '99.5%', TRUE, '["Executive Woman", "Active Ager", "Biohacker"]', 10, 'in_stock'),
('PSA-EPI', 'Epitalon', 'Wellness & Longevity', 'Telomere Support', 35.00, 194.00, 855.00, 2180.00, 77.30, 57.40, 4.40, '99.0%', TRUE, '["Active Ager", "Corporate Man"]', 8, 'in_stock'),
('RTT-GHK', 'GHK-Cu 50mg', 'Skin & Hair', 'Copper Peptide', 25.00, 176.00, 630.00, 1607.00, 72.10, 46.40, 3.60, '99.5%', TRUE, '["Executive Woman", "Active Ager"]', 9, 'in_stock'),
('PSA-PIN', 'Pinealon', 'Wellness & Longevity', 'Cognitive Support', 47.00, 216.00, 855.00, 2180.00, 74.80, 54.80, 4.00, '99.0%', TRUE, '["Active Ager", "Corporate Man"]', 7, 'in_stock'),
('RTT-BTB', 'BPC/TB-500 Blend', 'Recovery', 'Tissue Repair', 145.00, 398.00, 955.00, 2435.00, 58.40, 40.20, 2.40, '99.0%', TRUE, '["Injury Recoverer", "Corporate Man", "Biohacker"]', 10, 'in_stock'),
('PSA-SLK', 'Selank', 'Wellness & Longevity', 'Anxiolytic', 43.00, 209.00, 740.00, 1887.00, 71.70, 50.00, 3.50, '99.0%', TRUE, '["Executive Woman", "Corporate Man"]', 7, 'in_stock'),
('PSA-SMX', 'Semax', 'Wellness & Longevity', 'Cognitive', 43.00, 209.00, 740.00, 1887.00, 71.70, 50.00, 3.50, '99.0%', TRUE, '["Corporate Man", "Biohacker"]', 7, 'in_stock'),
('PSA-ARA', 'ARA-290', 'Recovery', 'Immune/Neuropathic', 57.00, 242.00, 1235.00, 3149.00, 80.40, 61.60, 5.10, '99.0%', TRUE, '["Injury Recoverer", "Active Ager"]', 9, 'in_stock'),
('PSA-THA', 'Thymosin Alpha-1', 'Recovery', 'Immune Modulation', 135.00, 379.00, 1500.00, 3825.00, 74.70, 61.90, 4.00, '99.0%', TRUE, '["Active Ager", "Executive Woman"]', 8, 'in_stock'),
('RTT-GLW', 'GLOW70', 'Skin & Hair', 'Growth Factor Stack', 165.00, 435.00, 1080.00, 2754.00, 59.70, 43.30, 2.50, '99.5%', TRUE, '["Executive Woman", "Active Ager"]', 8, 'in_stock'),
('RTT-KLW', 'KLOW80', 'Wellness & Longevity', 'Longevity Stack', 180.00, 462.00, 1260.00, 3213.00, 63.30, 48.70, 2.70, '99.5%', TRUE, '["Corporate Man", "Biohacker"]', 7, 'in_stock'),
('RTT-TES', 'Tesamorelin 10mg', 'Wellness & Longevity', 'GH Secretagogue', 155.00, 416.00, 1050.00, 2677.50, 60.40, 44.50, 1.90, '99.5%', TRUE, '["Corporate Man", "Biohacker"]', 6, 'in_stock'),
('RTT-MTC', 'MOTS-C', 'Wellness & Longevity', 'Mitochondrial', 47.00, 216.00, 650.00, 1657.50, 66.80, 42.60, 2.20, '99.0%', TRUE, '["Active Ager", "Biohacker"]', 6, 'in_stock')
ON CONFLICT (sku) DO UPDATE SET
  retail_price_zar = EXCLUDED.retail_price_zar,
  retail_price_3pack_zar = EXCLUDED.retail_price_3pack_zar,
  gross_margin_percent = EXCLUDED.gross_margin_percent,
  net_margin_percent = EXCLUDED.net_margin_percent,
  markup = EXCLUDED.markup,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- Seed Data: 9 Competitors
-- ============================================================
INSERT INTO psa_competitors (name, website, positioning, price_range, our_edge, threat_level, key_products) VALUES
('Research Peptides SA', 'https://researchpeptides.co.za', 'Budget/Volume (20 yrs)', 'Low', 'Higher purity, GP oversight, peptide tracker', 'MODERATE', '["SARMs", "nasal", "IV drips", "GHRP"]'),
('Protopep', 'https://protopep.co.za', 'Premium RUO', 'Premium', 'Tracker + quiz ecosystem, content depth', 'MODERATE', '["CJC-1295", "Ipamorelin", "BPC-157"]'),
('Peptide Warehouse', 'https://peptide-warehouse.co.za', 'Mid-tier RUO', 'Mid-range', 'Brand strength, GP review, tracker, R95 shipping vs our free', 'MODERATE', '["3rd party tested range", "general peptides"]'),
('LeoLab', 'https://leolab.co.za', 'Premium RUO', 'Premium', 'Content, quiz, community — but we have more', 'MINOR', '["99% purity peptides", "premium positioning"]'),
('SA Peptides', 'https://sapeptides.co.za', 'Budget RUO', 'Budget', 'Quality and UX — we outclass on both', 'MINOR', '["General research peptides"]'),
('Reschem', 'https://reschem.co.za', 'Niche', 'Mid-range', 'Medical alignment — we have GP oversight too', 'MINOR', '["Nootropics + Peptides"]'),
('Premier Body', 'https://premierbody.co.za', 'Medical Clinic — MAJOR THREAT', 'Premium', 'ONLY medically regulated pharma-grade in SA. Our Phase 7 endgame.', 'MAJOR', '["Doctor-prescribed", "hormone optimisation", "TRT", "peptide IV drips", "NAD+", "medical weight management"]'),
('AlphaHuman', 'https://alphahuman.co.za', 'Medical Clinic — MAJOR THREAT', 'Premium', 'SA premier clinic for custom-formulated peptides. Doctor-prescribed.', 'MAJOR', '["BPC-157", "Semaglutide", "CJC-1295", "in-person + online consultations"]'),
('IVgo', 'https://ivgo.co.za', 'Nurse-led Clinic', 'Premium', 'BPC-157 pen R3,000, Wolverine Stack R4,500. Premium but limited range.', 'MODERATE', '["BPC-157 pen", "Wolverine Stack", "IV drips"]')
ON CONFLICT (name) DO UPDATE SET
  positioning = EXCLUDED.positioning,
  price_range = EXCLUDED.price_range,
  our_edge = EXCLUDED.our_edge,
  threat_level = EXCLUDED.threat_level,
  key_products = EXCLUDED.key_products,
  updated_at = CURRENT_TIMESTAMP;;
