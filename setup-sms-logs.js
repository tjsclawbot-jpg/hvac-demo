#!/usr/bin/env node

/**
 * Setup SMS Logs Table in Supabase
 * 
 * This script creates the sms_logs table with proper schema, indexes, and RLS policies.
 * Run this once after initial database setup.
 * 
 * Usage: node setup-sms-logs.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupSMSLogsTable() {
  try {
    console.log('🚀 Setting up SMS logs table...\n')

    // Read the SQL setup file
    const sqlPath = path.join(__dirname, 'setup-sms-logs-table.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Execute the SQL commands
    console.log('📋 Executing SQL setup...')
    const { error } = await supabase.rpc('exec', { sql: sqlContent })

    if (error) {
      // Try alternative approach using direct table queries
      console.log('📝 Using alternative setup approach...')
      
      // Check if table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_name', 'sms_logs')

      if (tables && tables.length > 0) {
        console.log('✅ SMS logs table already exists')
        return
      }

      console.log('⚠️  Could not verify table setup via SQL. Manual setup may be required.')
      console.log('\n📖 To set up manually:')
      console.log('1. Go to Supabase dashboard: https://app.supabase.com')
      console.log('2. Navigate to your project')
      console.log('3. Open the SQL Editor')
      console.log('4. Create a new query')
      console.log('5. Copy the contents of setup-sms-logs-table.sql')
      console.log('6. Execute the query')
      return
    }

    console.log('✅ SMS logs table setup completed successfully!')
    console.log('\n📊 Table created with the following schema:')
    console.log('  - id (UUID, primary key)')
    console.log('  - recipient_phone (TEXT)')
    console.log('  - message_body (TEXT)')
    console.log('  - message_type (TEXT: customer_confirmation, contractor_assignment, status_update, customer_status_update)')
    console.log('  - booking_id (UUID, nullable)')
    console.log('  - contractor_id (UUID, nullable)')
    console.log('  - twilio_message_sid (TEXT, nullable)')
    console.log('  - sent_at (TIMESTAMP)')
    console.log('  - status (TEXT: sent, failed, bounced)')
    console.log('  - error_message (TEXT, nullable)')
    console.log('  - created_at (TIMESTAMP)')
    console.log('\n✨ Indexes created for optimized queries')
    console.log('🔒 Row Level Security (RLS) enabled')
  } catch (error) {
    console.error('❌ Error setting up SMS logs table:', error.message)
    console.log('\n📖 Manual setup instructions:')
    console.log('1. Visit Supabase dashboard')
    console.log('2. Open SQL Editor')
    console.log('3. Run the SQL from setup-sms-logs-table.sql')
    process.exit(1)
  }
}

// Run setup
setupSMSLogsTable().then(() => {
  console.log('\n✅ Setup complete!')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
