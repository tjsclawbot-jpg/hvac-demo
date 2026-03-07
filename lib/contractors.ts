/**
 * Contractor Configuration
 * 
 * This file stores contractor data including phone numbers for SMS notifications.
 * Can be migrated to database later as needed.
 */

export interface Contractor {
  id: string
  name: string
  phone: string
  role: string
  email?: string
}

/**
 * Hardcoded contractor list with phone numbers
 * TODO: Move to database when scaling
 */
export const CONTRACTORS: Contractor[] = [
  {
    id: 'tm1',
    name: 'John Smith',
    phone: '+1-555-0101',
    role: 'Lead Technician',
    email: 'john.smith@hvac.local',
  },
  {
    id: 'tm2',
    name: 'Sarah Johnson',
    phone: '+1-555-0102',
    role: 'Technician',
    email: 'sarah.johnson@hvac.local',
  },
  {
    id: 'tm3',
    name: 'Mike Davis',
    phone: '+1-555-0103',
    role: 'Technician',
    email: 'mike.davis@hvac.local',
  },
  {
    id: 'tm4',
    name: 'Lisa Chen',
    phone: '+1-555-0104',
    role: 'Service Manager',
    email: 'lisa.chen@hvac.local',
  },
]

/**
 * Get contractor by ID
 */
export function getContractorById(id: string): Contractor | undefined {
  return CONTRACTORS.find(c => c.id === id)
}

/**
 * Get contractor phone by ID
 */
export function getContractorPhone(id: string): string | undefined {
  return getContractorById(id)?.phone
}

/**
 * Get contractor name by ID
 */
export function getContractorName(id: string): string | undefined {
  return getContractorById(id)?.name
}
