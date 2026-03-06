# Components Documentation

## Header Component

**File:** `components/Header.tsx`

Responsive navigation header with logo, menu, and CTA buttons.

### Props
None - uses static content

### Features
- Responsive hamburger menu for mobile
- Logo with branding
- Navigation links (Services, Why Us, Testimonials, Contact)
- Emergency button with phone number
- Free quote CTA button
- Sticky positioning

### Usage
```jsx
import Header from '@/components/Header';

export default function Layout() {
  return (
    <>
      <Header />
      {/* page content */}
    </>
  );
}
```

---

## Footer Component

**File:** `components/Footer.tsx`

Comprehensive footer with company info, links, hours, and contact details.

### Props
None - uses static content

### Sections
1. **Company Info** - Logo, description, social links
2. **Services Links** - Quick navigation to main services
3. **Hours** - Business hours and emergency info
4. **Contact** - Address, phone, email
5. **Bottom Bar** - Copyright and legal links

### Usage
```jsx
import Footer from '@/components/Footer';

export default function Layout() {
  return (
    <>
      {/* page content */}
      <Footer />
    </>
  );
}
```

---

## ServiceCard Component

**File:** `components/ServiceCard.tsx`

Reusable card component for displaying HVAC services.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `icon` | React.ReactNode | - | ✅ | Emoji or icon to display |
| `title` | string | - | ✅ | Service name |
| `description` | string | - | ✅ | Service description |
| `features` | string[] | [] | ❌ | List of features/benefits |
| `cta` | string | "Learn More" | ❌ | Button text |
| `ctaLink` | string | "#" | ❌ | Button link/href |
| `isPrimary` | boolean | false | ❌ | Apply primary styling (highlighted) |

### Features
- Icon with colored background
- Feature bullet list
- Hover effects with elevation
- Responsive design
- Primary/secondary styling options

### Usage
```jsx
import ServiceCard from '@/components/ServiceCard';

<ServiceCard
  icon="❄️"
  title="AC Installation"
  description="Expert installation of high-efficiency systems"
  features={[
    'Energy-efficient units',
    '10-year warranty',
    'Same-day service'
  ]}
  cta="Get Quote"
  ctaLink="/quote"
  isPrimary={false}
/>
```

---

## TestimonialCard Component

**File:** `components/TestimonialCard.tsx`

Customer testimonial display card with ratings and avatars.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `name` | string | - | ✅ | Customer name |
| `role` | string | - | ✅ | Customer title/location |
| `content` | string | - | ✅ | Testimonial text |
| `rating` | number | 5 | ❌ | Star rating (1-5) |
| `image` | string | - | ❌ | Avatar image URL |

### Features
- Star rating display
- Circular avatar (image or initials)
- Quote styling
- Accent line separator
- Hover shadow effect
- Responsive layout

### Usage
```jsx
import TestimonialCard from '@/components/TestimonialCard';

<TestimonialCard
  name="Sarah Johnson"
  role="Homeowner, Arlington VA"
  content="Excellent service! Professional team and fair pricing."
  rating={5}
  image="https://example.com/avatar.jpg"
/>
```

---

## BeforeAfterSlider Component

**File:** `components/BeforeAfterSlider.tsx`

Interactive before/after image slider for gallery comparisons.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `beforeImage` | string | - | ✅ | URL of "before" image |
| `afterImage` | string | - | ✅ | URL of "after" image |
| `beforeLabel` | string | "Before" | ❌ | Label for before image |
| `afterLabel` | string | "After" | ❌ | Label for after image |
| `height` | string | "400px" | ❌ | Container height (CSS value) |

### Features
- Draggable slider handle
- Touch support for mobile
- Arrow icon in handle
- Labels on both sides
- Cursor feedback
- Responsive images
- Accessibility support (ARIA labels)

### Usage
```jsx
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

<BeforeAfterSlider
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  beforeLabel="Old Unit"
  afterLabel="New Install"
  height="500px"
/>
```

---

## Global Styles

**File:** `app/globals.css`

Custom utility classes for common patterns:

### Button Classes
- `.btn-primary` - Blue primary button
- `.btn-secondary` - Orange secondary button
- `.btn-outline` - Outlined button
- `.btn-emergency` - Red emergency button (animated)

### Section Classes
- `.hero-section` - Full-width hero with gradient
- `.services-grid` - Responsive grid for services (1/2/3 cols)
- `.testimonials-grid` - Responsive grid for testimonials
- `.section-padding` - Standard padding for sections
- `.container-custom` - Max-width container with padding

### Text Classes
- `.heading-primary` - Large primary heading
- `.heading-secondary` - Secondary heading
- `.text-accent` - Orange accent text

### Other Classes
- `.slider-handle` - Before/after slider handle
- `.slider-label` - Label on slider images
- `.before-after-slider` - Container for slider

---

## Color Reference

### Primary Colors
- **Blue**: `#1e40af` (rgb(30, 64, 175))
- **Orange**: `#ea580c` (rgb(234, 88, 12))
- **White**: `#ffffff`
- **Dark Gray**: `#374151`
- **Light Gray**: `#f9fafb`

### Tailwind Equivalents
- Blue: `blue-950`
- Orange: `orange-600`
- Gray: `gray-50` to `gray-900`

---

## Responsive Design

All components follow mobile-first design:

- **Mobile** (< 640px): Single column, full-width
- **Tablet** (640px - 1024px): 2 columns where applicable
- **Desktop** (> 1024px): 3+ columns, full layouts

Use Tailwind breakpoints:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>
```

---

## Accessibility Features

- **ARIA Labels** - All interactive elements have descriptive labels
- **Semantic HTML** - Proper use of `<button>`, `<nav>`, `<footer>`, etc.
- **Focus States** - Visible focus indicators on all interactive elements
- **Keyboard Navigation** - Full keyboard support
- **Color Contrast** - WCAG AA compliant contrast ratios
- **Icon Text** - Icons always accompanied by text

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

---

## Performance Notes

- Components use CSS transitions (no heavy JavaScript)
- Images are optimized for different screen sizes
- CSS is minified via Tailwind production build
- No external animation libraries needed
- Smooth 60fps animations

---

Last Updated: 2026-03-05
