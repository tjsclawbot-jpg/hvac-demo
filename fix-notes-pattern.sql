-- Fix notes column pattern constraint issue
-- Run this in Supabase SQL editor

-- 1. Drop the problematic column and recreate it
ALTER TABLE bookings DROP COLUMN IF EXISTS notes CASCADE;
ALTER TABLE voice_bookings DROP COLUMN IF EXISTS notes CASCADE;

-- 2. Recreate as simple nullable text column
ALTER TABLE bookings ADD COLUMN notes text;
ALTER TABLE voice_bookings ADD COLUMN notes text;
