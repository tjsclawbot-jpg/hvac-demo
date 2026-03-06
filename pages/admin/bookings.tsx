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
  const [bookingType, setBookingType] = useState<'web' | 'voice'>('voice')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedVoiceBooking, setSelectedVoiceBooking] = useState<VoiceBooking | null>(null)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState(145) // Default: $150 - $5 fee
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-3xl mx-auto">
          {/* Page Header - Mobile First */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-2">Booking Management</h1>
            <p className="text-base text-gray-600">Manage customer web and voice bookings</p>
          </div>

          {/* Stats - Simplified for Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-hvac-darkgray">{totalBookings}</p>
              <p className="text-xs text-gray-500 mt-2">{bookings.length} web, {voiceBookings.length} voice</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2">Upcoming</p>
              <p className="text-3xl font-bold text-hvac-orange">{upcomingCount}</p>
              <p className="text-xs text-gray-500 mt-2">{webUpcomingCount} web</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2">Total Deposits</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalDeposits)}</p>
            </div>
            <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2">Web Confirmed</p>
              <p className="text-3xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2">Voice Confirmed</p>
              <p className="text-3xl font-bold text-purple-600">
                {voiceBookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>

          {/* Controls - Mobile Friendly */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
            {/* Booking Type Selector - Full Width on Mobile */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wide text-gray-600 mb-3 font-semibold">Booking Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBookingType('web')}
                  className={`w-full px-4 py-4 rounded-lg font-semibold text-base transition-all touch-manipulation ${
                    bookingType === 'web'
                      ? 'bg-hvac-orange text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  🌐 Web
                </button>
                <button
                  onClick={() => setBookingType('voice')}
                  className={`w-full px-4 py-4 rounded-lg font-semibold text-base transition-all touch-manipulation ${
                    bookingType === 'voice'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  🎤 Voice
                </button>
              </div>
            </div>

            {/* View Type Selector (only for web bookings) */}
            {bookingType === 'web' && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-600 mb-3 font-semibold">View</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setViewType('list')}
                    className={`px-4 py-3 rounded-lg font-semibold text-base transition-all touch-manipulation ${
                      viewType === 'list'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setViewType('calendar')}
                    className={`px-4 py-3 rounded-lg font-semibold text-base transition-all touch-manipulation ${
                      viewType === 'calendar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                  >
                    📅 Calendar
                  </button>
                </div>
              </div>
            )}

            {/* Filters - Full Width */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold">Filter & Sort</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange"
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
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange"
                >
                  <option value="newest">📅 Newest First</option>
                  <option value="oldest">📅 Oldest First</option>
                </select>
              )}
            </div>
          </div>

          {/* Web Bookings List View */}
          {bookingType === 'web' && viewType === 'list' && (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card Header - Always Visible */}
                  <button
                    onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                    className="w-full px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors touch-manipulation"
                  >
                    <div className="text-left flex-grow">
                      <p className="text-lg font-bold text-hvac-darkgray">{booking.customerName}</p>
                      <p className="text-base text-gray-600 mt-1">{formatDate(booking.date)} at {booking.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className="text-xl">{expandedBookingId === booking.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Card Details - Expandable */}
                  {expandedBookingId === booking.id && (
                    <>
                      <div className="border-t border-gray-200 px-5 py-4 space-y-4 bg-gray-50">
                        {/* Customer Info */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Customer</p>
                          <p className="text-base text-hvac-darkgray font-medium">{booking.customerName}</p>
                          <p className="text-base text-gray-600">{booking.customerEmail}</p>
                          <p className="text-base text-gray-600">{booking.customerPhone}</p>
                        </div>

                        {/* Service & Address */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Service</p>
                          <p className="text-base font-medium text-hvac-darkgray capitalize">{booking.serviceType.replace('-', ' ')}</p>
                          <p className="text-sm text-gray-600 mt-2">{booking.customerAddress}</p>
                        </div>

                        {/* Deposit Info */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Deposit</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(booking.depositAmount)}</p>
                          <p className="text-base text-gray-600 mt-1">{booking.depositPaid ? '✓ Paid' : '✗ Pending'}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-gray-200 px-5 py-4 space-y-3">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange"
                        >
                          <option value="pending">Mark as Pending</option>
                          <option value="confirmed">Mark as Confirmed</option>
                          <option value="completed">Mark as Completed</option>
                          <option value="no-show">Mark as No-Show</option>
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking)
                                setRefundAmount(145)
                                setRefundModalOpen(true)
                              }}
                              className="px-4 py-3 text-base font-semibold bg-red-50 text-red-700 rounded-lg active:bg-red-100 transition-all"
                            >
                              💰 Refund
                            </button>
                          )}

                          <button
                            className="px-4 py-3 text-base font-semibold bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-all"
                          >
                            📄 Details
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-600">No bookings found</p>
                </div>
              )}
            </div>
          )}

          {/* Voice Bookings List View - PROMINENT & MOBILE FRIENDLY */}
          {bookingType === 'voice' && (
            <div>
              {/* Scroll indicator for mobile */}
              {filteredVoiceBookings.length > 1 && (
                <div className="flex justify-center mb-4 text-gray-500 text-sm">
                  <span className="animate-pulse">↓ Swipe to scroll ↓</span>
                </div>
              )}
              
              <div className="space-y-6">
                {filteredVoiceBookings.length > 0 ? (
                  filteredVoiceBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all transform hover:scale-[1.01]"
                      style={{
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {/* Card Header - Always Visible & Prominent */}
                      <button
                        onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                        className="w-full px-6 py-6 flex items-start justify-between gap-4 bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100 transition-colors touch-manipulation"
                      >
                        <div className="text-left flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-xl font-bold text-hvac-darkgray break-words">{booking.customerName}</p>
                          <p className="text-base text-hvac-orange font-semibold mt-2">
                            📅 {formatDate(booking.date)} · {booking.preferredTime}
                          </p>
                        </div>
                        <div className="text-2xl flex-shrink-0">
                          {expandedBookingId === booking.id ? '▲' : '▼'}
                        </div>
                      </button>

                      {/* Card Details - Expandable */}
                      {expandedBookingId === booking.id && (
                        <>
                          <div className="border-t-2 border-purple-200 px-6 py-6 space-y-5 bg-gray-50">
                            {/* Service Info */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Service Type</p>
                              <p className="text-xl font-bold text-hvac-darkgray">
                                {VOICE_SERVICE_TYPES[booking.serviceType] || booking.serviceType}
                              </p>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Phone Number</p>
                                <p className="text-lg font-bold text-hvac-darkgray">{booking.customerPhone}</p>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">Service Address</p>
                              <p className="text-base text-hvac-darkgray font-medium">{booking.serviceAddress}</p>
                            </div>

                            {/* Notes if available */}
                            {booking.notes && (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-2">📝 Notes</p>
                                <p className="text-base text-blue-900">{booking.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="border-t-2 border-purple-200 px-6 py-6 space-y-3 bg-white">
                            <select
                              value={booking.status}
                              onChange={(e) => handleVoiceBookingStatusChange(booking.id, e.target.value)}
                              className="w-full px-4 py-3 text-base font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            >
                              <option value="pending">Mark as Pending</option>
                              <option value="confirmed">Mark as Confirmed</option>
                              <option value="completed">Mark as Completed</option>
                              <option value="no-show">Mark as No-Show</option>
                              <option value="cancelled">Mark as Cancelled</option>
                            </select>

                            <button
                              className="w-full px-4 py-4 text-base font-semibold bg-purple-600 text-white rounded-lg active:bg-purple-700 transition-all"
                            >
                              📞 Call Customer
                            </button>

                            <button
                              className="w-full px-4 py-3 text-base font-semibold bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-all"
                            >
                              📄 Full Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-xl text-gray-600">🎤 No voice bookings</p>
                    <p className="text-base text-gray-500 mt-2">New voice bookings will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Web Bookings Calendar View */}
          {bookingType === 'web' && viewType === 'calendar' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold text-sm text-gray-700 py-3">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
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
                      className={`aspect-square p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                        dayBookings.length > 0
                          ? 'border-hvac-orange bg-orange-50 font-semibold'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="text-base font-bold text-hvac-darkgray">{date.getDate()}</div>
                      {dayBookings.length > 0 && (
                        <div className="text-xs text-hvac-orange font-bold mt-1">
                          {dayBookings.length}
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

      {/* Refund Modal - Mobile Optimized */}
      {refundModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md md:w-full shadow-2xl">
            <div className="px-5 py-8 md:py-8">
              <h2 className="text-3xl font-bold text-hvac-darkgray mb-6">Process Refund</h2>

              <div className="mb-8 space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-600 font-semibold mb-2">Customer</p>
                  <p className="text-xl text-hvac-darkgray font-medium">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-600 font-semibold mb-2">Appointment</p>
                  <p className="text-xl text-hvac-darkgray font-medium">{formatDate(selectedBooking.date)}</p>
                </div>

                <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-sm uppercase tracking-wide text-gray-600 font-semibold mb-2">Deposit Amount</p>
                  <p className="text-4xl font-bold text-hvac-darkgray">{formatCurrency(150)}</p>
                </div>

                <p className="text-base font-semibold text-gray-700 mt-6 mb-4">Select Refund Amount:</p>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-hvac-orange hover:bg-orange-50 transition-all touch-manipulation"
                    style={{ borderColor: refundAmount === 145 ? '#FF9500' : undefined, background: refundAmount === 145 ? '#FFF5E6' : undefined }}>
                    <input
                      type="radio"
                      checked={refundAmount === 145}
                      onChange={() => setRefundAmount(145)}
                      className="w-5 h-5 mr-4"
                    />
                    <span className="flex-grow">
                      <span className="text-lg font-bold text-hvac-orange">{formatCurrency(145)}</span>
                      <span className="text-sm text-gray-600 block">Minus $5 processing fee</span>
                    </span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-600 hover:bg-green-50 transition-all touch-manipulation"
                    style={{ borderColor: refundAmount === 150 ? '#16A34A' : undefined, background: refundAmount === 150 ? '#F0FDF4' : undefined }}>
                    <input
                      type="radio"
                      checked={refundAmount === 150}
                      onChange={() => setRefundAmount(150)}
                      className="w-5 h-5 mr-4"
                    />
                    <span className="flex-grow">
                      <span className="text-lg font-bold text-green-600">{formatCurrency(150)}</span>
                      <span className="text-sm text-gray-600 block">Full refund</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setRefundModalOpen(false)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRefund(selectedBooking.id)}
                  className="w-full px-4 py-4 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 active:bg-red-800 transition-all"
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
