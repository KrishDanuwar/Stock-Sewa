-- ======================================================
-- DB CLEAR SCRIPT FOR STOCK SEWA
-- Run the desired section in the Supabase SQL Editor
-- ======================================================

-- OPTION 1: SELECTIVE CLEAR (KEEP USERS & ORGANIZATIONS)
-- This deletes all invoices, items, customers, and products.
/*
BEGIN;
  DELETE FROM invoice_items;
  DELETE FROM stock_movements;
  DELETE FROM invoices;
  DELETE FROM customers;
  DELETE FROM products;
COMMIT;
*/

-- ------------------------------------------------------

-- OPTION 2: FULL RESET (WIPE EVERYTHING)
-- This deletes organizations and user profiles as well.
/*
BEGIN;
  DELETE FROM invoice_items;
  DELETE FROM stock_movements;
  DELETE FROM invoices;
  DELETE FROM customers;
  DELETE FROM products;
  DELETE FROM profiles;
  DELETE FROM organizations;
COMMIT;
*/

-- ------------------------------------------------------

-- OPTION 3: TOTAL FRESH START (KEEP LOGIN ONLY)
-- This clears all data and resets organization info.
/*
BEGIN;
  -- 1. Wipe all transactional data
  DELETE FROM invoice_items;
  DELETE FROM stock_movements;
  DELETE FROM invoices;
  DELETE FROM customers;
  DELETE FROM products;

  -- 2. Reset organization metadata
  UPDATE organizations 
  SET 
      pan_vat = NULL, 
      address = NULL, 
      phone = NULL, 
      logo_url = NULL,
      preferred_language = 'en';
COMMIT;
*/
