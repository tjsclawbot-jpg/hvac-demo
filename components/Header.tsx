import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

export default function Header() {
  return (
    <header className="bg-hvac-darkgray text-white border-b-4 border-hvac-orange sticky top-0 z-50">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-hvac-orange rounded-lg flex items-center justify-center font-bold text-white">
              H
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{SITE_NAME}</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/" className="text-sm hover:text-hvac-yellow transition-colors font-medium">
              Home
            </Link>
            <Link href="/services" className="text-sm hover:text-hvac-yellow transition-colors font-medium">
              Services
            </Link>
            <Link href="/about" className="text-sm hover:text-hvac-yellow transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:text-hvac-yellow transition-colors font-medium">
              Contact
            </Link>
            <Link href="/pricing" className="text-sm hover:text-hvac-yellow transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <Link href="/booking" className="hidden sm:block btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
              Book Now
            </Link>
            <Link href="/admin/bookings" className="hidden sm:block bg-hvac-yellow text-hvac-darkgray px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-yellow-300 transition-all">
              Admin
            </Link>
            <Link href="/booking" className="sm:hidden btn-primary text-xs py-2 px-3">
              Book
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
