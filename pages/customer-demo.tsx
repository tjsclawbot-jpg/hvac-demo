import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CustomerDemo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-hvac-darkgray border-b-4 border-hvac-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">Back to Sales</span>
            </Link>
            <div className="inline-block bg-hvac-yellow text-hvac-darkgray px-4 py-2 rounded-full text-sm font-bold">
              Customer Demo
            </div>
          </div>
        </div>
      </nav>

      {/* Info Banner */}
      <section className="bg-blue-100 border-b-2 border-blue-300 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-900 text-center font-semibold">
            👇 This is what your HVAC customers will see when they visit your booking page
          </p>
        </div>
      </section>

      {/* Customer Booking Page */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="m-6">
            <iframe 
              src="/booking"
              title="Customer Booking Demo"
              className="w-full border-2 border-gray-300 rounded-xl shadow-lg"
              style={{ height: '1200px' }}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hvac-darkgray border-t-4 border-hvac-orange py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 text-sm mb-2">&copy; 2026 HVAC Company Name. All rights reserved.</p>
          <p className="text-gray-400 text-xs">
            This white-labeled booking page is powered by ProFlow HVAC Lead Generation System
          </p>
        </div>
      </footer>
    </div>
  );
}
