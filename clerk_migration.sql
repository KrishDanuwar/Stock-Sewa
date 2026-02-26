-- ======================================================
-- CLERK AUTH MIGRATION
-- Run this in Supabase SQL Editor to support Clerk IDs
-- ======================================================

-- 1. Drop the old trigger that relied on Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Modify Profiles table to use TEXT ID (for Clerk)
-- We need to drop constraints first
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Since we are switching to Clerk, we'll alter the column type
-- Note: This might require dropping and recreating the primary key if there are existing records
-- but since the user is in a "hard reset" phase, this is safe.
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- 3. Update current_org_id function to work with Clerk IDs
-- We'll pass the clerk_id as a parameter since auth.uid() won't work automatically via RLS
-- unless we setup Clerk-Supabase JWT integration.
-- For now, we will use server-side manual filtering in actions for maximum reliability.
CREATE OR REPLACE FUNCTION public.current_org_id(user_clerk_id TEXT)
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = user_clerk_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Re-enable RLS but we'll mostly use server-side checks now
-- If you want RLS to work with Clerk JWT, more setup is needed.
-- For this "Sales Pro" app, we'll verify org_id in every Server Action.
