import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { businessInfo } from '@/lib/data'

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-hvac-darkgray to-hvac-orange text-white section-padding">
          <div className="container-max">
            <h1 className="text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl opacity-95">Learn about our commitment to excellence and customer satisfaction</p>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-hvac-darkgray">Who We Are</h2>
                <p className="text-hvac-text mb-4 leading-relaxed text-lg">
                  {businessInfo.description}
                </p>
                <p className="text-hvac-text mb-4 leading-relaxed">
                  With over 20 years of experience, our team of certified technicians is dedicated
                  to providing the highest quality HVAC services to the community.
                </p>
                <p className="text-hvac-text leading-relaxed">
                  We pride ourselves on our professionalism, reliability, and customer satisfaction.
                </p>
              </div>

              <div className="bg-hvac-lightgray border-l-4 border-hvac-orange rounded-lg p-8 shadow-md">
                <h3 className="text-2xl font-bold mb-6 text-hvac-darkgray">Our Core Values</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-hvac-orange rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <h4 className="font-bold text-hvac-darkgray">Excellence</h4>
                    </div>
                    <p className="text-hvac-text ml-11">
                      We deliver superior quality in every service we provide.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-hvac-orange rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <h4 className="font-bold text-hvac-darkgray">Integrity</h4>
                    </div>
                    <p className="text-hvac-text ml-11">
                      Honest pricing and transparent communication always.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-hvac-orange rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <h4 className="font-bold text-hvac-darkgray">Reliability</h4>
                    </div>
                    <p className="text-hvac-text ml-11">
                      On-time service you can count on, every single time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-hvac-light section-padding border-t-4 border-hvac-orange">
          <div className="container-max">
            <h2 className="text-4xl font-bold text-center mb-12 text-hvac-darkgray">
              Our Track Record
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <div className="text-5xl font-bold text-hvac-orange mb-3">20+</div>
                <p className="text-hvac-text font-semibold">Years of Experience</p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <div className="text-5xl font-bold text-hvac-orange mb-3">1000+</div>
                <p className="text-hvac-text font-semibold">Happy Customers</p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <div className="text-5xl font-bold text-hvac-orange mb-3">100%</div>
                <p className="text-hvac-text font-semibold">Satisfaction Guarantee</p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <div className="text-5xl font-bold text-hvac-orange mb-3">24/7</div>
                <p className="text-hvac-text font-semibold">Emergency Service</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
