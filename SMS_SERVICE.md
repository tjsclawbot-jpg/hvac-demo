# SMS Service Documentation

## Overview

The SMS service provides a robust infrastructure for sending SMS messages via Twilio with built-in templating, rate limiting, logging, and audit trails. It's designed for HVAC booking confirmations, status updates, and contractor notifications.

## Architecture

### Core Components

1. **`/api/sms/send-sms.ts`** - Main SMS sending API endpoint
2. **`lib/supabase.ts`** - Database functions for SMS logging and retrieval
3. **`setup-sms-logs-table.sql`** - Database schema definition
4. **`setup-sms-logs.js`** - Setup script for initializing the database

## Setup Instructions

### 1. Ensure Twilio Configuration

Verify that your `.env.local` has the required Twilio credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### 2. Create SMS Logs Table

Run the setup script to create the SMS logs table in Supabase:

```bash
node setup-sms-logs.js
```

Alternatively, manually execute the SQL in Supabase dashboard:

1. Go to https://app.supabase.com
2. Select your project
3. Open **SQL Editor**
4. Copy and paste contents from `setup-sms-logs-table.sql`
5. Execute

### 3. Install Dependencies

SMS service requires Twilio and Supabase clients (already in `package.json`):

```bash
npm install twilio @supabase/supabase-js
```

## API Usage

### Endpoint

```
POST /api/sms/send-sms
```

### Request Body

```typescript
interface SMSRequest {
  recipientPhone: string                    // Phone number (E.164 or 10-digit)
  messageBody: string                       // SMS template with placeholders
  messageType: string                       // Type of message (see types below)
  bookingId?: string                        // UUID of booking (optional)
  contractorId?: string                     // UUID of contractor (optional)
  templateVariables?: Record<string, any>   // Variables to replace in template
}
```

### Message Types

- `customer_confirmation` - Booking confirmation sent to customer
- `contractor_assignment` - Notification when contractor is assigned
- `status_update` - Status update for existing booking
- `customer_status_update` - Customer-facing status update

### Response

```typescript
interface SMSResponse {
  success: boolean        // Whether SMS was sent successfully
  messageSid?: string     // Twilio message SID (if successful)
  error?: string          // Error message (if failed)
  rateLimit?: boolean     // Whether request was rate limited
}
```

## Template System

### Supported Placeholders

The template system supports dynamic variables using bracket notation:

| Placeholder | Variable Name | Example |
|------------|--------------|---------|
| `[Name]` | `name`, `customerName` | "John Smith" |
| `[Date]` | `date`, `preferredDate` | "03/15/2026" |
| `[Time]` | `time`, `preferredTime` | "2:00 PM" |
| `[Address]` | `address`, `serviceAddress` | "123 Main St, DC 20001" |
| `[ServiceType]` | `serviceType` | "AC Repair" |
| `[Status]` | `status` | "Confirmed" |
| `[Amount]` | `amount` | "150.00" |
| `[ConfirmationCode]` | `confirmationCode` | "HVAC-2026-001" |
| `[ContractorName]` | `contractorName` | "Mike's HVAC" |
| `[ContractorPhone]` | `contractorPhone` | "+12025551234" |
| `[BookingID]` | `bookingId` | "550e8400-e29b-41d4-a716-446655440000" |

### Example Templates

#### Customer Confirmation
```
Hi [Name], your HVAC service is confirmed for [Date] at [Time].
Service: [ServiceType]
Address: [Address]
Reply CONFIRM to confirm or CANCEL to cancel.
```

#### Contractor Assignment
```
New booking assigned! Customer: [Name], Service: [ServiceType]
Location: [Address], Preferred Time: [Time]
Contact: [CustomerPhone]
```

#### Status Update
```
Your [ServiceType] booking is now [Status].
Confirmation: [ConfirmationCode]
Questions? Call us at +12027595374
```

## Examples

### Example 1: Send Customer Confirmation

