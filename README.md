# MeroStock — Inventory Management & Billing

A complete production-ready inventory management and billing web application built with **Next.js 14+**, **Supabase**, and **Tailwind CSS**.

## Features

- **📦 Inventory Management** — Add, edit, delete, search products with barcode support
- **🧾 Invoice System** — Create invoices with multiple products, auto-calculate totals
- **💳 Credit System** — Partial payments, track paid/remaining, update status automatically
- **👥 Customer Management** — Add customers, view credit balance
- **📊 Dashboard** — Total products, stock value, unpaid invoices, today's revenue
- **🖨️ Print** — Printable invoice layout with `window.print()`
- **📋 Stock History** — Track all stock movements (IN/OUT), manual stock-in

## Tech Stack

- Next.js 14+ (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- TypeScript
- Server Actions

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd MeroStockPT
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push code to GitHub
2. Import into [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy ✅

## Database Schema

See `supabase/schema.sql` — includes 6 tables:
`products`, `customers`, `invoices`, `invoice_items`, `stock_movements`, `payments`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard
│   ├── products/           # Products CRUD
│   ├── customers/          # Customers
│   ├── invoices/           # Invoices list
│   │   ├── new/            # Create invoice
│   │   └── [id]/           # Invoice detail & print
│   ├── payments/           # Payment history
│   └── stock/              # Stock movements
├── components/
│   ├── Sidebar.tsx
│   ├── SearchBar.tsx
│   ├── Modal.tsx
│   └── StatCard.tsx
└── lib/
    ├── supabase.ts         # Supabase client
    └── actions/            # Server actions
        ├── products.ts
        ├── customers.ts
        ├── invoices.ts
        ├── payments.ts
        ├── stock.ts
        └── dashboard.ts
```
