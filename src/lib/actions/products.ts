'use server';

import { createClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function addProduct(formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const cost_price = parseFloat((formData.get('cost_price') as string) || '0');
    const stock_quantity = parseInt(formData.get('stock_quantity') as string);
    const unit = formData.get('unit') as string;
    const category = formData.get('category') as string;
    const barcode = formData.get('barcode') as string;

    const { error } = await supabase.from('products').insert({
        organization_id: organizationId,
        name, price, cost_price, stock_quantity, unit, category, barcode,
    });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();

    const { error } = await supabase
        .from('products')
        .update({
            name: formData.get('name') as string,
            price: parseFloat(formData.get('price') as string),
            cost_price: parseFloat((formData.get('cost_price') as string) || '0'),
            stock_quantity: parseInt(formData.get('stock_quantity') as string),
            unit: formData.get('unit') as string,
            category: formData.get('category') as string,
        })
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/products');
    return { success: true };
}

export async function deleteProduct(id: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true };
}
