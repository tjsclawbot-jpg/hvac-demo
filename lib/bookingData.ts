// Booking system data and configuration
export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingData {
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
  stripePaymentId?: string
  status: 'pending' | 'confirmed' | 'completed' | 'no-show' | 'cancelled'
  createdAt: string
  refundStatus?: 'pending' | 'completed' | 'failed'
  refundAmount?: number
  notes?: string
}

// Available service types
export const SERVICE_TYPES = [
  { id: 'ac-repair', label: 'AC Repair', description: 'Air conditioning system repair and maintenance' },
  { id: 'heating-repair', label: 'Heating Repair', description: 'Furnace and heating system repair' },
  { id: 'plumbing', label: 'Plumbing', description: 'HVAC-related plumbing services' },
  { id: 'emergency', label: 'Emergency Service', description: 'Emergency HVAC services (24/7)' },
  { id: 'maintenance', label: 'Maintenance', description: 'Regular HVAC system maintenance' },
]

// Business hours (HVAC availability)
export const BUSINESS_HOURS = {
  startHour: 9,
  endHour: 17,
  slots: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
  inspectionSlots: [
    { time: '9:00 AM - 12:00 PM', value: 'morning' },
    { time: '1:00 PM - 5:00 PM', value: 'afternoon' },
  ],
}

// Deposit configuration
export const DEPOSIT_CONFIG = {
  amount: 150,
  stripeFee: 5,
  refundableWithin: 24, // hours before appointment
}

// Sample booked dates (for demo - this would be in a database)
export const SAMPLE_BOOKED_DATES = [
  { date: '2026-03-10', slots: ['9:00 AM', '10:00 AM', '11:00 AM'] },
  { date: '2026-03-12', slots: ['2:00 PM', '3:00 PM'] },
  { date: '2026-03-14', slots: ['1:00 PM'] },
]

// Holidays (dates when booking is disabled)
export const HOLIDAYS = [
  '2026-03-17', // St. Patrick's Day (example)
  '2026-07-04', // Independence Day
  '2026-11-26', // Thanksgiving
  '2026-12-25', // Christmas
]

// Sample booking data (for admin dashboard demo)
export const SAMPLE_BOOKINGS: BookingData[] = [
  {
    id: 'BK001',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '(555) 123-4567',
    customerAddress: '123 Main St, Springfield, IL 62701',
    serviceType: 'ac-repair',
    date: '2026-03-10',
    time: '10:00 AM',
    depositAmount: 150,
    depositPaid: true,
    stripePaymentId: 'pi_1234567890',
    status: 'confirmed',
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'BK002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '(555) 234-5678',
    customerAddress: '456 Oak Ave, Springfield, IL 62702',
    serviceType: 'heating-repair',
    date: '2026-03-12',
    time: '2:00 PM',
    depositAmount: 150,
    depositPaid: true,
    stripePaymentId: 'pi_0987654321',
    status: 'confirmed',
    createdAt: '2026-02-28T14:20:00Z',
  },
  {
    id: 'BK003',
    customerName: 'Mike Davis',
    customerEmail: 'mike@example.com',
    customerPhone: '(555) 345-6789',
    customerAddress: '789 Elm St, Springfield, IL 62703',
    serviceType: 'maintenance',
    date: '2026-03-15',
    time: '11:00 AM',
    depositAmount: 150,
    depositPaid: true,
    stripePaymentId: 'pi_1111111111',
    status: 'pending',
    createdAt: '2026-03-02T09:15:00Z',
  },
]

// Get available time slots for a specific date
export function getAvailableSlots(date: string): TimeSlot[] {
  // Check if date is booked
  const bookedDate = SAMPLE_BOOKED_DATES.find(b => b.date === date)
  
  return BUSINESS_HOURS.slots.map(slot => ({
    time: slot,
    available: !bookedDate || !bookedDate.slots.includes(slot),
  }))
}

// Check if a date is a weekend
export function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6
}

// Check if a date is a holiday
export function isHoliday(date: string): boolean {
  return HOLIDAYS.includes(date)
}

// Check if a date is available for booking
export function isDateAvailable(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0]
  return !isWeekend(date) && !isHoliday(dateString)
}

// Format date as YYYY-MM-DD
export function formatDateForBooking(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get next 30 available dates for booking
export function getNextAvailableDates(count: number = 30): Date[] {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let current = new Date(today)
  current.setDate(current.getDate() + 1) // Start from tomorrow
  
  while (dates.length < count) {
    if (isDateAvailable(current)) {
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// Refund policy terms
export const REFUND_POLICY = {
  deposit: 150,
  stripeFee: 5,
  refundWithin24Hours: 'Full refund if cancelled within 24 hours of appointment',
  noShow: 'Deposit forfeited for no-shows',
  poorFit: `Refund minus $${5} Stripe processing fee if we determine we cannot meet your needs`,
  appliedToInvoice: 'Deposit applies to service invoice if booking proceeds',
}
