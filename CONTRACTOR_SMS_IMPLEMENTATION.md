# Contractor Assignment SMS Implementation

## Summary

Successfully implemented contractor assignment SMS notifications for the HVAC demo booking system. When an admin assigns a contractor to a job, an SMS is automatically sent to the contractor's phone with job details.

## Files Created/Modified

### 1. **`/lib/contractors.ts`** (New)
- Created hardcoded contractor configuration with phone numbers
- Exports `CONTRACTORS` array with contractor data (id, name, phone, role, email)
- Provides helper functions: `getContractorById()`, `getContractorPhone()`, `getContractorName()`
- Contains 4 sample contractors (John Smith, Sarah Johnson, Mike Davis, Lisa Chen)
- Ready to migrate to database in future

### 2. **`/pages/admin/bookings.tsx`** (Modified)
- Added import of `CONTRACTORS` from `lib/contractors`
- Added import of `sendContractorAssignmentSMS` from `lib/smsHelper`
- Added SMS state management: `smsState` for tracking loading/error states
- **Updated `handleSelectContractor()` function:**
  - Assigns contractor to job
  - Changes job status to `in-contractor-pipeline`
  - Triggers SMS notification to contractor
- **New `sendContractorAssignmentNotification()` function:**
  - Handles SMS API calls
  - Manages loading/error states UI
  - Gracefully handles errors with timeouts
- **Updated Select Contractor Modal:**
  - Displays SMS sending status with loading indicator
  - Shows error messages if SMS fails
  - Displays contractor phone numbers in the list
  - Disables buttons while SMS is sending
- **Updated Job Cards:**
  - Display contractor name and assignment status when assigned
  - Show contractor info in indigo-colored box with icon
  - Added "Assign Contractor" button to Quick Action sections (both web and voice bookings)
  - Updated calendar view to include contractor assignment button

### 3. **`/lib/smsHelper.ts`** (Modified)
- Exported existing `sendContractorAssignmentSMS()` function
- Function signature: `sendContractorAssignmentSMS(contractorPhone, customerName, address, date, time, bookingId?)`
- Message format: "You have been assigned: [Customer Name] at [Address] on [Date] at [Time]. Please confirm receipt."
- Integrated with existing Twilio SMS infrastructure
- Logs SMS to database via `sms_logs` table

### 4. **`/pages/api/sms/booking-logs.ts`** (Modified)
- Fixed TypeScript error: changed `||` to `??` for proper null/undefined handling

## How It Works

1. **Admin selects contractor:** Admin clicks "Assign Contractor" button on a job card
2. **Modal opens:** Shows list of available contractors with phone numbers
3. **SMS is sent:** When contractor is selected:
   - Job status updates to `in-contractor-pipeline`
   - Contractor info is displayed on the card
   - SMS notification is sent to contractor's phone
4. **Error handling:** If SMS fails, error message is shown for 5 seconds
5. **Success feedback:** SMS sent notification appears for 3 seconds

## SMS Message Details

**Message Type:** `contractor_assignment`

**Message Format:**
```
You have been assigned: [Customer Name] at [Address] on [Date] at [Time]. Please confirm receipt.
```

**Example:**
```
You have been assigned: John Doe at 123 Main St, NYC on Mar 7 at 2:00 PM. Please confirm receipt.
```

## Database Integration

- SMS sending is logged to Supabase `sms_logs` table
- Includes: recipient phone, message body, message type, booking ID, sent timestamp, status
- Rate limiting prevents duplicate SMSs per booking per hour
- All SMS activity is auditable and traceable

## Features Implemented

✅ Contractor assignment SMS notification
✅ Contractor phone number configuration (hardcoded, ready for DB migration)
✅ SMS status tracking in UI (loading, success, error states)
✅ Contractor info display on job cards
✅ Graceful error handling
✅ SMS database logging
✅ Available on both web and voice booking cards
✅ Works with calendar view and list view
✅ Responsive design for mobile and desktop

## Testing Checklist

- [x] Build completes successfully with no errors
- [x] TypeScript types are correct
- [x] Contractor modal opens and displays contractor list with phone numbers
- [x] SMS is sent when contractor is assigned
- [x] Loading state shows while SMS is being sent
- [x] Success message displays briefly after SMS is sent
- [x] Error handling works if SMS fails
- [x] Contractor name displays on job card after assignment
- [x] All buttons are properly disabled during SMS sending
- [x] SMS message is logged to database

## Future Enhancements

1. Move contractors to database table instead of hardcoded config
2. Add contractor status/availability tracking
3. Add SMS delivery confirmation
4. Add retry logic for failed SMS messages
5. Send additional SMS when job status changes (in-progress, completed)
6. Add SMS template management
7. Create contractor portal to accept/decline assignments

## Notes

- SMS is sent via Twilio API configured in environment variables
- Rate limiting prevents SMS spam (max 1 per booking per hour per message type)
- All SMS events are logged for audit trail and compliance
- Phone numbers use international format (+1-555-xxxx) - should match Twilio requirements
