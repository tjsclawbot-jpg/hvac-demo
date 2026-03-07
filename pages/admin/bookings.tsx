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

// Status badge color map
const statusColorMap = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '✓' },
  pending: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: '⏱' },
  completed: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: '✓✓' },
  'no-show': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '✗' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: '⊘' }
}

// Service type icons
const serviceIcons: Record<string, string> = {
  'emergency-ac': '🚨',
  'ac-maintenance': '🛠',
  'heating-repair': '🔥',
  'heat-pump': '❄',
  'thermostat-install': '🌡',
  'ductwork-repair': '🔧',
  'general': '⚙'
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full max-w-5xl mx-auto">
          {/* Page Header - Modern & Clean */}
          <div className="mb-10 md:mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-hvac-darkgray mb-3 leading-tight">Booking Management</h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium">Manage your customer bookings from web and voice channels</p>
          </div>

          {/* Stats - Modern Grid with Varied Sizes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Total Bookings - Large Card */}
            <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-hvac-darkgray to-gray-800 text-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <p className="text-sm uppercase tracking-wider font-semibold opacity-90">Total Bookings</p>
                  <p className="text-5xl lg:text-6xl font-bold mt-3">{totalBookings}</p>
                  <p className="text-sm mt-3 opacity-75">{bookings.length} web • {voiceBookings.length} voice</p>
                </div>
                <div className="text-5xl opacity-20">📋</div>
              </div>
            </div>

            {/* Upcoming - Medium Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-hvac-orange to-orange-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Upcoming</p>
              <p className="text-4xl lg:text-5xl font-bold mt-3">{upcomingCount}</p>
              <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${(upcomingCount / totalBookings) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Total Deposits - Medium Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Deposits Collected</p>
              <p className="text-4xl lg:text-5xl font-bold mt-3">{formatCurrency(totalDeposits)}</p>
              <p className="text-sm mt-4 opacity-75">{bookings.filter(b => b.depositPaid).length} completed</p>
            </div>

            {/* Confirmed Web - Small Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-900">Web Confirmed</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{bookings.filter(b => b.status === 'confirmed').length}</p>
              <div className="text-2xl mt-3">🌐</div>
            </div>

            {/* Confirmed Voice - Small Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs uppercase tracking-wider font-semibold text-purple-900">Voice Confirmed</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">{voiceBookings.filter(b => b.status === 'confirmed').length}</p>
              <div className="text-2xl mt-3">🎤</div>
            </div>

            {/* Pending - Small Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs uppercase tracking-wider font-semibold text-yellow-900">Pending</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{voiceBookings.filter(b => b.status === 'pending').length}</p>
              <div className="text-2xl mt-3">⏱</div>
            </div>

            {/* Completed - Small Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-900">Completed</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{voiceBookings.filter(b => b.status === 'completed').length}</p>
              <div className="text-2xl mt-3">✓</div>
            </div>
          </div>

          {/* Controls - Modern & Mobile First */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7 mb-10 shadow-sm">
            {/* Booking Type Selector */}
            <div className="mb-7 pb-7 border-b border-gray-200">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">Booking Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBookingType('web')}
                  className={`px-4 py-3.5 md:py-4 rounded-xl font-bold text-base transition-all touch-manipulation ${
                    bookingType === 'web'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-150 active:bg-gray-200'
                  }`}
                >
                  🌐 Web
                </button>
                <button
                  onClick={() => setBookingType('voice')}
                  className={`px-4 py-3.5 md:py-4 rounded-xl font-bold text-base transition-all touch-manipulation ${
                    bookingType === 'voice'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-150 active:bg-gray-200'
                  }`}
                >
                  🎤 Voice
                </button>
              </div>
            </div>

            {/* View Type Selector (only for web bookings) */}
            {bookingType === 'web' && (
              <div className="mb-7 pb-7 border-b border-gray-200">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">View Mode</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setViewType('list')}
                    className={`px-4 py-3.5 rounded-xl font-bold text-base transition-all touch-manipulation ${
                      viewType === 'list'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-150 active:bg-gray-200'
                    }`}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setViewType('calendar')}
                    className={`px-4 py-3.5 rounded-xl font-bold text-base transition-all touch-manipulation ${
                      viewType === 'calendar'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-150 active:bg-gray-200'
                    }`}
                  >
                    📅 Calendar
                  </button>
                </div>
              </div>
            )}

            {/* Filters & Sort */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600">Filters</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hvac-orange focus:border-hvac-orange bg-white hover:border-gray-400 transition-colors cursor-pointer"
              >
                <option value="all">📊 All Status</option>
                <option value="pending">⏱ Pending</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="completed">✓✓ Completed</option>
                <option value="no-show">✗ No-Show</option>
                <option value="cancelled">⊘ Cancelled</option>
              </select>

              {/* Sort Order (for voice bookings) */}
              {bookingType === 'voice' && (
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="newest">📅 Newest First</option>
                  <option value="oldest">📅 Oldest First</option>
                </select>
              )}
            </div>
          </div>

          {/* Web Bookings List View - Modern Design */}
          {bookingType === 'web' && viewType === 'list' && (
            <div className="space-y-4">
              {filteredBookings.map(booking => {
                const statusConfig = statusColorMap[booking.status as keyof typeof statusColorMap] || statusColorMap.pending
                const isExpanded = expandedBookingId === booking.id
                
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Card Header */}
                    <button
                      onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                      className="w-full px-5 md:px-7 py-5 md:py-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                      <div className="flex-grow min-w-0">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border-2`}>
                            <span>{statusConfig.icon}</span>
                            <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                          </span>
                        </div>

                        {/* Customer Name */}
                        <h3 className="text-2xl md:text-3xl font-bold text-hvac-darkgray mb-1 break-words">
                          {booking.customerName}
                        </h3>

                        {/* Date & Time */}
                        <p className="text-sm md:text-base text-gray-600">
                          📅 {formatDate(booking.date)} at {booking.time}
                        </p>
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0 text-2xl text-gray-400">
                        {isExpanded ? '▼' : '▶'}
                      </div>
                    </button>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <>
                        <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-5 bg-gray-50">
                          {/* Customer Info */}
                          <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">Customer Details</p>
                            <div className="space-y-2">
                              <p className="text-base md:text-lg font-bold text-hvac-darkgray">{booking.customerName}</p>
                              <a href={`mailto:${booking.customerEmail}`} className="text-base text-blue-600 hover:underline">{booking.customerEmail}</a>
                              <a href={`tel:${booking.customerPhone}`} className="text-base text-blue-600 hover:underline block">{booking.customerPhone}</a>
                            </div>
                          </div>

                          {/* Service & Address */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Service Type</p>
                              <p className="text-lg md:text-xl font-bold text-hvac-darkgray capitalize">{booking.serviceType.replace('-', ' ')}</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Deposit</p>
                              <p className="text-lg md:text-xl font-bold text-green-600">{formatCurrency(booking.depositAmount)}</p>
                              <p className="text-sm text-gray-600 mt-1">{booking.depositPaid ? '✓ Paid' : '⏳ Pending'}</p>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Service Address</p>
                            <p className="text-base md:text-lg font-medium text-hvac-darkgray">{booking.customerAddress}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-3 bg-white">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className="w-full px-4 py-3 md:py-3.5 text-base font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white hover:border-gray-400 transition-colors cursor-pointer"
                          >
                            <option value="pending">⏱ Mark as Pending</option>
                            <option value="confirmed">✓ Mark as Confirmed</option>
                            <option value="completed">✓✓ Mark as Completed</option>
                            <option value="no-show">✗ Mark as No-Show</option>
                          </select>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setRefundAmount(145)
                                  setRefundModalOpen(true)
                                }}
                                className="px-4 py-3 md:py-3.5 text-base font-semibold bg-red-50 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-100 active:bg-red-200 transition-all"
                              >
                                💰 Process Refund
                              </button>
                            )}

                            <button
                              className="px-4 py-3 md:py-3.5 text-base font-semibold bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-all"
                            >
                              📄 Full Details
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {filteredBookings.length === 0 && (
                <div className="text-center py-16 md:py-24 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                  <p className="text-3xl mb-3">📋</p>
                  <p className="text-2xl font-bold text-gray-700">No bookings found</p>
                  <p className="text-base text-gray-500 mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}

          {/* Voice Bookings List View - MODERN & MOBILE FIRST */}
          {bookingType === 'voice' && (
            <div>
              <div className="space-y-4">
                {filteredVoiceBookings.length > 0 ? (
                  filteredVoiceBookings.map(booking => {
                    const statusConfig = statusColorMap[booking.status as keyof typeof statusColorMap] || statusColorMap.pending
                    const serviceIcon = serviceIcons[booking.serviceType] || '⚙'
                    const isExpanded = expandedBookingId === booking.id
                    
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Card Header - Always Visible */}
                        <button
                          onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                          className="w-full px-5 md:px-7 py-5 md:py-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors touch-manipulation"
                        >
                          <div className="flex-grow min-w-0">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border-2`}>
                                <span className="text-base">{statusConfig.icon}</span>
                                <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                              </span>
                            </div>

                            {/* Customer Name - Large & Scannable */}
                            <h3 className="text-2xl md:text-3xl font-bold text-hvac-darkgray mb-2 break-words leading-tight">
                              {booking.customerName}
                            </h3>

                            {/* Service Type with Icon */}
                            <div className="flex items-center gap-2 text-base md:text-lg font-semibold text-hvac-darkgray">
                              <span className="text-xl">{serviceIcon}</span>
                              <span>{VOICE_SERVICE_TYPES[booking.serviceType] || booking.serviceType}</span>
                            </div>

                            {/* Date & Time */}
                            <p className="text-sm md:text-base text-gray-600 mt-2">
                              📅 {formatDate(booking.date)} at {booking.preferredTime}
                            </p>
                          </div>

                          {/* Expand Icon */}
                          <div className="flex-shrink-0 text-2xl text-gray-400">
                            {isExpanded ? '▼' : '▶'}
                          </div>
                        </button>

                        {/* Expandable Details Section */}
                        {isExpanded && (
                          <>
                            <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-5 bg-gray-50">
                              {/* Contact Information - Two Column */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Phone</p>
                                  <p className="text-lg md:text-xl font-bold text-hvac-darkgray font-mono">{booking.customerPhone}</p>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Email</p>
                                  <p className="text-sm md:text-base font-medium text-hvac-darkgray truncate">{booking.customerEmail || 'N/A'}</p>
                                </div>
                              </div>

                              {/* Service Address */}
                              <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Service Address</p>
                                <p className="text-base md:text-lg font-medium text-hvac-darkgray">{booking.serviceAddress}</p>
                              </div>

                              {/* Notes if available */}
                              {booking.notes && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-blue-700 mb-2">📝 Notes</p>
                                  <p className="text-base text-blue-900">{booking.notes}</p>
                                </div>
                              )}

                              {/* Call Status Progress */}
                              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-purple-900">Call Status</p>
                                  <span className="text-sm font-bold text-purple-700">{booking.status === 'completed' ? '100%' : booking.status === 'confirmed' ? '75%' : booking.status === 'pending' ? '25%' : '0%'}</span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden border border-purple-300">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: booking.status === 'completed' ? '100%' : 
                                             booking.status === 'confirmed' ? '75%' : 
                                             booking.status === 'pending' ? '25%' : '0%'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-3 bg-white">
                              <select
                                value={booking.status}
                                onChange={(e) => handleVoiceBookingStatusChange(booking.id, e.target.value)}
                                className="w-full px-4 py-3 md:py-3.5 text-base font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white hover:border-gray-400 transition-colors cursor-pointer"
                              >
                                <option value="pending">⏱ Mark as Pending</option>
                                <option value="confirmed">✓ Mark as Confirmed</option>
                                <option value="completed">✓✓ Mark as Completed</option>
                                <option value="no-show">✗ Mark as No-Show</option>
                                <option value="cancelled">⊘ Mark as Cancelled</option>
                              </select>

                              <button
                                className="w-full px-4 py-4 md:py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 transition-all shadow-sm hover:shadow-md"
                              >
                                📞 Call Customer
                              </button>

                              <button
                                className="w-full px-4 py-3 md:py-3.5 text-base font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all"
                              >
                                📄 View Full Details
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-16 md:py-24 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <p className="text-3xl mb-3">🎤</p>
                    <p className="text-2xl font-bold text-gray-700">No voice bookings</p>
                    <p className="text-base text-gray-500 mt-2">New voice bookings will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Web Bookings Calendar View - Modern Design */}
          {bookingType === 'web' && viewType === 'calendar' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold text-sm md:text-base text-gray-700 py-3 uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {[...Array(35)].map((_, idx) => {
                  const date = new Date(2026, 2, idx - 9) // March 2026
                  const dateStr = date.toISOString().split('T')[0]
                  const dayBookings = bookings.filter(b => b.date === dateStr)
                  const isCurrentDay = idx >= 9 && idx < 31

                  if (!isCurrentDay) {
                    return <div key={idx} className="aspect-square" />
                  }

                  return (
                    <div
                      key={idx}
                      className={`aspect-square p-2 md:p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer hover:shadow-md ${
                        dayBookings.length > 0
                          ? 'border-hvac-orange bg-gradient-to-br from-orange-50 to-orange-100 font-bold'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-base md:text-lg font-bold text-hvac-darkgray">{date.getDate()}</div>
                      {dayBookings.length > 0 && (
                        <div className="text-xs md:text-sm font-bold text-hvac-orange mt-1 bg-white px-2 py-0.5 rounded-full">
                          {dayBookings.length} {dayBookings.length === 1 ? 'booking' : 'bookings'}
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

      {/* Refund Modal - Modern & Accessible */}
      {refundModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl">
            <div className="px-5 md:px-7 py-8 md:py-10">
              <h2 className="text-4xl md:text-5xl font-bold text-hvac-darkgray mb-8">Process Refund</h2>

              <div className="mb-8 space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Customer</p>
                  <p className="text-xl font-bold text-hvac-darkgray">{selectedBooking.customerName}</p>
                </div>

                {/* Appointment Date */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Appointment Date</p>
                  <p className="text-xl font-bold text-hvac-darkgray">{formatDate(selectedBooking.date)}</p>
                </div>

                {/* Deposit Amount */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-300">
                  <p className="text-xs uppercase tracking-wider font-semibold text-green-900 mb-2">Original Deposit</p>
                  <p className="text-5xl font-bold text-green-600">{formatCurrency(150)}</p>
                </div>

                {/* Refund Amount Selection */}
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-700 mb-4">Select Refund Amount</p>
                  <div className="space-y-3">
                    {/* Option 1: With Fee */}
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all touch-manipulation ${
                      refundAmount === 145
                        ? 'border-hvac-orange bg-orange-50'
                        : 'border-gray-300 bg-white hover:border-hvac-orange'
                    }`}>
                      <input
                        type="radio"
                        checked={refundAmount === 145}
                        onChange={() => setRefundAmount(145)}
                        className="w-5 h-5 mr-4 cursor-pointer"
                      />
                      <span className="flex-grow">
                        <span className="text-xl font-bold text-hvac-orange">{formatCurrency(145)}</span>
                        <span className="text-sm text-gray-600 block">Minus $5 processing fee</span>
                      </span>
                    </label>

                    {/* Option 2: Full Refund */}
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all touch-manipulation ${
                      refundAmount === 150
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-green-600'
                    }`}>
                      <input
                        type="radio"
                        checked={refundAmount === 150}
                        onChange={() => setRefundAmount(150)}
                        className="w-5 h-5 mr-4 cursor-pointer"
                      />
                      <span className="flex-grow">
                        <span className="text-xl font-bold text-green-600">{formatCurrency(150)}</span>
                        <span className="text-sm text-gray-600 block">Full refund (no fees)</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setRefundModalOpen(false)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRefund(selectedBooking.id)}
                  className="w-full px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 transition-all shadow-md hover:shadow-lg"
                >
                  💰 Process Refund {formatCurrency(refundAmount)}
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
