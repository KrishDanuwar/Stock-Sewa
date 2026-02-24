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

-- ======================================================
-- 11. STORAGE BUCKET (MANUAL STEP)
-- ======================================================
-- Please go to Supabase Dashboard -> Storage
-- Create a new bucket named: logos
-- Make the bucket: PUBLIC
-- ======================================================
