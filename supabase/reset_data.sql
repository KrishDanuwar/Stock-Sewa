-- ============================================
-- RESET DATABASE RECORDS (CLEAN SLATE)
-- ============================================

-- DANGER: This will delete ALL business data.
-- Run this to start fresh with a clean database.

-- Disable triggers temporarily to avoid foreign key noise if needed
-- (Though TRUNCATE CASCADE handles it)

TRUNCATE TABLE 
    public.invoice_items, 
    public.payments, 
    public.stock_movements, 
    public.invoices, 
    public.products, 
    public.customers 
RESTART IDENTITY CASCADE;

-- Final confirmation
DO $$ 
BEGIN 
    RAISE NOTICE 'Database successfully reset to 0 records.';
END $$;
