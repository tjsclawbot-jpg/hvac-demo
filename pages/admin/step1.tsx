'use client'

import Link from 'next/link'
import { useState } from 'react'
import SplitScreenLayout from '@/components/SplitScreenLayout'
import AdminHeader from '@/components/AdminHeader'

export default function AdminStep1() {
  const [formData, setFormData] = useState({
    businessName: 'Premier HVAC Solutions',
    phone: '(555) 123-4567',
    email: 'info@premierhvac.com',
    address: '123 Climate Street, Your City, ST 12345',
    description: 'Award-winning HVAC services for residential and commercial properties.',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const LeftPanel = () => (
    <div className="p-8 space-y-6">
      <form className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-bold text-hvac-yellow mb-2">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
            placeholder="Your business name"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="info@example.com"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-bold text-hvac-yellow mb-2">Business Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
            placeholder="Street address, City, State ZIP"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-hvac-yellow mb-2">Business Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all resize-none"
            placeholder="Describe your business in a few sentences..."
          ></textarea>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 pt-6 border-t border-gray-700">
          <Link href="/admin">
            <button
              type="button"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
            >
              ← Back
            </button>
          </Link>
          <Link href="/admin/step2">
            <button
              type="button"
              className="px-6 py-3 bg-hvac-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50"
            >
              Next: Services →
            </button>
          </Link>
        </div>
      </form>
    </div>
  )

  const RightPanel = () => (
    <div className="p-8">
      {/* Customer Preview Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-200">
        <div className="inline-block bg-hvac-orange text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
          LIVE PREVIEW
        </div>
        <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Your Website Header</h2>
        <p className="text-gray-600 text-sm">This is what your customers will see</p>
      </div>

      {/* Preview Content */}
      <div className="space-y-6">
        {/* Business Name Display */}
        <div>
          <h3 className="text-3xl font-bold text-hvac-orange mb-2">{formData.businessName}</h3>
          <p className="text-gray-600">{formData.description}</p>
        </div>

        {/* Contact Info Card */}
        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-hvac-orange">
          <h4 className="font-bold text-hvac-darkgray mb-3 flex items-center gap-2">
            <span className="text-xl">📞</span> Contact Information
          </h4>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Phone:</strong> <span className="text-hvac-orange font-semibold">{formData.phone}</span>
            </p>
            <p>
              <strong>Email:</strong> <span className="text-hvac-orange font-semibold">{formData.email}</span>
            </p>
            <p>
              <strong>Address:</strong> {formData.address}
            </p>
          </div>
        </div>

        {/* Preview Note */}
        <div className="bg-hvac-light p-4 rounded-lg border border-gray-300">
          <p className="text-sm text-gray-700">
            <strong>✓ Real-time preview:</strong> Changes you make on the left will appear here instantly as customers
            will see them.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center border-t-4 border-blue-400">
            <p className="text-2xl font-bold text-hvac-orange">5</p>
            <p className="text-xs text-gray-600 mt-1">Steps Complete</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border-t-4 border-green-400">
            <p className="text-2xl font-bold text-hvac-orange">Step 1/5</p>
            <p className="text-xs text-gray-600 mt-1">Current Progress</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <AdminHeader currentStep={1} title="Step 1: Business Information" subtitle="Tell us about your HVAC business" />
      <SplitScreenLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />
    </>
  )
}
