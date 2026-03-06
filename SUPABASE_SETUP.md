# Supabase Integration Setup

## Overview
This document explains how to set up Supabase database integration for voice booking persistence.

## Prerequisites
- A Supabase project (free tier is fine)
- Supabase URL and Anon Key

## Database Setup

### 1. Create the `voice_bookings` Table

Run the following SQL in your Supabase SQL editor:

```sql
CREATE TABLE voice_bookings (
  id BIGSERIAL PRIMARY KEY,
  call_sid VARCHAR(255) NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_address TEXT NOT NULL,
  preferred_time VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on call_sid for quick lookups
CREATE UNIQUE INDEX idx_voice_bookings_call_sid ON voice_bookings(call_sid);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE voice_bookings ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing anonymous inserts (for voice API)
CREATE POLICY "Allow anonymous inserts" ON voice_bookings
  FOR INSERT WITH CHECK (true);

-- Create a policy allowing authenticated users to select all
CREATE POLICY "Allow authenticated select" ON voice_bookings
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_from_supabase
```

You can find these in your Supabase project settings under "API" > "Project API keys".

## Data Flow

1. **Call comes in** → `incoming-call.ts` initiates IVR
2. **User provides info** → Various endpoints collect name, phone, address, service type
3. **User confirms time** → `confirm-booking.ts` captures preferred time
4. **Booking stored** → `storeVoiceBooking()` persists to Supabase `voice_bookings` table
5. **Confirmation plays** → User hears confirmation message
6. **Database failure handling** → If DB insert fails, call still completes successfully (graceful degradation)

## Table Schema

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| call_sid | VARCHAR(255) | Twilio call identifier (unique) |
| service_type | VARCHAR(255) | Type of service (e.g., "AC repair") |
| customer_name | VARCHAR(255) | Name of customer |
| customer_phone | VARCHAR(20) | Phone number for confirmation |
| service_address | TEXT | Service location address |
| preferred_time | VARCHAR(255) | Preferred appointment time |
| created_at | TIMESTAMP | When the booking was created |
| updated_at | TIMESTAMP | Last update timestamp |

## Testing

Use the provided test script:

```bash
./test-confirm-booking.sh
```

This will send a POST request to the confirm-booking endpoint with sample data.

## Monitoring

Check Supabase dashboard for:
- New rows in `voice_bookings` table
- Any errors in the function logs
- Performance metrics under "Database" > "Usage"

## Future Enhancements

1. **Session State Storage**: Store conversation state in Supabase to extract accurate customer data
2. **Analytics**: Query voice bookings for reporting
3. **Follow-up Webhooks**: Trigger post-booking workflows
4. **CRM Integration**: Sync bookings to external systems
