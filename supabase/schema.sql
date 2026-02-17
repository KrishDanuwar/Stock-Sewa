-- ============================================
-- MeroStock SaaS — Supabase PostgreSQL Schema
-- Multi-tenant SaaS with Organizations & Profiles
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL, -- Links to auth.users
  subscription_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (links auth.users to an organization)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, barcode) -- Barcode unique per organization
);

-- 4. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'partial', 'unpaid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number) -- Invoice number unique per organization
);

-- 6. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 7. Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL,
  reference TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9/10. Supabase Native Auth Trigger
-- Automatically create Org and Profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
BEGIN
  -- Extract org_name from metadata or use email prefix
  org_name := COALESCE(
    new.raw_user_meta_data->>'org_name', 
    split_part(new.email, '@', 1) || '''s Shop'
  );

  -- 1. Create Organization
  INSERT INTO public.organizations (name, owner_id, subscription_status)
  VALUES (org_name, new.id, 'trialing')
  RETURNING id INTO org_id;

  -- 2. Create Profile
  INSERT INTO public.profiles (id, organization_id, email)
  VALUES (new.id, org_id, new.email);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Row Level Security (STRICT MODE)
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can ONLY see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- No longer needed for frontend as trigger handles it, but keep for safety/manual
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: Users can ONLY see the organization they belong to
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization" ON organizations FOR SELECT 
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()) OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
-- No longer needed for frontend as trigger handles it
CREATE POLICY "Users can insert organizations" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update organization" ON organizations;
CREATE POLICY "Owners can update organization" ON organizations FOR UPDATE USING (auth.uid() = owner_id);

-- Business tables: Isolation based on organization_id
DROP POLICY IF EXISTS "Org data isolation" ON products;
CREATE POLICY "Org data isolation" ON products FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Org data isolation" ON customers;
CREATE POLICY "Org data isolation" ON customers FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Org data isolation" ON invoices;
CREATE POLICY "Org data isolation" ON invoices FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Org data isolation" ON invoice_items;
CREATE POLICY "Org data isolation" ON invoice_items FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Org data isolation" ON stock_movements;
CREATE POLICY "Org data isolation" ON stock_movements FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Org data isolation" ON payments;
CREATE POLICY "Org data isolation" ON payments FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- ============================================
-- Indexes
-- ============================================
DROP INDEX IF EXISTS idx_products_org;
CREATE INDEX idx_products_org ON products(organization_id);

DROP INDEX IF EXISTS idx_customers_org;
CREATE INDEX idx_customers_org ON customers(organization_id);

DROP INDEX IF EXISTS idx_invoices_org;
CREATE INDEX idx_invoices_org ON invoices(organization_id);

DROP INDEX IF EXISTS idx_profiles_org;
CREATE INDEX idx_profiles_org ON profiles(organization_id);
