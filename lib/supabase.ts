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
