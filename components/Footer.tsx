import { businessInfo } from '@/lib/data'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-hvac-darkgray text-white mt-12">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-hvac-orange">Contact</h3>
            <p className="text-gray-100">{businessInfo.phone}</p>
            <p className="text-gray-100">{businessInfo.email}</p>
            <p className="mt-2 text-gray-300">{businessInfo.address}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-hvac-orange">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-100 hover:text-hvac-orange transition-colors duration-200 font-medium">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-100 hover:text-hvac-orange transition-colors duration-200 font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-100 hover:text-hvac-orange transition-colors duration-200 font-medium">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-100 hover:text-hvac-orange transition-colors duration-200 font-medium">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-hvac-orange">Business Hours</h3>
            <p className="text-gray-100">Mon - Fri: 8:00 AM - 6:00 PM</p>
            <p className="text-gray-100">Saturday: 9:00 AM - 4:00 PM</p>
            <p className="text-gray-100">Sunday: Closed</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} {businessInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
