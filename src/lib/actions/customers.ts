'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

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
        address: c.address || ''
    }));
}

export async function addCustomer(formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();
    const { error } = await supabase.from('customers').insert({
        organization_id: organizationId,
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        pan_number: formData.get('pan_number') as string,
        tax_type: formData.get('tax_type') as string || 'pan',
        address: formData.get('address') as string,
    });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/customers');
    return { success: true };
}

export async function deleteCustomer(id: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/customers');
    return { success: true };
}
