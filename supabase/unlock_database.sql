-- ==========================================
-- MeroStock OPEN ACCESS UNLOCK SCRIPT
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Disable RLS on all tables for guest access
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- 2. Drop all restrictive policies (optional but clean)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Org data isolation" ON products;
DROP POLICY IF EXISTS "Org data isolation" ON customers;
DROP POLICY IF EXISTS "Org data isolation" ON invoices;
DROP POLICY IF EXISTS "Org data isolation" ON invoice_items;
DROP POLICY IF EXISTS "Org data isolation" ON stock_movements;
DROP POLICY IF EXISTS "Org data isolation" ON payments;

-- 3. Ensure the Default Organization exists (CRITICAL for data consistency)
INSERT INTO organizations (id, name, owner_id, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'MeroStock Shop', 
  '00000000-0000-0000-0000-000000000000', 
  'active'
)
ON CONFLICT (id) DO UPDATE 
SET name = 'MeroStock Shop', subscription_status = 'active';

-- 4. Enable a catch-all profile for the guest user (optional safety)
INSERT INTO profiles (id, organization_id, email)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  'guest@merostock.local'
)
ON CONFLICT (id) DO NOTHING;
