import type { Service } from '@/lib/data'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white border-l-4 border-hvac-orange rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-hvac-orange rounded-lg flex items-center justify-center text-white font-bold">
          🔧
        </div>
        <h3 className="text-xl font-bold text-hvac-darkgray">{service.name}</h3>
      </div>
      <p className="text-hvac-text mb-4 leading-relaxed">{service.description}</p>
      {service.price && (
        <p className="text-lg font-semibold text-hvac-orange">{service.price}</p>
      )}
      <button className="mt-4 w-full bg-hvac-yellow text-hvac-darkgray px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200">
        Learn More
      </button>
    </div>
  )
}
