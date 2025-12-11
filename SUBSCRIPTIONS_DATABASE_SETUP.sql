-- ============================================
-- LeaveHub Subscriptions & Payments Database
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE SUBSCRIPTION STATUS ENUM
-- ============================================
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL, -- 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
  plan_code VARCHAR(50) NOT NULL,
  status subscription_status DEFAULT 'trialing' NOT NULL,

  -- Paystack data
  paystack_subscription_code VARCHAR(255) UNIQUE,
  paystack_customer_code VARCHAR(255),
  paystack_email_token VARCHAR(255),

  -- Subscription details
  amount INTEGER NOT NULL, -- Amount in kobo/cents
  currency VARCHAR(3) DEFAULT 'ZAR',
  interval VARCHAR(20) DEFAULT 'monthly',

  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_code ON subscriptions(paystack_subscription_code);

-- ============================================
-- 3. PAYMENTS TABLE (Transaction History)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Paystack data
  paystack_reference VARCHAR(255) UNIQUE NOT NULL,
  paystack_transaction_id VARCHAR(255),
  paystack_access_code VARCHAR(255),

  -- Payment details
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
  channel VARCHAR(50), -- 'card', 'bank', 'ussd', etc.

  -- Payment metadata
  paid_at TIMESTAMPTZ,
  ip_address VARCHAR(50),
  fees INTEGER, -- Paystack fees

  -- Additional info
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(paystack_reference);

-- ============================================
-- 4. PAYSTACK CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS paystack_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,

  paystack_customer_code VARCHAR(255) UNIQUE NOT NULL,
  paystack_customer_id INTEGER,

  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),

  -- Card details (last 4 digits only for display)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  card_exp_month VARCHAR(2),
  card_exp_year VARCHAR(4),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paystack_customers_company_id ON paystack_customers(company_id);
CREATE INDEX IF NOT EXISTS idx_paystack_customers_code ON paystack_customers(paystack_customer_code);

-- ============================================
-- 5. WEBHOOKS LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS paystack_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  paystack_event_id VARCHAR(255),

  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,

  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_event_type ON paystack_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON paystack_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON paystack_webhooks(created_at DESC);

-- ============================================
-- 6. UPDATE COMPANIES TABLE
-- ============================================
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS max_employees INTEGER DEFAULT 10;

-- ============================================
-- 7. ROW LEVEL SECURITY FOR SUBSCRIPTIONS
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paystack_customers ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
DROP POLICY IF EXISTS "Company admins can view subscriptions" ON subscriptions;
CREATE POLICY "Company admins can view subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.company_id = subscriptions.company_id
      AND profiles.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Payments policies
DROP POLICY IF EXISTS "Company admins can view payments" ON payments;
CREATE POLICY "Company admins can view payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.company_id = payments.company_id
      AND profiles.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to check if company subscription is active
CREATE OR REPLACE FUNCTION is_subscription_active(company_uuid UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE company_id = company_uuid
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
$$;

-- Function to get company subscription status
CREATE OR REPLACE FUNCTION get_subscription_status(company_uuid UUID)
RETURNS TABLE (
  status subscription_status,
  plan_name VARCHAR,
  current_period_end TIMESTAMPTZ,
  is_trial BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    s.status,
    s.plan_name,
    s.current_period_end,
    (s.trial_ends_at IS NOT NULL AND s.trial_ends_at > NOW()) as is_trial
  FROM subscriptions s
  WHERE s.company_id = company_uuid
  AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION is_subscription_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_status(UUID) TO authenticated;

-- ============================================
-- 9. SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Subscriptions & Payments database setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- subscriptions';
  RAISE NOTICE '- payments';
  RAISE NOTICE '- paystack_customers';
  RAISE NOTICE '- paystack_webhooks';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set up webhook URL in Paystack dashboard';
  RAISE NOTICE '2. Create subscription plans in Paystack';
  RAISE NOTICE '3. Test payment flow';
END $$;
