import { NextApiRequest, NextApiResponse } from 'next'
import { SAMPLE_BOOKINGS } from '@/lib/bookingData'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Booking ID is required' })
  }

  // Find booking in sample data
  const booking = SAMPLE_BOOKINGS.find(b => b.id === id)

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }

  return res.status(200).json(booking)
}
