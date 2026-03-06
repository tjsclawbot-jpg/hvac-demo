'use client'

import { useState, useRef, useEffect } from 'react'

interface BeforeAfterSliderProps {
  beforeImage?: string
  afterImage?: string
  beforeLabel?: string
  afterLabel?: string
}

export default function BeforeAfterSlider({
  beforeImage = '/images/placeholder-before.jpg',
  afterImage = '/images/placeholder-after.jpg',
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, newPosition)))
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden cursor-col-resize"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {}}
    >
      {/* After image (background) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${afterImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-5"></div>
      </div>

      {/* Before image (overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${beforeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-5"></div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 h-full w-1 bg-white shadow-lg"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
          <span className="text-gray-600 text-xs font-bold">⟨ ⟩</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm font-semibold">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm font-semibold">
        {afterLabel}
      </div>
    </div>
  )
}
