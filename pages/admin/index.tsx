import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

export default function AdminDashboard() {
  const steps = [
    {
      num: 1,
      title: 'Business Information',
      description: 'Enter your company name, contact details, and business description.',
      icon: '🏢',
    },
    {
      num: 2,
      title: 'Services',
      description: 'Add and customize the services your business offers with pricing.',
      icon: '🔧',
    },
    {
      num: 3,
      title: 'Testimonials',
      description: 'Showcase your best customer testimonials and reviews on your site.',
      icon: '⭐',
    },
    {
      num: 4,
      title: 'Photos',
      description: 'Upload before/after photos and portfolio images of your work.',
      icon: '📸',
    },
    {
      num: 5,
      title: 'Business Hours',
      description: 'Set your operating hours and special service availability.',
      icon: '📅',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-hvac-darkgray to-gray-900">
      {/* Header */}
      <AdminHeader title="ProFlow HVAC - Admin Dashboard" subtitle="Complete these steps to customize your website" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Intro Section */}
        <div className="mb-12">
          <div className="bg-gray-800 border-l-4 border-hvac-orange rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-3">🚀 Site Setup Wizard</h2>
            <p className="text-gray-300 text-lg">
              Welcome to your admin dashboard! Complete the following 5 steps to customize your HVAC business website. Changes will be previewed on the right side in real-time.
            </p>
            <div className="mt-4 flex gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-hvac-yellow">
                <span>✓</span> Dark contractor panel (left)
              </div>
              <div className="flex items-center gap-2 text-hvac-yellow">
                <span>✓</span> Live customer preview (right)
              </div>
              <div className="flex items-center gap-2 text-hvac-yellow">
                <span>✓</span> Responsive design
              </div>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => (
            <Link key={step.num} href={`/admin/step${step.num}`}>
              <div className="group relative bg-gray-800 border-2 border-gray-700 hover:border-hvac-orange rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 h-full">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-hvac-orange/0 to-hvac-orange/0 group-hover:from-hvac-orange/10 group-hover:to-transparent rounded-lg transition-all duration-300"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-hvac-orange rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg group-hover:shadow-orange-500/50 transition-all">
                      {step.icon}
                    </div>
                    <div className="w-10 h-10 bg-gray-700 group-hover:bg-hvac-orange rounded-full flex items-center justify-center font-bold text-white transition-all">
                      {step.num}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-hvac-yellow transition-colors">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>

                  <div className="mt-4 flex items-center gap-2 text-hvac-orange font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Get Started</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Review & Publish Card */}
          <Link href="/admin/confirm">
            <div className="group relative bg-gradient-to-br from-hvac-orange via-orange-500 to-red-500 border-2 border-hvac-yellow rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50 h-full">
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-3xl font-bold">✓</div>
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold text-white">
                    6
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Review & Publish</h3>
                <p className="text-white text-sm opacity-95">Review all your information and publish your site live.</p>

                <div className="mt-4 flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Final Step</span>
                  <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links & Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Links */}
          <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 hover:border-hvac-orange transition">
            <h3 className="font-bold text-hvac-yellow mb-4">🔗 Quick Links</h3>
            <div className="space-y-3">
              <Link href="/">
                <div className="text-hvac-orange hover:text-hvac-yellow transition cursor-pointer font-semibold">
                  👁️ View Live Site
                </div>
              </Link>
              <Link href="/admin">
                <div className="text-hvac-orange hover:text-hvac-yellow transition cursor-pointer font-semibold">
                  📊 Admin Dashboard
                </div>
              </Link>
              <div className="text-gray-400 cursor-pointer hover:text-hvac-orange transition font-semibold">
                📞 Support
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 hover:border-hvac-orange transition">
            <h3 className="font-bold text-hvac-yellow mb-4">✨ System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Setup Progress</span>
                <span className="text-hvac-orange font-bold">0/5 Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Website Status</span>
                <span className="text-gray-400">Not Published</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-gray-400">Never</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">SSL Certificate</span>
                <span className="text-green-400 font-bold">✓ Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-8 bg-blue-900 bg-opacity-30 border-2 border-blue-700 rounded-lg">
          <h3 className="font-bold text-hvac-yellow mb-3">ℹ️ How the Split-Screen Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 text-sm">
            <div>
              <p className="font-bold text-hvac-yellow mb-2">LEFT SIDE (Your Admin Panel)</p>
              <p>Dark background with orange accents. This is where you enter all your business data. Professional and easy on the eyes during long data entry sessions.</p>
            </div>
            <div>
              <p className="font-bold text-hvac-yellow mb-2">RIGHT SIDE (Customer Preview)</p>
              <p>Light background showing exactly what your customers will see. Watch changes update in real-time as you type, so you know exactly what impression you're making.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
