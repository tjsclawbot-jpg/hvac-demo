import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface ConfirmationData {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  serviceType: string
  date: string
  time: string
  confirmationNumber: string
  depositAmount: number
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfirmation = async () => {
      const { id } = router.query

      if (!id) {
        setError('No booking ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load confirmation')
        }
        const data = await response.json()
        setConfirmationData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load confirmation')
      } finally {
        setLoading(false)
      }
    }

    if (router.isReady) {
      fetchConfirmation()
    }
  }, [router.isReady, router.query])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center section-padding">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading your booking confirmation...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !confirmationData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center section-padding">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Error Loading Confirmation</h2>
            <p className="text-gray-600 mb-6">{error || 'Could not load your booking details'}</p>
            <Link href="/" className="btn-primary inline-block">
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white section-padding border-b-4 border-hvac-orange">
          <div className="container-max text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h1 className="text-4xl md:text-5xl font-bold text-hvac-darkgray mb-4">Your Inspection is Booked!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thank you for booking with Premier HVAC Solutions. Your appointment is confirmed and we'll see you soon.
            </p>
          </div>
        </section>

        {/* Confirmation Details */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Confirmation Card - 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white border-2 border-hvac-orange rounded-lg p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-hvac-darkgray mb-6">Booking Confirmation Details</h2>

                  <div className="mb-8 p-4 bg-hvac-light border-l-4 border-hvac-orange rounded">
                    <p className="text-sm text-gray-600 mb-1">Confirmation Reference:</p>
                    <p className="text-2xl font-bold text-hvac-orange font-mono">{confirmationData.confirmationNumber}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Scheduled Date</p>
                      <p className="text-lg font-semibold text-hvac-darkgray">{formatDate(confirmationData.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Scheduled Time</p>
                      <p className="text-lg font-semibold text-hvac-darkgray">{confirmationData.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service Address</p>
                      <p className="text-lg font-semibold text-hvac-darkgray">{confirmationData.customerAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service Type</p>
                      <p className="text-lg font-semibold text-hvac-darkgray capitalize">
                        {confirmationData.serviceType.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Deposit Paid</p>
                      <p className="text-lg font-semibold text-green-600">${confirmationData.depositAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <p className="text-lg font-semibold text-hvac-orange">Confirmed</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-8">
                    <h3 className="font-bold text-hvac-darkgray mb-4">Contact Information</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-semibold">Name:</span> {confirmationData.customerName}</p>
                      <p><span className="font-semibold">Email:</span> {confirmationData.customerEmail}</p>
                      <p><span className="font-semibold">Phone:</span> {confirmationData.customerPhone}</p>
                    </div>
                  </div>

                  {/* What to Expect */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-4">What to Expect</h3>
                    <ul className="space-y-3 text-blue-900 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">→</span>
                        <span>Our technician will arrive within 30 minutes of your scheduled time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">→</span>
                        <span>The inspection will take 1-2 hours depending on your system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">→</span>
                        <span>You'll receive a detailed report with our findings and recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">→</span>
                        <span>No pressure to decide - we'll answer all your questions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Email Confirmation */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-hvac-darkgray mb-3">📧 Check Your Email</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    A confirmation email has been sent to <span className="font-semibold">{confirmationData.customerEmail}</span>
                  </p>
                  <p className="text-xs text-gray-500">If you don't see it, check your spam folder.</p>
                </div>

                {/* Next Steps */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-hvac-darkgray mb-4">Next Steps</h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <span className="font-bold text-hvac-orange flex-shrink-0">1</span>
                      <span>Save your confirmation number</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-hvac-orange flex-shrink-0">2</span>
                      <span>Prepare your address for technician entry</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-hvac-orange flex-shrink-0">3</span>
                      <span>Plan for 1-2 hours for the inspection</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-hvac-orange flex-shrink-0">4</span>
                      <span>Review findings and recommendations</span>
                    </li>
                  </ol>
                </div>

                {/* Need Help */}
                <div className="bg-hvac-light border border-hvac-yellow rounded-lg p-6">
                  <h3 className="font-bold text-hvac-darkgray mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Have questions or need to reschedule?
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>📞 <a href="tel:(555)123-4567" className="text-hvac-orange hover:underline font-semibold">(555) 123-4567</a></p>
                    <p>📧 <a href="mailto:support@premierhvac.com" className="text-hvac-orange hover:underline font-semibold">support@premierhvac.com</a></p>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800">
                    <span className="font-bold">💡 Tip:</span> You can cancel within 24 hours of your appointment for a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-hvac-darkgray text-white section-padding">
          <div className="container-max text-center">
            <h2 className="text-3xl font-bold mb-6">Questions About Your Booking?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                Return to Home
              </Link>
              <Link href="/contact" className="btn-outline">
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
