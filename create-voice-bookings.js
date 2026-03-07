const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  if (!SUPABASE_URL) console.error('   - SUPABASE_URL');
  if (!SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  if (!ANON_KEY) console.error('   - SUPABASE_ANON_KEY');
  console.error('\nAdd these to .env.local and try again.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setupTable() {
  try {
    console.log('Attempting to create voice_bookings table...\n');
    
    // Try calling a function if it exists, or use the API to create
    // First, let's try to insert a test record to see if table exists
    const { data, error } = await supabase
      .from('voice_bookings')
      .insert([{
        call_sid: 'test-' + Date.now(),
        service_type: 'test',
        customer_name: 'Test Customer',
        customer_phone: '+1234567890',
        service_address: 'Test Address',
        preferred_time: '2024-01-01'
      }])
      .select();

    if (error) {
      console.log('Error from insert:', error.code, error.message);
      
      if (error.code === '42P01') {
        console.log('\n❌ Table does not exist. Trying alternative method...\n');
        
        // Try using sql_execute function if available
        const { data: rpcData, error: rpcError } = await supabase.rpc('sql_execute', {
          sql: `
            CREATE TABLE IF NOT EXISTS voice_bookings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              call_sid TEXT NOT NULL,
              service_type TEXT,
              customer_name TEXT,
              customer_phone TEXT,
              service_address TEXT,
              preferred_time TEXT,
              created_at TIMESTAMP DEFAULT NOW()
            );
            
            ALTER TABLE voice_bookings ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Enable read for all users" ON voice_bookings FOR SELECT USING (true);
            CREATE POLICY "Enable insert for all users" ON voice_bookings FOR INSERT WITH CHECK (true);
          `
        });
        
        if (rpcError) {
          console.log('RPC Error:', rpcError.message);
        } else {
          console.log('✓ Table created via RPC');
        }
      }
    } else {
      console.log('✓ Successfully inserted test record');
      console.log('Table structure verified');
      
      // Clean up test record
      await supabase.from('voice_bookings').delete().eq('call_sid', data[0].call_sid);
      console.log('✓ Cleaned up test record');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

setupTable();
