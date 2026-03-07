import { useState, useRef } from 'react'
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
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'in-contractor-pipeline' | 'completed-not-in-pipeline' | 'no-show' | 'cancelled'
  assignedTo?: string
  contractor_assigned?: string
  progression_path?: 'progressed' | 'not_progressed'
}

// Hardcoded team members for colleague assignment
const TEAM_MEMBERS = [
  { id: 'tm1', name: 'John Smith', role: 'Lead Technician' },
  { id: 'tm2', name: 'Sarah Johnson', role: 'Technician' },
  { id: 'tm3', name: 'Mike Davis', role: 'Technician' },
  { id: 'tm4', name: 'Lisa Chen', role: 'Service Manager' }
]

// Status badge color map
const statusColorMap = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: '⏱', buttonText: 'Confirm Job', buttonBg: 'bg-gray-400 hover:bg-gray-500' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '✓', buttonText: 'Confirmed', buttonBg: 'bg-green-500 hover:bg-green-600' },
  'in-progress': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: '⚡', buttonText: 'In Progress', buttonBg: 'bg-orange-500 hover:bg-orange-600' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: '🔍', buttonText: 'Inspected', buttonBg: 'bg-blue-500 cursor-not-allowed opacity-75' },
  'in-contractor-pipeline': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '✓✓', buttonText: 'In Pipeline', buttonBg: 'bg-green-500 cursor-not-allowed opacity-75' },
  'completed-not-in-pipeline': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: '✓', buttonText: 'Completed', buttonBg: 'bg-gray-500 cursor-not-allowed opacity-75' },
  'no-show': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '✗', buttonText: 'No-Show', buttonBg: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: '⊘', buttonText: 'Cancelled', buttonBg: 'bg-gray-400' }
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
  const [refundAmount, setRefundAmount] = useState(145)
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{ bookingId: string; newStatus: string } | null>(null)
  const [assignColleagueModal, setAssignColleagueModal] = useState<{ bookingId: string } | null>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; bookingId: string } | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [completionPathModal, setCompletionPathModal] = useState<{ bookingId: string } | null>(null)
  const [selectContractorModal, setSelectContractorModal] = useState<{ bookingId: string } | null>(null)
  
  // Helper function to get progress percentage for status
  const getProgressPercentage = (status: string) => {
    const progression = { pending: 25, confirmed: 50, 'in-progress': 75, completed: 100 }
    return progression[status as keyof typeof progression] || 0
  }

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

  // Get bookings for selected date in calendar view
  const dayViewBookings = selectedDate 
    ? bookings.filter(b => b.date === selectedDate).sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.time}`).getTime()
        const timeB = new Date(`2000-01-01T${b.time}`).getTime()
        return timeA - timeB
      })
    : []

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus as any } : b
    ))
  }

  const handleInteractiveStatusChange = (bookingId: string, currentStatus: string) => {
    if (currentStatus === 'pending') {
      setStatusConfirmDialog({ bookingId, newStatus: 'confirmed' })
    } else if (currentStatus === 'confirmed') {
      setStatusConfirmDialog({ bookingId, newStatus: 'confirmed' })
    } else if (currentStatus === 'in-progress') {
      setStatusConfirmDialog({ bookingId, newStatus: 'in-progress' })
    }
  }

  const handleStatusConfirm = (bookingId: string) => {
    const currentBooking = bookings.find(b => b.id === bookingId)
    if (!currentBooking) return

    let nextStatus = 'pending'
    if (currentBooking.status === 'pending') nextStatus = 'confirmed'
    else if (currentBooking.status === 'confirmed') nextStatus = 'in-progress'
    else if (currentBooking.status === 'in-progress') {
      // Show two-path completion dialog instead of directly completing
      setCompletionPathModal({ bookingId })
      setStatusConfirmDialog(null)
      return
    }

    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: nextStatus as any } : b
    ))
    setStatusConfirmDialog(null)
  }

  const handleStatusUnconfirm = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'pending' } : b
    ))
    setStatusConfirmDialog(null)
  }

  const handleCompletionPath = (bookingId: string, path: 'progressed' | 'not_progressed') => {
    const newStatus = path === 'progressed' ? 'in-contractor-pipeline' : 'completed-not-in-pipeline'
    
    if (path === 'progressed') {
      // Open contractor selection dialog
      setSelectContractorModal({ bookingId })
      setCompletionPathModal(null)
    } else {
      // Mark as completed not in pipeline
      setBookings(bookings.map(b => 
        b.id === bookingId 
          ? { ...b, status: newStatus as any, progression_path: path }
          : b
      ))
      setCompletionPathModal(null)
    }
  }

  const handleSelectContractor = (bookingId: string, contractorId: string) => {
    const contractor = TEAM_MEMBERS.find(tm => tm.id === contractorId)
    if (!contractor) return

    setBookings(bookings.map(b => 
      b.id === bookingId 
        ? { 
            ...b, 
            status: 'in-contractor-pipeline', 
            progression_path: 'progressed',
            contractor_assigned: contractor.name 
          } 
        : b
    ))
    setSelectContractorModal(null)
  }

  const handleAssignColleague = (bookingId: string, colleagueId: string) => {
    const colleague = TEAM_MEMBERS.find(tm => tm.id === colleagueId)
    if (!colleague) return

    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, assignedTo: colleague.name } : b
    ))
    setAssignColleagueModal(null)
  }

  const handleTouchStart = (e: React.TouchEvent, bookingId: string) => {
    setTouchStart({ x: e.touches[0].clientX, bookingId })
  }

  const handleTouchEnd = (e: React.TouchEvent, bookingId: string) => {
    if (!touchStart || touchStart.bookingId !== bookingId) return

    const endX = e.changedTouches[0].clientX
    const diff = touchStart.x - endX

    if (diff > 50) {
      const booking = bookings.find(b => b.id === bookingId)
      if (booking && booking.status === 'confirmed') {
        handleStatusChange(bookingId, 'in-progress')
      }
    }

    setTouchStart(null)
  }

  const handleVoiceBookingStatusChange = (bookingId: string, newStatus: string) => {
    setVoiceBookings(voiceBookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus as any } : b
    ))
  }

  const handleRefund = async (bookingId: string) => {
    console.log(`Refunding ${formatCurrency(refundAmount)} for booking ${bookingId}`)
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ))
    setRefundModalOpen(false)
    setSelectedBooking(null)
  }

  // Calculate enhanced metrics
  const webBookings = bookings.length
  const voiceBookingsCount = voiceBookings.length
  const totalBookings = webBookings + voiceBookingsCount

  const webUpcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
  const voiceUpcomingCount = voiceBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
  const upcomingCount = webUpcomingCount + voiceUpcomingCount

  const totalDeposits = bookings.filter(b => b.depositPaid).length * 150

  const jobsInProgress = bookings.filter(b => b.status === 'in-progress').length + voiceBookings.filter(b => b.status === 'in-progress').length
  const jobsCompleted = bookings.filter(b => b.status === 'completed').length + voiceBookings.filter(b => b.status === 'completed').length

  // Contractor pipeline metrics (simulate with 40% of confirmed jobs)
  const jobsInContractorPipeline = Math.ceil(bookings.filter(b => b.status === 'confirmed').length * 0.4)

  // Status breakdown
  const statusBreakdown = {
    pending: bookings.filter(b => b.status === 'pending').length + voiceBookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length + voiceBookings.filter(b => b.status === 'confirmed').length,
    inProgress: jobsInProgress,
    completed: jobsCompleted
  }

  // Calculate percentages for charts
  const totalForPercent = totalBookings || 1
  const webPercentage = Math.round((webBookings / totalForPercent) * 100)
  const voicePercentage = Math.round((voiceBookingsCount / totalForPercent) * 100)
  
  const statusTotalForPercent = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1
  const pendingPercentage = Math.round((statusBreakdown.pending / statusTotalForPercent) * 100)
  const confirmedPercentage = Math.round((statusBreakdown.confirmed / statusTotalForPercent) * 100)
  const inProgressPercentage = Math.round((statusBreakdown.inProgress / statusTotalForPercent) * 100)
  const completedPercentage = Math.round((statusBreakdown.completed / statusTotalForPercent) * 100)

  // Contractor pipeline health (0-100%)
  const contractorPipelineHealth = jobsInContractorPipeline > 0 ? 65 : 0

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hvac-darkgray mb-3 leading-tight">Booking Management</h1>
            <p className="text-base md:text-lg text-gray-600 font-medium">Manage your customer bookings from web and voice channels</p>
          </div>

          {/* Primary Metrics - Large Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Total Bookings */}
            <div className="lg:col-span-1 bg-gradient-to-br from-hvac-darkgray to-gray-800 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-90">Total Bookings</p>
                <p className="text-5xl md:text-6xl font-bold mt-4 leading-tight">{totalBookings}</p>
              </div>
              <p className="text-xs md:text-sm mt-4 opacity-80">{webBookings} web • {voiceBookingsCount} voice</p>
            </div>

            {/* Upcoming */}
            <div className="bg-gradient-to-br from-hvac-orange to-orange-600 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-90">Upcoming (Pending + Confirmed)</p>
                <p className="text-5xl md:text-6xl font-bold mt-4 leading-tight">{upcomingCount}</p>
              </div>
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all" 
                  style={{ width: `${totalBookings > 0 ? (upcomingCount / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Jobs In Progress */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-90">Jobs In Progress</p>
                <p className="text-5xl md:text-6xl font-bold mt-4 leading-tight">{jobsInProgress}</p>
              </div>
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all" 
                  style={{ width: `${totalBookings > 0 ? (jobsInProgress / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Jobs Completed */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-90">Jobs Completed (Total)</p>
                <p className="text-5xl md:text-6xl font-bold mt-4 leading-tight">{jobsCompleted}</p>
              </div>
              <p className="text-xs md:text-sm mt-4 opacity-80">Web & Voice combined</p>
            </div>

            {/* Contractor Pipeline */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-90">In Contractor Pipeline</p>
                <p className="text-5xl md:text-6xl font-bold mt-4 leading-tight">{jobsInContractorPipeline}</p>
              </div>
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all" 
                  style={{ width: `${contractorPipelineHealth}%` }}
                ></div>
              </div>
            </div>

            {/* Deposits Collected */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-90">Deposits Collected</p>
                <p className="text-4xl md:text-5xl font-bold mt-4 leading-tight">{formatCurrency(totalDeposits)}</p>
              </div>
              <p className="text-xs md:text-sm mt-4 opacity-80">{bookings.filter(b => b.depositPaid).length} paid</p>
            </div>
          </div>

          {/* Breakdown Cards - Secondary Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            {/* Voice vs Web Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg md:text-xl font-bold text-hvac-darkgray mb-6">📊 Voice vs Web Bookings</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base font-semibold text-gray-700">🌐 Web</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">{webBookings}</p>
                  </div>
                  <div className="h-3 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${webPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{webPercentage}% of total</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base font-semibold text-gray-700">🎤 Voice</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">{voiceBookingsCount}</p>
                  </div>
                  <div className="h-3 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                      style={{ width: `${voicePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{voicePercentage}% of total</p>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg md:text-xl font-bold text-hvac-darkgray mb-6">🎯 Status Breakdown</h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base font-semibold text-gray-700">⏱ Pending</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-600">{statusBreakdown.pending}</p>
                  </div>
                  <div className="h-2.5 bg-yellow-100 rounded-full overflow-hidden border border-yellow-200">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${pendingPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pendingPercentage}%</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base font-semibold text-gray-700">✓ Confirmed</p>
                    <p className="text-lg md:text-xl font-bold text-green-600">{statusBreakdown.confirmed}</p>
                  </div>
                  <div className="h-2.5 bg-green-100 rounded-full overflow-hidden border border-green-200">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${confirmedPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{confirmedPercentage}%</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base font-semibold text-gray-700">⚡ In Progress</p>
                    <p className="text-lg md:text-xl font-bold text-orange-600">{statusBreakdown.inProgress}</p>
                  </div>
                  <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden border border-orange-200">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${inProgressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{inProgressPercentage}%</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base font-semibold text-gray-700">✓✓ Completed</p>
                    <p className="text-lg md:text-xl font-bold text-emerald-600">{statusBreakdown.completed}</p>
                  </div>
                  <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${completedPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{completedPercentage}%</p>
                </div>
              </div>
            </div>

            {/* Contractor Pipeline Health */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg md:text-xl font-bold text-hvac-darkgray mb-6">🔧 Pipeline Health</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm md:text-base font-semibold text-blue-900">Overall Health</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-600">{contractorPipelineHealth}%</p>
                  </div>
                  <div className="h-4 bg-white rounded-full overflow-hidden border-2 border-blue-300">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${contractorPipelineHealth}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📦</span>
                    <div className="flex-grow">
                      <p className="text-xs md:text-sm text-gray-600">In Pipeline</p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-600">{jobsInContractorPipeline}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div className="flex-grow">
                      <p className="text-xs md:text-sm text-gray-600">Completed</p>
                      <p className="text-2xl md:text-3xl font-bold text-green-600">{jobsCompleted}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-grow">
                      <p className="text-xs md:text-sm text-gray-600">Status</p>
                      <p className="text-lg md:text-xl font-bold text-gray-700">{contractorPipelineHealth > 50 ? '✓ Healthy' : '⚠️ Needs Attention'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-7 mb-10 shadow-sm">
            {/* Booking Type Selector */}
            <div className="mb-7 pb-7 border-b border-gray-200">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">Booking Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBookingType('web')}
                  className={`px-4 py-3.5 md:py-4 rounded-xl font-bold text-base transition-all touch-manipulation min-h-[44px] ${
                    bookingType === 'web'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-150 active:bg-gray-200'
                  }`}
                >
                  🌐 Web
                </button>
                <button
                  onClick={() => setBookingType('voice')}
                  className={`px-4 py-3.5 md:py-4 rounded-xl font-bold text-base transition-all touch-manipulation min-h-[44px] ${
                    bookingType === 'voice'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-150 active:bg-gray-200'
                  }`}
                >
                  🎤 Voice
                </button>
              </div>
            </div>

            {/* View Type Selector */}
            {bookingType === 'web' && (
              <div className="mb-7 pb-7 border-b border-gray-200">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">View Mode</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setViewType('list')}
                    className={`px-4 py-3.5 rounded-xl font-bold text-base transition-all touch-manipulation min-h-[44px] ${
                      viewType === 'list'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-150 active:bg-gray-200'
                    }`}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setViewType('calendar')}
                    className={`px-4 py-3.5 rounded-xl font-bold text-base transition-all touch-manipulation min-h-[44px] ${
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
                className="w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hvac-orange focus:border-hvac-orange bg-white hover:border-gray-400 transition-colors cursor-pointer min-h-[44px]"
              >
                <option value="all">📊 All Status</option>
                <option value="pending">⏱ Pending</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="completed">✓✓ Completed</option>
                <option value="no-show">✗ No-Show</option>
                <option value="cancelled">⊘ Cancelled</option>
              </select>

              {/* Sort Order */}
              {bookingType === 'voice' && (
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white hover:border-gray-400 transition-colors cursor-pointer min-h-[44px]"
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
                      className="w-full px-5 md:px-7 py-5 md:py-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors touch-manipulation min-h-[60px]"
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
                        <h3 className="text-xl md:text-2xl font-bold text-hvac-darkgray mb-1 break-words">
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
                            className="w-full px-4 py-3 md:py-3.5 text-base font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white hover:border-gray-400 transition-colors cursor-pointer min-h-[44px]"
                          >
                            <option value="pending">⏱ Mark as Pending</option>
                            <option value="confirmed">✓ Mark as Confirmed</option>
                            <option value="completed">✓✓ Mark as Completed</option>
                            <option value="no-show">✗ Mark as No-Show</option>
                          </select>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking)
                                setRefundAmount(145)
                                setRefundModalOpen(true)
                              }}
                              className="px-4 py-3 md:py-3.5 text-base font-semibold bg-red-50 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-100 active:bg-red-200 transition-all min-h-[44px]"
                            >
                              💰 Process Refund
                            </button>

                            <button
                              className="px-4 py-3 md:py-3.5 text-base font-semibold bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-all min-h-[44px]"
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

          {/* Voice Bookings List View */}
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
                        {/* Card Header */}
                        <button
                          onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                          className="w-full px-5 md:px-7 py-5 md:py-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors touch-manipulation min-h-[60px]"
                        >
                          <div className="flex-grow min-w-0">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border-2`}>
                                <span className="text-base">{statusConfig.icon}</span>
                                <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                              </span>
                            </div>

                            {/* Customer Name */}
                            <h3 className="text-xl md:text-2xl font-bold text-hvac-darkgray mb-2 break-words leading-tight">
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

                        {/* Expandable Details */}
                        {isExpanded && (
                          <>
                            <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-5 bg-gray-50">
                              {/* Contact Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Phone</p>
                                  <p className="text-lg md:text-xl font-bold text-hvac-darkgray font-mono break-all">{booking.customerPhone}</p>
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
                                className="w-full px-4 py-3 md:py-3.5 text-base font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white hover:border-gray-400 transition-colors cursor-pointer min-h-[44px]"
                              >
                                <option value="pending">⏱ Mark as Pending</option>
                                <option value="confirmed">✓ Mark as Confirmed</option>
                                <option value="completed">✓✓ Mark as Completed</option>
                                <option value="no-show">✗ Mark as No-Show</option>
                                <option value="cancelled">⊘ Mark as Cancelled</option>
                              </select>

                              <button
                                className="w-full px-4 py-4 md:py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 transition-all shadow-sm hover:shadow-md min-h-[44px]"
                              >
                                📞 Call Customer
                              </button>

                              <button
                                className="w-full px-4 py-3 md:py-3.5 text-base font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all min-h-[44px]"
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

          {/* Web Bookings Calendar View */}
          {bookingType === 'web' && viewType === 'calendar' && (
            <div className="space-y-6">
              {/* Calendar Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-hvac-darkgray mb-6">Select a Date</h2>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-xs md:text-sm text-gray-600 py-3 uppercase tracking-wide">
                      {day.charAt(0)}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {[...Array(35)].map((_, idx) => {
                    const date = new Date(2026, 2, idx - 9)
                    const dateStr = date.toISOString().split('T')[0]
                    const dayBookings = bookings.filter(b => b.date === dateStr)
                    const isCurrentDay = idx >= 9 && idx < 31
                    const isSelected = selectedDate === dateStr

                    if (!isCurrentDay) {
                      return <div key={idx} className="aspect-square" />
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`aspect-square p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-sm font-bold touch-manipulation min-h-[44px] ${
                          isSelected
                            ? 'border-hvac-orange bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg'
                            : dayBookings.length > 0
                            ? 'border-hvac-orange bg-gradient-to-br from-orange-50 to-orange-100 text-hvac-darkgray hover:shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div>{date.getDate()}</div>
                        {dayBookings.length > 0 && (
                          <div className={`text-xs mt-0.5 font-bold ${isSelected ? 'text-orange-100' : 'text-hvac-orange'}`}>
                            {dayBookings.length}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Day View Section */}
              {selectedDate && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300 p-6 md:p-8 shadow-md">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-2">
                      📅 {formatDate(selectedDate)}
                    </h2>
                    <p className="text-lg text-gray-700">
                      {dayViewBookings.length} appointment{dayViewBookings.length !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>

                  {dayViewBookings.length > 0 ? (
                    <div className="space-y-4">
                      {dayViewBookings.map(booking => {
                        const statusConfig = statusColorMap[booking.status as keyof typeof statusColorMap] || statusColorMap.pending
                        const serviceIcon = serviceIcons[booking.serviceType] || '⚙'
                        
                        return (
                          <div
                            key={booking.id}
                            onTouchStart={(e) => handleTouchStart(e, booking.id)}
                            onTouchEnd={(e) => handleTouchEnd(e, booking.id)}
                            className="bg-white rounded-2xl border-2 border-gray-300 p-5 md:p-6 shadow-sm hover:shadow-md transition-all"
                          >
                            {/* Appointment Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-3xl">{serviceIcon}</span>
                                  <div>
                                    <p className="text-sm text-gray-600">⏰ {booking.time}</p>
                                    <p className="text-2xl md:text-3xl font-bold text-hvac-darkgray">
                                      {booking.customerName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border-2 whitespace-nowrap`}>
                                <span>{statusConfig.icon}</span>
                                <span>{booking.status.replace('-', ' ').toUpperCase()}</span>
                              </span>
                            </div>

                            {/* Service Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm md:text-base">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 font-semibold">Service Type</p>
                                <p className="font-bold text-gray-800">{booking.serviceType.replace('-', ' ')}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 font-semibold">📞 Phone</p>
                                <p className="font-bold text-gray-800 font-mono break-all">{booking.customerPhone}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 font-semibold">Deposit</p>
                                <p className="font-bold text-green-600">{formatCurrency(booking.depositAmount)}</p>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                              <p className="text-xs text-blue-700 font-semibold">📍 Address</p>
                              <p className="text-blue-900 font-medium">{booking.customerAddress}</p>
                            </div>

                            {/* Progress Indicator */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-700 uppercase">Progress</p>
                                <p className="text-sm font-bold text-gray-700">{getProgressPercentage(booking.status)}%</p>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div 
                                  className="h-full bg-gradient-to-r from-hvac-orange to-orange-500 rounded-full transition-all duration-300"
                                  style={{ width: `${getProgressPercentage(booking.status)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-2 text-xs text-gray-600 font-semibold">
                                <span>Pending</span>
                                <span>Confirmed</span>
                                <span>In Progress</span>
                                <span>Complete</span>
                              </div>
                            </div>

                            {/* Assigned To */}
                            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-700 font-semibold mb-1">👤 Assigned To</p>
                              <p className="text-purple-900 font-bold">
                                {booking.assignedTo || 'Unassigned'}
                              </p>
                            </div>

                            {/* Interactive Status Button & Actions */}
                            <div className="space-y-3">
                              {/* Interactive Status Button */}
                              {booking.status !== 'completed' && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleInteractiveStatusChange(booking.id, booking.status)}
                                    className={`flex-1 px-4 py-4 md:py-5 rounded-xl font-bold text-lg text-white transition-all shadow-md hover:shadow-lg active:shadow-sm touch-manipulation min-h-[44px] ${statusConfig.buttonBg}`}
                                  >
                                    {booking.status === 'pending' && '✓ Confirm Job'}
                                    {booking.status === 'confirmed' && '➜ Swipe → for Progress'}
                                    {booking.status === 'in-progress' && '✓ Mark Complete'}
                                  </button>
                                </div>
                              )}

                              {/* Assign Colleague Button */}
                              <button
                                onClick={() => setAssignColleagueModal({ bookingId: booking.id })}
                                className="w-full px-4 py-3 md:py-4 bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 rounded-xl font-bold transition-all border-2 border-purple-300 touch-manipulation min-h-[44px]"
                              >
                                👤 Assign to Colleague
                              </button>

                              {/* Edit & Details Buttons */}
                              <div className="grid grid-cols-2 gap-3">
                                <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all border border-gray-300 text-sm md:text-base touch-manipulation min-h-[44px]">
                                  📄 Full Details
                                </button>
                                <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all border border-gray-300 text-sm md:text-base touch-manipulation min-h-[44px]">
                                  ✏️ Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-blue-300">
                      <p className="text-3xl mb-2">📭</p>
                      <p className="text-lg font-bold text-gray-700">No appointments scheduled</p>
                      <p className="text-sm text-gray-600">Pick another date or create a new booking</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Status Confirmation Dialog */}
      {statusConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl animate-in">
            <div className="px-5 md:px-7 py-8 md:py-10">
              <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-6">
                {(() => {
                  const booking = bookings.find(b => b.id === statusConfirmDialog.bookingId)
                  if (!booking) return 'Action'
                  if (booking.status === 'pending') return '✓ Confirm Job?'
                  if (booking.status === 'confirmed') return '✗ Unconfirm Job?'
                  if (booking.status === 'in-progress') return '✓ Mark as Complete?'
                  return 'Status Update'
                })()}
              </h2>

              <div className="mb-8 space-y-3">
                {(() => {
                  const booking = bookings.find(b => b.id === statusConfirmDialog.bookingId)
                  if (!booking) return null
                  
                  if (booking.status === 'pending') {
                    return (
                      <>
                        <p className="text-base text-gray-700 mb-4">Ready to confirm this job with {booking.customerName}?</p>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-300">
                          <p className="text-sm text-blue-700 font-semibold">⏰ Appointment</p>
                          <p className="text-lg font-bold text-blue-900">{formatDate(booking.date)} at {booking.time}</p>
                        </div>
                      </>
                    )
                  } else if (booking.status === 'confirmed') {
                    return (
                      <p className="text-base text-gray-700">This will return the job to pending status. Continue?</p>
                    )
                  } else if (booking.status === 'in-progress') {
                    return (
                      <>
                        <p className="text-base text-gray-700 mb-4">Mark this job as complete for {booking.customerName}?</p>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300">
                          <p className="text-sm text-green-700 font-semibold">✓ Work Status</p>
                          <p className="text-lg font-bold text-green-900">Ready to close out this appointment</p>
                        </div>
                      </>
                    )
                  }
                  return null
                })()}
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStatusConfirmDialog(null)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusConfirm(statusConfirmDialog.bookingId)}
                  className="w-full px-4 py-4 bg-gradient-to-r from-hvac-orange to-orange-600 text-white rounded-xl font-bold text-base hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 transition-all shadow-md hover:shadow-lg touch-manipulation min-h-[44px]"
                >
                  ✓ Confirm
                </button>

                {(() => {
                  const booking = bookings.find(b => b.id === statusConfirmDialog.bookingId)
                  if (booking?.status === 'confirmed') {
                    return (
                      <button
                        onClick={() => handleStatusUnconfirm(statusConfirmDialog.bookingId)}
                        className="w-full px-4 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-base hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all shadow-md hover:shadow-lg touch-manipulation min-h-[44px]"
                      >
                        ✗ Unconfirm
                      </button>
                    )
                  }
                  return null
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-Path Completion Dialog */}
      {completionPathModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl animate-in">
            <div className="px-5 md:px-7 py-8 md:py-10">
              <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-6">Job Completion Path</h2>
              <p className="text-lg text-gray-700 mb-8">Choose how to proceed with this completed job:</p>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleCompletionPath(completionPathModal.bookingId, 'progressed')}
                  className="w-full p-5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 active:from-green-200 active:to-green-300 rounded-xl border-3 border-green-400 transition-all text-left touch-manipulation"
                >
                  <p className="text-xl font-bold text-green-900 mb-2">✓ Assign to Contractor Work</p>
                  <p className="text-sm text-green-700">Job progresses to contractor pipeline</p>
                </button>

                <button
                  onClick={() => handleCompletionPath(completionPathModal.bookingId, 'not_progressed')}
                  className="w-full p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300 rounded-xl border-3 border-gray-400 transition-all text-left touch-manipulation"
                >
                  <p className="text-xl font-bold text-gray-900 mb-2">✓ Complete, Not Progressing</p>
                  <p className="text-sm text-gray-700">Job is closed out, no further work</p>
                </button>
              </div>

              <button
                onClick={() => setCompletionPathModal(null)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Contractor Dialog */}
      {selectContractorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl animate-in">
            <div className="px-5 md:px-7 py-8 md:py-10">
              <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-6">👤 Assign to Contractor</h2>
              <p className="text-lg text-gray-700 mb-6">Select a contractor for this job:</p>

              <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
                {TEAM_MEMBERS.map(contractor => (
                  <button
                    key={contractor.id}
                    onClick={() => handleSelectContractor(selectContractorModal.bookingId, contractor.id)}
                    className="w-full p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 active:from-indigo-200 active:to-indigo-300 rounded-xl border-2 border-indigo-300 transition-all text-left touch-manipulation"
                  >
                    <p className="text-lg font-bold text-indigo-900">{contractor.name}</p>
                    <p className="text-sm text-indigo-700">{contractor.role}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectContractorModal(null)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Colleague Modal */}
      {assignColleagueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl animate-in">
            <div className="px-5 md:px-7 py-8 md:py-10">
              <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-6">👤 Assign to Colleague</h2>

              <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
                {TEAM_MEMBERS.map(colleague => (
                  <button
                    key={colleague.id}
                    onClick={() => handleAssignColleague(assignColleagueModal.bookingId, colleague.id)}
                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 active:from-purple-200 active:to-purple-300 rounded-xl border-2 border-purple-300 transition-all text-left touch-manipulation min-h-[56px]"
                  >
                    <p className="text-lg font-bold text-purple-900">{colleague.name}</p>
                    <p className="text-sm text-purple-700">{colleague.role}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setAssignColleagueModal(null)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
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
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all touch-manipulation min-h-[56px] ${
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
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all touch-manipulation min-h-[56px] ${
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
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRefund(selectedBooking.id)}
                  className="w-full px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 transition-all shadow-md hover:shadow-lg touch-manipulation min-h-[44px]"
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
