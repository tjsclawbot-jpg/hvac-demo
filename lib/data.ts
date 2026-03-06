// Central data store for HVAC Demo Site
export interface BusinessInfo {
  name: string
  phone: string
  email: string
  address: string
  description: string
  logo?: string
}

export interface Service {
  id: string
  name: string
  description: string
  price?: string
  icon?: string
}

export interface Testimonial {
  id: string
  author: string
  content: string
  rating: number
  image?: string
}

export interface BusinessHours {
  day: string
  open: string
  close: string
  closed?: boolean
}

// Placeholder Data
export const businessInfo: BusinessInfo = {
  name: 'Premier HVAC Solutions',
  phone: '(555) 123-4567',
  email: 'info@premierhvac.com',
  address: '123 Climate Street, Your City, ST 12345',
  description: 'Award-winning HVAC services for residential and commercial properties.',
}

export const services: Service[] = [
  {
    id: '1',
    name: 'AC Installation',
    description: 'Professional air conditioning installation for homes and businesses.',
    price: 'From $2,500',
  },
  {
    id: '2',
    name: 'Heating Installation',
    description: 'Expert furnace and heating system installation.',
    price: 'From $1,800',
  },
  {
    id: '3',
    name: 'Maintenance & Repairs',
    description: 'Regular maintenance and emergency repair services.',
    price: 'Call for quote',
  },
  {
    id: '4',
    name: 'HVAC Inspection',
    description: 'Comprehensive system inspections and diagnostics.',
    price: '$150',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'John Smith',
    content: 'Great service! The technicians were professional and courteous. Highly recommend!',
    rating: 5,
  },
  {
    id: '2',
    author: 'Sarah Johnson',
    content: 'Fast response time and fair pricing. Will definitely use again.',
    rating: 5,
  },
  {
    id: '3',
    author: 'Mike Davis',
    content: 'Professional team. They fixed my AC in no time.',
    rating: 4,
  },
]

export const businessHours: BusinessHours[] = [
  { day: 'Monday', open: '08:00 AM', close: '06:00 PM' },
  { day: 'Tuesday', open: '08:00 AM', close: '06:00 PM' },
  { day: 'Wednesday', open: '08:00 AM', close: '06:00 PM' },
  { day: 'Thursday', open: '08:00 AM', close: '06:00 PM' },
  { day: 'Friday', open: '08:00 AM', close: '06:00 PM' },
  { day: 'Saturday', open: '09:00 AM', close: '04:00 PM' },
  { day: 'Sunday', closed: true, open: 'Closed', close: 'Closed' },
]

export const photos: string[] = [
  '/images/placeholder-1.jpg',
  '/images/placeholder-2.jpg',
  '/images/placeholder-3.jpg',
]
