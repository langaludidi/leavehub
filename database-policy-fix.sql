-- Fixed Leave Management Systems Schema
-- This script corrects the polname vs policyname issue

-- Enable Row Level Security and create policies with correct syntax
DO $$
BEGIN
  -- Enable RLS on leave_requests table if not already enabled
  ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "leave_requests_select_basic" ON leave_requests;
  DROP POLICY IF EXISTS "leave_requests_insert_own" ON leave_requests;
  DROP POLICY IF EXISTS "leave_requests_update_own" ON leave_requests;
  DROP POLICY IF EXISTS "leave_requests_delete_own" ON leave_requests;
  
  -- Create SELECT policy - users can see their own requests
  CREATE POLICY "leave_requests_select_basic" ON leave_requests
    FOR SELECT USING (auth.uid() = user_id);
  
  -- Create INSERT policy - users can create their own requests
  CREATE POLICY "leave_requests_insert_own" ON leave_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  -- Create UPDATE policy - users can update their own pending requests
  CREATE POLICY "leave_requests_update_own" ON leave_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
  
  -- Create DELETE policy - users can delete their own pending requests
  CREATE POLICY "leave_requests_delete_own" ON leave_requests
    FOR DELETE USING (auth.uid() = user_id AND status = 'pending');
    
  RAISE NOTICE 'Leave requests policies created successfully';
END $$;

-- Create additional policies for other tables if needed
DO $$
BEGIN
  -- Policies for user_profiles table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
    DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
    
    CREATE POLICY "user_profiles_select_own" ON user_profiles
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "user_profiles_update_own" ON user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
      
    RAISE NOTICE 'User profiles policies created successfully';
  END IF;
END $$;

-- Create policies for leave_balances table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_balances') THEN
    ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "leave_balances_select_own" ON leave_balances;
    
    CREATE POLICY "leave_balances_select_own" ON leave_balances
      FOR SELECT USING (auth.uid() = user_id);
      
    RAISE NOTICE 'Leave balances policies created successfully';
  END IF;
END $$;

-- Create policies for notifications table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
    
    CREATE POLICY "notifications_select_own" ON notifications
      FOR SELECT USING (auth.uid() = user_id OR is_public = true);
      
    RAISE NOTICE 'Notifications policies created successfully';
  END IF;
END $$;

-- Create admin policies (for users with admin role)
DO $$
BEGIN
  -- Admin can see all leave requests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
    DROP POLICY IF EXISTS "leave_requests_admin_all" ON leave_requests;
    
    CREATE POLICY "leave_requests_admin_all" ON leave_requests
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE user_profiles.user_id = auth.uid() 
          AND user_profiles.role = 'admin'
        )
      );
      
    RAISE NOTICE 'Admin policies created successfully';
  END IF;
END $$;

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('leave_requests', 'user_profiles', 'leave_balances', 'notifications')
ORDER BY tablename, policyname;