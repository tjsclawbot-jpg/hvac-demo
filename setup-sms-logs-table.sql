-- Create sms_logs table for SMS tracking and auditing
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('customer_confirmation', 'contractor_assignment', 'status_update', 'customer_status_update')),
  booking_id UUID,
  contractor_id UUID,
  twilio_message_sid TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for access
DROP POLICY IF EXISTS "Enable read for all users" ON sms_logs;
CREATE POLICY "Enable read for all users" ON sms_logs 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON sms_logs;
CREATE POLICY "Enable insert for all users" ON sms_logs 
  FOR INSERT WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_recipient_phone ON sms_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_booking_id ON sms_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_contractor_id ON sms_logs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_message_type ON sms_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at);

-- Create composite index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_sms_logs_rate_limit ON sms_logs(booking_id, message_type, sent_at) 
  WHERE status = 'sent';
