-- Create call_state table for tracking conversation progress
CREATE TABLE IF NOT EXISTS call_state (
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
);

-- Enable Row Level Security
ALTER TABLE call_state ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
DROP POLICY IF EXISTS "Enable read for all users" ON call_state;
CREATE POLICY "Enable read for all users" ON call_state 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON call_state;
CREATE POLICY "Enable insert for all users" ON call_state 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON call_state;
CREATE POLICY "Enable update for all users" ON call_state 
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON call_state;
CREATE POLICY "Enable delete for all users" ON call_state 
  FOR DELETE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_call_state_call_sid ON call_state(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_state_status ON call_state(status);
CREATE INDEX IF NOT EXISTS idx_call_state_created_at ON call_state(created_at);
