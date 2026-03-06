import Link from 'next/link'
import { businessInfo, services, testimonials } from '@/lib/data'
import AdminHeader from '@/components/AdminHeader'
import SplitScreenLayout from '@/components/SplitScreenLayout'

export default function AdminConfirm() {
  const LeftPanel = () => (
    <div className="p-8 space-y-8">
      {/* All Data Review */}
      <div>
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Review All Data</h2>

        {/* Business Info */}
        <div className="bg-gray-800 border-2 border-hvac-orange p-6 rounded-lg mb-6 hover:border-hvac-yellow transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-hvac-yellow">✓ Business Information</h3>
            <Link href="/admin/step1" className="text-hvac-yellow text-sm hover:text-white transition">
              Edit
            </Link>
          </div>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-hvac-yellow font-semibold">Name:</span> {businessInfo.name}
            </p>
            <p>
              <span className="text-hvac-yellow font-semibold">Phone:</span> {businessInfo.phone}
            </p>
            <p>
              <span className="text-hvac-yellow font-semibold">Email:</span> {businessInfo.email}
            </p>
            <p>
              <span className="text-hvac-yellow font-semibold">Address:</span> {businessInfo.address}
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="bg-gray-800 border-2 border-hvac-orange p-6 rounded-lg mb-6 hover:border-hvac-yellow transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-hvac-yellow">✓ Services ({services.length})</h3>
            <Link href="/admin/step2" className="text-hvac-yellow text-sm hover:text-white transition">
              Edit
            </Link>
          </div>
          <ul className="space-y-2 text-gray-300">
            {services.slice(0, 5).map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.name}</span>
                <span className="text-hvac-yellow">{s.price}</span>
              </li>
            ))}
            {services.length > 5 && <li className="text-hvac-yellow text-sm">...and {services.length - 5} more</li>}
          </ul>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-800 border-2 border-hvac-orange p-6 rounded-lg mb-6 hover:border-hvac-yellow transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-hvac-yellow">✓ Testimonials ({testimonials.length})</h3>
            <Link href="/admin/step3" className="text-hvac-yellow text-sm hover:text-white transition">
              Edit
            </Link>
          </div>
          <p className="text-gray-300 text-sm">Customer reviews configured and ready to display</p>
        </div>

        {/* Content Status */}
        <div className="bg-gray-800 border-2 border-hvac-orange p-6 rounded-lg hover:border-hvac-yellow transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-hvac-yellow">✓ Additional Content</h3>
            <Link href="/admin/step4" className="text-hvac-yellow text-sm hover:text-white transition">
              Edit
            </Link>
          </div>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>✓ Photos uploaded</p>
            <p>✓ Business hours configured</p>
            <p>✓ Emergency service enabled</p>
            <p>✓ About page enabled</p>
          </div>
        </div>
      </div>

      {/* Publish Section */}
      <div className="bg-gradient-to-r from-hvac-orange to-orange-600 rounded-lg p-6 text-center border-2 border-hvac-yellow">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to Go Live?</h2>
        <p className="text-white text-sm mb-6 opacity-95">Your HVAC website is fully configured and ready to publish</p>
        <button className="w-full bg-white text-hvac-orange font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50">
          📤 Publish Site Live
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-6 border-t border-gray-700">
        <Link href="/admin/step5">
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
          >
            ← Back
          </button>
        </Link>
        <div className="flex gap-4">
          <Link href="/admin">
            <button
              type="button"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
            >
              Dashboard
            </button>
          </Link>
          <button className="px-6 py-3 bg-hvac-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50">
            Continue →
          </button>
        </div>
      </div>
    </div>
  )

  const RightPanel = () => (
    <div className="p-8">
      {/* Preview Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-200">
        <div className="inline-block bg-hvac-orange text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
          FINAL PREVIEW
        </div>
        <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Your Live Website</h2>
        <p className="text-gray-600 text-sm">This is exactly what customers will see</p>
      </div>

      {/* Website Preview */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-md">
        {/* Header Section */}
        <div className="bg-hvac-darkgray text-white p-6 text-center border-b-4 border-hvac-orange">
          <h1 className="text-3xl font-bold">{businessInfo.name}</h1>
          <p className="text-gray-300 mt-2">{businessInfo.description}</p>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-hvac-orange mb-4">📞 Contact Us</h3>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-hvac-orange space-y-2">
              <p>
                <strong>Phone:</strong> <span className="text-hvac-orange">{businessInfo.phone}</span>
              </p>
              <p>
                <strong>Email:</strong> <span className="text-hvac-orange">{businessInfo.email}</span>
              </p>
              <p>
                <strong>Address:</strong> {businessInfo.address}
              </p>
            </div>
          </div>

          {/* Services Preview */}
          <div>
            <h3 className="text-xl font-bold text-hvac-orange mb-4">Our Services</h3>
            <div className="space-y-3">
              {services.slice(0, 3).map((service) => (
                <div key={service.id} className="border-l-4 border-hvac-orange bg-gray-50 p-4 rounded">
                  <h4 className="font-bold text-hvac-darkgray">{service.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  <p className="font-bold text-hvac-orange mt-2">{service.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Preview */}
          {testimonials.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-hvac-orange mb-4">⭐ What Customers Say</h3>
              <div className="space-y-3">
                {testimonials.slice(0, 2).map((testimonial) => (
                  <div key={testimonial.id} className="bg-gray-50 p-4 rounded border-l-4 border-hvac-orange">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <span key={i} className="text-hvac-yellow">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                    <p className="font-bold text-hvac-darkgray mt-2">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hours Preview */}
          <div>
            <h3 className="text-xl font-bold text-hvac-orange mb-4">📅 Business Hours</h3>
            <div className="bg-gray-50 p-4 rounded border-l-4 border-hvac-orange space-y-2 text-sm">
              <p>
                <strong>Mon-Fri:</strong> 8:00 AM - 6:00 PM
              </p>
              <p>
                <strong>Saturday:</strong> 9:00 AM - 4:00 PM
              </p>
              <p className="text-hvac-orange font-bold">🚨 24/7 Emergency Service Available</p>
            </div>
          </div>

          {/* Final Checklist */}
          <div className="bg-hvac-light p-4 rounded-lg border border-gray-300">
            <p className="text-sm font-semibold text-hvac-darkgray">
              ✅ <strong>Your site is complete and ready to publish!</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Publish Info */}
      <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-300">
        <p className="text-sm text-gray-700">
          <strong>✓ All Set:</strong> Click "Publish Site Live" on the left to launch your website
        </p>
      </div>
    </div>
  )

  return (
    <>
      <AdminHeader title="Review & Publish" subtitle="Your website is ready to go live!" />
      <SplitScreenLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />
    </>
  )
}
