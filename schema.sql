-- ======================================================
-- STOCK SEWA: COMPLETE SUPABASE SCHEMA
-- Run in Supabase SQL Editor in this exact order
-- ======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- 1. ORGANIZATIONS (Tenants)
-- ======================================================
CREATE TABLE IF NOT EXISTS organizations (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    pan_vat    TEXT,
    address    TEXT,
    phone      TEXT,
    logo_url   TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 2. PROFILES (Link auth.users → organizations)
-- ======================================================
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    username        TEXT UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 3. PRODUCTS
-- ======================================================
CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name            TEXT NOT NULL,
    barcode         TEXT,
    description     TEXT,
    price           DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_price      DECIMAL(12, 2) DEFAULT 0.00,
    stock_quantity  INTEGER NOT NULL DEFAULT 0,
    unit            TEXT DEFAULT 'pcs',
    category        TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 4. CUSTOMERS
-- ======================================================
CREATE TABLE IF NOT EXISTS customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name            TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    pan_number      TEXT,
    address         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 5. INVOICES
-- ======================================================
CREATE TABLE IF NOT EXISTS invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
    invoice_number  TEXT NOT NULL,
    invoice_type    TEXT NOT NULL CHECK (invoice_type IN ('normal', 'pan', 'vat')),
    subtotal        DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment_method  TEXT DEFAULT 'cash',
    notes           TEXT,
    date_ad         DATE DEFAULT CURRENT_DATE,
    date_bs         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 6. INVOICE ITEMS (Snapshot of products at time of sale)
-- ======================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id  UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  DECIMAL(12, 2) NOT NULL
);

-- ======================================================
-- 7. STOCK MOVEMENTS (Immutable audit log)
-- ======================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    movement_type   TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity        INTEGER NOT NULL,
    reference_id    UUID,  -- invoice_id or manual adjustment
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 8. DB TRIGGER: Auto-create Organization on Signup
-- ======================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_org_id UUID;
    org_name TEXT;
    username_val TEXT;
BEGIN
    -- Get org_name and username from user metadata
    org_name := COALESCE(NEW.raw_user_meta_data->>'org_name', 'My Shop');
    username_val := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

    -- Create the organization
    INSERT INTO public.organizations (name)
    VALUES (org_name)
    RETURNING id INTO new_org_id;

    -- Create the profile linking user to organization
    INSERT INTO public.profiles (id, organization_id, username)
    VALUES (NEW.id, new_org_id, username_val);

    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ======================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ======================================================

-- Helper function to get current user's org_id (in public schema to avoid permission errors)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ORGANIZATIONS: Users can only see their own org
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON organizations
    FOR ALL USING (id = public.current_org_id());

-- PROFILES: Users can only see their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_isolation" ON profiles
    FOR ALL USING (organization_id = public.current_org_id());

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_isolation" ON products
    FOR ALL USING (organization_id = public.current_org_id());

-- CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_isolation" ON customers
    FOR ALL USING (organization_id = public.current_org_id());

-- INVOICES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_isolation" ON invoices
    FOR ALL USING (organization_id = public.current_org_id());

-- INVOICE_ITEMS (via invoice's org)
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items_isolation" ON invoice_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE organization_id = public.current_org_id()
        )
    );

-- STOCK_MOVEMENTS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_movements_isolation" ON stock_movements
    FOR ALL USING (organization_id = public.current_org_id());