'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { DEPOSIT_CONFIG } from '@/lib/bookingData'

interface StripePaymentProps {
  onSuccess: (paymentIntentId: string, clientSecret: string) => void
  onError: (error: string) => void
  isProcessing?: boolean
  customerEmail: string
  customerName: string
}

export default function StripePayment({
  onSuccess,
  onError,
  isProcessing = false,
  customerEmail,
  customerName,
}: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment intent on the backend
      const response = await fetch('/api/bookings/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: DEPOSIT_CONFIG.amount,
          customerEmail,
          customerName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret, paymentIntentId } = await response.json()

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      })

      if (result.error) {
        setError(result.error.message || 'Payment failed')
        onError(result.error.message || 'Payment failed')
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntentId, clientSecret)
      } else {
        setError('Payment processing failed. Please try again.')
        onError('Payment processing failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment error'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#EF4444',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold text-hvac-darkgray mb-1 sm:mb-2">Complete Your Booking</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Secure $150 deposit via Stripe</p>

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-hvac-light border-l-4 border-hvac-orange rounded">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
          <span className="font-semibold text-xs sm:text-sm text-hvac-darkgray">Deposit Amount:</span>
          <span className="text-xl sm:text-2xl font-bold text-hvac-orange">${DEPOSIT_CONFIG.amount}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          This secures your inspection slot. Full refund within 24 hours of appointment.
        </p>
      </div>

      {/* Cardholder name */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-hvac-darkgray mb-1 sm:mb-2">Cardholder Name</label>
        <input
          type="text"
          value={customerName}
          readOnly
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
        />
      </div>

      {/* Card element */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-hvac-darkgray mb-1 sm:mb-2">Card Details</label>
        <div className="p-3 sm:p-4 border border-gray-300 rounded-lg bg-white text-base">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-xs sm:text-sm font-medium">❌ {error}</p>
        </div>
      )}

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-xs sm:text-sm flex items-start gap-2 mb-3">
          <span className="flex-shrink-0 text-sm sm:text-base">🔒</span>
          <span>Your payment is secure and encrypted. We use Stripe, the trusted payment processor for thousands of businesses.</span>
        </p>
        <div className="flex items-center justify-center pt-3 border-t border-blue-200">
          <svg className="w-16 sm:w-20 h-auto" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            {/* Stripe Logo */}
            <text x="2" y="24" fontSize="14" fontWeight="600" fill="#0066CC" fontFamily="Arial, sans-serif">
              stripe
            </text>
          </svg>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || isProcessing}
        className={`w-full py-3 sm:py-4 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all duration-300 min-h-11 sm:min-h-12 ${
          !stripe || loading || isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-hvac-orange hover:bg-orange-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading || isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin">⏳</span>
            Processing...
          </span>
        ) : (
          `Complete Booking - $${DEPOSIT_CONFIG.amount}`
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-3 sm:mt-4">
        By completing this booking, you agree to our cancellation and refund policy.
      </p>
    </form>
  )
}
