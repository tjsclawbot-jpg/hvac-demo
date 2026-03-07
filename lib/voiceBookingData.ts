// Voice Booking System Data
export interface VoiceBooking {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceAddress: string
  serviceType: string
  preferredTime: string
  date: string
  callSid: string
  timestamp: string
  notes?: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'in-contractor-pipeline' | 'completed-not-in-pipeline' | 'no-show' | 'cancelled'
  source: 'voice' // To distinguish from web bookings
  assignedTo?: string
  contractor_assigned?: string
  progression_path?: 'progressed' | 'not_progressed'
}

// Sample voice booking data (for demo - in production, fetch from Supabase)
export const SAMPLE_VOICE_BOOKINGS: VoiceBooking[] = [
  {
    id: 'VB001',
    customerName: 'Robert Martinez',
    customerPhone: '(555) 456-7890',
    serviceAddress: '321 Pine Rd, Springfield, IL 62704',
    serviceType: 'heating-repair',
    preferredTime: '9:00 AM',
    date: '2026-03-11',
    callSid: 'CA1234567890abcdef',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'confirmed',
    source: 'voice',
  },
  {
    id: 'VB002',
    customerName: 'Jennifer Lee',
    customerPhone: '(555) 567-8901',
    serviceAddress: '654 Maple Ln, Springfield, IL 62705',
    serviceType: 'ac-repair',
    preferredTime: '2:00 PM',
    date: '2026-03-13',
    callSid: 'CA9876543210fedcba',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'pending',
    source: 'voice',
  },
  {
    id: 'VB003',
    customerName: 'David Wilson',
    customerPhone: '(555) 678-9012',
    serviceAddress: '987 Cedar Dr, Springfield, IL 62706',
    serviceType: 'maintenance',
    preferredTime: '11:00 AM',
    date: '2026-03-14',
    callSid: 'CAabcdef1234567890',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    status: 'pending',
    source: 'voice',
  },
]

// Service type labels for voice bookings
export const VOICE_SERVICE_TYPES: { [key: string]: string } = {
  'ac-repair': 'AC Repair',
  'heating-repair': 'Heating Repair',
  'plumbing': 'Plumbing',
  'emergency': 'Emergency Service',
  'maintenance': 'Maintenance',
}

// Convert voice booking to display format
export function formatVoiceBooking(booking: VoiceBooking) {
  return {
    ...booking,
    serviceTypeLabel: VOICE_SERVICE_TYPES[booking.serviceType] || booking.serviceType,
  }
}
