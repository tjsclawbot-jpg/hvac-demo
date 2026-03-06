'use client'

import { REFUND_POLICY } from '@/lib/bookingData'

export default function RefundPolicy() {
  return (
    <div className="bg-hvac-light border-l-4 border-hvac-orange p-4 sm:p-6 rounded-lg my-6 sm:my-8">
      <h3 className="text-lg sm:text-2xl font-bold text-hvac-darkgray mb-3 sm:mb-4">Our Refund Guarantee</h3>
      
      <div className="space-y-3 sm:space-y-4 text-hvac-text">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-hvac-orange text-white flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 sm:mt-1">
            ✓
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">
              <span className="text-hvac-orange">${REFUND_POLICY.deposit}</span> Deposit Secures Your Slot
            </p>
            <p className="text-xs opacity-90">Your inspection time is reserved when you pay the deposit.</p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-hvac-orange text-white flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 sm:mt-1">
            ✓
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">
              24-Hour Cancellation Guarantee
            </p>
            <p className="text-xs opacity-90">{REFUND_POLICY.refundWithin24Hours}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-hvac-orange text-white flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 sm:mt-1">
            ✓
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">
              Not a Good Fit? Money Back.
            </p>
            <p className="text-xs opacity-90">
              {REFUND_POLICY.poorFit}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-hvac-orange text-white flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 sm:mt-1">
            $
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-hvac-darkgray">
              Ready to Proceed? Deposit Applies to Invoice
            </p>
            <p className="text-xs opacity-90">{REFUND_POLICY.appliedToInvoice}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-hvac-yellow/30 text-xs sm:text-sm text-hvac-text">
        <p>
          <span className="font-semibold">No surprises.</span> No hidden fees. Just honest, professional HVAC service.
        </p>
      </div>
    </div>
  )
}
