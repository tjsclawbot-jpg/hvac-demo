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
