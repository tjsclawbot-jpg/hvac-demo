# SMS Status Update Feature Implementation

## Overview
This document describes the SMS status update feature that automatically sends SMS notifications to customers, contractors, and managers when job statuses change.

## Features Implemented

### 1. Status-Specific SMS Messages
The system sends status-specific SMS messages based on the job status change:

- **"Confirmed"**: Sends confirmation SMS to customer
  - Message: "Your appointment is confirmed. We look forward to serving you at [Address]!"

- **"In Progress"**: Sends SMS to customer and contractor
  - Customer: "Hi [Name], we're on our way to [Address]. Thank you for choosing us!"
  - Contractor: "Job dispatched for [Customer Name] at [Address]."

- **"Completed"**: Sends SMS to customer and contractor
  - Customer: "Thank you! Your job has been completed. An invoice will be sent shortly."
  - Contractor: "Job completed for [Customer Name]! Invoice will be sent shortly."

- **"In Contractor Pipeline"** (Needs Review): Sends SMS to manager
  - Manager: "Job ready for review: [Customer Name] at [Address]. Please check the admin portal."

### 2. Duplicate Prevention
The system tracks which statuses have had SMS sent using the `sms_sent_statuses` array on each booking:

```typescript
sms_sent_statuses?: string[] // Track which statuses have had SMS sent to prevent duplicates
```

When a status change occurs:
1. Check if SMS has already been sent for this status
2. Only send SMS if it hasn't been sent before for this status
3. Add the status to the sent array to prevent future duplicates
4. Log warnings if an SMS is attempted to be sent for a status that already has been sent

### 3. Database Logging
All SMS messages are logged to the database via the `logSMS` function in `lib/supabase.ts`:

- `recipient_phone`: Phone number that received the SMS
- `message_body`: The actual SMS message text
- `message_type`: Type of SMS (customer_confirmation, status_update, etc.)
- `booking_id`: ID of the booking (for tracking)
- `sent_at`: Timestamp of when SMS was sent
- `status`: Whether SMS was successfully sent or failed

### 4. Rate Limiting
Rate limiting is enforced via `checkRateLimit` in `lib/supabase.ts`:
- Max 1 SMS per booking per status change per hour
- Prevents SMS spam from repeated status changes

## Implementation Details

### Files Modified

#### 1. `/pages/admin/bookings.tsx`
- **Added**: `useEffect` import for lifecycle hooks
- **Added**: `sms_sent_statuses` field to Booking interface
- **Updated**: `handleStatusChange` function to:
  - Check if SMS was already sent for this status
  - Send appropriate SMS based on status
  - Track sent SMS in booking state
- **Updated**: `handleStatusConfirm` to use `handleStatusChange` for SMS tracking
- **Updated**: `handleCompletionPath` to use `handleStatusChange` for SMS tracking
- **Updated**: `handleSelectContractor` to send contractor assignment SMS

#### 2. `/lib/smsHelper.ts` (Created)
New helper library with functions:
- `sendCustomerStatusUpdateSMS()`: Sends status update SMS to customer
- `sendContractorStatusUpdateSMS()`: Sends status update SMS to contractor
- `sendContractorAssignmentSMS()`: Sends contractor assignment notification
- `sendConfirmationCustomerSMS()`: Sends booking confirmation to customer
- `sendInProgressCustomerSMS()`: Sends in-progress notification to customer
- `sendInProgressContractorSMS()`: Sends in-progress notification to contractor
- `sendCompletedContractorSMS()`: Sends completion notification to contractor
- `sendNeedsReviewManagerSMS()`: Sends needs-review notification to manager
- `handleStatusChangeAndSendSMS()`: Main handler for status changes with SMS

#### 3. `/pages/api/sms/send-sms.ts`
- Already existed with Twilio integration
- Sends SMS via Twilio API
- Logs SMS to database
- Enforces rate limiting

#### 4. `/lib/supabase.ts`
- Already has `logSMS()` function to log SMS to database
- Already has `checkRateLimit()` function for rate limiting

## How It Works

