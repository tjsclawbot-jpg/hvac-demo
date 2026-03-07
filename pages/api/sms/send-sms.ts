import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { logSMS, checkRateLimit } from '../../../lib/supabase'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !twilioNumber) {
  console.error('❌ Missing Twilio configuration')
}

const client = twilio(accountSid, authToken)

// SMS rate limiting configuration (messages per hour per recipient)
const SMS_RATE_LIMIT_PER_HOUR = 5
const SMS_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export interface SMSRequest {
  recipientPhone: string
  messageBody: string
  messageType: 'customer_confirmation' | 'contractor_assignment' | 'status_update' | 'customer_status_update'
  bookingId?: string
  contractorId?: string
  templateVariables?: Record<string, string | number | boolean>
}

export interface SMSResponse {
  success: boolean
  messageSid?: string
  error?: string
  rateLimit?: boolean
}

/**
 * Process SMS template with dynamic variables
 * Supports variables: [Name], [Date], [Time], [Address], [ServiceType], [Status], [Amount]
 */
export function processTemplate(
  template: string,
  variables: Record<string, string | number | boolean> = {}
): string {
  let message = template

  // Replace standard variables
  const variableMap: Record<string, string> = {
    '[Name]': String(variables.name || variables.customerName || 'Customer'),
    '[Date]': String(variables.date || variables.preferredDate || new Date().toLocaleDateString()),
    '[Time]': String(variables.time || variables.preferredTime || ''),
    '[Address]': String(variables.address || variables.serviceAddress || ''),
    '[ServiceType]': String(variables.serviceType || 'HVAC Service'),
    '[Status]': String(variables.status || 'Pending'),
    '[Amount]': String(variables.amount || ''),
    '[ConfirmationCode]': String(variables.confirmationCode || ''),
    '[ContractorName]': String(variables.contractorName || ''),
    '[ContractorPhone]': String(variables.contractorPhone || ''),
    '[BookingID]': String(variables.bookingId || ''),
  }

  // Replace all template variables
  Object.entries(variableMap).forEach(([placeholder, value]) => {
    if (value && value !== '') {
      message = message.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
    }
  })

  // Remove any unreplaced placeholders
  message = message.replace(/\[[^\]]+\]/g, '')

  return message
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic validation for E.164 format or 10-digit US numbers
  const phoneRegex = /^(\+?1)?(\d{10})$/
  const cleanPhone = phone.replace(/\D/g, '')
  return phoneRegex.test(cleanPhone)
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 10) {
    return `+1${cleanPhone}`
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`
  } else if (cleanPhone.length > 11) {
    return `+${cleanPhone}`
  }
  
  return `+1${cleanPhone}`
}

/**
 * Send SMS via Twilio with templating and logging
 */
export async function sendSMS(req: NextApiRequest, res: NextApiResponse<SMSResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { 
      recipientPhone: rawPhone, 
      messageBody: template, 
      messageType, 
      bookingId,
      contractorId,
      templateVariables 
    } = req.body as SMSRequest

    // Validate required fields
    if (!rawPhone || !template || !messageType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientPhone, messageBody (template), messageType',
      })
    }

    // Validate phone number format
    if (!validatePhoneNumber(rawPhone)) {
      return res.status(400).json({
        success: false,
        error: `Invalid phone number format: ${rawPhone}. Expected E.164 format (e.g., +1234567890) or 10-digit US number.`,
      })
    }

    // Format phone number to E.164
    const recipientPhone = formatPhoneNumber(rawPhone)

    // Process template with variables
    const messageBody = processTemplate(template, templateVariables)

    // Validate message length (Twilio SMS max 160 chars, 320 for UCS-2)
    if (messageBody.length > 320) {
      console.warn(`⚠️ Message exceeds maximum length. SMS may be split into multiple parts.`)
    }

    // Check rate limiting per booking and message type
    if (bookingId) {
      const rateLimitResult = await checkRateLimit(bookingId, messageType)
      if (!rateLimitResult.success || rateLimitResult.data === false) {
        console.warn(`⚠️ Rate limit exceeded for booking ${bookingId}, message type ${messageType}`)
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Only one SMS per booking per status change allowed.',
          rateLimit: true,
        })
      }
    }

    // Send SMS via Twilio
    console.log(`📱 Sending SMS to ${recipientPhone} (${messageType})`)
    const message = await client.messages.create({
      body: messageBody,
      from: twilioNumber,
      to: recipientPhone,
    })

    console.log(`✅ SMS sent successfully. Message SID: ${message.sid}`)

    // Log SMS to database
    const logResult = await logSMS({
      recipient_phone: recipientPhone,
      message_body: messageBody,
      message_type: messageType as any,
      booking_id: bookingId,
      contractor_id: contractorId,
      sent_at: new Date().toISOString(),
      status: 'sent',
      twilio_message_sid: message.sid,
    })

    if (!logResult.success) {
      console.warn(`⚠️ Failed to log SMS to database: ${logResult.error}`)
      // Don't fail the request if logging fails, SMS was still sent
    }

    return res.status(200).json({
      success: true,
      messageSid: message.sid,
    })
  } catch (error) {
    console.error('❌ Error sending SMS:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Attempt to log failure
    try {
      const { 
        recipientPhone: rawPhone, 
        messageBody, 
        messageType, 
        bookingId,
        contractorId 
      } = req.body as SMSRequest
      
      const recipientPhone = formatPhoneNumber(rawPhone)
      
      await logSMS({
        recipient_phone: recipientPhone,
        message_body: messageBody,
        message_type: messageType as any,
        booking_id: bookingId,
        contractor_id: contractorId,
        sent_at: new Date().toISOString(),
        status: 'failed',
        error_message: errorMessage,
      })
    } catch (logError) {
      console.error('Failed to log SMS error:', logError)
    }

    return res.status(500).json({
      success: false,
      error: `Failed to send SMS: ${errorMessage}`,
    })
  }
}

export default sendSMS
