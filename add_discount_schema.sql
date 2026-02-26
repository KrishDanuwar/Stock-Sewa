-- Run this in the Supabase SQL Editor to add discount support

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;
