/**
 * SMS Helper Library
 * Handles sending status-specific SMS messages to customers, contractors, and managers
 */

// Team members with phone numbers
const TEAM_MEMBERS = [
  { id: 'tm1', name: 'John Smith', role: 'Lead Technician', phone: '+14155552671' },
  { id: 'tm2', name: 'Sarah Johnson', role: 'Technician', phone: '+14155552672' },
  { id: 'tm3', name: 'Mike Davis', role: 'Technician', phone: '+14155552673' },
  { id: 'tm4', name: 'Lisa Chen', role: 'Service Manager', phone: '+14155552674' }
]

interface SMSPayload {
  recipientPhone: string
  messageBody: string
  messageType: 'customer_confirmation' | 'contractor_assignment' | 'status_update' | 'customer_status_update'
  bookingId?: string
}

/**
 * Send SMS via the backend API
 */
async function sendSMS(payload: SMSPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/sms/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ SMS send error:', data.error)
      return { success: false, error: data.error }
    }

    console.log('✅ SMS sent successfully:', data.messageSid)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to send SMS:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send "In Progress" SMS to customer
 * Message: "We're on our way to [Address]. ETA: [time if available]"
 */
export async function sendInProgressCustomerSMS(
  customerPhone: string,
  address: string,
  eta?: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const etaText = eta ? ` ETA: ${eta}` : ''
  const messageBody = `We're on our way to ${address}.${etaText} Thank you for choosing us!`

  return sendSMS({
    recipientPhone: customerPhone,
    messageBody,
    messageType: 'customer_status_update',
    bookingId,
  })
}

/**
 * Send "In Progress" SMS to contractor
 * Message: "Job dispatched to [Address]. ETA: [time if available]"
 */
export async function sendInProgressContractorSMS(
  contractorPhone: string,
  address: string,
  customerName: string,
  eta?: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const etaText = eta ? ` ETA: ${eta}` : ''
  const messageBody = `Job dispatched for ${customerName} at ${address}.${etaText}`

  return sendSMS({
    recipientPhone: contractorPhone,
    messageBody,
    messageType: 'status_update',
    bookingId,
  })
}

/**
 * Send "Completed" SMS to contractor
 * Message: "Job completed! [Customer Name] will receive invoice shortly."
 */
export async function sendCompletedContractorSMS(
  contractorPhone: string,
  customerName: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const messageBody = `Job completed for ${customerName}! Invoice will be sent shortly.`

  return sendSMS({
    recipientPhone: contractorPhone,
    messageBody,
    messageType: 'status_update',
    bookingId,
  })
}

/**
 * Send "Needs Review" SMS to manager/admin
 * Message: "Job ready for review at [Address]"
 */
export async function sendNeedsReviewManagerSMS(
  managerPhone: string,
  address: string,
  customerName: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const messageBody = `Job ready for review: ${customerName} at ${address}. Please check the admin portal.`

  return sendSMS({
    recipientPhone: managerPhone,
    messageBody,
    messageType: 'status_update',
    bookingId,
  })
}

/**
 * Send confirmation SMS to customer
 * Message: "Your appointment is confirmed for [Date] at [Time]"
 */
export async function sendConfirmationCustomerSMS(
  customerPhone: string,
  date: string,
  time: string,
  address: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const messageBody = `Your appointment is confirmed for ${date} at ${time} at ${address}. We look forward to serving you!`

  return sendSMS({
    recipientPhone: customerPhone,
    messageBody,
    messageType: 'customer_confirmation',
    bookingId,
  })
}

/**
 * Resend booking confirmation SMS
 * Used when admin manually triggers a resend from the bookings page
 */
export async function resendBookingConfirmationSMS(
  customerName: string,
  serviceType: string,
  preferredTime: string,
  serviceAddress: string,
  customerPhone: string,
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/sms/resend-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        customerName,
        serviceType,
        preferredTime,
        serviceAddress,
        recipientPhone: customerPhone,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ SMS resend error:', data.error)
      return { success: false, error: data.error }
    }

    console.log('✅ SMS resent successfully:', data.messageSid)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to resend SMS:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Fetch SMS logs for a booking from the API
 */
