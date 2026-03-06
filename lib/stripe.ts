// Stripe configuration and utilities
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export const DEPOSIT_AMOUNT = 150 // $150 in cents: 15000

// Create a payment intent for the deposit
export async function createPaymentIntent(
  amount: number,
  customerEmail: string,
  customerName: string,
  bookingId?: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      description: `HVAC Inspection Deposit - ${customerName}`,
      receipt_email: customerEmail,
      metadata: {
        customerName,
        customerEmail,
        bookingId: bookingId || 'pending',
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

// Confirm payment intent
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment',
    }
  }
}

// Process refund
export async function processRefund(
  paymentIntentId: string,
  amountToRefund?: number,
  reason?: string
) {
  try {
    const refundParams: {
      payment_intent?: string
      amount?: number
      metadata?: Record<string, string>
      reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
    } = {
      payment_intent: paymentIntentId,
    }

    // If amountToRefund is provided, add it
    if (amountToRefund) {
      refundParams.amount = amountToRefund * 100 // Convert to cents
    }

    if (reason) {
      refundParams.metadata = { reason }
    }

    const refund = await stripe.refunds.create(refundParams)

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    }
  }
}

// Get payment intent details
export async function getPaymentIntentDetails(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return {
      success: true,
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
    }
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    }
  }
}

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Webhook secret not configured')
      return false
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return true
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

// Export stripe instance for other uses
export default stripe
