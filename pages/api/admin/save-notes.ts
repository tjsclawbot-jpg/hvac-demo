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
    // Determine which table to update based on type
    const table = type === 'voice' ? 'voice_bookings' : 'bookings'
    
    console.log(`📝 Saving notes for booking ${bookingId} (${table})`)
    console.log(`Notes content: "${notes}" (length: ${notes.length})`)
    
    // Sanitize notes - ensure it's a valid string
    const sanitizedNotes = String(notes || '').trim()
    
    const { data, error } = await supabase
      .from(table)
      .update({
        notes: sanitizedNotes || null
      })
      .eq('id', bookingId)
      .select()

    console.log(`Supabase response:`, { data, error })

    if (error) {
      console.error('❌ Supabase error:', error)
      
      // If it's a pattern error, likely the notes column doesn't exist or has a constraint
      if (error.message?.includes('pattern') || error.message?.includes('constraint')) {
        return res.status(500).json({ 
          success: false, 
          error: `Column validation error. The notes column may not exist. Please contact support.` 
        })
      }
      
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

    console.log(`✅ Notes saved successfully for booking ${bookingId}`)
    return res.status(200).json({
      success: true,
      message: 'Notes saved successfully',
      data: data[0]
    })
  } catch (error) {
    console.error('❌ Error saving notes:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
