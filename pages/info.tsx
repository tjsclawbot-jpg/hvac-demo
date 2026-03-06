import React from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Award, Zap, Phone, ArrowRight } from 'lucide-react';

export default function Info() {
  return (
    <div className="min-h-screen bg-hvac-light">
      {/* Navigation */}
      <nav className="bg-hvac-darkgray border-b-4 border-hvac-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-white font-bold text-lg">ProFlow HVAC</span>
            </Link>
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-white hover:text-hvac-orange transition">Home</Link>
              <Link href="/about" className="text-hvac-orange font-semibold">About</Link>
              <Link href="/pricing" className="text-white hover:text-hvac-orange transition">Pricing</Link>
              <Link href="/faq" className="text-white hover:text-hvac-orange transition">FAQ</Link>
            </div>
            <Link href="/" className="hidden md:block bg-hvac-orange hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition">
              Back Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-hvac-darkgray to-hvac-orange text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 my-8 rounded-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About ProFlow HVAC</h1>
        <p className="text-xl opacity-95 max-w-3xl">
          Delivering exceptional heating, ventilation, and air conditioning solutions to Phoenix and surrounding areas. We're committed to your comfort, reliability, and peace of mind.
        </p>
      </section>

      {/* Why Choose ProFlow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-hvac-darkgray mb-12">Why Choose ProFlow?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-2xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-hvac-darkgray mb-3">Licensed & Certified</h3>
            <p className="text-hvac-text">All technicians are fully licensed, certified, and regularly trained on the latest HVAC technology and best practices.</p>
          </div>

          <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-2xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-hvac-darkgray mb-3">Industry Award Winners</h3>
            <p className="text-hvac-text">Recognized for excellence in customer service and technical expertise with multiple industry awards.</p>
          </div>

          <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-hvac-darkgray mb-3">24/7 Emergency Service</h3>
            <p className="text-hvac-text">Emergency HVAC breakdowns don't wait for business hours. Neither do we. Round-the-clock availability.</p>
          </div>

          <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-2xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-hvac-darkgray mb-3">Rapid Response Times</h3>
            <p className="text-hvac-text">Same-day service availability with technicians arriving within 2 hours of your call.</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-gradient-to-r from-hvac-orange to-orange-600 py-16 rounded-lg max-w-7xl mx-auto my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">What's Included in Our Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-3">Installation & Replacement</h3>
              <ul className="space-y-2 text-white text-sm">
                <li>✓ System design & consultation</li>
                <li>✓ Professional installation</li>
                <li>✓ Permit & inspection handling</li>
                <li>✓ Extended warranties available</li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-3">Maintenance Plans</h3>
              <ul className="space-y-2 text-white text-sm">
                <li>✓ Seasonal tune-ups</li>
                <li>✓ Filter changes & cleaning</li>
                <li>✓ Priority service scheduling</li>
                <li>✓ 15% discount on repairs</li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-3">Emergency Repairs</h3>
              <ul className="space-y-2 text-white text-sm">
                <li>✓ 24/7 availability</li>
                <li>✓ Same-day appointments</li>
                <li>✓ Flat diagnostic fee waived with repair</li>
                <li>✓ Parts warranty included</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-hvac-darkgray mb-12">Your Website Timeline</h2>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-hvac-orange rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
              <div className="w-1 h-20 bg-hvac-orange mt-4"></div>
            </div>
            <div className="bg-white rounded-lg p-6 flex-1 shadow-md">
              <h3 className="text-xl font-bold text-hvac-darkgray mb-2">Day 1: Discovery & Setup</h3>
              <p className="text-hvac-text">We gather your business information, branding guidelines, and service details. Your website builder is provisioned and ready.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-hvac-orange rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
              <div className="w-1 h-20 bg-hvac-orange mt-4"></div>
            </div>
            <div className="bg-white rounded-lg p-6 flex-1 shadow-md">
              <h3 className="text-xl font-bold text-hvac-darkgray mb-2">Day 2: Customization & Review</h3>
              <p className="text-hvac-text">Customize colors, content, and layout using the live preview builder. See changes in real-time and request adjustments.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-hvac-success rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
            </div>
            <div className="bg-white rounded-lg p-6 flex-1 shadow-md">
              <h3 className="text-xl font-bold text-hvac-darkgray mb-2">Day 3: Launch & Optimization</h3>
              <p className="text-hvac-text">Your website goes live with Google Analytics tracking. We handle domain setup, SEO basics, and provide training for future updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="bg-white border-y-4 border-hvac-orange py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-hvac-darkgray mb-12 text-center">Our Guarantees</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-hvac-success rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 font-bold">✓</div>
              <div>
                <h3 className="text-lg font-bold text-hvac-darkgray mb-2">99.9% Uptime Guarantee</h3>
                <p className="text-hvac-text">Your website stays online 99.9% of the time with our enterprise-grade hosting and redundancy.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-hvac-success rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 font-bold">✓</div>
              <div>
                <h3 className="text-lg font-bold text-hvac-darkgray mb-2">Full Ownership, Zero Contracts</h3>
                <p className="text-hvac-text">You own your website and all content. Cancel anytime with no penalties or long-term commitments.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-hvac-success rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 font-bold">✓</div>
              <div>
                <h3 className="text-lg font-bold text-hvac-darkgray mb-2">Money-Back Guarantee</h3>
                <p className="text-hvac-text">Not satisfied in the first 30 days? We'll refund your investment, no questions asked.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-hvac-success rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 font-bold">✓</div>
              <div>
                <h3 className="text-lg font-bold text-hvac-darkgray mb-2">Ongoing Support Included</h3>
                <p className="text-hvac-text">Priority email and phone support for updates, maintenance, and any questions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Support */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-hvac-darkgray mb-12">Ongoing Support Options</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md">
            <h3 className="text-xl font-bold text-hvac-darkgray mb-4">Basic (Included)</h3>
            <div className="text-hvac-text space-y-2 mb-6 text-sm">
              <p>✓ Email support</p>
              <p>✓ Monthly updates available</p>
              <p>✓ Security patches</p>
              <p>✓ Analytics dashboard access</p>
            </div>
            <p className="text-hvac-orange font-bold">No additional cost</p>
          </div>

          <div className="bg-gradient-to-br from-hvac-orange to-orange-600 rounded-lg p-8 border-2 border-hvac-yellow">
            <div className="inline-block bg-hvac-yellow text-hvac-darkgray px-3 py-1 rounded-full text-sm font-bold mb-4">Most Popular</div>
            <h3 className="text-xl font-bold text-white mb-4">Premium Support</h3>
            <div className="text-white space-y-2 mb-6 text-sm">
              <p>✓ Priority phone support</p>
              <p>✓ 2-hour response guarantee</p>
              <p>✓ Monthly strategy calls</p>
              <p>✓ Content updates included</p>
              <p>✓ A/B testing assistance</p>
            </div>
            <p className="text-white font-bold text-lg">$199/month</p>
          </div>

          <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md">
            <h3 className="text-xl font-bold text-hvac-darkgray mb-4">Pro Management</h3>
            <div className="text-hvac-text space-y-2 mb-6 text-sm">
              <p>✓ Dedicated account manager</p>
              <p>✓ Weekly optimization reviews</p>
              <p>✓ SEO & conversion optimization</p>
              <p>✓ Monthly reporting & insights</p>
              <p>✓ Custom development work</p>
            </div>
            <p className="text-hvac-orange font-bold">Custom pricing</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-hvac-darkgray to-hvac-orange text-white py-16 rounded-lg max-w-7xl mx-auto my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="opacity-95 mb-8 max-w-2xl mx-auto">
            Your professional HVAC website can be live in 3 days. No technical skills required. Full support included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-hvac-yellow hover:bg-yellow-300 text-hvac-darkgray px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
              Launch My Website <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="bg-white hover:bg-gray-100 text-hvac-orange px-8 py-3 rounded-lg font-semibold transition">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hvac-darkgray border-t-4 border-hvac-orange py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">&copy; 2026 ProFlow HVAC Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
