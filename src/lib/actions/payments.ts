'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

export async function getPayments(invoiceId?: string) {
    const ctx = getOrgContext();
    if (!ctx) return [];

    const supabase = createClient();
    let query = supabase
        .from('payments')
        .select('*, invoices(invoice_number, customers(name))')
        .eq('organization_id', ctx.organizationId)
        .order('created_at', { ascending: false });

    if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function recordPayment(invoiceId: string, amount: number) {
    const ctx = getOrgContext();
    if (!ctx) return { error: 'Unauthorized' };

    const supabase = createClient();
    try {
        // Get current invoice
        const { data: invoice, error: invErr } = await supabase
            .from('invoices')
            .select('paid_amount, total_amount, remaining_amount')
            .eq('id', invoiceId)
            .eq('organization_id', ctx.organizationId)
            .single();

        if (invErr) return { error: invErr.message };

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
            organization_id: ctx.organizationId,
            invoice_id: invoiceId,
            amount,
        });

        if (payErr) return { error: payErr.message };

        // Update invoice
        const { error: updateErr } = await supabase
            .from('invoices')
            .update({
                paid_amount: newPaid,
                remaining_amount: Math.max(0, newRemaining),
                status,
            })
            .eq('id', invoiceId)
            .eq('organization_id', ctx.organizationId);

        if (updateErr) return { error: updateErr.message };

        // revalidatePath removed for stability
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Payment recording failed' };
    }
}
