-- ========================================================
-- FIX: Missing Columns for Invoice Type & Company Details
-- ========================================================

-- 1. Update Organizations Table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='pan_no') THEN
        ALTER TABLE organizations ADD COLUMN pan_no TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='vat_no') THEN
        ALTER TABLE organizations ADD COLUMN vat_no TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='address') THEN
        ALTER TABLE organizations ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='phone') THEN
        ALTER TABLE organizations ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 2. Update Invoices Table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='customer_pan') THEN
        ALTER TABLE invoices ADD COLUMN customer_pan TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invoice_type') THEN
        ALTER TABLE invoices ADD COLUMN invoice_type TEXT NOT NULL DEFAULT 'normal' CHECK (invoice_type IN ('normal', 'pan', 'vat'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='tax_amount') THEN
        ALTER TABLE invoices ADD COLUMN tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 3. Force PostgREST Cache Reload (by renaming a column back and forth or similar, 
-- but usually ADD COLUMN triggers it. If not, the user can run:
-- NOTIFY pgrst, 'reload schema';
-- Note: NOTIFY requires superuser or specific permissions. 
-- The most reliable way is to just wait a few seconds after running DDL in the Supabase Dashboard.
