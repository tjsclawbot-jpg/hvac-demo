import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { businessInfo } from '@/lib/data'

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-hvac-darkgray to-hvac-orange text-white section-padding">
          <div className="container-max">
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl opacity-95">Get in touch with our team today. We're here to help!</p>
          </div>
        </section>

        <section className="section-padding bg-hvac-light">
          <div className="container-max grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h2 className="text-3xl font-bold mb-6 text-hvac-darkgray">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-hvac-darkgray mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-hvac-light border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-hvac-orange focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-hvac-darkgray mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full bg-hvac-light border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-hvac-orange focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-hvac-darkgray mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full bg-hvac-light border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-hvac-orange focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-hvac-darkgray mb-2">Message</label>
                  <textarea
                    placeholder="Tell us about your HVAC needs"
                    rows={5}
                    className="w-full bg-hvac-light border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-hvac-orange focus:outline-none transition-colors"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full text-lg font-semibold">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-hvac-darkgray">Contact Information</h2>

              <div className="space-y-6">
                {/* Phone Card */}
                <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-lg">
                      📞
                    </div>
                    <h3 className="font-bold text-hvac-darkgray text-lg">Phone</h3>
                  </div>
                  <p className="text-hvac-text ml-13">{businessInfo.phone}</p>
                </div>

                {/* Email Card */}
                <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-lg">
                      ✉️
                    </div>
                    <h3 className="font-bold text-hvac-darkgray text-lg">Email</h3>
                  </div>
                  <p className="text-hvac-text ml-13">{businessInfo.email}</p>
                </div>

                {/* Address Card */}
                <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-lg">
                      📍
                    </div>
                    <h3 className="font-bold text-hvac-darkgray text-lg">Address</h3>
                  </div>
                  <p className="text-hvac-text ml-13">{businessInfo.address}</p>
                </div>

                {/* Hours Card */}
                <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-hvac-orange rounded-lg flex items-center justify-center text-white text-lg">
                      🕐
                    </div>
                    <h3 className="font-bold text-hvac-darkgray text-lg">Business Hours</h3>
                  </div>
                  <div className="ml-13 space-y-1 text-hvac-text">
                    <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                    <p className="mt-3 font-semibold text-hvac-orange">
                      🚨 24/7 Emergency Service Available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick CTA */}
        <section className="bg-hvac-darkgray text-white section-padding">
          <div className="container-max text-center">
            <h2 className="text-3xl font-bold mb-4">Can't Wait to Chat?</h2>
            <p className="text-lg mb-6 opacity-90">Call us directly for immediate assistance</p>
            <a href={`tel:${businessInfo.phone}`} className="btn-primary inline-block text-lg">
              Call Now
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
