import { businessInfo } from '@/lib/data'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-hvac-darkgray text-white border-t-4 border-hvac-orange mt-auto">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition mb-4">
              <div className="w-8 h-8 bg-hvac-orange rounded-lg flex items-center justify-center font-bold text-white">
                H
              </div>
              <span className="font-bold text-lg">{businessInfo.name}</span>
            </Link>
            <p className="text-sm text-gray-400">AI-Powered Lead Generation for HVAC Professionals</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-hvac-yellow uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-hvac-yellow transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-gray-300 hover:text-hvac-yellow transition-colors font-medium">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-hvac-yellow transition-colors font-medium">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-300 hover:text-hvac-yellow transition-colors font-medium">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-hvac-yellow uppercase tracking-wider">Contact</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">
                <a href={`tel:${businessInfo.phone}`} className="hover:text-hvac-yellow transition-colors">
                  📞 {businessInfo.phone}
                </a>
              </p>
              <p className="text-gray-300">
                <a href={`mailto:${businessInfo.email}`} className="hover:text-hvac-yellow transition-colors">
                  📧 {businessInfo.email}
                </a>
              </p>
              <p className="text-gray-400">📍 {businessInfo.address}</p>
            </div>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-hvac-yellow uppercase tracking-wider">Get Started</h3>
            <Link href="/booking" className="block bg-hvac-yellow text-hvac-darkgray px-4 py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-all text-center mb-3">
              Book Now
            </Link>
            <Link href="/admin/bookings" className="block bg-hvac-orange text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-orange-700 transition-all text-center">
              Admin Portal
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} {businessInfo.name}. All rights reserved. | AI Voice Booking System</p>
        </div>
      </div>
    </footer>
  )
}
