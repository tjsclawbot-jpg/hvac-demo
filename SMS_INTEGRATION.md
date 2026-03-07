# Twilio SMS Integration - Complete Guide

## Overview

This document describes the complete Twilio SMS integration for the HVAC booking system. The system sends SMS notifications to customers and contractors at key points in the booking lifecycle.

## Architecture

### Components

1. **SMS Sending Service** (`/pages/api/sms/send-sms.ts`)
   - Main API endpoint for sending SMS via Twilio
   - Handles validation, rate limiting, and error handling
   - Logs all SMS attempts to Supabase

2. **SMS Helper Functions** (`/lib/smsHelper.ts`)
   - Utility functions for client-side SMS sending
   - Functions for each SMS type (confirmation, assignment, status update)
   - Wraps the send-sms API endpoint

3. **SMS Logging** (`lib/supabase.ts`)
   - Database functions for logging SMS
   - Rate limiting checks
   - Audit trail for all SMS messages

4. **Database Schema** (`setup-sms-logs-table.sql`)
   - SMS logs table in Supabase
   - Indexes for performance
   - Row-level security policies

## SMS Workflows

### 1. Customer Confirmation SMS (After Voice Booking)

**Trigger**: When voice booking reaches "confirmed" state

**Flow**:
1. Customer completes voice call booking
2. `confirm-booking.ts` stores booking in `voice_bookings` table
3. Customer SMS is sent automatically with confirmation details
4. SMS is logged to `sms_logs` table

**Message Template**:
```
Hi [Name], your [Service] appointment is confirmed for [Date] at [Time]. 
We'll see you at [Address]. Reply STOP to opt out.
```

**Implementation**:
- File: `/pages/api/voice/confirm-booking.ts`
- Function: `sendCustomerConfirmationSMS()`
- Status: ✅ **Implemented**

### 2. Contractor Assignment SMS

**Trigger**: When job is assigned to contractor from admin dashboard

**Flow**:
1. Admin selects contractor for confirmed job
2. `handleSelectContractor()` updates booking status
3. Contractor SMS is sent with job details
4. SMS is logged to `sms_logs` table

**Message Template**:
```
New job assigned: [Service] for [Customer Name] at [Address] on [Date] [Time]. 
Customer: [Phone]. Tap to view details: [dashboard link]
```

**Implementation**:
- File: `/pages/admin/bookings.tsx`
- Function: `handleSelectContractor()` → `sendContractorAssignmentSMS()`
- Contractor phone stored in: `TEAM_MEMBERS` array
- Status: ✅ **Implemented**

### 3. Status Update SMS - In Progress

**Trigger**: When job status changed to "in-progress"

**Flow**:
1. Admin marks job as "In Progress"
2. `handleStatusChange()` or `handleVoiceBookingStatusChange()` updates status
3. Customer SMS is sent with ETA
4. SMS is logged to `sms_logs` table

**Message Template**:
```
We're on our way to [Address]. ETA: [time if available]
```

**Implementation**:
- Files: `/pages/admin/bookings.tsx` (web), voice bookings handling
- Functions: `handleStatusChange()`, `handleVoiceBookingStatusChange()`
- Helper: `sendCustomerStatusUpdateSMS()`
- Status: ✅ **Implemented**

### 4. Status Update SMS - Completed

**Trigger**: When job status changed to "completed"

**Flow**:
1. Admin marks job as "Completed"
2. `handleStatusChange()` updates status
3. Customer SMS is sent with completion message
4. SMS is logged to `sms_logs` table

**Message Template**:
```
Job completed! [Customer Name] will receive invoice shortly.
```

**Implementation**:
- File: `/pages/admin/bookings.tsx`
- Function: `handleStatusChange()`
- Helper: `sendCustomerStatusUpdateSMS()`
- Status: ✅ **Implemented**

## Database Setup

### Creating the SMS Logs Table

The `sms_logs` table stores all SMS messages for auditing and tracking.

**File**: `setup-sms-logs-table.sql`

**Schema**:
```sql
- id (UUID): Primary key
- recipient_phone (TEXT): Phone number message was sent to
- message_body (TEXT): Full SMS message text
- message_type (TEXT): Type of SMS (customer_confirmation, contractor_assignment, status_update, customer_status_update)
- booking_id (UUID): Associated booking ID for tracking
- contractor_id (UUID): Associated contractor ID (optional)
- twilio_message_sid (TEXT): Twilio message tracking ID
- sent_at (TIMESTAMP): When SMS was sent
- status (TEXT): 'sent', 'failed', or 'bounced'
- error_message (TEXT): Error details if failed
- created_at (TIMESTAMP): Record creation time
```