```typescript
const response = await fetch('/api/sms/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientPhone: '+12025551234',
    messageBody: 'Hi [Name], your service on [Date] at [Time] is confirmed! Address: [Address]',
    messageType: 'customer_confirmation',
    bookingId: 'booking-uuid-here',
    templateVariables: {
      name: 'John Doe',
      date: '03/15/2026',
      time: '2:00 PM',
      address: '123 Main St, Washington DC',
    }
  })
})

const result = await response.json()
console.log(result)
// { success: true, messageSid: 'SMxxxxxxxx' }
```

### Example 2: Send Contractor Assignment with Phone Formatting

```typescript
const response = await fetch('/api/sms/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientPhone: '2025551234',  // Auto-formatted to +12025551234
    messageBody: 'New job: [ServiceType] at [Address]. Customer: [Name] ([CustomerPhone])',
    messageType: 'contractor_assignment',
    contractorId: 'contractor-uuid-here',
    bookingId: 'booking-uuid-here',
    templateVariables: {
      serviceType: 'AC Repair',
      address: '123 Main St, DC',
      name: 'Jane Smith',
      customerPhone: '+12025559999',
    }
  })
})
```

### Example 3: Send with Error Handling

```typescript
async function sendSMSWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/sms/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ SMS sent:', result.messageSid)
        return result
      }

      if (result.rateLimit) {
        console.warn('⚠️  Rate limited, waiting 60 seconds...')
        await new Promise(r => setTimeout(r, 60000))
        continue
      }

      throw new Error(result.error)
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message)
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 2000))
      }
    }
  }
  
  throw new Error('Failed to send SMS after retries')
}
```

## Database Schema

### SMS Logs Table

```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL,
  booking_id UUID,
  contractor_id UUID,
  twilio_message_sid TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Indexes

Optimized indexes for common queries:

- `idx_sms_logs_recipient_phone` - Query by phone number
- `idx_sms_logs_booking_id` - Query by booking
- `idx_sms_logs_contractor_id` - Query by contractor
- `idx_sms_logs_message_type` - Query by message type
- `idx_sms_logs_status` - Query by status
- `idx_sms_logs_sent_at` - Query by send time
- `idx_sms_logs_rate_limit` - Rate limiting checks

## Query Functions

### Get SMS History for Booking

```typescript
import { getSMSHistoryForBooking } from '@/lib/supabase'

const result = await getSMSHistoryForBooking('booking-uuid')
// Returns: { success: boolean, data: SMSLog[] }
```

### Get SMS History for Contractor

```typescript
import { getSMSHistoryForContractor } from '@/lib/supabase'

const result = await getSMSHistoryForContractor('contractor-uuid')
// Returns: { success: boolean, data: SMSLog[] }
```

### Get SMS History for Phone Number

```typescript
import { getSMSHistoryForPhoneNumber } from '@/lib/supabase'

const result = await getSMSHistoryForPhoneNumber('+12025551234')
// Returns: { success: boolean, data: SMSLog[] }
```

### Get SMS Statistics

```typescript
import { getSMSStatistics } from '@/lib/supabase'

const result = await getSMSStatistics('booking-uuid', 30) // Last 30 days
// Returns statistics by status and message type
```

## Rate Limiting

### How It Works

- **Limit**: 1 SMS per booking per message type per hour
- **Bypass**: Pass different `messageType` to send multiple messages
- **Response**: 429 status code when rate limited

### Checking Rate Limit

```typescript
import { checkRateLimit } from '@/lib/supabase'

const { data: canSend } = await checkRateLimit('booking-uuid', 'customer_confirmation')

