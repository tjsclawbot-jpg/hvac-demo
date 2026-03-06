-- Create voice_bookings table for HVAC voice bookings
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

-- Enable Row Level Security
ALTER TABLE voice_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
DROP POLICY IF EXISTS "Enable read for all users" ON voice_bookings;
CREATE POLICY "Enable read for all users" ON voice_bookings 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON voice_bookings;
CREATE POLICY "Enable insert for all users" ON voice_bookings 
  FOR INSERT WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_bookings_call_sid ON voice_bookings(call_sid);
CREATE INDEX IF NOT EXISTS idx_voice_bookings_customer_phone ON voice_bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_voice_bookings_created_at ON voice_bookings(created_at);
