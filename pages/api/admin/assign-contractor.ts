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

  const { bookingId, contractorName } = req.body

  if (!bookingId || !contractorName) {
    return res.status(400).json({ error: 'Missing bookingId or contractorName' })
  }

  try {
    // Update the voice booking with contractor assignment
    const { error } = await supabase
      .from('voice_bookings')
      .update({
        contractor_assigned: contractorName,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ success: false, error: error.message })
    }

    return res.status(200).json({
      success: true,
      message: `Contractor ${contractorName} assigned to booking ${bookingId}`
    })
  } catch (error) {
    console.error('Error assigning contractor:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