export async function fetchSMSLogsForBooking(bookingId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const response = await fetch(`/api/sms/booking-logs?bookingId=${encodeURIComponent(bookingId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error fetching SMS logs:', data.error)
      return { success: false, error: data.error }
    }

    return { success: true, data: data.logs || [] }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to fetch SMS logs:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Handle job status change and send appropriate SMSs
 * Prevents duplicate SMSs by checking sent_statuses array
 */
export async function handleStatusChangeAndSendSMS(
  booking: any,
  newStatus: string,
  previousStatus?: string,
  contractorAssignedName?: string
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []
  
  // Track which statuses have already had SMS sent
  const sentStatuses = booking.sms_sent_statuses || []

  // Only send if this status hasn't had SMS sent yet
  if (sentStatuses.includes(newStatus)) {
    console.log(`⚠️ SMS already sent for status '${newStatus}' on booking ${booking.id}`)
    return { success: true, errors: [] }
  }

  try {
    const date = new Date(`${booking.date}T${booking.time}`)
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    switch (newStatus) {
      case 'confirmed':
        // Send confirmation SMS to customer
        await sendConfirmationCustomerSMS(
          booking.customerPhone,
          formattedDate,
          formattedTime,
          booking.customerAddress,
          booking.id
        )
        console.log(`✅ Sent confirmation SMS to customer for booking ${booking.id}`)
        break

      case 'in-progress':
        // Send SMS to customer
        await sendInProgressCustomerSMS(
          booking.customerPhone,
          booking.customerAddress,
          undefined,
          booking.id
        )
        console.log(`✅ Sent in-progress SMS to customer for booking ${booking.id}`)

        // Send SMS to contractor if assigned
        if (booking.contractor_assigned && contractorAssignedName) {
          const contractor = TEAM_MEMBERS.find(t => t.name === contractorAssignedName)
          if (contractor) {
            await sendInProgressContractorSMS(
              contractor.phone,
              booking.customerAddress,
              booking.customerName,
              undefined,
              booking.id
            )
            console.log(`✅ Sent in-progress SMS to contractor for booking ${booking.id}`)
          }
        }
        break

      case 'completed':
        // Send SMS to contractor if assigned
        if (booking.contractor_assigned && contractorAssignedName) {
          const contractor = TEAM_MEMBERS.find(t => t.name === contractorAssignedName)
          if (contractor) {
            await sendCompletedContractorSMS(
              contractor.phone,
              booking.customerName,
              booking.id
            )
            console.log(`✅ Sent completion SMS to contractor for booking ${booking.id}`)
          }
        }
        break

      case 'in-contractor-pipeline':
        // Send needs review SMS to manager
        const manager = TEAM_MEMBERS.find(t => t.role === 'Service Manager')
        if (manager) {
          await sendNeedsReviewManagerSMS(
            manager.phone,
            booking.customerAddress,
            booking.customerName,
            booking.id
          )
          console.log(`✅ Sent needs-review SMS to manager for booking ${booking.id}`)
        }
        break

      case 'cancelled':
      case 'no-show':
        // For these statuses, no automatic SMS but could add custom logic
        console.log(`ℹ️ Status ${newStatus} - no automatic SMS configured`)
        break

      default:
        console.log(`ℹ️ No SMS configured for status: ${newStatus}`)
    }

    return { success: true, errors }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error handling status change SMS:', errorMessage)
    errors.push(errorMessage)
    return { success: false, errors }
  }
}

/**
 * Send customer status update SMS (wrapper function for backwards compatibility)
 * Handles different status types with appropriate messages
 */
export async function sendCustomerStatusUpdateSMS(
  customerPhone: string,
  status: string,
  address: string,
  eta?: string,
  customerName?: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let messageBody = ''

    switch (status) {
      case 'in-progress':
        messageBody = `Hi ${customerName || 'there'}, we're on our way to ${address}. Thank you for choosing us!`
        break
      case 'completed':
        messageBody = `Thank you! Your job has been completed. An invoice will be sent shortly.`
        break
      case 'confirmed':
        messageBody = `Your appointment is confirmed. We look forward to serving you at ${address}!`
        break
      default:
        messageBody = `Update on your service appointment: Status is now ${status}`
    }

    return sendSMS({
      recipientPhone: customerPhone,
      messageBody,
      messageType: 'customer_status_update',
      bookingId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error sending customer SMS:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send contractor status update SMS (wrapper function for backwards compatibility)
 */
export async function sendContractorStatusUpdateSMS(
  contractorPhone: string,
  status: string,
  address: string,
  customerName?: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let messageBody = ''

    switch (status) {
      case 'in-progress':
        messageBody = `Job dispatched for ${customerName || 'customer'} at ${address}.`
        break
      case 'completed':
        messageBody = `Job completed for ${customerName || 'customer'}! Invoice will be sent shortly.`
        break
      default:
        messageBody = `Update on your assigned job: Status is now ${status}`
    }

    return sendSMS({
      recipientPhone: contractorPhone,
      messageBody,
      messageType: 'status_update',
      bookingId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error sending contractor SMS:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Send contractor assignment SMS
 */
export async function sendContractorAssignmentSMS(
  contractorPhone: string,
  customerName: string,
  address: string,
  date: string,
  time: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const messageBody = `You have been assigned: ${customerName} at ${address} on ${date} at ${time}. Please confirm receipt.`

  return sendSMS({
    recipientPhone: contractorPhone,
    messageBody,
    messageType: 'contractor_assignment',
    bookingId,
  })
}

export { TEAM_MEMBERS }
