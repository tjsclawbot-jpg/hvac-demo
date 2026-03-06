import React from 'react'

interface SplitScreenLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  title?: string
  subtitle?: string
}

export default function SplitScreenLayout({ leftPanel, rightPanel, title, subtitle }: SplitScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {(title || subtitle) && (
        <div className="bg-hvac-darkgray text-white shadow-lg border-b-4 border-hvac-orange">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {title && <h1 className="text-3xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-gray-300 mt-2">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Split Screen Container */}
      <div className="max-w-7xl mx-auto">
        {/* Desktop: Side by side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-0 min-h-[calc(100vh-140px)]">
          {/* Left Panel - Dark Admin Side */}
          <div className="bg-hvac-darkgray text-white overflow-y-auto border-r-4 border-hvac-orange">
            {leftPanel}
          </div>

          {/* Right Panel - Light Preview Side */}
          <div className="bg-white overflow-y-auto">
            {rightPanel}
          </div>
        </div>

        {/* Mobile: Stacked */}
        <div className="lg:hidden flex flex-col gap-0">
          {/* Mobile: Form on top */}
          <div className="bg-hvac-darkgray text-white px-4 py-8 border-b-4 border-hvac-orange">
            <div className="text-sm font-bold text-hvac-yellow mb-4">📋 ADMIN FORM</div>
            {leftPanel}
          </div>

          {/* Mobile: Preview on bottom */}
          <div className="bg-white px-4 py-8">
            <div className="text-sm font-bold text-hvac-darkgray mb-4">👁️ CUSTOMER PREVIEW</div>
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  )
}
