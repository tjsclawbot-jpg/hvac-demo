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
    console.log(`📌 Assigning contractor ${contractorName} to booking ${bookingId}`)
    
    // Update the voice booking with contractor assignment
    const { data, error } = await supabase
      .from('voice_bookings')
      .update({
        contractor_assigned: contractorName,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('❌ Supabase error:', error)
      return res.status(500).json({ 
        success: false, 
        error: `Supabase error: ${error.message}` 
      })
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No booking found with ID: ${bookingId}`)
      return res.status(404).json({
        success: false,
        error: `Booking not found: ${bookingId}`
      })
    }

    console.log(`✅ Successfully assigned contractor to booking ${bookingId}`)
    return res.status(200).json({
      success: true,
      message: `Contractor ${contractorName} assigned to booking ${bookingId}`,
      data: data[0]
    })
  } catch (error) {
    console.error('❌ Error assigning contractor:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
