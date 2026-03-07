import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface VoiceBooking {
  call_sid: string
  service_type: string
  customer_name: string
  customer_phone: string
  service_address: string
  preferred_time: string
  created_at?: string
}

export interface CallState {
  id?: string
  call_sid: string
  customer_name?: string | null
  customer_phone?: string | null
  service_address?: string | null
  service_type?: string | null
  preferred_time?: string | null
  status: 'started' | 'name_collected' | 'phone_collected' | 'address_collected' | 'time_collected' | 'completed'
  created_at?: string
  updated_at?: string
}

/**
 * Initialize a new call state entry
 */
export async function initializeCallState(callSid: string) {
  try {
    const { data, error } = await supabase
      .from('call_state')
      .insert([
        {
          call_sid: callSid,
          status: 'started',
        },
      ])
      .select()

    if (error) {
      console.error('❌ Error initializing call state:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log('✅ Call state initialized:', data)
    return { success: true, error: null, data: data?.[0] }
  } catch (error) {
    console.error('Error initializing call state:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Retrieve call state by CallSid
 */
export async function getCallState(callSid: string) {
  try {
    const { data, error } = await supabase
      .from('call_state')
      .select('*')
      .eq('call_sid', callSid)
      .single()

    if (error) {
      console.error('❌ Error retrieving call state:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log('✅ Call state retrieved:', data)
    return { success: true, error: null, data }
  } catch (error) {
    console.error('Error retrieving call state:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Update call state with field and status
 */
export async function updateCallState(
  callSid: string,
  updates: Partial<CallState>
) {
  try {
    // Validate that callSid exists
    const getResult = await getCallState(callSid)
    if (!getResult.success || !getResult.data) {
      console.warn(`⚠️ Call state not found for ${callSid}, initializing...`)
      const initResult = await initializeCallState(callSid)
      if (!initResult.success) {
        return {
          success: false,
          error: 'Failed to initialize call state',
          data: null,
        }
      }
    }

    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('call_state')
      .update(updatePayload)
      .eq('call_sid', callSid)
      .select()

    if (error) {
      console.error('❌ Error updating call state:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log('✅ Call state updated:', data)
    return { success: true, error: null, data: data?.[0] }
  } catch (error) {
    console.error('Error updating call state:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Store voice booking from complete call state
 */
export async function storeVoiceBooking(booking: VoiceBooking) {
  try {
    const { data, error } = await supabase
      .from('voice_bookings')
      .insert([
        {
          call_sid: booking.call_sid,
          service_type: booking.service_type,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          service_address: booking.service_address,
          preferred_time: booking.preferred_time,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log('✅ Voice booking stored in Supabase:', data)
    return { success: true, error: null, data }
  } catch (error) {
    console.error('Error storing voice booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Clean up old call state entries (older than 24 hours)
 */
export async function cleanupOldCallStates() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('call_state')
      .delete()
      .lt('created_at', twentyFourHoursAgo)
      .select()

    if (error) {
      console.error('❌ Error cleaning up call states:', error)
      return { success: false, error: error.message, deleted: 0 }
    }

    const deleted = data?.length || 0
    console.log(`✅ Cleaned up ${deleted} old call state entries`)
    return { success: true, error: null, deleted }
  } catch (error) {
    console.error('Error cleaning up call states:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      deleted: 0,
    }
  }
}

export interface SMSLog {
  recipient_phone: string
  message_body: string
  message_type: 'customer_confirmation' | 'contractor_assignment' | 'status_update' | 'customer_status_update'
  booking_id?: string
  contractor_id?: string
  twilio_message_sid?: string
  sent_at: string
  status: 'sent' | 'failed' | 'bounced'
  error_message?: string
}

/**
 * Log SMS to database for tracking and auditing
 */
export async function logSMS(smsData: SMSLog) {
  try {
    const { data, error } = await supabase
      .from('sms_logs')
      .insert([
        {
          recipient_phone: smsData.recipient_phone,
          message_body: smsData.message_body,
          message_type: smsData.message_type,
          booking_id: smsData.booking_id || null,
          contractor_id: smsData.contractor_id || null,
          twilio_message_sid: smsData.twilio_message_sid || null,
          sent_at: smsData.sent_at,
          status: smsData.status,
          error_message: smsData.error_message || null,
        },
      ])
      .select()

    if (error) {
      console.error('❌ Error logging SMS:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log('✅ SMS logged to database:', data)
    return { success: true, error: null, data: data?.[0] }
  } catch (error) {
    console.error('Error logging SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Check rate limiting for SMS (max 1 per booking per status change)
 */
export async function checkRateLimit(
  bookingId: string,
  messageType: string
): Promise<{ success: boolean; error?: string; data?: boolean }> {
  try {
    // Get the last SMS sent for this booking with this message type in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('message_type', messageType)
      .eq('status', 'sent')
      .gte('sent_at', oneHourAgo)
      .order('sent_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ Error checking rate limit:', error)
      // If we can't check, allow the SMS to proceed
      return { success: true, data: true }
    }

    // If no recent SMS found, allow sending
    if (!data || data.length === 0) {
      return { success: true, data: true }
    }

    // SMS was recently sent, rate limited
    return { success: true, data: false }
  } catch (error) {
    console.error('Error checking rate limit:', error)
    // If we can't check, allow the SMS to proceed
    return { success: true, data: true }
  }
}

/**
 * Retrieve SMS history for a specific booking
 */
export async function getSMSHistoryForBooking(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('booking_id', bookingId)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('❌ Error retrieving SMS history for booking:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log(`✅ Retrieved ${data?.length || 0} SMS records for booking ${bookingId}`)
    return { success: true, error: null, data: data || [] }
  } catch (error) {
    console.error('Error retrieving SMS history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Retrieve SMS history for a specific contractor
 */
export async function getSMSHistoryForContractor(contractorId: string) {
  try {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('contractor_id', contractorId)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('❌ Error retrieving SMS history for contractor:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log(`✅ Retrieved ${data?.length || 0} SMS records for contractor ${contractorId}`)
    return { success: true, error: null, data: data || [] }
  } catch (error) {
    console.error('Error retrieving SMS history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Retrieve SMS history for a specific phone number
 */
export async function getSMSHistoryForPhoneNumber(phoneNumber: string) {
  try {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('recipient_phone', phoneNumber)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('❌ Error retrieving SMS history for phone number:', error)
      return { success: false, error: error.message, data: null }
    }

    console.log(`✅ Retrieved ${data?.length || 0} SMS records for phone number ${phoneNumber}`)
    return { success: true, error: null, data: data || [] }
  } catch (error) {
    console.error('Error retrieving SMS history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Get SMS statistics for a booking
 */
export async function getSMSStatistics(bookingId?: string, days: number = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    let query = supabase
      .from('sms_logs')
      .select('status, message_type')
      .gte('sent_at', startDate)

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error retrieving SMS statistics:', error)
      return { success: false, error: error.message, data: null }
    }

    // Calculate statistics
    const stats = {
      total: data?.length || 0,
      sent: data?.filter(log => log.status === 'sent').length || 0,
      failed: data?.filter(log => log.status === 'failed').length || 0,
      bounced: data?.filter(log => log.status === 'bounced').length || 0,
      byType: {
        customer_confirmation: data?.filter(log => log.message_type === 'customer_confirmation').length || 0,
        contractor_assignment: data?.filter(log => log.message_type === 'contractor_assignment').length || 0,
        status_update: data?.filter(log => log.message_type === 'status_update').length || 0,
        customer_status_update: data?.filter(log => log.message_type === 'customer_status_update').length || 0,
      },
    }

    console.log(`✅ SMS Statistics (last ${days} days):`, stats)
    return { success: true, error: null, data: stats }
  } catch (error) {
    console.error('Error retrieving SMS statistics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

/**
 * Get SMS logs for a specific booking
 */
export async function getSMSLogsForBooking(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('booking_id', bookingId)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching SMS logs:', error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, error: null, data: data || [] }
  } catch (error) {
    console.error('Error fetching SMS logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}
