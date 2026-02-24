-- Append this to schema.sql -- run in Supabase SQL Editor

-- ======================================================
-- 10. HELPER FUNCTION: Decrement stock safely
-- ======================================================
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_name_manual TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_pan_manual TEXT;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_type TEXT DEFAULT 'pan' CHECK (tax_type IN ('pan', 'vat'));

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'np'));

-- ======================================================
-- REPAIR FUNCTION V2: Bypasses RLS to fix broken signups
-- ======================================================
CREATE OR REPLACE FUNCTION public.repair_user_org_v2(target_user_id UUID, org_name TEXT, username_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_org_id UUID;
    existing_org_id UUID;
BEGIN
    -- Check if valid profile and org already exist
    SELECT organization_id INTO existing_org_id FROM public.profiles WHERE id = target_user_id;

    IF existing_org_id IS NOT NULL THEN
        RETURN 'SUCCESS: Profile and Organization already exist.';
    END IF;

    -- Create organization
    INSERT INTO public.organizations (name)
    VALUES (org_name)
    RETURNING id INTO new_org_id;

    -- Create or Update profile linking user to organization
    INSERT INTO public.profiles (id, organization_id, username)
    VALUES (target_user_id, new_org_id, username_val)
    ON CONFLICT (id) DO UPDATE 
    SET organization_id = EXCLUDED.organization_id, 
        username = COALESCE(profiles.username, EXCLUDED.username);

    RETURN 'SUCCESS: Repaired Missing Profile/Org.';
EXCEPTION WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;

-- ======================================================
-- 11. STORAGE BUCKET (MANUAL STEP)
-- ======================================================
-- Please go to Supabase Dashboard -> Storage
-- Create a new bucket named: logos
-- Make the bucket: PUBLIC
-- ======================================================
