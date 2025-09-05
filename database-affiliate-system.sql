-- LeaveHub Affiliate System Database Schema
-- Run this in your Supabase SQL editor

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  affiliate_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  commission_rate DECIMAL(5,2) DEFAULT 25.00, -- 25% commission
  payment_method JSONB DEFAULT '{}', -- PayPal, bank details, etc.
  referral_link TEXT,
  total_referrals INTEGER DEFAULT 0,
  total_commissions_earned DECIMAL(10,2) DEFAULT 0.00,
  total_commissions_paid DECIMAL(10,2) DEFAULT 0.00,
  marketing_materials JSONB DEFAULT '{}',
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired', 'invalid')),
  conversion_date TIMESTAMPTZ,
  first_payment_date TIMESTAMPTZ,
  subscription_id UUID REFERENCES subscriptions(id),
  source_url TEXT, -- Where the referral came from
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission payments table
CREATE TABLE IF NOT EXISTS commission_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  payment_method TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMPTZ,
  payment_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate commission tracking (recurring)
CREATE TABLE IF NOT EXISTS commission_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
  referral_id UUID REFERENCES referrals(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('first_payment', 'recurring', 'bonus')),
  subscription_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_month DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired')),
  payment_id UUID REFERENCES commission_payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate marketing materials
CREATE TABLE IF NOT EXISTS marketing_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'email_template', 'social_post', 'landing_page', 'video')),
  content TEXT,
  image_url TEXT,
  download_url TEXT,
  dimensions TEXT, -- For banners: "300x250", "728x90", etc.
  file_size INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate stats/analytics
CREATE TABLE IF NOT EXISTS affiliate_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  commission_earned DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(affiliate_id, date)
);

-- Enable RLS on all affiliate tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates
CREATE POLICY "Affiliates can view own profile" ON affiliates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Affiliates can update own profile" ON affiliates
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Superadmins can manage affiliates" ON affiliates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN org_members om ON p.id = om.user_id
      WHERE p.id = auth.uid()
      AND om.role = 'superadmin'
    )
  );

-- RLS Policies for referrals
CREATE POLICY "Affiliates can view own referrals" ON referrals
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create referrals" ON referrals
  FOR INSERT WITH CHECK (true);

-- RLS Policies for commission payments
CREATE POLICY "Affiliates can view own payments" ON commission_payments
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for commission tracking
CREATE POLICY "Affiliates can view own commission tracking" ON commission_tracking
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for marketing materials (public read)
CREATE POLICY "Affiliates can view marketing materials" ON marketing_materials
  FOR SELECT USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM affiliates WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS Policies for affiliate stats
CREATE POLICY "Affiliates can view own stats" ON affiliate_stats
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_commission_payments_affiliate_id ON commission_payments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commission_tracking_affiliate_id ON commission_tracking(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commission_tracking_referral_id ON commission_tracking(referral_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_stats_affiliate_date ON affiliate_stats(affiliate_id, date);

-- Add updated_at triggers
CREATE TRIGGER update_affiliates_updated_at 
  BEFORE UPDATE ON affiliates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at 
  BEFORE UPDATE ON referrals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_payments_updated_at 
  BEFORE UPDATE ON commission_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    -- Generate 8-character code with random letters/numbers
    code := UPPER(
      SUBSTRING(MD5(random()::text || clock_timestamp()::text) FROM 1 FOR 8)
    );
    
    -- Check if code already exists
    SELECT NOT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO is_unique;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to track referral clicks
CREATE OR REPLACE FUNCTION track_referral_click(
  ref_code TEXT,
  source_url TEXT DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL,
  ip_addr TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  affiliate_rec RECORD;
  referral_id UUID;
  existing_referral UUID;
BEGIN
  -- Find affiliate by code
  SELECT * INTO affiliate_rec FROM affiliates WHERE affiliate_code = ref_code AND status = 'active';
  
  IF affiliate_rec.id IS NULL THEN
    RETURN NULL; -- Invalid affiliate code
  END IF;
  
  -- Check if referral already exists for this session/IP (within 24 hours)
  SELECT id INTO existing_referral 
  FROM referrals 
  WHERE affiliate_id = affiliate_rec.id 
    AND ip_address = ip_addr::INET 
    AND created_at > NOW() - INTERVAL '24 hours'
  LIMIT 1;
  
  IF existing_referral IS NOT NULL THEN
    RETURN existing_referral; -- Return existing referral
  END IF;
  
  -- Create new referral tracking
  INSERT INTO referrals (
    affiliate_id,
    referral_code,
    source_url,
    user_agent,
    ip_address,
    status
  ) VALUES (
    affiliate_rec.id,
    ref_code,
    source_url,
    user_agent_str,
    COALESCE(ip_addr::INET, '0.0.0.0'::INET),
    'pending'
  ) RETURNING id INTO referral_id;
  
  -- Update affiliate stats
  INSERT INTO affiliate_stats (affiliate_id, date, clicks)
  VALUES (affiliate_rec.id, CURRENT_DATE, 1)
  ON CONFLICT (affiliate_id, date)
  DO UPDATE SET clicks = affiliate_stats.clicks + 1;
  
  RETURN referral_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE affiliates IS 'Affiliate partner profiles and settings';
COMMENT ON TABLE referrals IS 'Track referral clicks and conversions';
COMMENT ON TABLE commission_payments IS 'Affiliate commission payment records';
COMMENT ON TABLE commission_tracking IS 'Individual commission calculations per referral';
COMMENT ON TABLE marketing_materials IS 'Marketing assets for affiliates';
COMMENT ON TABLE affiliate_stats IS 'Daily affiliate performance statistics';