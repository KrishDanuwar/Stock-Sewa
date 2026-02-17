-- ============================================
-- FINAL AUTH REFACTOR (NATIVE SUPABASE)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the automation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
BEGIN
  -- Extract org_name from metadata (passed from our new signup code)
  org_name := COALESCE(new.raw_user_meta_data->>'org_name', 'My Organization');

  -- Create Organization
  INSERT INTO public.organizations (name, owner_id, subscription_status)
  VALUES (org_name, new.id, 'trialing')
  RETURNING id INTO org_id;

  -- Create Profile
  INSERT INTO public.profiles (id, organization_id, email)
  VALUES (new.id, org_id, new.email);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Link the function to Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Restore Strict Security
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
CREATE POLICY "Users can insert organizations" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
