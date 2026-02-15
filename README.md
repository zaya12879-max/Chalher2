# CHALHER Paris - Luxury E-commerce Website

A sophisticated e-commerce platform for CHALHER Paris luxury fashion brand, featuring a full-featured shopping experience with authentication, cart management, and secure checkout.

## Features Implemented

### 🛍️ Shopping Experience
- **Product Gallery**: Display of 18 products with elegant grid layout
- **Product Modal**: Detailed product view with customization options (personalization text)
- **Shopping Cart**: Full cart functionality with add/remove items
- **Cart Sidebar**: Smooth sliding cart with live updates

### 🔐 Authentication System
- **Login & Registration**: Secure authentication with Supabase
- **User Sessions**: Persistent user sessions
- **Protected Routes**: Checkout requires authentication

### 🔍 Search Functionality
- **Live Search**: Real-time product search as you type
- **Search Modal**: Beautiful search interface with product results

### 🍔 Navigation
- **Burger Menu**: Mobile-friendly navigation menu with:
  - Accueil (Home)
  - À propos de nous (About Us)
  - Notre Collection (Our Collection)
  - Contact
- **Social Media Links**: WhatsApp and Instagram integration

### 💳 Checkout System
- **Shipping Information Form**: Complete address collection
- **Multiple Payment Methods**:
  - Credit/Debit Card (with form for card number, expiry, CVV)
  - PayPal integration ready
  - Cash on Delivery
- **Order Summary**: Live calculation of totals
- **Order Management**: Orders saved to database

### 📦 Delivery Information
- **Tooltip**: Hover over "LIVRAISON OFFERTE" to see: "Livraison gratuite à partir de 300 MAD"

### 🎨 Design Features
- Luxury design maintained throughout
- Responsive layout for mobile and desktop
- Smooth animations and transitions
- Premium typography (Playfair Display + Montserrat)

## Database Structure

The application uses Supabase with the following tables:

- **products**: Product catalog
- **cart_items**: User shopping carts
- **orders**: Order records
- **order_items**: Individual items in orders

All tables have Row Level Security (RLS) enabled for data protection.

## File Structure

```
project/
├── index.html          # Main homepage
├── auth.html           # Login/Registration page
├── checkout.html       # Checkout page
├── style.css           # All styling
├── script.js           # Main functionality (cart, search, menu)
├── auth.js             # Authentication logic
├── checkout.js         # Checkout logic
├── supabaseClient.js   # Supabase configuration
├── public/
│   └── images/         # Product images (hijab0.jpeg - hijab18.jpeg)
└── package.json        # Dependencies

```

## Setup Instructions

### 1. Add Your Product Images

Place your product images in the `public/images/` folder:
- `hijab0.jpeg` - Hero background image
- `hijab1.jpeg` to `hijab18.jpeg` - Product images

### 2. Update Social Media Links

In `index.html`, update the social media links:
- WhatsApp: Replace `https://wa.me/33123456789` with your WhatsApp number
- Instagram: Replace `https://instagram.com/chalherparis` with your Instagram handle

### 3. Customize Content

You can customize:
- Brand colors in `style.css` (see `:root` variables)
- Product names and prices in the database
- Shipping information
- Contact details

## How It Works

### Guest Shopping
- Users can browse products without logging in
- Cart is saved to localStorage for guests
- Login required to complete checkout

### Authenticated Shopping
- After login, cart is synced to database
- User can complete checkout
- Orders are saved with user information

### Payment Processing
Currently the payment forms collect information but don't process actual payments. To enable real payment processing:

1. **For Stripe**: Integrate Stripe API for card payments
2. **For PayPal**: Add PayPal SDK integration
3. **For Cash on Delivery**: Already functional - orders are marked as COD

## Technologies Used

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Playfair Display, Montserrat)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Security Features

- Row Level Security (RLS) on all database tables
- Secure password hashing via Supabase Auth
- Protected checkout routes
- Input validation on forms
- XSS protection

## Future Enhancements

Potential additions:
- Real payment gateway integration (Stripe/PayPal)
- Email notifications for orders
- Admin dashboard for order management
- Product reviews and ratings
- Wishlist functionality
- Order tracking
- Multiple product images per item

---

**CHALHER Paris** - Luxe et Élégance © 2026
