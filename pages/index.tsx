import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-hvac-orange to-orange-600 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Lead Generation System for HVAC Professionals</h1>
          <p className="text-xl opacity-95 max-w-3xl mb-8">
            Launch your own professional booking & referral platform in 3 days. Generate more leads. Close more jobs. Simple pricing. Full ownership.
          </p>
          <div className="flex flex-wrap gap-6 text-base">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <span className="font-bold">✓</span> <span>Instant lead capture</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <span className="font-bold">✓</span> <span>Deposit collection</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <span className="font-bold">✓</span> <span>Appointment scheduling</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <span className="font-bold">✓</span> <span>Admin dashboard</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Breakdown */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-4">One-Time Setup + Monthly Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Launch your white-labeled HVAC lead generation system. We handle setup, hosting, and ongoing support so you can focus on growing your business.</p>
          </div>
          
          {/* Build Price */}
          <div className="bg-white rounded-2xl p-10 mb-16 border-2 border-hvac-orange shadow-lg">
            <div className="flex items-start justify-between mb-8 pb-8 border-b-2 border-gray-100">
              <div>
                <h3 className="text-3xl font-bold text-hvac-darkgray mb-3">HVAC Booking System Setup</h3>
                <p className="text-gray-600 text-lg">White-labeled, professional booking platform. 3-day setup. Ready to generate leads immediately.</p>
              </div>
              <Zap className="w-10 h-10 text-hvac-orange flex-shrink-0" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-3 uppercase tracking-wide">One-Time Investment</p>
                <div className="text-6xl font-bold text-hvac-orange mb-4">
                  $5,000
                </div>
                <p className="text-gray-700 mb-8 text-lg">Custom setup, branding, configuration, and 30-day launch support included.</p>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3 text-gray-700">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Custom branding & white-label setup</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Multi-step booking form</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Automated appointment scheduling</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Deposit collection (Stripe)</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Admin dashboard & lead tracking</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">Mobile-optimized platform</span>
                  </li>
                </ul>
                
                <Link href="/" className="w-full bg-hvac-yellow hover:bg-yellow-400 text-hvac-darkgray px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition text-lg">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="bg-orange-50 rounded-lg p-8 border-2 border-orange-200">
                <h4 className="text-xl font-bold text-hvac-darkgray mb-6">Setup Includes</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Domain setup & SSL certificate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Booking form configuration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Stripe payment integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Admin dashboard access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Custom email templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Calendar & scheduling setup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Data migration (if needed)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">30 days launch support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-hvac-orange font-bold text-lg">✓</span>
                    <span className="text-lg">Team training & onboarding</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hosting & Support */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-hvac-darkgray mb-4">Ongoing Monthly Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Keep your booking system running flawlessly. Hosting, security, updates, and dedicated support included.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Hosting */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 shadow-md hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-hvac-darkgray mb-3">Hosting & Security</h3>
              <p className="text-gray-600 text-lg mb-8">Professional-grade hosting with 24/7 monitoring and automatic backups</p>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-hvac-orange">$59</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-gray-700">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">99.9% uptime guarantee</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Daily automatic backups</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Security monitoring 24/7</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">SSL certificate included</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">CDN for fast loading</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Email support included</span>
                </li>
              </ul>

              <button className="w-full bg-hvac-orange hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-bold transition text-lg">
                Add to Order
              </button>
            </div>

            {/* Monthly Retainer */}
            <div className="bg-hvac-orange rounded-2xl p-10 border-2 border-hvac-yellow shadow-lg relative">
              <div className="absolute -top-4 left-6 inline-block bg-hvac-yellow text-hvac-darkgray px-4 py-2 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 mt-4">Complete Support Package</h3>
              <p className="text-white text-lg mb-8 opacity-95">Hosting, 24/7 support, optimization, and growth-focused features</p>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$199</span>
                <span className="text-white text-lg opacity-90">/month</span>
              </div>

              <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-8 border border-white border-opacity-30">
                <p className="text-white font-semibold text-lg">Includes: Everything in Hosting + Premium Support</p>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Everything in Hosting plan</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-lg">24/7 text & chat support + phone support</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Monthly lead optimization review</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Quarterly strategy & growth calls</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-lg">Lead generation optimization</span>
                </li>
              </ul>

              <button className="w-full bg-white hover:bg-gray-100 text-hvac-orange px-6 py-4 rounded-lg font-bold transition text-lg">
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-hvac-darkgray text-white section-padding">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Generate More HVAC Leads?</h2>
          <p className="text-xl text-white font-semibold mb-10 max-w-2xl mx-auto">
            Launch your white-labeled booking system in 3 days. Start capturing leads and taking deposits immediately. No long-term contracts. Full ownership.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-hvac-orange hover:bg-orange-700 text-white px-10 py-4 rounded-lg font-bold transition text-lg">
            Schedule a Demo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
