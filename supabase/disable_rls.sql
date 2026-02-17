-- ============================================================
-- DISABLE RLS & REMOVE MULTI-TENANCY
-- Run this in your Supabase SQL Editor to remove all
-- Row Level Security policies and allow open access.
-- ============================================================

-- 1. Disable RLS on all application tables
ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_movements DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing RLS policies on these tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN (
            'organizations', 'profiles', 'products', 'customers',
            'invoices', 'invoice_items', 'payments', 'stock_movements'
        )
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- 3. Grant full access to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Verify: List remaining policies (should be empty)
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