**Indexes**:
- `recipient_phone`: Fast lookup by phone number
- `booking_id`: Fast lookup by booking
- `contractor_id`: Fast lookup by contractor
- `message_type`: Filter by SMS type
- `status`: Filter by delivery status
- `sent_at`, `created_at`: Time-based queries
- `rate_limit`: Composite index for rate limiting

### Creating the Table Manually

1. Go to Supabase dashboard: https://app.supabase.com/
2. Select project: `qeoxavbzuxqhbwwlpiss`
3. Click "SQL Editor" → "New Query"
4. Copy contents of `setup-sms-logs-table.sql`
5. Click "RUN"

Or via Node.js:
```bash
node complete-supabase-setup.js
```

## Twilio Configuration

### Credentials

**Account SID**: `ACafc143506a110cc2f5d6c44593fc4b9e`  
**Auth Token**: `3e31cb74f7ad9a301e8c291fdf366bcd` (in .env.local)  
**From Number**: `+12027595374` (existing voice number, supports SMS)

### Environment Variables

```env
TWILIO_ACCOUNT_SID=ACafc143506a110cc2f5d6c44593fc4b9e
TWILIO_AUTH_TOKEN=3e31cb74f7ad9a301e8c291fdf366bcd
TWILIO_PHONE_NUMBER=+12027595374
```

### Verifying SMS Support

The `+12027595374` number is configured for both voice and SMS on Twilio.

To verify:
1. Log in to Twilio Console: https://console.twilio.com/
2. Go to Phone Numbers → Manage Numbers
3. Select `+12027595374`
4. Verify both "Voice" and "Messaging" are enabled

## Rate Limiting

**Policy**: Maximum 1 SMS per booking per status change per hour

**Implementation**:
- Function: `checkRateLimit()` in `/lib/supabase.ts`
- Query: Checks for recent sent SMS with same booking ID and message type
- Fallback: If check fails, SMS is allowed to proceed (fail-open)

**Usage**:
```typescript
const rateLimitResult = await checkRateLimit(bookingId, messageType);
if (!rateLimitResult.data) {
  // Rate limited - SMS not sent
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

## Error Handling

### SMS Send Failures

If an SMS fails to send:
1. Error is logged to Supabase with `status: 'failed'`
2. Error message is stored in `error_message` field
3. The workflow continues (non-blocking)
4. Admin can see failed SMS in logs

### Logging Failures

If SMS logging fails:
1. Warning is logged to console
2. SMS is still considered sent
3. User is informed if critical

## Testing

### Automated Test Suite

Run the complete test suite:
```bash
node test-sms-integration.js
```

**Tests**:
1. ✅ Customer confirmation SMS
2. ✅ Contractor assignment SMS
3. ✅ Status update SMS (in-progress)
4. ✅ Completion SMS
5. ✅ SMS logging in Supabase
6. ✅ Rate limiting enforcement

### Manual Testing

#### Test 1: Customer Confirmation SMS
1. Go to voice booking system
2. Complete a voice call booking
3. Booking reaches "confirmed" state
4. Check phone for confirmation SMS
5. Verify message format and details

#### Test 2: Contractor Assignment SMS
1. Go to Admin Dashboard → Bookings
2. Find a confirmed booking
3. Click to select contractor
4. Check contractor phone for assignment SMS
5. Verify message includes job details and dashboard link

#### Test 3: Status Updates
1. In Bookings admin, change status to "In Progress"
2. Check customer phone for "on my way" SMS
3. Change status to "Completed"
4. Check customer phone for completion SMS

#### Test 4: SMS Logging
1. Open Supabase dashboard
2. Go to Tables → `sms_logs`
3. Verify recent SMS records appear
4. Check status is 'sent' for successful messages

### Test Phone Numbers (Twilio Sandbox)

For testing without actual SMS charges:

**Success**: `+15005550006`  
**Invalid**: `+15005550001`  
**Failure**: `+15005550009`

## Integration Points

### Voice Booking Flow

```
Voice Call → confirm-booking.ts
  ↓
