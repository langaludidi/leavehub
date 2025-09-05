-- Additional SQL functions for affiliate system

-- Function to update affiliate commission totals
CREATE OR REPLACE FUNCTION update_affiliate_commissions(
  affiliate_id UUID,
  commission_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliates 
  SET 
    total_commissions_earned = total_commissions_earned + commission_amount,
    updated_at = NOW()
  WHERE id = affiliate_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive affiliate stats
CREATE OR REPLACE FUNCTION get_affiliate_stats(affiliate_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_referrals INTEGER;
  active_referrals INTEGER;
  total_earned DECIMAL;
  total_paid DECIMAL;
  pending_commissions DECIMAL;
  conversion_rate DECIMAL;
  clicks_this_month INTEGER;
  signups_this_month INTEGER;
BEGIN
  -- Get total referrals
  SELECT COUNT(*) INTO total_referrals
  FROM referrals WHERE affiliate_id = affiliate_id;
  
  -- Get active referrals (converted)
  SELECT COUNT(*) INTO active_referrals
  FROM referrals WHERE affiliate_id = affiliate_id AND status = 'converted';
  
  -- Get commission totals
  SELECT 
    COALESCE(total_commissions_earned, 0),
    COALESCE(total_commissions_paid, 0)
  INTO total_earned, total_paid
  FROM affiliates WHERE id = affiliate_id;
  
  pending_commissions := total_earned - total_paid;
  
  -- Calculate conversion rate
  conversion_rate := CASE 
    WHEN total_referrals > 0 THEN (active_referrals::DECIMAL / total_referrals::DECIMAL) * 100
    ELSE 0
  END;
  
  -- Get this month's stats
  SELECT 
    COALESCE(SUM(clicks), 0),
    COALESCE(SUM(signups), 0)
  INTO clicks_this_month, signups_this_month
  FROM affiliate_stats 
  WHERE affiliate_id = affiliate_id 
    AND date >= DATE_TRUNC('month', CURRENT_DATE);
  
  -- Build JSON result
  result := json_build_object(
    'totalReferrals', total_referrals,
    'activeReferrals', active_referrals,
    'totalCommissionsEarned', total_earned,
    'totalCommissionsPaid', total_paid,
    'pendingCommissions', pending_commissions,
    'conversionRate', conversion_rate,
    'clicksThisMonth', clicks_this_month,
    'signupsThisMonth', signups_this_month
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily affiliate stats
CREATE OR REPLACE FUNCTION update_daily_affiliate_stats(
  affiliate_code TEXT,
  stat_date DATE,
  stat_type TEXT
)
RETURNS VOID AS $$
DECLARE
  affiliate_rec RECORD;
BEGIN
  -- Find affiliate by code
  SELECT id INTO affiliate_rec FROM affiliates WHERE affiliate_code = affiliate_code;
  
  IF affiliate_rec.id IS NULL THEN
    RETURN; -- Invalid affiliate code
  END IF;
  
  -- Update or insert daily stats
  IF stat_type = 'clicks' THEN
    INSERT INTO affiliate_stats (affiliate_id, date, clicks)
    VALUES (affiliate_rec.id, stat_date, 1)
    ON CONFLICT (affiliate_id, date)
    DO UPDATE SET clicks = affiliate_stats.clicks + 1;
    
  ELSIF stat_type = 'signups' THEN
    INSERT INTO affiliate_stats (affiliate_id, date, signups)
    VALUES (affiliate_rec.id, stat_date, 1)
    ON CONFLICT (affiliate_id, date)
    DO UPDATE SET signups = affiliate_stats.signups + 1;
    
  ELSIF stat_type = 'conversions' THEN
    INSERT INTO affiliate_stats (affiliate_id, date, conversions)
    VALUES (affiliate_rec.id, stat_date, 1)
    ON CONFLICT (affiliate_id, date)
    DO UPDATE SET conversions = affiliate_stats.conversions + 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to process monthly commission payments
CREATE OR REPLACE FUNCTION process_monthly_commissions(
  payment_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
)
RETURNS TABLE(affiliate_id UUID, commission_amount DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.affiliate_id,
    SUM(ct.commission_amount) as total_commission
  FROM commission_tracking ct
  WHERE ct.commission_month = payment_month
    AND ct.payment_status = 'pending'
  GROUP BY ct.affiliate_id
  HAVING SUM(ct.commission_amount) > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create commission payment record
CREATE OR REPLACE FUNCTION create_commission_payment(
  affiliate_id UUID,
  period_start DATE,
  period_end DATE,
  gross_amount DECIMAL,
  commission_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
  payment_id UUID;
BEGIN
  INSERT INTO commission_payments (
    affiliate_id,
    period_start,
    period_end,
    gross_amount,
    commission_amount,
    payment_status
  )
  VALUES (
    affiliate_id,
    period_start,
    period_end,
    gross_amount,
    commission_amount,
    'pending'
  )
  RETURNING id INTO payment_id;
  
  -- Update commission tracking records
  UPDATE commission_tracking
  SET 
    payment_status = 'pending',
    payment_id = payment_id
  WHERE affiliate_id = affiliate_id
    AND commission_month >= period_start
    AND commission_month <= period_end
    AND payment_status = 'pending';
    
  RETURN payment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve affiliate application
CREATE OR REPLACE FUNCTION approve_affiliate(
  affiliate_id UUID,
  approver_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliates
  SET 
    status = 'active',
    approved_by = approver_id,
    approved_at = NOW(),
    referral_link = 'https://leavehub.co.za/?ref=' || affiliate_code,
    updated_at = NOW()
  WHERE id = affiliate_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get affiliate performance report
CREATE OR REPLACE FUNCTION get_affiliate_performance_report(
  affiliate_id UUID,
  start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'),
  end_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'
)
RETURNS TABLE(
  date DATE,
  clicks INTEGER,
  signups INTEGER,
  conversions INTEGER,
  commission_earned DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.date,
    COALESCE(s.clicks, 0) as clicks,
    COALESCE(s.signups, 0) as signups,
    COALESCE(s.conversions, 0) as conversions,
    COALESCE(s.commission_earned, 0) as commission_earned
  FROM affiliate_stats s
  WHERE s.affiliate_id = affiliate_id
    AND s.date >= start_date
    AND s.date <= end_date
  ORDER BY s.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing affiliates
CREATE OR REPLACE FUNCTION get_top_affiliates(
  limit_count INTEGER DEFAULT 10,
  period_start DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
)
RETURNS TABLE(
  affiliate_id UUID,
  affiliate_name TEXT,
  total_referrals BIGINT,
  total_conversions BIGINT,
  total_commissions DECIMAL,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as affiliate_id,
    p.full_name as affiliate_name,
    COUNT(r.id) as total_referrals,
    COUNT(CASE WHEN r.status = 'converted' THEN 1 END) as total_conversions,
    COALESCE(SUM(ct.commission_amount), 0) as total_commissions,
    CASE 
      WHEN COUNT(r.id) > 0 
      THEN ROUND((COUNT(CASE WHEN r.status = 'converted' THEN 1 END)::DECIMAL / COUNT(r.id)::DECIMAL) * 100, 2)
      ELSE 0 
    END as conversion_rate
  FROM affiliates a
  JOIN profiles p ON a.user_id = p.id
  LEFT JOIN referrals r ON a.id = r.affiliate_id AND r.created_at >= period_start
  LEFT JOIN commission_tracking ct ON a.id = ct.affiliate_id AND ct.created_at >= period_start
  WHERE a.status = 'active'
  GROUP BY a.id, p.full_name
  ORDER BY total_commissions DESC, total_conversions DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update affiliate referral count
CREATE OR REPLACE FUNCTION update_affiliate_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE affiliates 
    SET total_referrals = total_referrals + 1
    WHERE id = NEW.affiliate_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE affiliates 
    SET total_referrals = total_referrals - 1
    WHERE id = OLD.affiliate_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral count
DROP TRIGGER IF EXISTS referral_count_trigger ON referrals;
CREATE TRIGGER referral_count_trigger
  AFTER INSERT OR DELETE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_referral_count();

-- Insert sample marketing materials
INSERT INTO marketing_materials (title, type, content, active) VALUES
  ('LeaveHub Banner 728x90', 'banner', 'Perfect for website headers', TRUE),
  ('Email Template - Introduction', 'email_template', 'Introducing LeaveHub to your network', TRUE),
  ('Social Media Post - Benefits', 'social_post', 'Highlight key LeaveHub benefits', TRUE),
  ('Landing Page Copy', 'landing_page', 'Convert visitors to trials', TRUE)
ON CONFLICT DO NOTHING;