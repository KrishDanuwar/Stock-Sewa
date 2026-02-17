'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getPayments(invoiceId?: string) {
    let query = supabase
        .from('payments')
        .select('*, invoices(invoice_number, customers(name))')
        .order('created_at', { ascending: false });

    if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function recordPayment(invoiceId: string, amount: number) {
    // Get current invoice
    const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .select('paid_amount, total_amount, remaining_amount')
        .eq('id', invoiceId)
        .single();

    if (invErr) throw new Error(invErr.message);

    const newPaid = Number(invoice.paid_amount) + amount;
    const newRemaining = Number(invoice.total_amount) - newPaid;

    let status: string;
    if (newRemaining <= 0) {
        status = 'paid';
    } else if (newPaid > 0) {
        status = 'partial';
    } else {
        status = 'unpaid';
    }

    // Insert payment record
    const { error: payErr } = await supabase.from('payments').insert({
        invoice_id: invoiceId,
        amount,
    });

    if (payErr) throw new Error(payErr.message);

    // Update invoice
    const { error: updateErr } = await supabase
        .from('invoices')
        .update({
            paid_amount: newPaid,
            remaining_amount: Math.max(0, newRemaining),
            status,
        })
        .eq('id', invoiceId);

    if (updateErr) throw new Error(updateErr.message);

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/invoices');
    revalidatePath('/');
    return { success: true };
}