Store in voice_bookings
  ↓
Send Customer SMS ✅
  ↓
Log SMS to sms_logs
  ↓
Customer receives confirmation
```

### Admin Booking Management

```
Admin Dashboard → bookings.tsx
  ↓
Contractor Assignment Event
  ↓
handleSelectContractor() fires
  ↓
Send Contractor SMS ✅
  ↓
Log SMS to sms_logs
  ↓
Contractor receives assignment
```

```
Status Change Event (in-progress/completed)
  ↓
handleStatusChange() or handleVoiceBookingStatusChange()
  ↓
Send Customer Status SMS ✅
  ↓
Log SMS to sms_logs
  ↓
Customer receives update
```

## Monitoring & Debugging

### Check SMS Logs

Query recent SMS records:
```sql
SELECT * FROM sms_logs 
WHERE booking_id = 'booking-id'
ORDER BY created_at DESC 
LIMIT 10;
```

Check failed SMS:
```sql
SELECT * FROM sms_logs 
WHERE status = 'failed'
ORDER BY created_at DESC 
LIMIT 10;
```

Check rate limit status:
```sql
SELECT * FROM sms_logs 
WHERE booking_id = 'booking-id' 
  AND message_type = 'status_update'
  AND status = 'sent'
  AND sent_at > NOW() - INTERVAL '1 hour'
ORDER BY sent_at DESC;
```

### Console Logging

All SMS operations log to console:
- `📱 Sending SMS to [phone]`
- `✅ SMS sent successfully. Message SID: [sid]`
- `⚠️ Failed to log SMS to database`
- `❌ Error sending SMS: [error]`

### Common Issues

**Problem**: SMS not sending (rate limit error)
- **Solution**: Check recent SMS logs for the booking, wait 1 hour

**Problem**: SMS sends but logs fail
- **Solution**: Check Supabase connection, verify `sms_logs` table exists

**Problem**: Contractor not receiving SMS
- **Solution**: Verify contractor phone number in `TEAM_MEMBERS`, check rate limit

**Problem**: Test SMS not working
- **Solution**: Ensure using Twilio test phone number (+15005550006), check Twilio credentials

## Future Enhancements

1. **Scheduled SMS**: Send reminders 24h before appointment
2. **Customer Response Tracking**: Track STOP requests
3. **Multiple Languages**: Support SMS in multiple languages
4. **Rich Media**: Include photos/documents in SMS (MMS)
5. **Delivery Reports**: Get delivery/failure callbacks from Twilio
6. **Batch SMS**: Send to multiple recipients efficiently
7. **A/B Testing**: Test different message templates
8. **Analytics**: SMS open rates, response rates, conversion tracking

## Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `/pages/api/sms/send-sms.ts` | ✅ Created | Main SMS sending API |
| `/lib/smsHelper.ts` | ✅ Created | Client-side SMS helpers |
| `/lib/supabase.ts` | ✅ Updated | SMS logging functions |
| `/pages/api/voice/confirm-booking.ts` | ✅ Updated | Send customer SMS on booking |
| `/pages/admin/bookings.tsx` | ✅ Updated | Send SMS on status/contractor changes |
| `setup-sms-logs-table.sql` | ✅ Created | Database schema |
| `test-sms-integration.js` | ✅ Created | Test suite |
| `SMS_INTEGRATION.md` | ✅ Created | This documentation |

## Commit Message

```
Feature: Add complete Twilio SMS integration for bookings, assignments, and status updates

- Create /api/sms/send-sms.ts for SMS sending via Twilio
- Add SMS helper functions in lib/smsHelper.ts
- Extend lib/supabase.ts with SMS logging and rate limiting
- Update confirm-booking.ts to send customer confirmation SMS
- Update admin/bookings.tsx to send SMS on contractor assignment and status changes
- Create sms_logs table in Supabase with proper schema and indexes
- Add comprehensive test suite (test-sms-integration.js)
- Rate limiting: max 1 SMS per booking per status change per hour
- Error handling: SMS failures logged but don't break workflow
- All SMS messages are logged for auditing and compliance
```

## Support

For issues or questions about SMS integration:
1. Check the SMS logs in Supabase (`sms_logs` table)
2. Review console logs for error messages
3. Verify Twilio credentials in `.env.local`
4. Run test suite: `node test-sms-integration.js`
5. Check rate limiting: one SMS per booking per status per hour
