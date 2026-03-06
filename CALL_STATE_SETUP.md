# Call State Management Setup Guide

## Overview

The call state management system tracks conversation data across voice booking calls, allowing you to persist customer information throughout the entire call flow.

## Table: `call_state`

This table stores temporary conversation state for active calls, keyed by Twilio's `CallSid`.

### Schema

```sql
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
```

### Fields

- **id** (UUID): Primary key
- **call_sid** (TEXT, UNIQUE): Twilio Call Session ID - uniquely identifies each call
- **customer_name** (TEXT): Name collected in collect-name.ts
- **customer_phone** (TEXT): Phone number collected in collect-phone.ts
- **service_address** (TEXT): Address collected in collect-address.ts
- **service_type** (TEXT): Service type detected in handle-speech.ts
- **preferred_time** (TEXT): Appointment time preference from confirm-booking.ts
- **status** (TEXT): Call state status enum
- **created_at** (TIMESTAMP): When the call started
- **updated_at** (TIMESTAMP): Last update time

### Status Values

- `started`: Initial state when call begins
- `name_collected`: Customer name has been captured
- `phone_collected`: Phone number has been captured
- `address_collected`: Service address has been captured
- `time_collected`: Preferred time has been captured
- `completed`: Call completed and booking stored

## Setup Instructions

### Option 1: Using Supabase Dashboard (Manual)

1. Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the SQL from `setup-call-state-table.sql`
6. Run the query

### Option 2: Using the Setup Script

```bash
# Run the automated setup script
node setup-call-state.js
```

The script will attempt to create the table and verify it's accessible.

## Integration Points

### 1. incoming-call.ts
- **Action**: Initialize call state
- **Function**: `initializeCallState(callSid)`
- **Creates**: New record with status='started'

### 2. handle-speech.ts
- **Action**: Save service type
- **Function**: `updateCallState(callSid, {service_type, status})`
- **Updates**: Sets service_type and maintains status

### 3. collect-name.ts
- **Action**: Save customer name
- **Function**: `updateCallState(callSid, {customer_name, status: 'name_collected'})`
- **Updates**: Saves customer name and marks name as collected

### 4. collect-phone.ts
- **Action**: Save phone number
- **Function**: `updateCallState(callSid, {customer_phone, status: 'phone_collected'})`
- **Updates**: Saves formatted phone number and marks phone as collected

### 5. collect-address.ts
- **Action**: Save service address
- **Function**: `updateCallState(callSid, {service_address, status: 'address_collected'})`
- **Updates**: Saves address and marks address as collected

### 6. confirm-booking.ts
- **Action**: Retrieve all data and create booking
- **Functions**: 
  - `getCallState(callSid)` - Retrieve complete conversation state
  - `storeVoiceBooking(booking)` - Store to voice_bookings table
  - `updateCallState(callSid, {status: 'completed'})` - Mark call as completed
- **Updates**: Creates permanent booking record and closes call state

### 7. end-call.ts
- **Action**: Optional cleanup
- **Function**: Delete completed call states
- **Note**: Can optionally remove completed entries for hygiene

## Cleanup

### Automatic Cleanup (Recommended)

Call the cleanup endpoint periodically to remove entries older than 24 hours:

```bash
# Using curl
curl -X GET \
  "https://your-domain.com/api/voice/cleanup-call-states?token=YOUR_CLEANUP_TOKEN" \
  -H "x-cleanup-token: YOUR_CLEANUP_TOKEN"
```

### Setup as Cron Job (Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/voice/cleanup-call-states",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Or Use External Service

Use [EasyCron](https://www.easycron.com/) or similar to call the cleanup endpoint daily.

## Error Handling

All endpoints include graceful error handling:

- **DB Failures**: If state retrieval fails, endpoints continue with graceful fallback
- **Validation**: Data is validated before storage
- **Logging**: All errors are logged to console
- **Confirmation**: IVR still plays confirmation message even if DB fails

## Testing

### Run Full Flow Test

```bash
# Test the complete call state flow
node test-call-state-flow.js
```

This script:
1. Creates a new call state
2. Simulates service type detection
3. Simulates name collection
4. Simulates phone collection
5. Simulates address collection
6. Retrieves all collected data
7. Creates a voice booking
8. Marks call state as completed
9. Verifies all data was stored correctly
10. Cleans up test data

### Manual Testing

1. Make a voice call to your Twilio number
2. Follow the IVR prompts
3. Check Supabase for:
   - Call state entry in `call_state` table
   - Booking entry in `voice_bookings` table
4. Verify status transitions

## Database Schema Visualization

```
call_state table:
┌─────────────────────────────────────────────────────┐
│ id (UUID)                                           │
├─────────────────────────────────────────────────────┤
│ call_sid (TEXT, UNIQUE) ← Twilio Call SID          │
│ customer_name (TEXT)     ← From collect-name        │
│ customer_phone (TEXT)    ← From collect-phone       │
│ service_address (TEXT)   ← From collect-address     │
│ service_type (TEXT)      ← From handle-speech       │
│ preferred_time (TEXT)    ← From confirm-booking     │
│ status (TEXT)            ← Flow state enum          │
│ created_at (TIMESTAMP)   ← Call start time          │
│ updated_at (TIMESTAMP)   ← Last update time         │
└─────────────────────────────────────────────────────┘
                            ↓
                    References throughout
                    voice call endpoints
                            ↓
                    ┌──────────────────┐
                    │ voice_bookings   │
                    │ table (permanent)│
                    └──────────────────┘
```

## API Functions

All functions are in `lib/supabase.ts`:

### `initializeCallState(callSid: string)`
Creates a new call state entry with status='started'

**Returns**: `{ success: boolean, error: string | null, data: CallState | null }`

### `getCallState(callSid: string)`
Retrieves a call state by CallSid

**Returns**: `{ success: boolean, error: string | null, data: CallState | null }`

### `updateCallState(callSid: string, updates: Partial<CallState>)`
Updates one or more fields in the call state

**Returns**: `{ success: boolean, error: string | null, data: CallState | null }`

### `cleanupOldCallStates()`
Deletes call state entries older than 24 hours

**Returns**: `{ success: boolean, error: string | null, deleted: number }`

## Troubleshooting

### Table Not Found Error

If you get "Could not find the table 'public.call_state'":

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy SQL from `setup-call-state-table.sql`
4. Run the query
5. Refresh the page

### Data Not Persisting

- Check Supabase network request in browser DevTools
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env.local
- Check database Row Level Security policies (should allow all operations)
- Review console logs for error messages

### Cleanup Not Running

- Verify CLEANUP_TOKEN is set if using token-based auth
- Check Cron job logs in Vercel dashboard
- Manually call the cleanup endpoint to test

## Next Steps

1. ✅ Create the `call_state` table in Supabase (see Setup Instructions above)
2. ✅ Update all voice endpoints (completed)
3. ✅ Add error handling (completed)
4. ✅ Test with `node test-call-state-flow.js`
5. ✅ Set up periodic cleanup (configure cron or external service)
6. ✅ Deploy to production

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Twilio Voice API](https://www.twilio.com/docs/voice)
- [NextJS API Routes](https://nextjs.org/docs/api-routes/introduction)
