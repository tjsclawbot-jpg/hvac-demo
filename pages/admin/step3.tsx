'use client'

import Link from 'next/link'
import { useState } from 'react'
import SplitScreenLayout from '@/components/SplitScreenLayout'
import AdminHeader from '@/components/AdminHeader'

export default function AdminStep3() {
  const [testimonials, setTestimonials] = useState([
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
  ])

  const [newTestimonial, setNewTestimonial] = useState({ author: '', content: '', rating: 5 })

  const addTestimonial = () => {
    if (newTestimonial.author && newTestimonial.content) {
      setTestimonials([...testimonials, { id: String(Date.now()), ...newTestimonial }])
      setNewTestimonial({ author: '', content: '', rating: 5 })
    }
  }

  const deleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id))
  }

  const LeftPanel = () => (
    <div className="p-8 space-y-8">
      {/* Current Testimonials */}
      <div>
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Current Testimonials ({testimonials.length})</h2>
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-800 border-2 border-hvac-orange p-4 rounded-lg hover:bg-gray-750 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? 'text-hvac-yellow text-lg' : 'text-gray-600'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                  <p className="font-bold text-white mt-2">— {testimonial.author}</p>
                </div>
                <button
                  onClick={() => deleteTestimonial(testimonial.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold ml-4 px-3 py-1 bg-red-900 bg-opacity-30 rounded hover:bg-opacity-50 transition whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Testimonial */}
      <div className="border-t border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Add New Testimonial</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Customer Name *</label>
            <input
              type="text"
              value={newTestimonial.author}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Testimonial *</label>
            <textarea
              value={newTestimonial.content}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all resize-none"
              placeholder="What did the customer think?"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Rating</label>
            <select
              value={newTestimonial.rating}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
              <option value={3}>⭐⭐⭐ (3 stars)</option>
              <option value={2}>⭐⭐ (2 stars)</option>
              <option value={1}>⭐ (1 star)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={addTestimonial}
            className="w-full px-4 py-3 bg-hvac-yellow hover:bg-yellow-400 text-hvac-darkgray font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/50"
          >
            + Add Testimonial
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-6 border-t border-gray-700">
        <Link href="/admin/step2">
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
          >
            ← Back
          </button>
        </Link>
        <Link href="/admin/step4">
          <button
            type="button"
            className="px-6 py-3 bg-hvac-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50"
          >
            Next: Photos →
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
        <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Customer Testimonials</h2>
        <p className="text-gray-600 text-sm">What customers say about your services</p>
      </div>

      {/* Testimonials Grid */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No testimonials yet</p>
        ) : (
          testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg border-l-4 border-hvac-orange hover:shadow-md transition">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < testimonial.rating ? 'text-hvac-yellow text-lg' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 italic mb-3">"{testimonial.content}"</p>
              <p className="font-bold text-hvac-darkgray">— {testimonial.author}</p>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="bg-hvac-light p-4 rounded-lg">
          <p className="text-sm font-semibold text-hvac-darkgray">
            ✓ <strong>{testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}</strong> added and
            displayed on homepage
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Step 3/5 Complete:</strong> Testimonials configured
        </p>
      </div>
    </div>
  )

  return (
    <>
      <AdminHeader currentStep={3} title="Step 3: Testimonials" subtitle="Showcase customer feedback and reviews" />
      <SplitScreenLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />
    </>
  )
}
