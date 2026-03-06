'use client'

import Link from 'next/link'
import { useState } from 'react'
import SplitScreenLayout from '@/components/SplitScreenLayout'
import AdminHeader from '@/components/AdminHeader'

export default function AdminStep5() {
  const [hours, setHours] = useState([
    { day: 'Monday', open: '08:00 AM', close: '06:00 PM', closed: false },
    { day: 'Tuesday', open: '08:00 AM', close: '06:00 PM', closed: false },
    { day: 'Wednesday', open: '08:00 AM', close: '06:00 PM', closed: false },
    { day: 'Thursday', open: '08:00 AM', close: '06:00 PM', closed: false },
    { day: 'Friday', open: '08:00 AM', close: '06:00 PM', closed: false },
    { day: 'Saturday', open: '09:00 AM', close: '04:00 PM', closed: false },
    { day: 'Sunday', open: 'Closed', close: 'Closed', closed: true },
  ])

  const [emergencyService, setEmergencyService] = useState(true)

  const updateHours = (index: number, field: string, value: string | boolean) => {
    const newHours = [...hours]
    newHours[index] = { ...newHours[index], [field]: value }
    setHours(newHours)
  }

  const LeftPanel = () => (
    <div className="p-8 space-y-8">
      {/* Operating Hours */}
      <div>
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Operating Hours</h2>
        <div className="space-y-3">
          {hours.map((hour, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange rounded-lg transition">
              <div className="w-20 font-semibold text-white">{hour.day}</div>
              <div className="flex gap-3 items-center">
                {!hour.closed ? (
                  <>
                    <input
                      type="text"
                      value={hour.open}
                      onChange={(e) => updateHours(idx, 'open', e.target.value)}
                      className="bg-gray-700 border border-gray-600 focus:border-hvac-yellow text-white rounded px-2 py-1 text-sm focus:outline-none"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="text"
                      value={hour.close}
                      onChange={(e) => updateHours(idx, 'close', e.target.value)}
                      className="bg-gray-700 border border-gray-600 focus:border-hvac-yellow text-white rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </>
                ) : (
                  <span className="text-hvac-yellow font-semibold">Closed</span>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={hour.closed}
                  onChange={(e) => updateHours(idx, 'closed', e.target.checked)}
                  className="w-4 h-4 accent-hvac-orange"
                />
                <span className="text-sm text-gray-300">Closed</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Service */}
      <div className="border-t border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Service Options</h2>
        <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-hvac-orange rounded-lg cursor-pointer hover:bg-gray-750 transition">
          <input
            type="checkbox"
            checked={emergencyService}
            onChange={(e) => setEmergencyService(e.target.checked)}
            className="w-5 h-5 accent-hvac-orange cursor-pointer"
          />
          <div>
            <div className="font-bold text-white">🚨 24/7 Emergency Service</div>
            <p className="text-sm text-gray-400">Enable emergency service availability round the clock</p>
          </div>
        </label>
      </div>

      {/* Tips */}
      <div className="bg-blue-900 bg-opacity-40 border-2 border-blue-700 rounded-lg p-4">
        <h3 className="font-bold text-hvac-yellow mb-3">⏰ Hours Tips:</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Set accurate hours to prevent scheduling confusion</li>
          <li>• Enable emergency service if you offer it</li>
          <li>• Consider seasonal variations in hours</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-6 border-t border-gray-700">
        <Link href="/admin/step4">
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
          >
            ← Back
          </button>
        </Link>
        <Link href="/admin/confirm">
          <button
            type="button"
            className="px-6 py-3 bg-hvac-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50"
          >
            Next: Review →
          </button>
        </Link>
      </div>
    </div>
  )

  const RightPanel = () => (
    <div className="p-8">
      {/* Preview Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-200">
        <div className="inline-block bg-hvac-orange text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
          LIVE PREVIEW
        </div>
        <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Business Hours</h2>
        <p className="text-gray-600 text-sm">How customers will see your hours</p>
      </div>

      {/* Hours Display */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-hvac-darkgray mb-4">📅 Our Hours</h3>
        <div className="space-y-3">
          {hours.map((hour, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
              <span className="font-semibold text-hvac-darkgray">{hour.day}</span>
              <span className={hour.closed ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                {hour.closed ? 'Closed' : `${hour.open} - ${hour.close}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Service Badge */}
      {emergencyService && (
        <div className="bg-hvac-orange text-white p-4 rounded-lg mb-6 text-center">
          <p className="font-bold">🚨 24/7 Emergency Service Available</p>
          <p className="text-sm mt-1">Call anytime for urgent HVAC needs</p>
        </div>
      )}

      {/* Contact Prompt */}
      <div className="bg-hvac-light p-4 rounded-lg border border-gray-300">
        <p className="text-sm text-gray-700">
          <strong>✓ Customers can see</strong> your exact hours and know when to reach you.
        </p>
      </div>

      {/* Progress */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Step 5/5 Complete:</strong> You're almost ready to publish!
        </p>
      </div>
    </div>
  )

  return (
    <>
      <AdminHeader currentStep={5} title="Step 5: Business Hours" subtitle="Set your operating hours and service availability" />
      <SplitScreenLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />
    </>
  )
}
