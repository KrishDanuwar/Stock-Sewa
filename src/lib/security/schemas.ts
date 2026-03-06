import { z } from 'zod';

// Helper for sanitizing strings
const sanitizeString = (str: string) => str.trim().replace(/[<>]/g, '');

export const ProductSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).transform(sanitizeString),
    price: z.number().min(0, "Price cannot be negative"),
    cost_price: z.number().min(0, "Cost price cannot be negative").optional().default(0),
    stock_quantity: z.number().int().min(0, "Stock cannot be negative"),
    unit: z.string().max(20).transform(sanitizeString).optional().default('pcs'),
    category: z.string().max(50).transform(sanitizeString).optional().default(''),
    barcode: z.string().max(50).transform(sanitizeString).optional(),
    mfg_date: z.string().optional().nullable(),
    expiry_date: z.string().optional().nullable(),
    batch_number: z.string().max(50).transform(sanitizeString).optional().nullable(),
});

export const SupplierSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).transform(sanitizeString),
    email: z.string().email("Invalid email").optional().nullable().or(z.literal('')),
    phone: z.string().max(20).transform(sanitizeString).optional().nullable(),
    address: z.string().max(200).transform(sanitizeString).optional().nullable(),
    pan_number: z.string().max(20).transform(sanitizeString).optional().nullable(),
});

export const CustomerSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).transform(sanitizeString),
    phone: z.string().max(20).transform(sanitizeString).optional().nullable(),
    email: z.string().email("Invalid email").optional().nullable().or(z.literal('')),
    pan_number: z.string().max(20).transform(sanitizeString).optional().nullable(),
    tax_type: z.enum(['pan', 'vat']).default('pan'),
    address: z.string().max(200).transform(sanitizeString).optional().nullable(),
    credit_limit: z.number().min(0).optional().default(0),
});

export const InvoicePayloadSchema = z.object({
    customer_id: z.string().uuid().optional().nullable(),
    invoice_type: z.enum(['normal', 'pan', 'vat']).default('normal'),
    payment_method: z.string().min(1),
    payment_status: z.enum(['paid', 'unpaid', 'partial']),
    amount_paid: z.number().min(0),
    customer_name_manual: z.string().max(100).transform(sanitizeString).optional().nullable(),
    customer_pan_manual: z.string().max(20).transform(sanitizeString).optional().nullable(),
    notes: z.string().max(500).transform(sanitizeString).optional().nullable(),
    discount_amount: z.number().min(0).optional().default(0),
    items: z.array(z.object({
        product_id: z.string().uuid(),
        product_name: z.string(),
        quantity: z.number().min(1),
        unit_price: z.number().min(0),
        cost_price: z.number().min(0),
    })).min(1),
});

export const PlanSchema = z.object({
    id: z.string().min(1).max(50).transform(s => s.toLowerCase().trim()),
    name: z.string().min(1).max(100).transform(sanitizeString),
    description: z.string().max(500).transform(sanitizeString).optional().nullable(),
    price: z.number().min(0),
    period: z.string().max(20).transform(sanitizeString),
    duration_days: z.number().int().min(1),
    is_popular: z.boolean().optional(),
    sort_order: z.number().int().optional(),
});
