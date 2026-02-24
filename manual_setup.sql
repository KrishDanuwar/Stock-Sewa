-- ======================================================
-- MANUAL REPAIR SCRIPT
-- Run this in your Supabase SQL Editor
-- This will manually create the organization and link it to your user
-- ======================================================

DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    -- 1. Find the user ID by email
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'krishsingh347@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found! Please sign up in the application UI first with krishsingh347@gmail.com';
    END IF;

    -- 2. Create the organization "GK Paints"
    INSERT INTO public.organizations (name)
    VALUES ('GK Paints')
    RETURNING id INTO v_org_id;

    -- 3. Create or Update the profile for "gautam"
    INSERT INTO public.profiles (id, organization_id, username)
    VALUES (v_user_id, v_org_id, 'gautam')
    ON CONFLICT (id) DO UPDATE 
    SET organization_id = EXCLUDED.organization_id,
        username = EXCLUDED.username;

    RAISE NOTICE 'SUCCESS: GK Paints organization created and linked to Gautam.';
END $$;
