'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';
import { createInvoice } from './invoices';
import { getTodayBs } from '@/utils/date-utils';
import { rateLimit } from '@/lib/security/rate-limit';
import { CustomerSchema } from '@/lib/security/schemas';
import { trackSecurityEvent } from '@/lib/security/audit-log';

export async function getCustomers() {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        pan_number: c.pan_number || '',
        tax_type: c.tax_type || 'pan',
        address: c.address || '',
        credit_balance: c.credit_balance || 0,
        credit_limit: c.credit_limit || 0
    }));
}



export async function addCustomer(formData: FormData) {
    try {
        await rateLimit(10, 60000);
        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();

        const rawData = {
            name: formData.get('name') as string,
            phone: (formData.get('phone') as string) || undefined,
            email: (formData.get('email') as string) || undefined,
            pan_number: (formData.get('pan_number') as string) || undefined,
            tax_type: (formData.get('tax_type') as string) || 'pan',
            address: (formData.get('address') as string) || undefined,
            credit_limit: parseFloat(formData.get('credit_limit') as string || '0'),
        };

        const validatedData = CustomerSchema.parse(rawData);

        const { error } = await supabase.from('customers').insert({
            organization_id: organizationId,
            ...validatedData,
        });

        if (error) return { error: error.message };
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        if (err.name === 'ZodError') return { error: err.errors[0].message };
        return { error: err.message || 'An unexpected error occurred' };
    }
}

export async function deleteCustomer(id: string) {
    try {
        await rateLimit(5, 60000);
        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();

        await trackSecurityEvent('delete_customer', { customerId: id, orgId: organizationId });

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId);

        if (error) return { error: error.message };
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred' };
    }
}


export async function clearCustomerCredit(customerId: string, amount: number, paymentMethod: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    // 1. Decrement the credit balance
    const { error: creditError } = await supabase.rpc('update_customer_credit', {
        p_customer_id: customerId,
        p_amount: -amount
    });

    if (creditError) {
        // Fallback if RPC fails
        const { data: customer } = await supabase.from('customers').select('credit_balance').eq('id', customerId).single();
        await supabase.from('customers').update({ credit_balance: (customer?.credit_balance || 0) - amount }).eq('id', customerId);
    }

    // 2. Create an audit invoice for this payment
    const result = await createInvoice({
        customer_id: customerId,
        invoice_type: 'normal',
        payment_method: paymentMethod,
        payment_status: 'paid',
        amount_paid: amount,
        notes: `CREDIT_PAYMENT: Manual credit clearance of Rs. ${amount}`,
        items: [] // No items for clearance
    });

    if (result.success) {
        revalidatePath('/dashboard/customers');
        revalidatePath('/dashboard/invoices');
        return { success: true };
    }

    return { error: 'Payment recorded but audit invoice failed.' };
}
