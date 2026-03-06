import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        hvac: {
          orange: '#FF6600',        // Primary Orange
          darkgray: '#1F2937',      // Dark Gray
          yellow: '#FCD34D',        // Accent Yellow
          light: '#F9FAFB',         // Light Background
          lightgray: '#F3F4F6',     // Testimonial Gray
          text: '#374151',          // Supporting Text
          success: '#10B981',       // Success States
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
