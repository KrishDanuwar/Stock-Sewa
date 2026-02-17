'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getCustomers(search?: string) {
    let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getCustomer(id: string) {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getCustomerWithCredit(id: string) {
    const { data: customer, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (custErr) throw new Error(custErr.message);

    const { data: invoices, error: invErr } = await supabase
        .from('invoices')
        .select('remaining_amount')
        .eq('customer_id', id)
        .in('status', ['unpaid', 'partial']);

    if (invErr) throw new Error(invErr.message);

    const totalCredit = invoices.reduce(
        (sum: number, inv: { remaining_amount: number }) => sum + Number(inv.remaining_amount),
        0
    );

    return { ...customer, total_credit: totalCredit };
}

export async function createCustomer(formData: FormData) {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase.from('customers').insert({
        name,
        phone,
        address,
    });

    if (error) throw new Error(error.message);
    revalidatePath('/customers');
    return { success: true };
}

export async function updateCustomer(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase
        .from('customers')
        .update({ name, phone, address })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/customers');
    return { success: true };
}
