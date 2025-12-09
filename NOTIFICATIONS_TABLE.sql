-- LeaveHub Notifications System
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- 2. RLS POLICIES
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (true);

-- ============================================
-- 3. NOTIFICATION HELPER FUNCTIONS
-- ============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_action_url VARCHAR(500) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_metadata)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all user notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGERS FOR AUTOMATIC NOTIFICATIONS
-- ============================================

-- Trigger function for leave request notifications
CREATE OR REPLACE FUNCTION notify_leave_request_events()
RETURNS TRIGGER AS $$
DECLARE
  requester_profile RECORD;
  manager_profile RECORD;
  leave_type_name VARCHAR(100);
BEGIN
  -- Get requester profile
  SELECT * INTO requester_profile FROM profiles WHERE id = NEW.user_id;

  -- Get leave type name
  SELECT name INTO leave_type_name FROM leave_types WHERE id = NEW.leave_type_id;

  -- On INSERT (New leave request)
  IF TG_OP = 'INSERT' THEN
    -- Notify managers in the same department
    FOR manager_profile IN
      SELECT * FROM profiles
      WHERE company_id = requester_profile.company_id
      AND department = requester_profile.department
      AND role IN ('manager', 'admin')
      AND id != NEW.user_id
    LOOP
      PERFORM create_notification(
        manager_profile.id,
        'leave_request_submitted',
        'New Leave Request',
        requester_profile.first_name || ' ' || requester_profile.last_name || ' requested ' || leave_type_name || ' leave',
        '/dashboard/approvals',
        jsonb_build_object(
          'leave_request_id', NEW.id,
          'requester_id', NEW.user_id,
          'leave_type', leave_type_name,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'working_days', NEW.working_days
        )
      );
    END LOOP;
  END IF;

  -- On UPDATE (Status change)
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify the requester
    IF NEW.status = 'approved' THEN
      PERFORM create_notification(
        NEW.user_id,
        'leave_request_approved',
        'Leave Request Approved',
        'Your ' || leave_type_name || ' leave request has been approved',
        '/dashboard/my-requests',
        jsonb_build_object(
          'leave_request_id', NEW.id,
          'leave_type', leave_type_name,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'working_days', NEW.working_days
        )
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM create_notification(
        NEW.user_id,
        'leave_request_rejected',
        'Leave Request Rejected',
        'Your ' || leave_type_name || ' leave request has been rejected',
        '/dashboard/my-requests',
        jsonb_build_object(
          'leave_request_id', NEW.id,
          'leave_type', leave_type_name,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'reason', NEW.reviewer_comments
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to leave_requests table
DROP TRIGGER IF EXISTS leave_request_notification_trigger ON leave_requests;
CREATE TRIGGER leave_request_notification_trigger
AFTER INSERT OR UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION notify_leave_request_events();

-- ============================================
-- 5. INSERT DEMO NOTIFICATIONS
-- ============================================

-- Create some demo notifications for demo-user-123
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
SELECT
  p.id,
  'leave_request_approved',
  'Leave Request Approved',
  'Your Annual Leave request for Dec 23-27 has been approved',
  '/dashboard/my-requests',
  false,
  NOW() - INTERVAL '1 hour'
FROM profiles p
WHERE p.clerk_user_id = 'demo-user-123'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
SELECT
  p.id,
  'leave_balance_low',
  'Leave Balance Running Low',
  'You have only 2 days of sick leave remaining for 2025',
  '/dashboard',
  false,
  NOW() - INTERVAL '2 days'
FROM profiles p
WHERE p.clerk_user_id = 'demo-user-123'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, type, title, message, action_url, is_read, read_at, created_at)
SELECT
  p.id,
  'leave_reminder',
  'Upcoming Leave Reminder',
  'Your leave starts in 3 days (Dec 23, 2025)',
  '/dashboard/calendar',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '3 days'
FROM profiles p
WHERE p.clerk_user_id = 'demo-user-123'
ON CONFLICT DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Notifications system setup complete!' AS status;
SELECT 'Notifications' AS table_name, COUNT(*) as count FROM notifications;
