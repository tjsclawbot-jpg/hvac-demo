#!/usr/bin/env node

/**
 * Complete Supabase Setup Script
 * 
 * This script attempts to create the voice_bookings table in Supabase.
 * Requires either:
 * 1. Access to Supabase dashboard (manual SQL execution), or
 * 2. Direct PostgreSQL connection credentials
 * 
 * Usage: node complete-supabase-setup.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://qeoxavbzuxqhbwwlpiss.supabase.co';
const PROJECT_REF = 'qeoxavbzuxqhbwwlpiss';
const DB_PASSWORD = 'G7V$Ei2fLQw!BSS';
const DB_HOST = `${PROJECT_REF}.c.supabase.co`;
const SQL_FILE = path.join(__dirname, 'setup-voice-bookings-table.sql');

console.log('🚀 Supabase Setup for HVAC Voice Bookings\n');
console.log('Project:', PROJECT_REF);
console.log('URL:', SUPABASE_URL);

function attemptPostgresConnect() {
  console.log('\n📡 Attempting direct PostgreSQL connection...\n');
  
  return new Promise((resolve) => {
    const cmd = `PGPASSWORD='${DB_PASSWORD}' psql -h ${DB_HOST} -U postgres -d postgres -f ${SQL_FILE}`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ PostgreSQL connection failed:');
        console.log('  Error:', error.message);
        console.log('\n  This is expected if:');
        console.log('  - Network connectivity to Supabase is unavailable');
        console.log('  - Database password is incorrect');
        console.log('  - PostgreSQL client (psql) is not installed\n');
        resolve(false);
      } else {
        console.log('✓ Table created successfully via PostgreSQL!\n');
        console.log(stdout);
        resolve(true);
      }
    });
  });
}

function printManualInstructions() {
  console.log('📋 Manual Setup via Supabase Dashboard:\n');
  console.log('1. Go to: https://app.supabase.com/');
  console.log('2. Login to your Supabase account');
  console.log('3. Navigate to project: ' + PROJECT_REF);
  console.log('4. Click "SQL Editor" in the left sidebar');
  console.log('5. Click "New Query"');
  console.log('6. Copy and paste the contents of: setup-voice-bookings-table.sql');
  console.log('7. Click "RUN" button');
  console.log('8. Verify: Table should appear in the "Tables" sidebar\n');
}

async function main() {
  const postgresSuccess = await attemptPostgresConnect();
  
  if (!postgresSuccess) {
    printManualInstructions();
    console.log('ℹ️  Save the SQL file location for manual execution:');
    console.log('   ', SQL_FILE, '\n');
  }
  
  console.log('After table creation, verify with:');
  console.log('  curl -X GET \\');
  console.log('    "https://qeoxavbzuxqhbwwlpiss.supabase.co/rest/v1/voice_bookings" \\');
  console.log('    -H "apikey: sb_publishable_8hwfQTZ1BwkDqO8nu4kxsg_wozt3oaO"\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
