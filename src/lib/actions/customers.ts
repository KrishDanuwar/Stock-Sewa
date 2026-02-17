'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

export async function getCustomers(search?: string) {
    const ctx = await getOrgContext();
    if (!ctx) return [];

    const supabase = createClient();
    let query = supabase
        .from('customers')
        .select('*')
        .eq('organization_id', ctx.organizationId)
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getCustomer(id: string) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getCustomerWithCredit(id: string) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();
    const { data: customer, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .single();

    if (custErr) throw new Error(custErr.message);

    const { data: invoices, error: invErr } = await supabase
        .from('invoices')
        .select('remaining_amount')
        .eq('customer_id', id)
        .eq('organization_id', ctx.organizationId)
        .in('status', ['unpaid', 'partial']);

    if (invErr) throw new Error(invErr.message);

    const totalCredit = invoices.reduce(
        (sum: number, inv: { remaining_amount: number }) => sum + Number(inv.remaining_amount),
        0
    );

    return { ...customer, total_credit: totalCredit };
}

export async function createCustomer(formData: FormData) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase.from('customers').insert({
        organization_id: ctx.organizationId,
        name,
        phone,
        address,
    });

    if (error) throw new Error(error.message);
    revalidatePath('/customers');
    return { success: true };
}

export async function updateCustomer(id: string, formData: FormData) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase
        .from('customers')
        .update({ name, phone, address })
        .eq('id', id)
        .eq('organization_id', ctx.organizationId);

    if (error) throw new Error(error.message);
    revalidatePath('/customers');
    return { success: true };
}

export async function settleCustomerCredit(customerId: string, amount: number) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();

    // Get all pending invoices for this customer
    const { data: invoices, error: invErr } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId)
        .eq('organization_id', ctx.organizationId)
        .in('status', ['unpaid', 'partial'])
        .order('created_at', { ascending: true }); // Oldest first

    if (invErr) throw new Error(invErr.message);
    if (!invoices || invoices.length === 0) throw new Error('No pending credit found');

    let remainingPayment = amount;

    for (const invoice of invoices) {
        if (remainingPayment <= 0) break;

        const payToApply = Math.min(remainingPayment, Number(invoice.remaining_amount));
        const newPaidAmount = Number(invoice.paid_amount) + payToApply;
        const newRemainingAmount = Number(invoice.remaining_amount) - payToApply;
        const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

        // Update invoice
        const { error: updErr } = await supabase
            .from('invoices')
            .update({
                paid_amount: newPaidAmount,
                remaining_amount: newRemainingAmount,
                status: newStatus
            })
            .eq('id', invoice.id);

        if (updErr) throw new Error(`Failed to update invoice ${invoice.invoice_number}: ${updErr.message}`);

        // Create payment record
        const { error: payErr } = await supabase
            .from('payments')
            .insert({
                organization_id: ctx.organizationId,
                invoice_id: invoice.id,
                amount: payToApply,
                notes: 'Bulk credit settlement'
            });

        if (payErr) throw new Error(`Failed to record payment for ${invoice.invoice_number}`);

        remainingPayment -= payToApply;
    }

    revalidatePath('/customers');
    revalidatePath(`/customers/${customerId}`);
    revalidatePath('/invoices');
    return { success: true };
}
