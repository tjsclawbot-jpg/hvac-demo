import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bookingId, notes, type } = req.body

  if (!bookingId || notes === undefined) {
    return res.status(400).json({ error: 'Missing bookingId or notes' })
  }

  try {
    const table = type === 'voice' ? 'voice_bookings' : 'bookings'
    const { data, error } = await supabase
      .from(table)
      .update({ notes: String(notes || '').trim() || null })
      .eq('id', bookingId)
      .select()

    if (error) throw error
    if (!data?.length) return res.status(404).json({ success: false, error: 'Booking not found' })

    return res.status(200).json({ success: true, message: 'Notes saved' })
  } catch (error) {
    console.error('❌ Error saving notes:', error)
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' })
  }
}
