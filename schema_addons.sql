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
-- REPAIR FUNCTION: Bypasses RLS to fix broken signups
-- ======================================================
CREATE OR REPLACE FUNCTION public.repair_user_org(target_user_id UUID, org_name TEXT, username_val TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
        RETURN;
    END IF;

    -- Create organization
    INSERT INTO public.organizations (name)
    VALUES (org_name)
    RETURNING id INTO new_org_id;

    -- Create profile
    INSERT INTO public.profiles (id, organization_id, username)
    VALUES (target_user_id, new_org_id, username_val);
END;
$$;

-- ======================================================
-- 11. STORAGE BUCKET (MANUAL STEP)
-- ======================================================
-- Please go to Supabase Dashboard -> Storage
-- Create a new bucket named: logos
-- Make the bucket: PUBLIC
-- ======================================================
