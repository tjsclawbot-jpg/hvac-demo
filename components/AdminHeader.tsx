import Link from 'next/link'

interface AdminHeaderProps {
  currentStep?: number
  totalSteps?: number
  title?: string
  subtitle?: string
}

export default function AdminHeader({ currentStep, totalSteps = 5, title, subtitle }: AdminHeaderProps) {
  const steps = [
    { num: 1, name: 'Business Info' },
    { num: 2, name: 'Services' },
    { num: 3, name: 'Testimonials' },
    { num: 4, name: 'Photos' },
    { num: 5, name: 'Hours' },
  ]

  const progressPercentage = currentStep ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="bg-hvac-darkgray text-white shadow-lg border-b-4 border-hvac-orange">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-sm font-bold text-hvac-yellow mb-1">PROFLOW HVAC SOLUTIONS</div>
            {title && <h1 className="text-3xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-gray-300 text-sm mt-2">{subtitle}</p>}
          </div>
          <Link href="/">
            <button type="button" className="text-gray-400 hover:text-hvac-orange transition text-sm font-semibold">
              ← Exit Admin
            </button>
          </Link>
        </div>

        {/* Progress Bar */}
        {currentStep && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-300">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-hvac-yellow font-bold">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-hvac-orange via-hvac-yellow to-hvac-orange transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="hidden md:flex gap-2 mt-6 flex-wrap">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep && step.num <= currentStep
                    ? 'bg-hvac-orange text-white'
                    : currentStep && step.num === currentStep + 1
                      ? 'bg-hvac-yellow text-hvac-darkgray'
                      : 'bg-gray-600 text-gray-400'
                }`}
              >
                {currentStep && step.num < currentStep ? '✓' : step.num}
              </div>
              <span className="text-xs text-gray-400 ml-1 hidden sm:inline">{step.name}</span>
              {step.num < totalSteps && <div className="w-2 h-0.5 bg-gray-600 mx-2"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
