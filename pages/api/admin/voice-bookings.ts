import { NextApiRequest, NextApiResponse } from 'next'
import { VoiceBooking } from '@/lib/voiceBookingData'

interface ApiResponse {
  success: boolean
  data?: VoiceBooking[]
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Verify admin authentication in production
  // const token = req.headers.authorization?.split('Bearer ')[1]
  // if (!verifyAdminToken(token)) {
  //   return res.status(401).json({ success: false, error: 'Unauthorized' })
  // }

  if (req.method === 'GET') {
    try {
      // TODO: Fetch from Supabase `voice_bookings` table
      // Example implementation:
      // const { data, error } = await supabase
      //   .from('voice_bookings')
      //   .select('*')
      //   .order('date', { ascending: false })
      //
      // if (error) throw error
      // return res.status(200).json({ success: true, data })

      // For now, return empty array (mock data is in component)
      return res.status(200).json({ success: true, data: [] })
    } catch (error) {
      console.error('Error fetching voice bookings:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch voice bookings',
      })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, status } = req.body

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: id, status',
        })
      }

      // TODO: Update voice booking status in Supabase
      // const { data, error } = await supabase
      //   .from('voice_bookings')
      //   .update({ status })
      //   .eq('id', id)
      //   .select()
      //   .single()
      //
      // if (error) throw error
      // return res.status(200).json({ success: true, data })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error updating voice booking:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update voice booking',
      })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: id',
        })
      }

      // TODO: Delete voice booking from Supabase
      // const { error } = await supabase
      //   .from('voice_bookings')
      //   .delete()
      //   .eq('id', id)
      //
      // if (error) throw error
      // return res.status(200).json({ success: true })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error deleting voice booking:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to delete voice booking',
      })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
