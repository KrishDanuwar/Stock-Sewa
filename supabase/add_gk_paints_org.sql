-- ============================================================
-- ADD G.K PAINTS ORGANIZATION
-- ============================================================

-- 1. Make owner_id nullable since we are running without authentication
ALTER TABLE public.organizations ALTER COLUMN owner_id DROP NOT NULL;

-- 2. Ensure the organization exists by checking manually
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'G.K Paints') THEN
        INSERT INTO public.organizations (name, subscription_status, is_approved)
        VALUES ('G.K Paints', 'active', true);
    ELSE
        UPDATE public.organizations 
        SET subscription_status = 'active', is_approved = true
        WHERE name = 'G.K Paints';
    END IF;
END $$;

-- Optional: If you want to delete other organizations (CAUTION)
-- DELETE FROM public.organizations WHERE name != 'G.K Paints';
