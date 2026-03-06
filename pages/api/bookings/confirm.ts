import { NextApiRequest, NextApiResponse } from 'next'
import { generateBookingId, generateConfirmationNumber } from '@/lib/bookingManagement'

// Mock database - in a real app, this would use a database
const bookings: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      serviceType,
      date,
      time,
      paymentIntentId,
    } = req.body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !serviceType || !date || !time || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create booking
    const booking = {
      id: generateBookingId(),
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      serviceType,
      date,
      time,
      depositAmount: 150,
      depositPaid: true,
      stripePaymentId: paymentIntentId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmationNumber: generateConfirmationNumber(),
    }

    // Store booking (in-memory for demo)
    bookings.push(booking)

    // In a real app, you would:
    // 1. Store this in a database
    // 2. Send confirmation email
    // 3. Create calendar entry

    return res.status(200).json(booking)
  } catch (error) {
    console.error('Booking confirmation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
