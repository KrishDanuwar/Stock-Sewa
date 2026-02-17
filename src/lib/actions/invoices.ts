'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

interface InvoiceItem {
    product_id: string;
    quantity: number;
    price: number;
}

interface CreateInvoiceData {
    customer_id: string;
    items: InvoiceItem[];
    paid_amount: number;
}

function generateInvoiceNumber(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${y}${m}${d}-${rand}`;
}

export async function getInvoices(search?: string, status?: string) {
    let query = supabase
        .from('invoices')
        .select('*, customers(name)')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('invoice_number', `%${search}%`);
    }

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getInvoice(id: string) {
    const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .select('*, customers(name, phone, address)')
        .eq('id', id)
        .single();

    if (invErr) throw new Error(invErr.message);

    const { data: items, error: itemsErr } = await supabase
        .from('invoice_items')
        .select('*, products(name, barcode)')
        .eq('invoice_id', id);

    if (itemsErr) throw new Error(itemsErr.message);

    const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', id)
        .order('created_at', { ascending: false });

    if (payErr) throw new Error(payErr.message);

    return { ...invoice, items, payments };
}

export async function getRecentInvoices(limit: number = 5) {
    const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name)')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);
    return data;
}

export async function createInvoice(invoiceData: CreateInvoiceData) {
    const { customer_id, items, paid_amount } = invoiceData;

    // Calculate totals
    const total_amount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const remaining_amount = total_amount - paid_amount;
    let status: string;
    if (remaining_amount <= 0) {
        status = 'paid';
    } else if (paid_amount > 0) {
        status = 'partial';
    } else {
        status = 'unpaid';
    }

    const invoice_number = generateInvoiceNumber();

    // 1. Insert invoice
    const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .insert({
            invoice_number,
            customer_id,
            total_amount,
            paid_amount,
            remaining_amount: Math.max(0, remaining_amount),
            status,
        })
        .select()
        .single();

    if (invErr) throw new Error(invErr.message);

    // 2. Insert invoice items
    const invoiceItems = items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
    }));

    const { error: itemsErr } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

    if (itemsErr) throw new Error(itemsErr.message);

    // 3. Deduct stock and create stock movements
    for (const item of items) {
        // Deduct stock
        const { data: product, error: prodErr } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

        if (prodErr) throw new Error(prodErr.message);

        const newQty = product.stock_quantity - item.quantity;
        const { error: updateErr } = await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, newQty) })
            .eq('id', item.product_id);

        if (updateErr) throw new Error(updateErr.message);

        // Create stock movement
        const { error: mvErr } = await supabase.from('stock_movements').insert({
            product_id: item.product_id,
            type: 'OUT',
            quantity: item.quantity,
            reference: `Invoice ${invoice_number}`,
        });

        if (mvErr) throw new Error(mvErr.message);
    }

    // 4. Record initial payment if any
    if (paid_amount > 0) {
        const { error: payErr } = await supabase.from('payments').insert({
            invoice_id: invoice.id,
            amount: paid_amount,
        });

        if (payErr) throw new Error(payErr.message);
    }

    revalidatePath('/invoices');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, id: invoice.id };
}
