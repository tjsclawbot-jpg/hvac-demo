// Booking management utilities
import { BookingData, DEPOSIT_CONFIG } from './bookingData'

// Generate unique booking ID
export function generateBookingId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `BK${timestamp}${random}`.toUpperCase()
}

// Generate confirmation reference number
export function generateConfirmationNumber(): string {
  return `CONF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
}

// Calculate refund amount based on circumstances
export function calculateRefundAmount(
  depositAmount: number = DEPOSIT_CONFIG.amount,
  reason: 'cancelled-24h' | 'no-show' | 'poor-fit'
): number {
  switch (reason) {
    case 'cancelled-24h':
      // Full refund if cancelled within 24 hours
      return depositAmount
    case 'no-show':
      // No refund for no-shows
      return 0
    case 'poor-fit':
      // Refund minus Stripe fee
      return depositAmount - DEPOSIT_CONFIG.stripeFee
    default:
      return 0
  }
}

// Check if refund is available
export function isRefundAvailable(
  appointmentDate: string,
  appointmentTime: string
): { available: boolean; reason?: string } {
  const appointmentDateTime = new Date(`${appointmentDate}T${convertTimeToMilitary(appointmentTime)}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilAppointment < 0) {
    return {
      available: false,
      reason: 'Appointment has already passed',
    }
  }

  if (hoursUntilAppointment <= 24) {
    return {
      available: true,
      reason: 'Full refund available - within 24 hours of appointment',
    }
  }

  return {
    available: true,
    reason: 'Refund available (minus $5 Stripe fee)',
  }
}

// Convert 12-hour time format to 24-hour for date calculations
function convertTimeToMilitary(time12: string): string {
  const [time, period] = time12.split(' ')
  let [hours, minutes] = time.split(':').map(Number)

  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// Format booking details for confirmation email
export function formatBookingDetails(booking: BookingData): string {
  return `
Booking Reference: ${booking.id}
Customer: ${booking.customerName}
Service Type: ${booking.serviceType}
Date: ${formatDate(booking.date)}
Time: ${booking.time}
Address: ${booking.customerAddress}
Deposit Paid: $${booking.depositAmount}
Status: ${booking.status}
`
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Validate booking data
export function validateBookingData(data: {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  serviceType?: string
  date?: string
  time?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }

  if (!data.customerEmail || !isValidEmail(data.customerEmail)) {
    errors.push('Valid email is required')
  }

  if (!data.customerPhone || data.customerPhone.trim().length < 10) {
    errors.push('Valid phone number is required')
  }

  if (!data.customerAddress || data.customerAddress.trim().length < 5) {
    errors.push('Valid address is required')
  }

  if (!data.serviceType) {
    errors.push('Service type is required')
  }

  if (!data.date) {
    errors.push('Appointment date is required')
  }

  if (!data.time) {
    errors.push('Appointment time is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Get status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'no-show':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Calculate hours until appointment
export function getHoursUntilAppointment(date: string, time: string): number {
  const appointmentDateTime = new Date(`${date}T${convertTimeToMilitary(time)}`)
  const now = new Date()
  return Math.floor((appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60))
}
