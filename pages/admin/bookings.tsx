import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { SAMPLE_BOOKINGS } from '@/lib/bookingData'
import { SAMPLE_VOICE_BOOKINGS, VoiceBooking, VOICE_SERVICE_TYPES } from '@/lib/voiceBookingData'
import { getStatusColor, formatDate, formatCurrency, getHoursUntilAppointment } from '@/lib/bookingManagement'
import { CONTRACTORS, getContractorById } from '@/lib/contractors'
import { sendContractorAssignmentSMS, sendCustomerStatusUpdateSMS } from '@/lib/smsHelper'

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
  sms_sent_statuses?: string[] // Track which statuses have had SMS sent to prevent duplicates
}

// Hardcoded team members for colleague assignment
const TEAM_MEMBERS = [
  { id: 'tm1', name: 'John Smith', role: 'Lead Technician', phone: '+14155552671' },
  { id: 'tm2', name: 'Sarah Johnson', role: 'Technician', phone: '+14155552672' },
  { id: 'tm3', name: 'Mike Davis', role: 'Technician', phone: '+14155552673' },
  { id: 'tm4', name: 'Lisa Chen', role: 'Service Manager', phone: '+14155552674' }
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
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null)
  const [smsState, setSmsState] = useState<{ loading: boolean; error?: string; bookingId?: string } | null>(null)
  const [smsHistory, setSmsHistory] = useState<Record<string, any[]>>({})
  const [loadingSMSHistory, setLoadingSMSHistory] = useState<Record<string, boolean>>({})
  const [resendingSMS, setResendingSMS] = useState<Record<string, boolean>>({})
  
  // Load real voice bookings from Supabase
  useEffect(() => {
    const fetchVoiceBookings = async () => {
      try {
        const response = await fetch('/api/admin/voice-bookings')
        const data = await response.json()
        
        if (data.success && data.bookings) {
          // Convert Supabase data to VoiceBooking format
          const convertedBookings = data.bookings.map((booking: any) => ({
            id: booking.id,
            call_sid: booking.call_sid,
            serviceType: booking.service_type || 'AC repair',
            customerName: booking.customer_name || 'Unknown',
            customerPhone: booking.customer_phone || '',
            serviceAddress: booking.service_address || '',
            preferredTime: booking.preferred_time || '',
            date: new Date(booking.created_at).toISOString().split('T')[0],
            status: 'pending' as const,
            customerEmail: '',
            notes: '',
            contractor_assigned: booking.contractor_assigned || undefined
          }))
          
          setVoiceBookings(convertedBookings)
        }
      } catch (error) {
        console.error('Failed to fetch voice bookings:', error)
      }
    }
    
    fetchVoiceBookings()
  }, [])
  
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

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) return

    // Check if SMS has already been sent for this status
    const sentStatuses = booking.sms_sent_statuses || []
    const smsSentForThisStatus = sentStatuses.includes(newStatus)

    if (smsSentForThisStatus) {
      console.log(`⚠️ SMS already sent for status '${newStatus}' on booking ${bookingId}`)
    }

    // Update UI first - add new status to sms_sent_statuses to track it
    setBookings(bookings.map(b => 
      b.id === bookingId ? { 
        ...b, 
        status: newStatus as any,
        sms_sent_statuses: smsSentForThisStatus ? (b.sms_sent_statuses || []) : [...(b.sms_sent_statuses || []), newStatus]
      } : b
    ))

    // Send SMS notifications for status changes (only if not already sent)
    if (!smsSentForThisStatus) {
      try {
        if (newStatus === 'confirmed') {
          // Send confirmation SMS to customer
          await sendCustomerStatusUpdateSMS(
            booking.customerPhone,
            newStatus,
            booking.customerAddress,
            undefined,
            booking.customerName,
            bookingId
          )
          console.log(`✅ Sent confirmation SMS to customer for booking ${bookingId}`)
        } else if (newStatus === 'in-progress') {
          // Send SMS to customer
          await sendCustomerStatusUpdateSMS(
            booking.customerPhone,
            newStatus,
            booking.customerAddress,
            undefined,
            booking.customerName,
            bookingId
          )
          console.log(`✅ Sent in-progress SMS to customer for booking ${bookingId}`)
        } else if (newStatus === 'completed') {
          // Send SMS to customer
          await sendCustomerStatusUpdateSMS(
            booking.customerPhone,
            newStatus,
            booking.customerAddress,
            undefined,
            booking.customerName,
            bookingId
          )
          console.log(`✅ Sent completion SMS to customer for booking ${bookingId}`)
        } else if (newStatus === 'in-contractor-pipeline') {
          // Send needs review SMS to manager
          const manager = TEAM_MEMBERS.find(t => t.role === 'Service Manager')
          if (manager) {
            await sendSMS({
              recipientPhone: manager.phone,
              messageBody: `Job ready for review: ${booking.customerName} at ${booking.customerAddress}. Please check the admin portal.`,
              messageType: 'status_update',
              bookingId,
            })
            console.log(`✅ Sent needs-review SMS to manager for booking ${bookingId}`)
          }
        }
      } catch (error) {
        console.error('❌ Error sending SMS:', error)
      }
    }
  }

  /**
   * Helper function to send SMS
   */
  const sendSMS = async (payload: {
    recipientPhone: string
    messageBody: string
    messageType: string
    bookingId?: string
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/sms/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ SMS send error:', data.error)
        return { success: false, error: data.error }
      }

      console.log('✅ SMS sent successfully:', data.messageSid)
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Failed to send SMS:', errorMessage)
      return { success: false, error: errorMessage }
    }
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

  const handleStatusConfirm = async (bookingId: string) => {
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

    // Use handleStatusChange to ensure SMS is sent properly
    await handleStatusChange(bookingId, nextStatus)
    setStatusConfirmDialog(null)
  }

  const handleStatusUnconfirm = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'pending' } : b
    ))
    setStatusConfirmDialog(null)
  }

  const handleCompletionPath = async (bookingId: string, path: 'progressed' | 'not_progressed') => {
    const newStatus = path === 'progressed' ? 'in-contractor-pipeline' : 'completed-not-in-pipeline'
    
    if (path === 'progressed') {
      // Open contractor selection dialog
      setSelectContractorModal({ bookingId })
      setCompletionPathModal(null)
    } else {
      // Mark as completed not in pipeline - use handleStatusChange for SMS tracking
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        setBookings(bookings.map(b => 
          b.id === bookingId 
            ? { ...b, progression_path: path }
            : b
        ))
        await handleStatusChange(bookingId, newStatus)
      }
      setCompletionPathModal(null)
    }
  }

  const handleSelectContractor = async (bookingId: string, contractorId: string) => {
    const contractor = CONTRACTORS.find(c => c.id === contractorId)
    if (!contractor) return

    // Check if this is a voice booking or web booking
    const voiceBooking = voiceBookings.find(b => b.id === bookingId)
    const webBooking = bookings.find(b => b.id === bookingId)

    if (voiceBooking) {
      // Handle voice booking - save to Supabase
      try {
        const response = await fetch('/api/admin/assign-contractor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            contractorName: contractor.name
          })
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to assign contractor')
        }

        // Update local state
        setVoiceBookings(voiceBookings.map(b =>
          b.id === bookingId
            ? { ...b, contractor_assigned: contractor.name }
            : b
        ))

        // Update status to in-progress
        handleVoiceBookingStatusChange(bookingId, 'in-progress')

        setSelectContractorModal(null)

        // Send SMS notification to contractor
        const booking = voiceBooking
        await sendContractorAssignmentSMS(
          contractor.phone,
          booking.customerName,
          booking.serviceAddress,
          formatDate(booking.date),
          booking.preferredTime,
          bookingId
        )
      } catch (error) {
        console.error('Error assigning contractor:', error)
        alert('Failed to assign contractor. Please try again.')
      }
    } else if (webBooking) {
      // Handle web booking
      setBookings(bookings.map(b =>
        b.id === bookingId
          ? {
              ...b,
              progression_path: 'progressed',
              contractor_assigned: contractor.name
            }
          : b
      ))

      // Change status to in-contractor-pipeline using handleStatusChange for SMS tracking
      await handleStatusChange(bookingId, 'in-contractor-pipeline')
      setSelectContractorModal(null)

      // Send SMS notification to contractor
      await sendContractorAssignmentSMS(
        contractor.phone,
        webBooking.customerName,
        webBooking.customerAddress,
        formatDate(webBooking.date),
        webBooking.time,
        bookingId
      )
    }
  }

  /**
   * Send SMS notification to contractor when assigned to a job
   */
  const sendContractorAssignmentNotification = async (
    bookingId: string,
    contractorId: string,
    booking: Booking
  ) => {
    try {
      setSmsState({ loading: true, bookingId })

      const contractorData = getContractorById(contractorId)
      if (!contractorData) {
        throw new Error('Contractor not found')
      }

      // Format the appointment date and time
      const appointmentDate = formatDate(booking.date)
      const appointmentTime = booking.time

      // Send SMS using the smsHelper
      const result = await sendContractorAssignmentSMS(
        contractorData.phone,
        booking.customerName,
        booking.customerAddress,
        appointmentDate,
        appointmentTime,
        bookingId
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to send SMS')
      }

      // SMS sent successfully
      setSmsState({ loading: false, bookingId })
      
      // Show success message briefly
      setTimeout(() => {
        setSmsState(null)
      }, 3000)

      console.log(`✅ SMS sent to ${contractorData.name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send SMS'
      console.error(`❌ Error sending SMS: ${errorMessage}`)
      setSmsState({ loading: false, error: errorMessage, bookingId })
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSmsState(null)
      }, 5000)
    }
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

  const handleVoiceBookingStatusChange = async (bookingId: string, newStatus: string) => {
    const voiceBooking = voiceBookings.find(b => b.id === bookingId)
    if (!voiceBooking) return

    setVoiceBookings(voiceBookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus as any } : b
    ))

    // Send SMS notifications for status changes
    if (newStatus === 'in-progress') {
      // Send customer SMS
      await sendCustomerStatusUpdateSMS(
        voiceBooking.customerPhone,
        newStatus,
        voiceBooking.serviceAddress,
        undefined,
        voiceBooking.customerName,
        bookingId
      )
    } else if (newStatus === 'completed') {
      // Send customer SMS for completion
      await sendCustomerStatusUpdateSMS(
        voiceBooking.customerPhone,
        newStatus,
        voiceBooking.serviceAddress,
        undefined,
        voiceBooking.customerName,
        bookingId
      )
    }
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

      <main className="flex-grow w-full">
        <div className="container-max section-padding">
          {/* Page Header */}
          <div className="mb-10 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hvac-darkgray mb-3 leading-tight">Booking Management</h1>
            <p className="text-base md:text-lg text-gray-600 font-medium">Manage your customer bookings from web and voice channels</p>
          </div>

          {/* Essential Metrics - Simplified Top Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
              {/* Upcoming Jobs - PRIMARY METRIC */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 p-6 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs uppercase tracking-wider font-semibold text-orange-700 mb-2">Upcoming Jobs</p>
                <p className="text-5xl md:text-6xl font-bold text-orange-600 mb-3">{upcomingCount}</p>
                <p className="text-sm md:text-base text-orange-600 font-medium">Confirmed & Pending</p>
              </div>

              {/* In Progress - PRIMARY METRIC */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-300 p-6 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs uppercase tracking-wider font-semibold text-yellow-700 mb-2">In Progress</p>
                <p className="text-5xl md:text-6xl font-bold text-yellow-600 mb-3">{jobsInProgress}</p>
                <p className="text-sm md:text-base text-yellow-600 font-medium">Active jobs</p>
              </div>
            </div>

            {/* Details Button - Expandable Secondary Metrics */}
            <button
              onClick={() => setExpandedBookingId(expandedBookingId === 'metrics' ? null : 'metrics')}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-between"
            >
              <span>📊 Details</span>
              <span className="text-lg">{expandedBookingId === 'metrics' ? '▼' : '▶'}</span>
            </button>

            {/* Expandable Secondary Metrics */}
            {expandedBookingId === 'metrics' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {/* Total Bookings */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Total Bookings</p>
                  <p className="text-3xl font-bold text-hvac-darkgray">{totalBookings}</p>
                </div>

                {/* Completed */}
                <div className="bg-white rounded-lg border border-green-200 p-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{jobsCompleted}</p>
                </div>

                {/* New Clients - Web vs Voice */}
                <div className="bg-white rounded-lg border border-purple-200 p-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">New Clients</p>
                  <div className="flex gap-3">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{webBookings}</p>
                      <p className="text-xs text-gray-500">web</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{voiceBookingsCount}</p>
                      <p className="text-xs text-gray-500">voice</p>
                    </div>
                  </div>
                </div>

                {/* Web vs Voice Breakdown */}
                <div className="bg-white rounded-lg border border-blue-200 p-4 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">Channel Breakdown</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-blue-600 rounded-full" style={{ width: `${webPercentage}%` }}></div>
                      <span className="text-xs font-semibold text-gray-700">{webPercentage}% Web</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-purple-600 rounded-full" style={{ width: `${voicePercentage}%` }}></div>
                      <span className="text-xs font-semibold text-gray-700">{voicePercentage}% Voice</span>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-lg border border-indigo-200 p-4 sm:col-span-2 lg:col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-3">Status Breakdown</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="text-lg font-bold text-gray-700">{statusBreakdown.pending}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confirmed</p>
                      <p className="text-lg font-bold text-green-600">{statusBreakdown.confirmed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">In Progress</p>
                      <p className="text-lg font-bold text-yellow-600">{statusBreakdown.inProgress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-lg font-bold text-blue-600">{statusBreakdown.completed}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar - Clean & Simple */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setBookingType('web')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all touch-manipulation min-h-[40px] ${
                  bookingType === 'web'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌐 Web
              </button>
              <button
                onClick={() => setBookingType('voice')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all touch-manipulation min-h-[40px] ${
                  bookingType === 'voice'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎤 Voice
              </button>
            </div>

            {/* View Mode Toggle (Web only) */}
            {bookingType === 'web' && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setViewType('list')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all touch-manipulation min-h-[40px] ${
                    viewType === 'list'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📋 List View
                </button>
                <button
                  onClick={() => setViewType('calendar')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all touch-manipulation min-h-[40px] ${
                    viewType === 'calendar'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Calendar View
                </button>
              </div>
            )}

            {/* Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange focus:border-hvac-orange bg-white hover:border-gray-400 transition-colors cursor-pointer min-h-[40px]"
            >
              <option value="all">📊 All</option>
              <option value="pending">⏱ Pending</option>
              <option value="confirmed">✓ Confirmed</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="completed">✓✓ Completed</option>
            </select>

            {/* Sort (Voice only) */}
            {bookingType === 'voice' && (
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="w-full sm:w-auto px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white hover:border-gray-400 transition-colors cursor-pointer min-h-[40px]"
              >
                <option value="newest">📅 Newest</option>
                <option value="oldest">📅 Oldest</option>
              </select>
            )}
          </div>
          {/* Web Bookings List View */}
          {bookingType === 'web' && viewType === 'list' && (
            <div className="space-y-4">
              {filteredBookings.map(booking => {
                const statusConfig = statusColorMap[booking.status as keyof typeof statusColorMap] || statusColorMap.pending
                const isExpanded = expandedBookingId === booking.id
                const serviceIcon = serviceIcons[booking.serviceType] || '⚙'
                
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Card Header - New Hierarchy */}
                    <div className="px-5 md:px-7 py-5 md:py-6 space-y-4">
                      {/* First Row: Status Badge (left) + Service Type (center-right) */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Status Badge - Upper Left */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} flex-shrink-0`}>
                          <span>{statusConfig.icon}</span>
                          <span className="hidden sm:inline">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                        </span>
                        
                        {/* Service Type - Right Side */}
                        <div className="flex items-center gap-2 text-right flex-shrink-0">
                          <span className="text-lg">{serviceIcon}</span>
                          <span className="text-sm md:text-base font-semibold text-gray-700 capitalize hidden sm:inline">{booking.serviceType.replace('-', ' ')}</span>
                        </div>
                      </div>

                      {/* Second Row: Large Customer Name */}
                      <h3 className="text-2xl md:text-3xl font-bold text-hvac-darkgray break-words leading-tight">
                        {booking.customerName}
                      </h3>

                      {/* Third Row: Date + Time */}
                      <p className="text-base md:text-lg text-gray-700 font-medium">
                        📅 {formatDate(booking.date)} • {booking.time}
                      </p>

                      {/* Fourth Row: Address + Google Maps Button */}
                      <div className="flex items-start gap-3">
                        <div className="flex-grow min-w-0">
                          <p className="text-base text-gray-700 font-medium truncate">
                            📍 {booking.customerAddress}
                          </p>
                        </div>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(booking.customerAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="View on Google Maps"
                        >
                          🗺️
                        </a>
                      </div>

                      {/* Contractor Assignment Display */}
                      {booking.contractor_assigned && (
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-300">
                          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-700 mb-1">👤 Contractor Assigned</p>
                          <p className="text-base font-bold text-indigo-900">{booking.contractor_assigned}</p>
                        </div>
                      )}

                      {/* Fifth Row: Status Menu on Right + Expand Button */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                          className="flex-grow px-4 py-2.5 text-base font-semibold text-hvac-darkgray hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
                        >
                          {isExpanded ? '▼ Details' : '▶ Details'}
                        </button>

                        {/* Status Management Menu (⋯) - Hidden Menu */}
                        <div className="relative group">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                            className="px-3 py-2.5 text-xl font-bold hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                            title="Status options"
                          >
                            ⋯
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === booking.id && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-40">
                              <div className="p-2 space-y-1">
                                {['pending', 'confirmed', 'in-progress', 'completed', 'no-show', 'cancelled'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      handleStatusChange(booking.id, status)
                                      setOpenMenuId(null)
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all touch-manipulation ${
                                      booking.status === status
                                        ? 'bg-hvac-orange text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {statusColorMap[status as keyof typeof statusColorMap]?.icon} {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <>
                        <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-5 bg-gray-50">
                          {/* Contact Information Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Email</p>
                              <a href={`mailto:${booking.customerEmail}`} className="text-base text-blue-600 hover:underline font-medium break-all">
                                {booking.customerEmail}
                              </a>
                            </div>

                            {/* Phone */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Phone</p>
                              <a href={`tel:${booking.customerPhone}`} className="text-base text-blue-600 hover:underline font-medium">
                                {booking.customerPhone}
                              </a>
                            </div>
                          </div>

                          {/* Deposit Information */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300">
                            <p className="text-xs uppercase tracking-wider font-semibold text-green-900 mb-2">Deposit</p>
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(booking.depositAmount)}</p>
                            <p className="text-sm text-green-700 mt-2 font-semibold">{booking.depositPaid ? '✓ Paid' : '⏳ Pending Payment'}</p>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-3 bg-white">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => setAssignColleagueModal({ bookingId: booking.id })}
                              className="px-4 py-3 md:py-3.5 text-base font-semibold bg-purple-50 border-2 border-purple-300 text-purple-700 rounded-xl hover:bg-purple-100 active:bg-purple-200 transition-all min-h-[44px]"
                            >
                              👤 Assign
                            </button>

                            <button
                              className="px-4 py-3 md:py-3.5 text-base font-semibold bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-all min-h-[44px]"
                            >
                              📝 Notes
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBooking(booking)
                                setRefundAmount(145)
                                setRefundModalOpen(true)
                              }}
                              className="px-4 py-3 md:py-3.5 text-base font-semibold bg-red-50 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-100 active:bg-red-200 transition-all min-h-[44px]"
                            >
                              💰 Refund
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
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Card Header - Compact */}
                        <div className="px-4 py-3 space-y-2">
                          {/* Status + Service Type + Name Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-grow min-w-0">
                              <h3 className="text-lg font-bold text-hvac-darkgray truncate">
                                {booking.customerName}
                              </h3>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                              <span>{statusConfig.icon}</span>
                            </span>
                          </div>

                          {/* Date + Time + Service Type Row */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                            <span>📅 {formatDate(booking.date)}</span>
                            <span>•</span>
                            <span>⏰ {booking.preferredTime}</span>
                            <span>•</span>
                            <span>{serviceIcon} {VOICE_SERVICE_TYPES[booking.serviceType] || booking.serviceType}</span>
                          </div>

                          {/* Address + Maps */}
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="truncate flex-grow">📍 {booking.serviceAddress}</span>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(booking.serviceAddress)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 hover:bg-gray-100 rounded p-1 transition-colors"
                              title="View on Google Maps"
                            >
                              🗺️
                            </a>
                          </div>

                          {/* Contractor Assignment Display */}
                          {(booking as any).contractor_assigned && (
                            <div className="bg-indigo-50 rounded p-2 border border-indigo-200 text-xs">
                              <p className="text-indigo-900 font-semibold">👤 {(booking as any).contractor_assigned}</p>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={async () => {
                                const newExpandedState = isExpanded ? null : booking.id
                                setExpandedBookingId(newExpandedState)
                                
                                // Load SMS history when expanding
                                if (newExpandedState === booking.id && !smsHistory[booking.id]) {
                                  setLoadingSMSHistory({ ...loadingSMSHistory, [booking.id]: true })
                                  try {
                                    const { fetchSMSLogsForBooking } = await import('@/lib/smsHelper')
                                    const result = await fetchSMSLogsForBooking(booking.id)
                                    if (result.success) {
                                      setSmsHistory({ ...smsHistory, [booking.id]: result.data || [] })
                                    }
                                  } catch (error) {
                                    console.error('Failed to load SMS history:', error)
                                  } finally {
                                    setLoadingSMSHistory({ ...loadingSMSHistory, [booking.id]: false })
                                  }
                                }
                              }}
                              className="px-3 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded transition-colors touch-manipulation"
                            >
                              {isExpanded ? '▼' : '▶'} Details
                            </button>

                            {/* Status Management Menu (⋯) */}
                            <div className="relative group">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                                className="px-2 py-1.5 text-lg font-bold hover:bg-gray-100 rounded transition-colors touch-manipulation"
                                title="Status options"
                              >
                                ⋯
                              </button>
                              
                              {/* Dropdown Menu */}
                              {openMenuId === booking.id && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-40">
                                  <div className="p-2 space-y-1">
                                    {['pending', 'confirmed', 'in-progress', 'completed', 'no-show', 'cancelled'].map(status => (
                                      <button
                                        key={status}
                                        onClick={() => {
                                          handleVoiceBookingStatusChange(booking.id, status)
                                          setOpenMenuId(null)
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all touch-manipulation ${
                                          booking.status === status
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                      >
                                        {statusColorMap[status as keyof typeof statusColorMap]?.icon} {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <>
                            <div className="border-t border-gray-200 px-5 md:px-7 py-5 md:py-6 space-y-5 bg-gray-50">
                              {/* Contact Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Phone</p>
                                  <a href={`tel:${booking.customerPhone}`} className="text-base text-blue-600 hover:underline font-medium">
                                    {booking.customerPhone}
                                  </a>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Email</p>
                                  {booking.customerEmail ? (
                                    <a href={`mailto:${booking.customerEmail}`} className="text-base text-blue-600 hover:underline font-medium break-all">
                                      {booking.customerEmail}
                                    </a>
                                  ) : (
                                    <p className="text-base text-gray-500">Not provided</p>
                                  )}
                                </div>
                              </div>

                              {/* Notes if available */}
                              {booking.notes && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-blue-700 mb-2">📝 Notes</p>
                                  <p className="text-base text-blue-900">{booking.notes}</p>
                                </div>
                              )}

                              {/* SMS History Section */}
                              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs uppercase tracking-wider font-semibold text-green-900">📱 SMS Status</p>
                                  {loadingSMSHistory[booking.id] && <span className="text-xs text-green-600">Loading...</span>}
                                </div>
                                {smsHistory[booking.id] && smsHistory[booking.id].length > 0 ? (
                                  <div className="space-y-2">
                                    <p className="text-sm text-green-700 font-medium">
                                      ✅ Last SMS sent: {new Date(smsHistory[booking.id][0].sent_at).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-600 italic">
                                      {smsHistory[booking.id][0].message_type.replace(/_/g, ' ').toUpperCase()}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-green-700">No SMS sent yet</p>
                                )}
                              </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-2">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <button
                                  className="px-3 py-2 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all min-h-[36px]"
                                >
                                  📞 Call
                                </button>

                                <button
                                  onClick={async () => {
                                    setResendingSMS({ ...resendingSMS, [booking.id]: true })
                                    try {
                                      const result = await (await import('@/lib/smsHelper')).resendBookingConfirmationSMS(
                                        booking.customerName,
                                        booking.serviceType,
                                        booking.preferredTime,
                                        booking.serviceAddress,
                                        booking.customerPhone,
                                        booking.id
                                      )
                                      if (result.success) {
                                        console.log('✅ SMS resent successfully')
                                        const logsResult = await (await import('@/lib/smsHelper')).fetchSMSLogsForBooking(booking.id)
                                        if (logsResult.success) {
                                          setSmsHistory({ ...smsHistory, [booking.id]: logsResult.data || [] })
                                        }
                                      }
                                    } finally {
                                      setResendingSMS({ ...resendingSMS, [booking.id]: false })
                                    }
                                  }}
                                  disabled={resendingSMS[booking.id]}
                                  className="px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all disabled:opacity-50 min-h-[36px]"
                                >
                                  {resendingSMS[booking.id] ? '⏳' : '💬'} SMS
                                </button>

                                <button
                                  onClick={() => setSelectContractorModal({ bookingId: booking.id })}
                                  className="px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all min-h-[36px]"
                                >
                                  👤 Assign
                                </button>

                                <button
                                  className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all min-h-[36px]"
                                >
                                  📝 Notes
                                </button>
                              </div>
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

          {/* Web Bookings Calendar View - Side-by-Side Layout */}
          {bookingType === 'web' && viewType === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar - Left Side */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-hvac-darkgray mb-4">📅 Calendar</h3>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center font-bold text-xs text-gray-600 py-2">
                      {day}
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
                        className={`aspect-square p-1 rounded text-xs font-bold transition-all flex flex-col items-center justify-center touch-manipulation ${
                          isSelected
                            ? 'bg-hvac-orange text-white shadow-md'
                            : dayBookings.length > 0
                            ? 'bg-orange-100 text-hvac-orange border border-orange-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div>{date.getDate()}</div>
                        {dayBookings.length > 0 && (
                          <div className="text-xs">
                            {dayBookings.length}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Job List - Right Side */}
              <div className="lg:col-span-2">
                {selectedDate ? (
                  <div className="space-y-3">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-hvac-darkgray mb-1">
                        📅 {formatDate(selectedDate)}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {dayViewBookings.length} appointment{dayViewBookings.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>

                    {dayViewBookings.length > 0 ? (
                      <div className="space-y-3">
                        {dayViewBookings.map(booking => {
                          const statusConfig = statusColorMap[booking.status as keyof typeof statusColorMap] || statusColorMap.pending
                          const serviceIcon = serviceIcons[booking.serviceType] || '⚙'
                          
                          return (
                            <div
                              key={booking.id}
                              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all"
                            >
                              {/* Header - Time, Name, Status */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-grow min-w-0">
                                  <p className="text-xs text-gray-600 font-semibold">⏰ {booking.time}</p>
                                  <h4 className="text-lg font-bold text-hvac-darkgray truncate">{booking.customerName}</h4>
                                  <p className="text-sm text-gray-600">{serviceIcon} {booking.serviceType.replace('-', ' ')}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                  <span>{statusConfig.icon}</span>
                                </span>
                              </div>

                              {/* Address & Phone */}
                              <div className="bg-gray-50 rounded p-2 mb-3 text-xs">
                                <p className="text-gray-600 font-semibold">📍 {booking.customerAddress}</p>
                              </div>

                              {/* Quick Actions - Compact */}
                              <div className="flex gap-2">
                                {booking.status === 'pending' && (
                                  <button
                                    onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                    className="flex-1 px-2 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-bold transition-all"
                                  >
                                    ✓ Confirm
                                  </button>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleStatusChange(booking.id, 'in-progress')}
                                    className="flex-1 px-2 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-xs font-bold transition-all"
                                  >
                                    ➜ Start
                                  </button>
                                )}
                                {booking.status === 'in-progress' && (
                                  <button
                                    onClick={() => setCompletionPathModal({ bookingId: booking.id })}
                                    className="flex-1 px-2 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-bold transition-all"
                                  >
                                    ✓ Complete
                                  </button>
                                )}
                                <button
                                  onClick={() => setAssignColleagueModal({ bookingId: booking.id })}
                                  className="flex-1 px-2 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-bold transition-all"
                                >
                                  👤 Assign
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setRefundAmount(145)
                                    setRefundModalOpen(true)
                                  }}
                                  className="px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition-all"
                                  title="Refund"
                                >
                                  💰
                                </button>
                              </div>
                          </div>
                        )
                      })}
                    </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="font-bold text-gray-700">No appointments</p>
                        <p className="text-sm text-gray-600">for this date</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="font-bold text-gray-700">Select a date to view jobs</p>
                    <p className="text-sm text-gray-600">Click a date on the calendar</p>
                  </div>
                )}
              </div>
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
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl animate-in flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-7 py-6 md:py-8 flex-shrink-0">
              <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-2">👤 Assign to Contractor</h2>
              <p className="text-lg text-gray-700">Select a contractor for this job:</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 md:px-7 py-4">
              {/* SMS Status Messages */}
              {smsState?.bookingId === selectContractorModal.bookingId && (
                <div className={`mb-3 p-4 rounded-xl border-2 ${
                  smsState.error
                    ? 'bg-red-50 border-red-300'
                    : 'bg-green-50 border-green-300'
                }`}>
                  {smsState.loading ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin">⏳</div>
                      <p className="text-sm font-semibold text-gray-700">Sending SMS notification...</p>
                    </div>
                  ) : smsState.error ? (
                    <p className="text-sm font-semibold text-red-700">⚠️ {smsState.error}</p>
                  ) : (
                    <p className="text-sm font-semibold text-green-700">✅ SMS sent to contractor!</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {CONTRACTORS.map(contractor => (
                  <button
                    key={contractor.id}
                    onClick={() => handleSelectContractor(selectContractorModal.bookingId, contractor.id)}
                    disabled={smsState?.loading}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left touch-manipulation ${
                      smsState?.loading
                        ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 active:from-indigo-200 active:to-indigo-300 border-indigo-300'
                    }`}
                  >
                    <p className="text-lg font-bold text-indigo-900">{contractor.name}</p>
                    <p className="text-sm text-indigo-700">{contractor.role}</p>
                    <p className="text-xs text-indigo-600 mt-1">📱 {contractor.phone}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="px-5 md:px-7 py-6 md:py-8 border-t border-gray-200 flex-shrink-0 bg-white rounded-b-t-3xl md:rounded-b-2xl">
              <button
                onClick={() => setSelectContractorModal(null)}
                disabled={smsState?.loading}
                className={`w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 transition-all touch-manipulation ${
                  smsState?.loading
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
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
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl animate-in flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-7 py-6 md:py-8 flex-shrink-0">
              <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray">👤 Assign to Colleague</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 md:px-7 py-4">
              <div className="space-y-2">
                {TEAM_MEMBERS.map(colleague => (
                  <button
                    key={colleague.id}
                    onClick={() => setSelectedColleague(colleague.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left touch-manipulation min-h-[56px] ${
                      selectedColleague === colleague.id
                        ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-500'
                        : 'bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-300'
                    }`}
                  >
                    <p className="text-lg font-bold text-purple-900">{colleague.name}</p>
                    <p className="text-sm text-purple-700">{colleague.role}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="px-5 md:px-7 py-6 md:py-8 border-t border-gray-200 flex-shrink-0 bg-white rounded-b-t-3xl md:rounded-b-2xl">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (selectedColleague) {
                      handleAssignColleague(assignColleagueModal.bookingId, selectedColleague)
                      setSelectedColleague(null)
                    }
                  }}
                  disabled={!selectedColleague}
                  className={`w-full px-4 py-4 rounded-xl font-bold text-base transition-all touch-manipulation min-h-[44px] ${
                    selectedColleague
                      ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setAssignColleagueModal(null)
                    setSelectedColleague(null)
                  }}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header - Fixed */}
            <div className="px-5 md:px-7 py-6 md:py-8 flex-shrink-0">
              <h2 className="text-4xl md:text-5xl font-bold text-hvac-darkgray">Process Refund</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 md:px-7 py-4">
              <div className="space-y-4">
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
                <div>
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
            </div>

            {/* Footer - Fixed */}
            <div className="px-5 md:px-7 py-6 md:py-8 border-t border-gray-200 flex-shrink-0 bg-white rounded-b-t-3xl md:rounded-b-2xl">
              <div className="flex flex-col gap-3">
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
