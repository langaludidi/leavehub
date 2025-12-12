-- ============================================
-- LeaveHub MVP - Paystack Subscriptions
-- Payment processing and subscription management
-- ============================================

-- ============================================
-- 1. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  -- Plan Information
  plan_name VARCHAR(50) NOT NULL,  -- 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
  plan_code VARCHAR(50) NOT NULL,  -- Paystack plan code

  -- Subscription Status
  status subscription_status DEFAULT 'trialing' NOT NULL,

  -- Paystack Integration
  paystack_subscription_code VARCHAR(255) UNIQUE,
  paystack_customer_code VARCHAR(255),
  paystack_email_token VARCHAR(255),

  -- Billing Details
  amount INTEGER NOT NULL,  -- Amount in cents (ZAR)
  currency VARCHAR(3) DEFAULT 'ZAR',
  interval VARCHAR(20) DEFAULT 'monthly',

  -- Subscription Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_paystack_code ON subscriptions(paystack_subscription_code);

-- ============================================
-- 2. PAYMENTS TABLE (Transaction History)
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Paystack Transaction Details
  paystack_reference VARCHAR(255) UNIQUE NOT NULL,
  paystack_transaction_id VARCHAR(255),
  paystack_access_code VARCHAR(255),

  -- Payment Information
  amount INTEGER NOT NULL,  -- Amount in cents (ZAR)
  currency VARCHAR(3) DEFAULT 'ZAR',
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'success', 'failed'
  channel VARCHAR(50),  -- 'card', 'bank', 'ussd', 'mobile_money'

  -- Payment Metadata
  paid_at TIMESTAMPTZ,
  ip_address VARCHAR(50),
  fees INTEGER,  -- Paystack transaction fees

  -- Additional Information
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(paystack_reference);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- ============================================
-- 3. PAYSTACK CUSTOMERS TABLE
-- ============================================
CREATE TABLE paystack_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Paystack Customer Information
  paystack_customer_code VARCHAR(255) UNIQUE NOT NULL,
  paystack_customer_id INTEGER,

  -- Customer Details
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),

  -- Saved Payment Method (for display only - last 4 digits)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),  -- 'visa', 'mastercard', etc.
  card_exp_month VARCHAR(2),
  card_exp_year VARCHAR(4),
  authorization_code VARCHAR(255),  -- For recurring payments

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_paystack_customers_company_id ON paystack_customers(company_id);
CREATE INDEX idx_paystack_customers_code ON paystack_customers(paystack_customer_code);

-- ============================================
-- 4. PAYSTACK WEBHOOKS LOG TABLE
-- ============================================
CREATE TABLE paystack_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Webhook Information
  event_type VARCHAR(100) NOT NULL,
  paystack_event_id VARCHAR(255),

  -- Webhook Payload
  payload JSONB NOT NULL,

  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_paystack_webhooks_event_type ON paystack_webhooks(event_type);
CREATE INDEX idx_paystack_webhooks_processed ON paystack_webhooks(processed);
CREATE INDEX idx_paystack_webhooks_created_at ON paystack_webhooks(created_at DESC);

-- ============================================
-- 5. ROW LEVEL SECURITY FOR PAYMENT TABLES
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paystack_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paystack_webhooks ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Company admins can view own subscriptions"
ON subscriptions FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('admin', 'super_admin')
  )
);

-- Payments policies
CREATE POLICY "Company admins can view own payments"
ON payments FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('admin', 'super_admin')
  )
);

-- Paystack customers policies
CREATE POLICY "Company admins can view own customer data"
ON paystack_customers FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('admin', 'super_admin')
  )
);

-- Webhooks policies (super admin only)
CREATE POLICY "Super admins can view webhooks"
ON paystack_webhooks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role = 'super_admin'
  )
);

-- ============================================
-- 6. TRIGGER: UPDATE TIMESTAMPS
-- ============================================
CREATE TRIGGER trigger_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_paystack_customers_updated_at
BEFORE UPDATE ON paystack_customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. TRIGGER: SYNC SUBSCRIPTION STATUS TO COMPANY
-- ============================================
CREATE OR REPLACE FUNCTION sync_subscription_status_to_company()
RETURNS TRIGGER AS $$
BEGIN
  -- Update company subscription_status when subscription changes
  UPDATE companies
  SET
    subscription_status = NEW.status,
    trial_ends_at = NEW.trial_ends_at,
    updated_at = NOW()
  WHERE id = NEW.company_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_subscription_status
AFTER INSERT OR UPDATE OF status ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_subscription_status_to_company();

-- ============================================
-- 8. FUNCTION: CHECK SUBSCRIPTION IS ACTIVE
-- ============================================
CREATE OR REPLACE FUNCTION is_subscription_active(company_uuid UUID)
RETURNS BOOLEAN
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

GRANT EXECUTE ON FUNCTION is_subscription_active(UUID) TO authenticated;

-- ============================================
-- 9. FUNCTION: GET ACTIVE SUBSCRIPTION DETAILS
-- ============================================
CREATE OR REPLACE FUNCTION get_active_subscription(company_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name VARCHAR,
  status subscription_status,
  amount INTEGER,
  currency VARCHAR,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  is_trial BOOLEAN,
  days_remaining INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    s.id AS subscription_id,
    s.plan_name,
    s.status,
    s.amount,
    s.currency,
    s.current_period_start,
    s.current_period_end,
    (s.status = 'trialing') AS is_trial,
    CASE
      WHEN s.current_period_end > NOW()
      THEN EXTRACT(DAY FROM (s.current_period_end - NOW()))::INTEGER
      ELSE 0
    END AS days_remaining
  FROM subscriptions s
  WHERE s.company_id = company_uuid
  AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_active_subscription(UUID) TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Paystack Subscriptions schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Payment Infrastructure:';
  RAISE NOTICE '- subscriptions table (manage active subscriptions)';
  RAISE NOTICE '- payments table (transaction history)';
  RAISE NOTICE '- paystack_customers table (customer payment methods)';
  RAISE NOTICE '- paystack_webhooks table (webhook event logging)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- Auto-sync subscription status to company';
  RAISE NOTICE '- Row Level Security for payment data';
  RAISE NOTICE '- Webhook event logging with retry tracking';
  RAISE NOTICE '- Helper functions for subscription checks';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 DATABASE SETUP COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'All database scripts have been run successfully.';
  RAISE NOTICE 'Your LeaveHub MVP database is ready!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure Paystack webhook in dashboard';
  RAISE NOTICE '2. Create subscription plans in Paystack';
  RAISE NOTICE '3. Update application code';
  RAISE NOTICE '4. Test complete user flow';
  RAISE NOTICE '';
END $$;
