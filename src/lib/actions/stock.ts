'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

export async function getStockMovements(productId?: string) {
    const ctx = await getOrgContext();
    if (!ctx) return [];

    const supabase = createClient();
    let query = supabase
        .from('stock_movements')
        .select('*, products(name, barcode)')
        .eq('organization_id', ctx.organizationId)
        .order('created_at', { ascending: false });

    if (productId) {
        query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function addStockIn(formData: FormData) {
    const ctx = await getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const supabase = createClient();
    const product_id = formData.get('product_id') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const reference = formData.get('reference') as string;

    // Update product stock
    const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product_id)
        .eq('organization_id', ctx.organizationId)
        .single();

    if (prodErr) throw new Error(prodErr.message);

    const { error: updateErr } = await supabase
        .from('products')
        .update({ stock_quantity: product.stock_quantity + quantity })
        .eq('id', product_id)
        .eq('organization_id', ctx.organizationId);

    if (updateErr) throw new Error(updateErr.message);

    // Create stock movement record
    const { error: mvErr } = await supabase.from('stock_movements').insert({
        organization_id: ctx.organizationId,
        product_id,
        type: 'IN',
        quantity,
        reference: reference || 'Manual stock in',
    });

    if (mvErr) throw new Error(mvErr.message);

    revalidatePath('/stock');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
}
