#!/usr/bin/env node

/**
 * Setup script to create call_state table in Supabase
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupCallStateTable() {
  console.log('🔧 Setting up call_state table...\n')

  const sqlStatements = [
    // Create table
    `CREATE TABLE IF NOT EXISTS call_state (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      call_sid TEXT NOT NULL UNIQUE,
      customer_name TEXT,
      customer_phone TEXT,
      service_address TEXT,
      service_type TEXT,
      preferred_time TEXT,
      status TEXT DEFAULT 'started' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );`,

    // Enable RLS
    `ALTER TABLE call_state ENABLE ROW LEVEL SECURITY;`,

    // Policies
    `DROP POLICY IF EXISTS "Enable read for all users" ON call_state;`,
    `CREATE POLICY "Enable read for all users" ON call_state 
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Enable insert for all users" ON call_state;`,
    `CREATE POLICY "Enable insert for all users" ON call_state 
      FOR INSERT WITH CHECK (true);`,

    `DROP POLICY IF EXISTS "Enable update for all users" ON call_state;`,
    `CREATE POLICY "Enable update for all users" ON call_state 
      FOR UPDATE USING (true);`,

    `DROP POLICY IF EXISTS "Enable delete for all users" ON call_state;`,
    `CREATE POLICY "Enable delete for all users" ON call_state 
      FOR DELETE USING (true);`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_call_state_call_sid ON call_state(call_sid);`,
    `CREATE INDEX IF NOT EXISTS idx_call_state_status ON call_state(status);`,
    `CREATE INDEX IF NOT EXISTS idx_call_state_created_at ON call_state(created_at);`,
  ]

  for (const sql of sqlStatements) {
    try {
      console.log(`Executing: ${sql.substring(0, 50)}...`)
      const { error } = await supabase.rpc('exec', { sql })

      if (error && !error.message.includes('already exists')) {
        // Try using the execute method instead
        console.log('Trying alternative approach...')
      } else if (!error) {
        console.log('✅ Success')
      }
    } catch (error) {
      // Supabase RPC method might not work, try direct SQL via API
      console.warn(`Note: Direct execution might need manual setup via Supabase dashboard`)
    }
  }

  // Verify table creation by trying a simple query
  console.log('\n✅ Table setup initiated. Verifying...')
  try {
    const { data, error } = await supabase
      .from('call_state')
      .select('*')
      .limit(1)

    if (!error) {
      console.log('✅ call_state table is accessible!')
      return true
    } else if (error.message.includes('not found')) {
      console.error('❌ Table not found. You may need to create it manually via Supabase SQL Editor.')
      console.error('\nSQL to run in Supabase SQL Editor:')
      console.error('────────────────────────────────────────────')
      console.log(fs.readFileSync(path.join(__dirname, 'setup-call-state-table.sql'), 'utf8'))
      console.error('────────────────────────────────────────────')
      return false
    } else {
      throw error
    }
  } catch (error) {
    console.error('❌ Error verifying table:', error.message)
    return false
  }
}

setupCallStateTable()
  .then(success => {
    if (success) {
      console.log('\n✅ Setup complete!')
      process.exit(0)
    } else {
      console.log('\n⚠️ Manual setup required')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
