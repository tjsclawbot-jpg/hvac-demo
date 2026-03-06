# HVAC Demo Site

A professional HVAC business website with integrated admin panel for easy customization.

## Features

- 🏠 Professional homepage with services showcase
- 👥 Customer testimonials and ratings
- 📞 Contact form and business information
- 💼 Admin dashboard for site customization
- 📱 Fully responsive mobile design
- 🎨 Modern HVAC-themed UI with Tailwind CSS
- 📊 Before/after image slider
- ⏰ Business hours management
- 🎯 Service pricing display
- ❓ FAQ section

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd hvac-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
   - **Public Site:** http://localhost:3000
   - **Admin Panel:** http://localhost:3000/admin

## Project Structure

```
hvac-demo/
├── pages/              # Next.js pages (public site)
│   ├── admin/         # Admin dashboard and setup wizard
│   ├── index.tsx      # Homepage
│   ├── services.tsx   # Services page
│   ├── about.tsx      # About page
│   ├── contact.tsx    # Contact page
│   ├── pricing.tsx    # Pricing page
│   ├── faq.tsx        # FAQ section
│   └── info.tsx       # HVAC info/education
├── app/               # App directory with layout
├── components/        # Reusable React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ServiceCard.tsx
│   ├── TestimonialCard.tsx
│   ├── BeforeAfterSlider.tsx
│   └── LivePreview.tsx
├── lib/               # Utilities and data
│   ├── data.ts        # Central data store
│   ├── formToSite.ts  # Form conversion logic
│   └── constants.ts   # Theme colors and config
├── hooks/             # Custom React hooks
│   └── useFormState.ts
├── public/            # Static assets
└── package.json       # Dependencies
```

## Admin Dashboard

Access the admin panel at `/admin` to:

1. **Step 1:** Enter business information (name, phone, email, address)
2. **Step 2:** Add and manage services with pricing
3. **Step 3:** Add customer testimonials and ratings
4. **Step 4:** Upload before/after and portfolio photos
5. **Step 5:** Configure business hours and emergency service
6. **Confirm:** Review and publish your site live

## Customization

### Colors

Edit `lib/constants.ts` to change the HVAC theme colors:

```typescript
export const COLORS = {
  primary: '#1e40af',      // Blue
  secondary: '#ea580c',    // Orange
  // ... more colors
}
```

### Data

Edit `lib/data.ts` to update:
- Business information
- Services
- Testimonials
- Business hours
- Photos

### Styling

The site uses Tailwind CSS. Edit `tailwind.config.ts` to customize styling.

## Build & Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** npm

## Features Walkthrough

### Homepage
- Hero section with call-to-action
- Services grid
- Customer testimonials
- Featured testimonials carousel
- CTA section

### Services Page
- Complete service list
- Service cards with pricing
- Why choose us section
- Service booking CTA

### Admin Panel
- 5-step setup wizard
- Real-time form validation
- Service management
- Testimonial management
- Photo upload
- Business hours configuration

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_URL=http://localhost:3000
ENABLE_CONTACT_FORM=true
ENABLE_BOOKING=true
BUSINESS_TIMEZONE=America/New_York
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The site is optimized for:
- Fast loading times
- Mobile responsiveness
- SEO friendliness
- Accessibility (WCAG 2.1)

## License

MIT License - feel free to use and modify for your business.

## Support

For issues or questions:
1. Check the FAQ page
2. Visit the Contact page
3. Email: support@example.com

---

**Ready to get started?** Run `npm install && npm run dev` and visit the admin panel to customize your site! 🚀
