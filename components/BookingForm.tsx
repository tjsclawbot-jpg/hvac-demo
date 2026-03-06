'use client'

import { useState } from 'react'
import { SERVICE_TYPES } from '@/lib/bookingData'
import { validateBookingData } from '@/lib/bookingManagement'
import CalendarPicker from './CalendarPicker'
import StripePayment from './StripePayment'

export interface BookingFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  serviceType: string
  date: string
  time: string
}

interface BookingFormProps {
  onSubmit: (data: BookingFormData & { paymentIntentId: string }) => void
  isLoading?: boolean
}

export default function BookingForm({ onSubmit, isLoading = false }: BookingFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    serviceType: '',
    date: '',
    time: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNum === 1) {
      if (!formData.customerName.trim()) newErrors.customerName = 'Name is required'
      if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required'
      if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone is required'
      if (!formData.customerAddress.trim()) newErrors.customerAddress = 'Address is required'
    }

    if (stepNum === 2) {
      if (!formData.serviceType) newErrors.serviceType = 'Please select a service type'
    }

    if (stepNum === 3) {
      if (!formData.date) newErrors.date = 'Please select a date'
      if (!formData.time) newErrors.time = 'Please select a time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  const handleDateTimeSelect = (date: string, time: string) => {
    setFormData(prev => ({ ...prev, date, time }))
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSubmit({ ...formData, paymentIntentId })
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  const progressPercentage = (step / 4) * 100

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between mb-2 text-xs sm:text-sm">
          <span className="font-semibold text-hvac-darkgray">
            Step {step} of 4
          </span>
          <span className="text-gray-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-hvac-orange h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step 1: Contact Information */}
      {step === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-hvac-darkgray mb-4 sm:mb-6">Your Contact Information</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-hvac-darkgray mb-1 sm:mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="John Smith"
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange transition-all ${
                  errors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.customerName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customerName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-hvac-darkgray mb-1 sm:mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange transition-all ${
                  errors.customerEmail ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.customerEmail && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customerEmail}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-hvac-darkgray mb-1 sm:mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange transition-all ${
                  errors.customerPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.customerPhone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customerPhone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-hvac-darkgray mb-1 sm:mb-2">
                Service Address *
              </label>
              <input
                type="text"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
                placeholder="123 Main St, Springfield, IL 62701"
                className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-hvac-orange transition-all ${
                  errors.customerAddress ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.customerAddress && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customerAddress}</p>}
            </div>
          </div>

          <div className="flex gap-3 mt-6 sm:mt-8">
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-hvac-orange text-white font-bold text-sm sm:text-base rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl min-h-11 sm:min-h-12"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Service Type */}
      {step === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-hvac-darkgray mb-4 sm:mb-6">What Service Do You Need?</h2>
          
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {SERVICE_TYPES.map(service => (
              <label
                key={service.id}
                className={`flex items-start p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.serviceType === service.id
                    ? 'border-hvac-orange bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-hvac-orange'
                }`}
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={service.id}
                  checked={formData.serviceType === service.id}
                  onChange={handleInputChange}
                  className="mt-1 mr-2 sm:mr-4 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">{service.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{service.description}</p>
                </div>
              </label>
            ))}
          </div>

          {errors.serviceType && <p className="text-red-500 text-xs sm:text-sm mb-4">{errors.serviceType}</p>}

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 sm:py-4 px-3 sm:px-6 bg-gray-200 text-hvac-darkgray font-bold text-sm sm:text-base rounded-lg hover:bg-gray-300 transition-all duration-300 min-h-11 sm:min-h-12"
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 sm:py-4 px-3 sm:px-6 bg-hvac-orange text-white font-bold text-sm sm:text-base rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl min-h-11 sm:min-h-12"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Date & Time */}
      {step === 3 && (
        <div className="space-y-3 sm:space-y-4">
          <CalendarPicker
            onDateTimeSelect={handleDateTimeSelect}
            selectedDate={formData.date}
            selectedTime={formData.time}
          />

          {errors.date && <p className="text-red-500 text-xs sm:text-sm">{errors.date}</p>}
          {errors.time && <p className="text-red-500 text-xs sm:text-sm">{errors.time}</p>}

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 sm:py-4 px-3 sm:px-6 bg-gray-200 text-hvac-darkgray font-bold text-sm sm:text-base rounded-lg hover:bg-gray-300 transition-all duration-300 min-h-11 sm:min-h-12"
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={!formData.date || !formData.time}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-bold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-lg min-h-11 sm:min-h-12 ${
                formData.date && formData.time
                  ? 'bg-hvac-orange text-white hover:bg-orange-700 hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div className="space-y-3 sm:space-y-4">
          <StripePayment
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            isProcessing={isLoading}
            customerEmail={formData.customerEmail}
            customerName={formData.customerName}
          />

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handlePrevStep}
              disabled={isLoading}
              className="flex-1 py-3 sm:py-4 px-3 sm:px-6 bg-gray-200 text-hvac-darkgray font-bold text-sm sm:text-base rounded-lg hover:bg-gray-300 transition-all duration-300 disabled:cursor-not-allowed min-h-11 sm:min-h-12"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Summary Box */}
      {step > 1 && (
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-hvac-light border-l-4 border-hvac-orange rounded-lg">
          <p className="text-xs sm:text-sm font-semibold text-hvac-darkgray mb-2">Booking Summary:</p>
          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
            {formData.customerName && <p>👤 {formData.customerName}</p>}
            {formData.serviceType && (
              <p>🔧 {SERVICE_TYPES.find(s => s.id === formData.serviceType)?.label}</p>
            )}
            {formData.date && formData.time && (
              <p>📅 {new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formData.time}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
