'use client'

import Link from 'next/link'
import { useState } from 'react'
import SplitScreenLayout from '@/components/SplitScreenLayout'
import AdminHeader from '@/components/AdminHeader'

export default function AdminStep4() {
  const [photos, setPhotos] = useState([
    { id: '1', url: '/images/placeholder-1.jpg', caption: 'Before and After Installation' },
    { id: '2', url: '/images/placeholder-2.jpg', caption: 'Professional Team at Work' },
    { id: '3', url: '/images/placeholder-3.jpg', caption: 'Customer Satisfaction' },
  ])

  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '' })

  const addPhoto = () => {
    if (newPhoto.url) {
      setPhotos([...photos, { id: String(Date.now()), ...newPhoto }])
      setNewPhoto({ url: '', caption: '' })
    }
  }

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id))
  }

  const LeftPanel = () => (
    <div className="p-8 space-y-8">
      {/* Current Photos */}
      <div>
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Current Photos ({photos.length})</h2>
        <div className="grid grid-cols-1 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-gray-800 border-2 border-hvac-orange rounded-lg overflow-hidden hover:border-hvac-yellow transition">
              <div className="bg-gray-700 h-32 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="text-3xl mb-2">🖼️</div>
                  <span className="text-xs text-gray-500">{photo.url}</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-white font-semibold text-sm mb-3">{photo.caption}</p>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold px-3 py-1 bg-red-900 bg-opacity-30 rounded hover:bg-opacity-50 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Photo */}
      <div className="border-t border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-hvac-yellow mb-6">Add New Photo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Photo URL *</label>
            <input
              type="text"
              value={newPhoto.url}
              onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="e.g., /images/my-photo.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-hvac-yellow mb-2">Caption</label>
            <input
              type="text"
              value={newPhoto.caption}
              onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange focus:border-hvac-yellow focus:outline-none text-white rounded-lg px-4 py-3 transition-all"
              placeholder="e.g., Before and After AC Installation"
            />
          </div>
          <button
            type="button"
            onClick={addPhoto}
            className="w-full px-4 py-3 bg-hvac-yellow hover:bg-yellow-400 text-hvac-darkgray font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/50"
          >
            + Add Photo
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-900 bg-opacity-40 border-2 border-blue-700 rounded-lg p-4">
        <h3 className="font-bold text-hvac-yellow mb-3">📸 Photo Tips:</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Use high-quality images of your actual work</li>
          <li>• Include before/after photos of installations</li>
          <li>• Show your team and satisfied customers</li>
          <li>• Keep file sizes under 2MB for faster loading</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-6 border-t border-gray-700">
        <Link href="/admin/step3">
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200"
          >
            ← Back
          </button>
        </Link>
        <Link href="/admin/step5">
          <button
            type="button"
            className="px-6 py-3 bg-hvac-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/50"
          >
            Next: Hours →
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
        <h2 className="text-2xl font-bold text-hvac-darkgray mb-2">Portfolio & Photos</h2>
        <p className="text-gray-600 text-sm">Your work showcase to customers</p>
      </div>

      {/* Photos Grid */}
      <div className="space-y-4">
        {photos.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No photos added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <span className="text-xs text-gray-500">Image</span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="font-semibold text-hvac-darkgray text-sm">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="bg-hvac-light p-4 rounded-lg">
          <p className="text-sm font-semibold text-hvac-darkgray">
            ✓ <strong>{photos.length} photo{photos.length !== 1 ? 's' : ''}</strong> added to portfolio
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Step 4/5 Complete:</strong> Photos uploaded successfully
        </p>
      </div>
    </div>
  )

  return (
    <>
      <AdminHeader currentStep={4} title="Step 4: Photos" subtitle="Upload before/after and portfolio photos" />
      <SplitScreenLayout leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />
    </>
  )
}
