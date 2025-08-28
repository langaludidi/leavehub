-- Calendar Integration Migration
-- Add calendar event tracking to leave requests

-- Add calendar_event_ids column to store external calendar event references
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS calendar_event_ids JSONB DEFAULT '{}';

-- Add calendar preferences to employee profiles
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS calendar_preferences JSONB DEFAULT '{}';

-- Create calendar integrations table to track user connections
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  provider_user_id TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  connected BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Add RLS to calendar_integrations
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own calendar integrations
CREATE POLICY "Users can manage own calendar integrations" ON calendar_integrations
  FOR ALL USING (user_id = auth.uid());

-- Create calendar sync logs table for audit trail
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  leave_request_id UUID REFERENCES leave_requests(id),
  provider TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  external_event_id TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS to calendar_sync_logs
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own sync logs, managers can view team logs
CREATE POLICY "Users can view own sync logs" ON calendar_sync_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view team sync logs" ON calendar_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_calendar_event_ids ON leave_requests 
  USING GIN (calendar_event_ids) WHERE calendar_event_ids IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_provider ON calendar_integrations(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_user_leave ON calendar_sync_logs(user_id, leave_request_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_created_at ON calendar_sync_logs(created_at);

-- Add updated_at trigger to calendar_integrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calendar_integrations_updated_at') THEN
    CREATE TRIGGER update_calendar_integrations_updated_at 
      BEFORE UPDATE ON calendar_integrations 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE calendar_integrations IS 'Stores user calendar provider connections and authentication tokens';
COMMENT ON TABLE calendar_sync_logs IS 'Audit trail for calendar synchronization events';
COMMENT ON COLUMN leave_requests.calendar_event_ids IS 'JSON object storing external calendar event IDs by provider';
COMMENT ON COLUMN employee_profiles.calendar_preferences IS 'User preferences for calendar integration behavior';