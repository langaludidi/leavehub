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

const migrationSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20251209_add_role_to_profiles.sql'),
  'utf8'
);

async function applyMigration() {
  try {
    console.log('🔄 Applying role migration to profiles table...\n');
    console.log('Note: You may need to run this SQL manually in Supabase Dashboard if this script fails.\n');
    console.log('='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\n');

    // Try to verify if role column already exists
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .limit(1);

    if (!error) {
      console.log('✓ role column already exists in profiles table!');
      console.log('Sample data:', data);
      return;
    }

    console.log('\n📝 Instructions to apply the migration:');
    console.log('1. Go to: https://supabase.com/dashboard/project/anxdcwmndfiowkfismts/sql');
    console.log('2. Copy the SQL above');
    console.log('3. Paste it in the SQL Editor');
    console.log('4. Click "Run"');
    console.log('\nThis will:');
    console.log('- Create user_role enum type');
    console.log('- Add role column to profiles table (default: employee)');
    console.log('- Create indexes for performance');
    console.log('- Update RLS policies for role-based access');
    console.log('- Create helper functions for role checking');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
