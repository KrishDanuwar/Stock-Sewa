# StockSewa SaaS — Your Trusted Inventory Partner

A production-ready, multi-tenant SaaS application for modern manufacturing and retail businesses. Built with **Next.js 14+**, **Supabase Auth/SSR**, **Stripe**, and **Tailwind CSS**.

## 🚀 Key SaaS Features

- **🔐 Robust Authentication** — Supabase Auth with custom `profiles` and secure session management via Next.js middleware.
- **🏢 Multi-Tenancy** — Strict data isolation using **PostgreSQL Row Level Security (RLS)**. Each organization owns its data.
- **💳 Subscription Billing** — Integrated with **Stripe Checkout** and **Webhooks**. Support for Basic and Pro plans.
- **🧾 Professional Invoices** — Dynamic invoice creation with multi-product line items and **PDF generation** (jspdf).
- **📦 Smart Inventory** — Auto-generated barcodes, real-time stock-out on invoice, and **low stock alerts**.
- **📊 Executive Dashboard** — Real-time SaaS metrics: Total Products, Stock Value, Unpaid Credit, and Today's Revenue.
- **📋 Transaction History** — Comprehensive tracking of payments and stock movements.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + RLS)
- **Payments**: Stripe SDK
- **Styling**: Tailwind CSS + Lucide Icons
- **PDF**: jsPDF + autoTable
- **UI Components**: Sonner (Toast), Radix UI (accessible primitives)

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone <your-repo>
cd StockSewaPT
npm install
```

### 2. Supabase Configuration
1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the **SQL Editor**. This sets up tables, RLS, and Auth triggers.
3. Enable **Google/Email Auth** in the Supabase Dashboard.
4. Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Stripe Configuration
1. Create a Stripe account.
2. Create two Prices (Basic & Pro) in the Stripe Dashboard.
3. Copy the **Secret Key** and **Webhook Secret**.
4. Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

### 4. Environment Variables
Create `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role # For admin tasks if needed

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run it
```bash
npm run dev
```

## 🏗️ Architecture (Multi-Tenant)

- **Organizations**: Root entity for businesses.
- **Profiles**: Links Supabase users to a specific Organization.
- **RLS**: Every table has a `USING (organization_id = (SELECT organization_id FROM profiles...))` policy to ensure data privacy.

## 📄 License
MIT
