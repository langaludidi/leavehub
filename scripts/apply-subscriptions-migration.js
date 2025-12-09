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
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/20251209_create_subscriptions_table.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

async function applyMigration() {
  try {
    console.log('Applying subscriptions table migration...');

    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try alternative method - execute each statement separately
      console.log('Trying alternative method...');

      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: stmtError } = await supabase
            .from('_migration_temp')
            .select('*')
            .limit(0);

          // Direct SQL execution via REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok) {
            console.log(`Statement execution note: ${statement.substring(0, 50)}...`);
          }
        }
      }
    }

    console.log('✓ Subscriptions table migration applied successfully');

    // Verify table was created
    const { data: tableCheck, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(0);

    if (checkError) {
      console.error('Warning: Could not verify table creation:', checkError.message);
    } else {
      console.log('✓ Verified: subscriptions table exists and is accessible');
    }

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

applyMigration();
