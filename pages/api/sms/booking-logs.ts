import { NextApiRequest, NextApiResponse } from 'next'
import { getSMSLogsForBooking } from '../../../lib/supabase'

interface BookingLogsResponse {
  success: boolean
  logs?: any[]
  error?: string
}

/**
 * Fetch SMS logs for a specific booking
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookingLogsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { bookingId } = req.query

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid bookingId parameter',
      })
    }

    const result = await getSMSLogsForBooking(bookingId)

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error ?? 'Unknown error',
      })
    }

    return res.status(200).json({
      success: true,
      logs: result.data || [],
    })
  } catch (error) {
    console.error('❌ Error fetching booking SMS logs:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({
      success: false,
      error: `Failed to fetch SMS logs: ${errorMessage}`,
    })
  }
}
