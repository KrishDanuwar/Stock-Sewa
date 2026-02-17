'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

function generateBarcode() {
    return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}

export async function getProducts(search?: string) {
    const ctx = await getOrgContext();
    if (!ctx) return [];

    const supabase = createClient();
    let query = supabase
        .from('products')
        .select('*')
        .eq('organization_id', ctx.organizationId)
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getProduct(id: string) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function createProduct(formData: FormData) {
    const ctx = await getOrgContext();
    if (!ctx) return { error: 'Unauthorized' };

    const supabase = createClient();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock_quantity = parseInt(formData.get('stock_quantity') as string);
    const barcode = (formData.get('barcode') as string) || generateBarcode();

    try {
        const { error } = await supabase.from('products').insert({
            organization_id: ctx.organizationId,
            name,
            description,
            price,
            stock_quantity,
            barcode,
        });

        if (error) return { error: error.message };
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Creation failed' };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    const ctx = await getOrgContext();
    if (!ctx) return { error: 'Unauthorized' };

    const supabase = createClient();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock_quantity = parseInt(formData.get('stock_quantity') as string);
    const barcode = formData.get('barcode') as string;

    try {
        const { error } = await supabase
            .from('products')
            .update({
                name,
                description,
                price,
                stock_quantity,
                barcode: barcode || undefined,
            })
            .eq('id', id)
            .eq('organization_id', ctx.organizationId);

        if (error) return { error: error.message };
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Update failed' };
    }
}

export async function deleteProduct(id: string) {
    const ctx = await getOrgContext();
    if (!ctx) return { error: 'Unauthorized' };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('organization_id', ctx.organizationId);
        if (error) return { error: error.message };
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Deletion failed' };
    }
}
