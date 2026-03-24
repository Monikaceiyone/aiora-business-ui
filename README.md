# AIORA Business UI

Frontend application for the AIORA AI-powered business automation platform. Built with Next.js 16, React 19, and Tailwind CSS, providing a modern interface for business management, AI integrations, and analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.9.0
- npm or yarn

### Installation

```bash
# Clone and navigate to frontend
cd Business-ui

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The application will start on http://localhost:3000

## 📁 Project Structure

```
Business-ui/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (website)/    # Marketing website pages
│   │   ├── dashboard/    # Business dashboard pages
│   │   └── store/        # Seller store pages
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── dashboard/   # Dashboard-specific components
│   │   ├── website/     # Marketing site components
│   │   └── catalog/     # Product catalog components
│   ├── lib/             # Utilities and API client
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── dist/               # Built application (after build)
```

## 🛠 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 🎨 Key Features

### 🏠 Marketing Website
- **Landing Page** - Product showcase and features
- **Core Suite** - Detailed product information
- **Pricing** - Transparent pricing structure
- **Company Pages** - About, careers, culture, etc.

### 🔐 Authentication
- **Google OAuth** - Secure seller authentication
- **Magic Links** - Passwordless login system
- **Phone Verification** - Indian phone number validation

### 📊 Business Dashboard
- **Analytics** - Usage statistics and metrics
- **Order Management** - Track and manage orders
- **Catalog Management** - Product and inventory control
- **Availability** - Appointment scheduling
- **Conversations** - Voice AI call history
- **Settings** - Business configuration

### 🛍️ Seller Stores
- **Dynamic Stores** - `{slug}.website.aiora.live`
- **Product Catalogs** - Customer-facing product listings
- **Order Placement** - Customer ordering interface

## 🔌 API Integration

The frontend communicates with the backend API using a centralized API client:

```typescript
import { apiClient } from '@/lib/api-client';

// Authentication
const context = await apiClient.getSellerContext(token);

// Catalog management
const products = await apiClient.getCatalogProducts(sellerId);
const newProduct = await apiClient.createProduct(productData);

// Orders and payments
const order = await apiClient.createTopupOrder(orderData);
const verification = await apiClient.verifyPayment(paymentData);

// Voice AI
const availability = await apiClient.getAvailability(sellerId);
const conversations = await apiClient.getConversations(sellerId);
```

## 🎨 UI Components

### Design System
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Consistent iconography
- **Recharts** - Data visualization

### Component Library
```typescript
// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// Dashboard Components
import { OrdersTable } from '@/components/dashboard/orders-table';
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { CatalogManager } from '@/components/catalog/catalog-manager';
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Client-side)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Environment
NODE_ENV=development
```

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: "standalone",
  turbopack: { root: process.cwd() },
  // Optimized for containerized deployment
};
```

## 🛣️ Routing

### App Router Structure
- `(auth)/login` - Seller authentication
- `(website)/*` - Marketing pages
- `dashboard/*` - Business management interface
- `store/[slug]` - Dynamic seller stores

### Route Groups
- `(auth)` - Authentication-related pages
- `(website)` - Public marketing pages
- No grouping - Application pages (dashboard, store)

## 🎯 State Management

### Client-Side State
- **React Hooks** - Local component state
- **Supabase Client** - Real-time data subscriptions
- **API Client** - Centralized data fetching

### Authentication State
```typescript
// Example authentication flow
const { data: session } = await supabase.auth.getSession();
if (session) {
  const context = await apiClient.getSellerContext(session.access_token);
  // Update UI with seller context
}
```

## 📱 Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Tablet Support** - Enhanced tablet experience
- **Desktop** - Full-featured desktop interface
- **Touch-Friendly** - Optimized for touch interactions

## 🔍 SEO & Performance

- **Next.js App Router** - Server-side rendering
- **Static Generation** - Pre-built marketing pages
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic code splitting
- **Turbopack** - Fast development builds

## 🧪 Development

### Code Quality
```bash
npm run lint        # ESLint checking
npm run type-check  # TypeScript validation
```

### Component Development
```typescript
// Example component structure
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export function ProductManager() {
  const [products, setProducts] = useState([]);
  
  const loadProducts = async () => {
    const result = await apiClient.getCatalogProducts(sellerId);
    if (result.success) {
      setProducts(result.data);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={loadProducts}>Load Products</Button>
      {/* Product list */}
    </div>
  );
}
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod
```

### Docker (Optional)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next/standalone ./
COPY public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔗 Integration with Backend

### API Communication
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: Bearer token in headers
- **Error Handling**: Centralized error management
- **Type Safety**: TypeScript interfaces for API responses

### Real-time Features
```typescript
// Supabase real-time subscriptions
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      // Update UI with new order
    }
  )
  .subscribe();
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes
```typescript
// Consistent spacing and colors
const styles = {
  container: "max-w-6xl mx-auto px-6",
  card: "bg-white border border-gray-200 rounded-xl p-6",
  button: "bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800",
  input: "border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
};
```

### Animation Guidelines
```typescript
// Framer Motion animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
```

## 🤝 Contributing

1. Follow the existing component structure
2. Use TypeScript for all new code
3. Follow Tailwind CSS conventions
4. Add proper error handling
5. Update this README for new features

## 📞 Support

For frontend issues, check:
1. Browser console for JavaScript errors
2. Network tab for API request failures
3. Environment variable configuration
4. Component prop validation