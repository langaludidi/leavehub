// Quick script to check what tables exist in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://anxdcwmndfiowkfismts.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueGRjd21uZGZpb3drZmlzbXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3MDkyNSwiZXhwIjoyMDc3MTQ2OTI1fQ.W2bjqLqg9U29F-thp4WCKOIYZWH8-h6zWHDDBf8mwgQ'
);

async function checkTables() {
  console.log('Checking Supabase connection...');
  console.log('URL: https://anxdcwmndfiowkfismts.supabase.co');

  // Try to query each table
  const tables = ['companies', 'profiles', 'leave_types', 'leave_balances', 'leave_requests', 'public_holidays'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: Table exists (${data?.length || 0} rows)`);
    }
  }
}

checkTables();
