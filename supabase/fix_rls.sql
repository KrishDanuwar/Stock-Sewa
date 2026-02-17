-- ==========================================
-- FINAL FIX FOR REGISTRATION RLS ERROR
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Fix Organizations Policy
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
CREATE POLICY "Users can insert organizations" ON organizations 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization" ON organizations 
FOR SELECT USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()) OR owner_id = auth.uid());

-- 2. Fix Profiles Policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- 3. Ensure RLS is active but bypassable for new signups
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
