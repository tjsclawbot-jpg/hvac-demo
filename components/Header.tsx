import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

export default function Header() {
  return (
    <header className="bg-hvac-darkgray text-white shadow-lg">
      <div className="container-max section-padding">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-hvac-orange rounded-lg flex items-center justify-center font-bold text-white">
                H
              </div>
              <h1 className="text-2xl font-bold">{SITE_NAME}</h1>
            </div>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/" className="hover:text-hvac-orange transition-colors duration-200">
              Home
            </Link>
            <Link href="/services" className="hover:text-hvac-orange transition-colors duration-200">
              Services
            </Link>
            <Link href="/about" className="hover:text-hvac-orange transition-colors duration-200">
              About
            </Link>
            <Link href="/contact" className="hover:text-hvac-orange transition-colors duration-200">
              Contact
            </Link>
            <Link href="/pricing" className="hover:text-hvac-orange transition-colors duration-200">
              Pricing
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/booking" className="btn-primary text-sm">
              Book Now
            </Link>
            <Link href="/admin/bookings" className="bg-hvac-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-all duration-300 text-sm">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