### Flow Diagram
```
User changes job status in Admin UI
    ↓
handleStatusChange() is called
    ↓
Check if SMS already sent for this status
    ↓
If SMS not sent:
    - Determine message type based on status
    - Get appropriate recipient (customer, contractor, or manager)
    - Call SMS helper function with phone and message
    - SMS helper calls /api/sms/send-sms endpoint
    - Twilio sends actual SMS
    - Response is logged to database
    ↓
Add status to sms_sent_statuses array to prevent duplicates
    ↓
Update booking state in UI
```

### SMS Recipients by Status

| Status | Recipients | Message |
|--------|-----------|---------|
| confirmed | Customer | Appointment confirmation |
| in-progress | Customer, Contractor | Dispatch notification |
| completed | Customer, Contractor | Job completion notice |
| in-contractor-pipeline | Manager | Needs review notification |

## Configuration

### Team Members with Phone Numbers
The system uses hardcoded team members in `TEAM_MEMBERS` array:

```typescript
const TEAM_MEMBERS = [
  { id: 'tm1', name: 'John Smith', role: 'Lead Technician', phone: '+14155552671' },
  { id: 'tm2', name: 'Sarah Johnson', role: 'Technician', phone: '+14155552672' },
  { id: 'tm3', name: 'Mike Davis', role: 'Technician', phone: '+14155552673' },
  { id: 'tm4', name: 'Lisa Chen', role: 'Service Manager', phone: '+14155552674' }
]
```

### Environment Variables Required
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number to send from
- `SUPABASE_URL`: Supabase database URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

## Error Handling

### Features
1. **Graceful SMS failures**: If SMS fails to send, the booking state is still updated
2. **Database logging of failures**: Failed SMS attempts are logged to database with status = 'failed'
3. **Console logging**: All SMS operations are logged to console for debugging
4. **Try-catch blocks**: All SMS sending is wrapped in try-catch to prevent crashes

### Error Messages
- ❌ SMS send error: Logs when Twilio API returns error
- ⚠️ SMS already sent: Logs when duplicate SMS is attempted
- ❌ Error sending SMS: Catches unexpected errors
- ✅ SMS sent successfully: Logs successful sends

## Testing

### Manual Testing Steps
1. Open admin bookings page
2. Click on a booking
3. Change status from "Pending" → "Confirmed"
   - ✅ SMS should be sent to customer
   - Check console for success/failure logs
4. Change status from "Confirmed" → "In Progress"
   - ✅ SMS should be sent to customer and contractor
5. Try changing status back to "Confirmed"
   - ✅ SMS should NOT be sent (already sent)
6. Change status to "In Contractor Pipeline"
   - ✅ SMS should be sent to manager (Service Manager)

### Database Verification
Check Supabase `sms_logs` table:
```sql
SELECT * FROM sms_logs WHERE booking_id = 'BOOKING_ID' ORDER BY sent_at DESC;
```

## Future Improvements

1. **Customizable Messages**: Allow SMS message templates to be configured
2. **Scheduled SMS**: Send SMS at specific times (e.g., day before appointment)
3. **SMS History UI**: Display SMS history for each booking in admin dashboard
4. **Resend SMS**: Allow manual resend of SMS from admin interface
5. **Two-Way SMS**: Support incoming SMS replies from customers
6. **SMS Analytics**: Track open rates, delivery times, customer responses
7. **Multi-language**: Support SMS in multiple languages based on customer preferences
8. **ETA Integration**: Include actual ETA when available from tracking system

## Commit Message
```
Feature: Add status update SMS for job progress

Implement SMS notifications for job status changes:
- Send "In Progress" SMS to customer & contractor when job starts
- Send "Completed" SMS to customer & contractor when job is done
- Send "Needs Review" SMS to manager when job in contractor pipeline
- Send confirmation SMS to customer when appointment confirmed
- Track which statuses have SMS sent to prevent duplicate notifications
- Log all SMS to database for audit trail
- Handle SMS errors gracefully without blocking booking updates
- Include rate limiting to prevent SMS spam (1 per status per hour)

Location: /pages/admin/bookings.tsx
Database: sms_logs table via Supabase
SMS Provider: Twilio
```
