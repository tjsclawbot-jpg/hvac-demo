import { NextApiRequest, NextApiResponse } from 'next'
import { createPaymentIntent } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amount, customerEmail, customerName, bookingId } = req.body

    if (!amount || !customerEmail || !customerName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await createPaymentIntent(amount, customerEmail, customerName, bookingId)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    return res.status(200).json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
