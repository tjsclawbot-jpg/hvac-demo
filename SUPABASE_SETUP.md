# Supabase Setup for HVAC Voice Bookings

## Status: ✓ Credentials Configured | ⏳ Table Creation Pending

### What Has Been Completed:

1. ✓ **Found Supabase Project**
   - Project URL: `https://qeoxavbzuxqhbwwlpiss.supabase.co`
   - Project Reference: `qeoxavbzuxqhbwwlpiss`

2. ✓ **Updated .env.local**
   - Added `SUPABASE_URL` 
   - Added `SUPABASE_ANON_KEY`
   - Location: `/Users/workbot/.openclaw/workspace/hvac-demo/.env.local`

### What Still Needs To Be Done:

The `voice_bookings` table needs to be created. Two options:

#### **Option 1: Via Supabase Dashboard (Easiest)**
1. Go to https://app.supabase.com/
2. Login to your Supabase account
3. Navigate to project: `qeoxavbzuxqhbwwlpiss`
4. Go to SQL Editor
5. Copy and paste the contents of `setup-voice-bookings-table.sql` (in this directory)
6. Click Run

#### **Option 2: Via PostgreSQL CLI**
```bash
cd /Users/workbot/.openclaw/workspace/hvac-demo
PGPASSWORD='G7V$Ei2fLQw!BSS' psql \
  -h qeoxavbzuxqhbwwlpiss.c.supabase.co \
  -U postgres \
  -d postgres \
  -f setup-voice-bookings-table.sql
```

### Table Schema

```sql
CREATE TABLE voice_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT NOT NULL,
  service_type TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  service_address TEXT,
  preferred_time TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Credentials

**Supabase URL:** `https://qeoxavbzuxqhbwwlpiss.supabase.co`

**Anon Key:** `sb_publishable_8hwfQTZ1BwkDqO8nu4kxsg_wozt3oaO`

**Service Role Key:** (Available in workspace .env.local)

**Database Password:** `G7V$Ei2fLQw!BSS`

### Next Steps

Once the table is created, you can:
1. Start the HVAC voice booking system
2. Test voice booking submissions
3. Verify data is being saved to the `voice_bookings` table
