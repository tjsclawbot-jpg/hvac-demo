'use client'

import { useState } from 'react'
import { getNextAvailableDates, isDateAvailable, formatDateForBooking, getAvailableSlots } from '@/lib/bookingData'

interface CalendarPickerProps {
  onDateTimeSelect: (date: string, time: string) => void
  selectedDate?: string
  selectedTime?: string
}

export default function CalendarPicker({ onDateTimeSelect, selectedDate, selectedTime }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selected, setSelected] = useState<{ date: string; time: string } | null>(
    selectedDate && selectedTime ? { date: selectedDate, time: selectedTime } : null
  )

  const availableDates = getNextAvailableDates(60)
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
  }

  const isDateSelectable = (date: Date): boolean => {
    return availableDates.some(
      d => d.getFullYear() === date.getFullYear() &&
           d.getMonth() === date.getMonth() &&
           d.getDate() === date.getDate()
    )
  }

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date)) {
      const dateString = formatDateForBooking(date)
      setSelected(prev => ({
        date: dateString,
        time: prev?.date === dateString ? prev.time : '',
      }))
    }
  }

  const handleTimeSelect = (time: string) => {
    if (selected?.date) {
      setSelected({ date: selected.date, time })
      onDateTimeSelect(selected.date, time)
    }
  }

  const selectedDateObj = selected?.date ? new Date(selected.date + 'T00:00:00') : null
  const availableSlots = selected?.date ? getAvailableSlots(selected.date) : []

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold text-hvac-darkgray mb-4">Select Your Inspection Date & Time</h3>
      
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Calendar */}
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-hvac-darkgray">{monthName}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={currentMonth <= new Date()}
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} />
                }

                const selectable = isDateSelectable(date)
                const isSelected = selectedDateObj && 
                  date.getFullYear() === selectedDateObj.getFullYear() &&
                  date.getMonth() === selectedDateObj.getMonth() &&
                  date.getDate() === selectedDateObj.getDate()

                const dateString = formatDateForBooking(date)

                return (
                  <button
                    key={dateString}
                    onClick={() => handleDateClick(date)}
                    disabled={!selectable}
                    className={`h-11 sm:h-12 lg:h-10 rounded text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                      isSelected
                        ? 'bg-hvac-orange text-white shadow-lg'
                        : selectable
                        ? 'bg-white border-2 border-hvac-orange text-hvac-orange hover:bg-orange-50 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-hvac-orange rounded"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">Booked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div>
          {selected?.date ? (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-4">
                Selected: <span className="text-hvac-orange">{new Date(selected.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </p>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-hvac-darkgray mb-3">Choose Your Time:</p>
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`w-full py-3 sm:py-4 px-4 rounded-lg font-medium transition-all duration-200 text-left min-h-11 sm:min-h-12 flex items-center justify-between ${
                      slot.available
                        ? selected?.time === slot.time
                          ? 'bg-hvac-orange text-white shadow-lg'
                          : 'bg-white border-2 border-hvac-orange text-hvac-orange hover:bg-orange-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{slot.time}</span>
                    {!slot.available && <span className="text-xs">Booked</span>}
                  </button>
                ))}
              </div>

              {selected?.time && (
                <div className="mt-6 p-4 bg-hvac-light border border-hvac-yellow rounded-lg">
                  <p className="text-sm text-hvac-darkgray">
                    <span className="font-semibold">Confirmed:</span> {new Date(selected.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at <span className="text-hvac-orange font-semibold">{selected.time}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg">📅</p>
                <p className="text-sm mt-2">Select a date to see available times</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
