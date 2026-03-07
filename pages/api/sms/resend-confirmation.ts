import { NextApiRequest, NextApiResponse } from 'next'
import { getSMSLogsForBooking } from '../../../lib/supabase'

interface ResendConfirmationRequest {
  bookingId: string
  customerName: string
  serviceType: string
  preferredTime: string
  serviceAddress: string
  recipientPhone: string
}

interface ResendConfirmationResponse {
  success: boolean
  messageSid?: string
  error?: string
}

/**
 * Resend booking confirmation SMS to customer
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResendConfirmationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const {
      bookingId,
      customerName,
      serviceType,
      preferredTime,
      serviceAddress,
      recipientPhone,
    } = req.body as ResendConfirmationRequest

    // Validate inputs
    if (!bookingId || !customerName || !serviceType || !preferredTime || !serviceAddress || !recipientPhone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    // Build the confirmation message
    const smsMessage = `Hi ${customerName}, your ${serviceType} appointment is confirmed for ${preferredTime}. We'll see you at ${serviceAddress}. Reply STOP to opt out.`

    // Call the send-sms endpoint
    const smsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sms/send-sms`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone,
          messageBody: smsMessage,
          messageType: 'customer_confirmation',
          bookingId,
        }),
      }
    )

    const smsResult = await smsResponse.json()

    if (smsResult.success) {
      console.log(`✅ Resent confirmation SMS for booking ${bookingId}`)
      return res.status(200).json({
        success: true,
        messageSid: smsResult.messageSid,
      })
    } else {
      console.warn(`⚠️ Failed to resend SMS for booking ${bookingId}:`, smsResult.error)
      return res.status(500).json({
        success: false,
        error: smsResult.error || 'Failed to send SMS',
      })
    }
  } catch (error) {
    console.error('❌ Error resending confirmation SMS:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({
      success: false,
      error: `Failed to resend SMS: ${errorMessage}`,
    })
  }
}
