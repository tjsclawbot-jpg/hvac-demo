import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { SAMPLE_BOOKINGS } from '@/lib/bookingData'
import { SAMPLE_VOICE_BOOKINGS, VoiceBooking, VOICE_SERVICE_TYPES } from '@/lib/voiceBookingData'
import { getStatusColor, formatDate, formatCurrency, getHoursUntilAppointment } from '@/lib/bookingManagement'

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  serviceType: string
  date: string
  time: string
  depositAmount: number
  depositPaid: boolean
  status: 'pending' | 'confirmed' | 'completed' | 'no-show' | 'cancelled'
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS)
  const [voiceBookings, setVoiceBookings] = useState<VoiceBooking[]>(SAMPLE_VOICE_BOOKINGS)
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list')
  const [bookingType, setBookingType] = useState<'web' | 'voice'>('web')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedVoiceBooking, setSelectedVoiceBooking] = useState<VoiceBooking | null>(null)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState(145) // Default: $150 - $5 fee

  // Filter bookings based on type and status
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus)

  // Filter and sort voice bookings
  let filteredVoiceBookings = filterStatus === 'all' 
    ? voiceBookings 
    : voiceBookings.filter(b => b.status === filterStatus)
  
  // Sort voice bookings by date
  filteredVoiceBookings = [...filteredVoiceBookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.preferredTime}`)
    const dateB = new Date(`${b.date}T${b.preferredTime}`)
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
  })

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus as any } : b
    ))
  }

  const handleVoiceBookingStatusChange = (bookingId: string, newStatus: string) => {
    setVoiceBookings(voiceBookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus as any } : b
    ))
  }

  const handleRefund = async (bookingId: string) => {
    // In a real app, this would call the Stripe refund API
    console.log(`Refunding ${formatCurrency(refundAmount)} for booking ${bookingId}`)
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ))
    setRefundModalOpen(false)
    setSelectedBooking(null)
  }

  // Calculate stats for both booking types
  const webUpcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
  const voiceUpcomingCount = voiceBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
  const upcomingCount = webUpcomingCount + voiceUpcomingCount
  
  const totalBookings = bookings.length + voiceBookings.length
  const totalDeposits = bookings.filter(b => b.depositPaid).length * 150

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow section-padding">
        <div className="container-max">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-hvac-darkgray mb-1 sm:mb-2">Booking Management</h1>
            <p className="text-xs sm:text-sm text-gray-600">View and manage customer web and voice bookings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold text-hvac-darkgray">{totalBookings}</p>
              <p className="text-xs text-gray-500 mt-1">{bookings.length} web, {voiceBookings.length} voice</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Upcoming</p>
              <p className="text-2xl sm:text-3xl font-bold text-hvac-orange">{upcomingCount}</p>
              <p className="text-xs text-gray-500 mt-1">{webUpcomingCount} web, {voiceUpcomingCount} voice</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total Deposits</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(totalDeposits)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Web Confirmed</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Voice Confirmed</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                {voiceBookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-6 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
              {/* Booking Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBookingType('web')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all min-h-10 ${
                    bookingType === 'web'
                      ? 'bg-hvac-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌐 Web Bookings
                </button>
                <button
                  onClick={() => setBookingType('voice')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all min-h-10 ${
                    bookingType === 'voice'
                      ? 'bg-hvac-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎤 Voice Bookings
                </button>
              </div>

              {/* View Type Selector (only for web bookings) */}
              {bookingType === 'web' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewType('list')}
                    className={`px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all min-h-10 ${
                      viewType === 'list'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setViewType('calendar')}
                    className={`px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all min-h-10 ${
                      viewType === 'calendar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 Calendar
                  </button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange min-h-10"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="no-show">No-Show</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Sort Order (for voice bookings) */}
              {bookingType === 'voice' && (
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange min-h-10"
                >
                  <option value="newest">📅 Newest First</option>
                  <option value="oldest">📅 Oldest First</option>
                </select>
              )}
            </div>
          </div>

          {/* Web Bookings List View */}
          {bookingType === 'web' && viewType === 'list' && (
            <div className="space-y-3 sm:space-y-4">
              {filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">{booking.customerName}</p>
                      <p className="text-xs text-gray-600">{booking.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Appointment</p>
                      <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-xs text-gray-600">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Service</p>
                      <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray capitalize">
                        {booking.serviceType.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Deposit</p>
                      <p className="font-semibold text-xs sm:text-sm text-green-600">{formatCurrency(booking.depositAmount)}</p>
                      <p className="text-xs text-gray-600">{booking.depositPaid ? '✓ Paid' : '✗ Pending'}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 sm:pt-4 flex flex-wrap gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange min-h-9 sm:min-h-10"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="confirmed">Mark as Confirmed</option>
                      <option value="completed">Mark as Completed</option>
                      <option value="no-show">Mark as No-Show</option>
                    </select>

                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking)
                          setRefundAmount(145) // Default: $150 - $5 fee
                          setRefundModalOpen(true)
                        }}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-all min-h-9 sm:min-h-10"
                      >
                        💰 Refund
                      </button>
                    )}

                    <button
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all ml-auto min-h-9 sm:min-h-10"
                    >
                      📄 Details
                    </button>
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No bookings found</p>
                </div>
              )}
            </div>
          )}

          {/* Voice Bookings List View */}
          {bookingType === 'voice' && (
            <div className="space-y-3 sm:space-y-4">
              {filteredVoiceBookings.length > 0 ? (
                filteredVoiceBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">
                          {formatDate(booking.date)}
                        </p>
                        <p className="text-xs text-gray-600">{booking.preferredTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Service Type</p>
                        <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray capitalize">
                          {VOICE_SERVICE_TYPES[booking.serviceType] || booking.serviceType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                        <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">{booking.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">{booking.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{booking.serviceAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2 sm:pt-4 flex flex-wrap gap-2">
                      <select
                        value={booking.status}
                        onChange={(e) => handleVoiceBookingStatusChange(booking.id, e.target.value)}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange min-h-9 sm:min-h-10"
                      >
                        <option value="pending">Mark as Pending</option>
                        <option value="confirmed">Mark as Confirmed</option>
                        <option value="completed">Mark as Completed</option>
                        <option value="no-show">Mark as No-Show</option>
                        <option value="cancelled">Mark as Cancelled</option>
                      </select>

                      <button
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all ml-auto min-h-9 sm:min-h-10"
                      >
                        📞 Call Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No voice bookings found</p>
                </div>
              )}
            </div>
          )}

          {/* Web Bookings Calendar View */}
          {bookingType === 'web' && viewType === 'calendar' && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {[...Array(35)].map((_, idx) => {
                  const date = new Date(2026, 2, idx - 9) // March 2026
                  const dateStr = date.toISOString().split('T')[0]
                  const dayBookings = bookings.filter(b => b.date === dateStr)

                  if (idx < 9 || idx >= 31) {
                    return <div key={idx} className="aspect-square" />
                  }

                  return (
                    <div
                      key={idx}
                      className={`aspect-square p-2 rounded border-2 transition-all ${
                        dayBookings.length > 0
                          ? 'border-hvac-orange bg-orange-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="text-xs font-semibold text-hvac-darkgray">{date.getDate()}</div>
                      {dayBookings.length > 0 && (
                        <div className="text-xs text-hvac-orange font-bold mt-1">
                          {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Refund Modal */}
      {refundModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-hvac-darkgray mb-3 sm:mb-4">Process Refund</h2>

            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Customer: {selectedBooking.customerName}</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Appointment: {formatDate(selectedBooking.date)}</p>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-xs text-gray-600 mb-1">Deposit Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-hvac-darkgray">{formatCurrency(150)}</p>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Refund Options:</p>
              <div className="space-y-2">
                <label className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    checked={refundAmount === 145}
                    onChange={() => setRefundAmount(145)}
                    className="mr-2 sm:mr-3"
                  />
                  <span className="text-xs sm:text-sm">
                    <span className="font-semibold text-hvac-orange">{formatCurrency(145)}</span> (Minus $5 fee)
                  </span>
                </label>
                <label className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    checked={refundAmount === 150}
                    onChange={() => setRefundAmount(150)}
                    className="mr-2 sm:mr-3"
                  />
                  <span className="text-xs sm:text-sm">
                    <span className="font-semibold text-green-600">{formatCurrency(150)}</span> (Full refund)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setRefundModalOpen(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg font-medium text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-all min-h-9 sm:min-h-10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRefund(selectedBooking.id)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-red-700 transition-all min-h-9 sm:min-h-10"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
