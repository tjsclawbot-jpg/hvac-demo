-- Add notes column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes text;

-- Add notes column to voice_bookings table if it doesn't exist
ALTER TABLE voice_bookings ADD COLUMN IF NOT EXISTS notes text;
