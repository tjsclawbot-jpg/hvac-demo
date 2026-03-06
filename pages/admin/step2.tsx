'use client'

import Link from 'next/link'
import { useState } from 'react'
import SplitScreenLayout from '@/components/SplitScreenLayout'
import AdminHeader from '@/components/AdminHeader'

export default function AdminStep2() {
  const [services, setServices] = useState([
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
  ])

  const [newService, setNewService] = useState({ name: '', description: '', price: '' })

  const addService = () => {
    if (newService.name) {
      setServices([...services, { id: String(Date.now()), ...newService }])
      setNewService({ name: '', description: '', price: '' })
    }
  }

  const deleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const LeftPanel = () => (
    <div className="p-8 space-y-8">
      {/* Current Services */}
      <div>
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Current Services ({services.length})</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-800 border-2 border-hvac-orange p-4 rounded-lg hover:bg-gray-750 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{service.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                  <p className="text-hvac-yellow font-semibold mt-2">{service.price}</p>
                </div>
                <button
                  onClick={() => deleteService(service.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold ml-4 px-3 py-1 bg-red-900 bg-opacity-30 rounded hover:bg-opacity-50 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Service */}
      <div className="border-t border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Add New Service</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Service Name *</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="e.g., Air Conditioning Maintenance"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Description</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all resize-none"
              placeholder="Describe this service..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Price</label>
            <input
              type="text"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="e.g., From $500 or Call for quote"
            />
          </div>
          <button
            type="button"
            onClick={addService}
            className="w-full px-4 py-3 bg-hvac-yellow hover:bg-yellow-400 text-hvac-darkgray font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/50"
          >
            + Add Service
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-6 border-t border-gray-700">
        <Link href="/admin/step1">
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
          >
            ← Back
          </button>
        </Link>
        <Link href="/admin/step3">
          <button
            type="button"
            className="px-6 py-3 bg-hvac-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50"
          >
            Next: Testimonials →
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
        <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Services Page</h2>
        <p className="text-gray-600 text-sm">What your customers will see</p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No services added yet</p>
        ) : (
          services.map((service) => (
            <div key={service.id} className="border-l-4 border-hvac-orange bg-gray-50 p-6 rounded-lg hover:shadow-md transition">
              <h3 className="text-lg font-bold text-hvac-darkgray mb-2">{service.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
              <p className="font-bold text-hvac-orange text-lg">{service.price}</p>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="bg-hvac-light p-4 rounded-lg">
          <p className="text-sm font-semibold text-hvac-darkgray">
            ✓ <strong>{services.length} service{services.length !== 1 ? 's' : ''}</strong> added and ready to display
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Step 2/5 Complete:</strong> Services configured successfully
        </p>
      </div>
    </div>
  )

  return (
    <>
      <AdminHeader currentStep={2} title="Step 2: Services" subtitle="Add the services your business offers" />
      <SplitScreenLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />
    </>
  )
}
