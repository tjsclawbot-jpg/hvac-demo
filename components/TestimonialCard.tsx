import type { Testimonial } from '@/lib/data'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < testimonial.rating)

  return (
    <div className="bg-hvac-lightgray border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex gap-1 mb-4">
        {stars.map((filled, i) => (
          <span key={i} className={filled ? 'text-hvac-orange text-lg' : 'text-gray-300 text-lg'}>
            ★
          </span>
        ))}
      </div>
      <p className="text-hvac-text mb-4 italic leading-relaxed">"{testimonial.content}"</p>
      <p className="font-semibold text-hvac-darkgray">— {testimonial.author}</p>
    </div>
  )
}