if (!canSend) {
  console.log('Rate limit exceeded - wait before sending another message')
}
```

## Phone Number Validation & Formatting

### Supported Formats

The service automatically validates and formats phone numbers:

| Input | Output | Notes |
|-------|--------|-------|
| `+12025551234` | `+12025551234` | Already valid E.164 |
| `2025551234` | `+12025551234` | 10-digit US number |
| `(202) 555-1234` | Invalid | Special characters removed first |
| `202-555-1234` | `+12025551234` | Dashes removed automatically |

### Validation Logic

```typescript
// Uses E.164 format validation
// Accepts: +1234567890 format or 10-digit US numbers
// Rejects: Invalid or too short numbers
```

## Error Handling

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | Missing required fields | Missing recipientPhone, messageBody, or messageType | Check request body |
| 400 | Invalid phone number format | Phone number doesn't match expected format | Use E.164 or 10-digit US format |
| 429 | Rate limit exceeded | Too many messages to this booking recently | Wait an hour or use different messageType |
| 500 | Failed to send SMS | Twilio error or network issue | Check Twilio credentials, try again |

### Logging Failures

All failures are automatically logged to the database for auditing:

```typescript
// Failed SMS attempts are recorded with error_message
const { data } = await getSMSHistoryForBooking(bookingId)
const failures = data?.filter(log => log.status === 'failed')
```

## Best Practices

1. **Always validate phone numbers** before sending
2. **Use templates** for consistency and easier updates
3. **Handle rate limiting gracefully** - don't retry immediately
4. **Log and monitor failures** - check database regularly
5. **Test with development credentials** before production
6. **Include opt-out info** in customer messages (if required by law)
7. **Use appropriate message types** for audit trail
8. **Include booking/contractor IDs** for tracking

## Monitoring & Analytics

### Dashboard Queries

Get daily sent/failed counts:

```sql
SELECT 
  DATE(sent_at) as date,
  message_type,
  status,
  COUNT(*) as count
FROM sms_logs
GROUP BY date, message_type, status
ORDER BY date DESC
```

Get delivery rate by contractor:

```sql
SELECT 
  contractor_id,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(100.0 * COUNT(CASE WHEN status = 'sent' THEN 1 END) / 
        COUNT(*), 2) as delivery_rate
FROM sms_logs
WHERE contractor_id IS NOT NULL
GROUP BY contractor_id
```

## Troubleshooting

### SMS Not Sending

1. Check Twilio credentials in `.env.local`
2. Verify account has SMS balance
3. Check phone number format (use E.164)
4. Review logs in Supabase for error details

### Rate Limiting Issues

1. Check when last SMS was sent: `getSMSHistoryForBooking(id)`
2. Try different message type if needed
3. Wait 1 hour before retrying same message type

### Database Errors

1. Verify SMS logs table exists: `setup-sms-logs.js`
2. Check Supabase connection credentials
3. Ensure table has proper RLS policies
4. Review Supabase logs for SQL errors

## Integration Examples

### Booking Confirmation Flow

```typescript
// When booking is created
await fetch('/api/sms/send-sms', {
  method: 'POST',
  body: JSON.stringify({
    recipientPhone: booking.customerPhone,
    messageBody: 'Hi [Name], your HVAC service is booked for [Date] at [Time]. Confirmation: [ConfirmationCode]',
    messageType: 'customer_confirmation',
    bookingId: booking.id,
    templateVariables: {
      name: booking.customerName,
      date: formatDate(booking.preferredDate),
      time: formatTime(booking.preferredTime),
      confirmationCode: booking.confirmationCode,
    }
  })
})
```

### Contractor Assignment

```typescript
// When contractor is assigned
await fetch('/api/sms/send-sms', {
  method: 'POST',
  body: JSON.stringify({
    recipientPhone: contractor.phone,
    messageBody: 'New booking: [ServiceType] at [Address]. Customer: [Name]. Time: [Time]',
    messageType: 'contractor_assignment',
    bookingId: booking.id,
    contractorId: contractor.id,
    templateVariables: {
      serviceType: booking.serviceType,
      address: booking.address,
      name: booking.customerName,
      time: booking.preferredTime,
    }
  })
})
```

## Version History

- **v1.0** (2026-03-07) - Initial release with templating and logging

## Support

For issues or questions:
1. Check logs in Supabase
2. Review Twilio dashboard for message status
3. Verify configuration in `.env.local`
4. Test with example payloads
