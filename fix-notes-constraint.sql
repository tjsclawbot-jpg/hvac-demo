-- Remove any constraints on notes column and ensure it's just a text field
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_notes_check;
ALTER TABLE voice_bookings DROP CONSTRAINT IF EXISTS voice_bookings_notes_check;

-- Ensure notes column exists and is nullable text
ALTER TABLE bookings ALTER COLUMN notes SET DEFAULT NULL;
ALTER TABLE voice_bookings ALTER COLUMN notes SET DEFAULT NULL;
