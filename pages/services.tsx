import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceCard from '@/components/ServiceCard'
import { services } from '@/lib/data'
import Link from 'next/link'

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-hvac-darkgray to-hvac-orange text-white section-padding">
          <div className="container-max">
            <h1 className="text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl opacity-95">
              Comprehensive HVAC solutions for your home and business
            </p>
          </div>
        </section>

        <section className="section-padding bg-hvac-light">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-8 shadow-md">
              <h2 className="text-3xl font-bold mb-6 text-hvac-darkgray">Why Choose Us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <span className="text-hvac-orange font-bold text-2xl">✓</span>
                  <div>
                    <h3 className="font-semibold text-hvac-darkgray mb-1">24/7 Emergency Service</h3>
                    <span className="text-hvac-text">Always available when you need us</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-hvac-orange font-bold text-2xl">✓</span>
                  <div>
                    <h3 className="font-semibold text-hvac-darkgray mb-1">Licensed & Insured</h3>
                    <span className="text-hvac-text">Certified professionals</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-hvac-orange font-bold text-2xl">✓</span>
                  <div>
                    <h3 className="font-semibold text-hvac-darkgray mb-1">Free Estimates</h3>
                    <span className="text-hvac-text">Upfront transparent pricing</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-hvac-orange font-bold text-2xl">✓</span>
                  <div>
                    <h3 className="font-semibold text-hvac-darkgray mb-1">Service Warranty</h3>
                    <span className="text-hvac-text">Backed by our guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-hvac-darkgray text-white section-padding">
          <div className="container-max text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Schedule Your Service?</h2>
            <p className="text-xl mb-8 opacity-90">Expert technicians available 24/7</p>
            <Link href="/contact" className="btn-primary inline-block text-lg">
              Request Service Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
