import { useState } from 'react'
import { useRouter } from 'next/router'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingForm, { BookingFormData } from '@/components/BookingForm'
import RefundPolicy from '@/components/RefundPolicy'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function BookingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBookingSubmit = async (data: BookingFormData & { paymentIntentId: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm booking')
      }

      const booking = await response.json()
      router.push(`/booking/confirmation?id=${booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="gradient-primary text-white section-padding">
          <div className="container-max text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">Book Your Inspection Today</h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-4 sm:mb-6">
              Reserve your HVAC inspection with just a $150 deposit. Cancel within 24 hours for a full refund.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 sm:px-4 py-2">
                <span>✓</span>
                <span>24-Hour Cancellation</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 sm:px-4 py-2">
                <span>💰</span>
                <span>Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 sm:px-4 py-2">
                <span>⚡</span>
                <span>Quick Approval</span>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Content */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Main Form - 2 columns */}
              <div className="lg:col-span-2">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">❌ {error}</p>
                  </div>
                )}

                <Elements stripe={stripePromise}>
                  <BookingForm onSubmit={handleBookingSubmit} isLoading={isLoading} />
                </Elements>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 sm:space-y-6">
                {/* Deposit Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm lg:sticky lg:top-6">
                  <h3 className="text-base sm:text-lg font-bold text-hvac-darkgray mb-3 sm:mb-4">Deposit Details</h3>
                  <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Amount:</span>
                      <span className="font-bold text-hvac-darkgray">$150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stripe Fee:</span>
                      <span className="text-sm text-gray-500">Included</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex items-start gap-2">
                      <span className="text-hvac-orange mt-0.5">✓</span>
                      <span>Secures your inspection slot</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-hvac-orange mt-0.5">✓</span>
                      <span>Full refund within 24 hours</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-hvac-orange mt-0.5">✓</span>
                      <span>Applies to invoice if proceeding</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
                    Secured by <span className="font-semibold">Stripe</span>
                  </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-hvac-darkgray mb-3 sm:mb-4">Why Book With Us?</h3>
                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-hvac-orange">★</span>
                      <span>Expert technicians with 15+ years experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-hvac-orange">★</span>
                      <span>Same-day scheduling available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-hvac-orange">★</span>
                      <span>Upfront pricing, no surprises</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-hvac-orange">★</span>
                      <span>24/7 emergency support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Full Width Refund Policy */}
            <div className="mt-8 sm:mt-12">
              <RefundPolicy />
            </div>

            {/* FAQ Section */}
            <div className="mt-8 sm:mt-12 bg-white border border-gray-200 rounded-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-hvac-darkgray mb-6 sm:mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
                <div>
                  <h4 className="font-bold text-hvac-darkgray mb-2">What's included in the inspection?</h4>
                  <p className="text-gray-600 text-sm">
                    A comprehensive evaluation of your HVAC system, including checking efficiency, safety, and any needed repairs.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-hvac-darkgray mb-2">How long is the inspection?</h4>
                  <p className="text-gray-600 text-sm">
                    Typically 1-2 hours, depending on system complexity and any issues found.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-hvac-darkgray mb-2">Do you offer emergency services?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes! We provide 24/7 emergency HVAC services. Call us anytime at (555) 123-4567.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-hvac-darkgray mb-2">Can I reschedule my appointment?</h4>
                  <p className="text-gray-600 text-sm">
                    Absolutely. Contact us 24 hours before your appointment to reschedule at no charge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-hvac-darkgray text-white section-padding">
          <div className="container-max text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">Trusted by Thousands of Homeowners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              <div>
                <div className="text-3xl font-bold text-hvac-orange mb-2">500+</div>
                <p className="text-gray-300">Inspections Completed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-hvac-orange mb-2">4.9★</div>
                <p className="text-gray-300">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-hvac-orange mb-2">24/7</div>
                <p className="text-gray-300">Emergency Service</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-hvac-orange mb-2">15+</div>
                <p className="text-gray-300">Years Experience</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
