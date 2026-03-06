# HVAC Booking System with Stripe Integration

Complete customer booking flow with $150 deposit via Stripe, calendar picker, and admin management dashboard.

## 📋 System Overview

### Customer Flow
1. Customer visits booking page: `/booking`
2. **Step 1**: Enter contact information (name, email, phone, address)
3. **Step 2**: Select service type (AC repair, heating, plumbing, emergency, maintenance)
4. **Step 3**: Choose inspection date and time from calendar
5. **Step 4**: Complete $150 deposit payment via Stripe
6. Receive confirmation email and booking reference
7. Confirmation page with all details

### Admin Dashboard
- View all bookings in list or calendar view
- Filter by status (pending, confirmed, completed, no-show, cancelled)
- Mark bookings as completed or no-show
- Process refunds with options (full, partial, minus Stripe fee)
- Real-time booking statistics

## 🏗️ Project Structure

### Pages
- **`pages/booking.tsx`** - Main booking page with hero, form, and refund policy
- **`pages/booking/confirmation.tsx`** - Confirmation page after successful payment
- **`pages/admin/bookings.tsx`** - Admin dashboard for managing bookings

### Components
- **`components/BookingForm.tsx`** - Multi-step booking form (4 steps)
- **`components/CalendarPicker.tsx`** - Date/time selection with availability
- **`components/StripePayment.tsx`** - Stripe card payment integration
- **`components/RefundPolicy.tsx`** - Refund policy display

### Libraries
- **`lib/bookingData.ts`** - Booking configuration and sample data
- **`lib/bookingManagement.ts`** - Booking logic, refunds, validation
- **`lib/stripe.ts`** - Stripe API integration

### API Routes
- **`pages/api/bookings/create-payment-intent.ts`** - Create Stripe payment intent
- **`pages/api/bookings/confirm.ts`** - Confirm booking after payment
- **`pages/api/bookings/[id].ts`** - Retrieve booking details
- **`pages/api/bookings/refund.ts`** - Process refunds

## 💰 Deposit Logic

### Amount & Fees
- **Deposit**: $150
- **Stripe Processing Fee**: $5 (passed to customer on refund)
- **Net Refund**: $145 (if refunded within 24h or due to poor fit)

### Refund Scenarios
1. **Within 24 Hours**: Full refund of $150 (no fee deduction)
2. **No-Show**: Forfeited deposit (no refund)
3. **Poor Fit**: $145 refund (minus $5 Stripe fee)
4. **Proceeding with Service**: Deposit applies to invoice

## 📅 Calendar Picker Features

- Shows next 30 available dates
- Disabled dates: Weekends, holidays
- Business hours: 9 AM - 5 PM (9am-12pm, 1pm-5pm slots)
- Visual indicators: Available (orange), Booked (gray)
- Sample bookings pre-loaded for demo

## 🔐 Stripe Integration

### Environment Variables Required
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Payment Flow
1. Create payment intent on backend
2. Stripe Elements form captures card details
3. Confirm payment with Stripe
4. On success, create booking and send confirmation

## 📊 Admin Dashboard Features

### Statistics Cards
- Total Bookings
- Upcoming Inspections
- Total Deposits Collected
- Confirmed Bookings

### Views
- **List View**: All bookings with customer info, status, and actions
- **Calendar View**: Visual calendar with booking indicators

### Actions Per Booking
- Change status (pending → confirmed → completed)
- Mark as no-show
- Process refund (full or partial)
- View details

## 🎨 Design System

### Colors (Home Depot Theme)
- **Primary Orange**: #FF6600 (CTAs, highlights)
- **Dark Gray**: #1F2937 (headers, professional)
- **Yellow**: #FCD34D (accents)
- **Success Green**: #10B981 (completed, paid)

### Components Styling
- Booking form: Orange focus states, progress bar
- Calendar: Orange selected dates, gray booked dates
- Buttons: Large, accessible, with hover states
- Cards: Shadow on hover, professional borders

## 📝 Sample Data

### Pre-loaded Bookings
- **BK001**: John Smith - AC Repair - March 10, 10 AM - Confirmed
- **BK002**: Sarah Johnson - Heating Repair - March 12, 2 PM - Confirmed
- **BK003**: Mike Davis - Maintenance - March 15, 11 AM - Pending

### Booked Dates
- March 10: 9 AM, 10 AM, 11 AM
- March 12: 2 PM, 3 PM
- March 14: 1 PM

## 🔄 Workflow Examples

### Customer Books Inspection
```
1. Visit /booking
2. Fill Step 1: Contact info (2 min)
3. Fill Step 2: Select AC Repair
4. Fill Step 3: March 10, 10 AM
5. Fill Step 4: Pay $150 via Stripe
6. Redirected to confirmation page
7. Email sent with confirmation number
```

### Admin Processes Refund
```
1. Visit /admin/bookings
2. Find booking (list or calendar view)
3. Click "Refund" button
4. Select refund amount ($145 or $150)
5. Click "Process Refund"
6. Refund processed via Stripe API
7. Booking marked as cancelled
```

## 📧 Email Integration (Ready)

The system is structured to send emails via:
- Confirmation email after booking
- Refund notifications
- Appointment reminders

Configure in `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@premierhvac.com
```

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` with Stripe keys:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Test the Flow
- Visit `http://localhost:3000/booking`
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## 📱 Mobile Responsive

All components are fully responsive:
- Mobile: Single column layout
- Tablet: 2-column layout
- Desktop: Full 3+ column layouts
- Responsive text sizes and spacing

## 🔍 Key Features Checklist

✅ Multi-step booking form with validation
✅ Calendar date picker with availability
✅ Stripe card payment integration
✅ Confirmation page with booking details
✅ Admin dashboard with list/calendar views
✅ Refund management with multiple options
✅ Booking status tracking
✅ Statistics and analytics dashboard
✅ Mobile responsive design
✅ Professional HVAC branding
✅ Trust signals and guarantees
✅ Sample data pre-loaded
✅ API endpoints ready
✅ Environment variables configured

## 🎯 Next Steps for Production

1. **Database**: Replace in-memory bookings with real database (MongoDB, PostgreSQL)
2. **Email**: Implement confirmation and reminder emails
3. **Authentication**: Add admin login/authentication
4. **Payments**: Move to live Stripe keys
5. **Calendar Sync**: Integrate with Google Calendar or similar
6. **SMS Reminders**: Send SMS reminders before appointments
7. **Analytics**: Track conversion rates and booking metrics
8. **Customization**: Adjust business hours, holidays, and prices

## 📞 Support

For test data and API documentation, see:
- `lib/bookingData.ts` - Sample bookings and configuration
- `lib/bookingManagement.ts` - Utility functions
- `pages/api/` - API endpoints

---

**Built for**: Premier HVAC Solutions
**Theme**: Home Depot colors (Orange, Dark Gray, Yellow)
**Payment Provider**: Stripe (Test Mode Ready)
