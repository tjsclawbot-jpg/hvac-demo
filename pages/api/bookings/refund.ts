import { NextApiRequest, NextApiResponse } from 'next'
import { processRefund } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { paymentIntentId, amount, reason } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' })
    }

    const result = await processRefund(paymentIntentId, amount, reason)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    return res.status(200).json({
      success: true,
      refundId: result.refundId,
      amount: result.amount,
      status: result.status,
    })
  } catch (error) {
    console.error('Refund processing error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
