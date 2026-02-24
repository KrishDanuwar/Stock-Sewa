'use server';

import { createClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { getTodayBs } from '@/utils/date-utils';
import { revalidatePath } from 'next/cache';

export interface CartItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

export interface CreateInvoicePayload {
    customer_id?: string;
    invoice_type: 'normal' | 'pan' | 'vat';
    payment_method: string;
    payment_status: 'paid' | 'unpaid' | 'partial';
    amount_paid: number;
    customer_name_manual?: string;
    customer_pan_manual?: string;
    notes?: string;
    items: CartItem[];
}

export async function createInvoice(payload: CreateInvoicePayload) {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();
    const today = getTodayBs();

    // ---- Calculation Engine ----
    const subtotal = payload.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
    );
    const taxRate = payload.invoice_type === 'vat' ? 0.13 : 0;
    const tax_amount = parseFloat((subtotal * taxRate).toFixed(2));
    const total_amount = parseFloat((subtotal + tax_amount).toFixed(2));

    // Generate invoice number
    const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

    const invoice_number = `INV-${today.year}-${String((count ?? 0) + 1).padStart(4, '0')}`;

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            organization_id: organizationId,
            customer_id: payload.customer_id || null,
            invoice_number,
            invoice_type: payload.invoice_type,
            subtotal,
            tax_amount,
            total_amount,
            payment_method: payload.payment_method,
            payment_status: payload.payment_status,
            amount_paid: payload.amount_paid,
            notes: payload.notes || null,
            customer_name_manual: payload.customer_name_manual || null,
            customer_pan_manual: payload.customer_pan_manual || null,
            date_ad: new Date().toISOString().split('T')[0],
            date_bs: today.formattedEn,
        })
        .select()
        .single();

    if (invoiceError) return { error: invoiceError.message };

    // Insert invoice items
    const { error: itemsError } = await supabase.from('invoice_items').insert(
        payload.items.map((item) => ({
            invoice_id: invoice.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
        }))
    );
    if (itemsError) return { error: itemsError.message };

    // Deduct stock for each product
    for (const item of payload.items) {
        await supabase.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
        });

        // Log stock movement
        await supabase.from('stock_movements').insert({
            organization_id: organizationId,
            product_id: item.product_id,
            movement_type: 'out',
            quantity: -item.quantity,
            reference_id: invoice.id,
            notes: `Sale - ${invoice_number}`,
        });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/products');

    return { success: true, invoice };
}

export async function getInvoices() {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
}
