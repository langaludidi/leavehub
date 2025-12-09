const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const createSubscriptionsTableSQL = `
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annually')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status TEXT DEFAULT 'active' CHECK (payment_status IN ('active', 'expired', 'cancelled', 'pending')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  company_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_reference ON subscriptions(payment_reference);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status ON subscriptions(payment_status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
`;

async function createTable() {
  try {
    console.log('🔄 Creating subscriptions table...\n');
    console.log('Note: You may need to run this SQL manually in Supabase Dashboard > SQL Editor if this script fails.\n');
    console.log('='.repeat(80));
    console.log(createSubscriptionsTableSQL);
    console.log('='.repeat(80));
    console.log('\n');

    // Try to verify if table exists by selecting from it
    const { data, error } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(0);

    if (!error) {
      console.log('✓ subscriptions table already exists!');
      return;
    }

    console.log('\n📝 Instructions to create the table:');
    console.log('1. Go to: https://supabase.com/dashboard/project/anxdcwmndfiowkfismts/sql');
    console.log('2. Copy the SQL above');
    console.log('3. Paste it in the SQL Editor');
    console.log('4. Click "Run"');
    console.log('\nOr run this command if you have psql installed:');
    console.log(`psql "${supabaseUrl.replace('https://', 'postgresql://postgres:')}@db.anxdcwmndfiowkfismts.supabase.co:5432/postgres" -c "..."`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();
