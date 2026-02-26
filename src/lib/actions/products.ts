'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        cost_price: Number(p.cost_price) || 0,
        stock_quantity: Number(p.stock_quantity) || 0,
        unit: p.unit || 'pcs',
        category: p.category || '',
        barcode: p.barcode || '',
        mfg_date: p.mfg_date || '',
        expiry_date: p.expiry_date || '',
        batch_number: p.batch_number || '',
        created_at: p.created_at
    }));
}

export async function addProduct(formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const cost_price = parseFloat((formData.get('cost_price') as string) || '0');
    const stock_quantity = parseInt(formData.get('stock_quantity') as string);
    const unit = formData.get('unit') as string;
    const category = formData.get('category') as string;
    const mfg_date = formData.get('mfg_date') as string;
    const expiry_date = formData.get('expiry_date') as string;
    const batch_number = formData.get('batch_number') as string;
    let barcode = formData.get('barcode') as string;

    // Auto-generate barcode if empty
    if (!barcode) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        barcode = `${timestamp}${random}`;
    }

    const { error } = await supabase.from('products').insert({
        organization_id: organizationId,
        name, price, cost_price, stock_quantity, unit, category,
        barcode,
        mfg_date: mfg_date || null,
        expiry_date: expiry_date || null,
        batch_number: batch_number || null
    });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('products')
        .update({
            name: formData.get('name') as string,
            price: parseFloat(formData.get('price') as string),
            cost_price: parseFloat((formData.get('cost_price') as string) || '0'),
            stock_quantity: parseInt(formData.get('stock_quantity') as string),
            unit: formData.get('unit') as string,
            category: formData.get('category') as string,
            mfg_date: formData.get('mfg_date') as string,
            expiry_date: formData.get('expiry_date') as string,
            batch_number: formData.get('batch_number') as string,
        })
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/products');
    return { success: true };
}

export async function deleteProduct(id: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

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

export async function restockProduct(
    id: string,
    quantity: number,
    newPrice?: number,
    newCostPrice?: number,
    newMfgDate?: string,
    newExpiryDate?: string,
    newBatchNumber?: string
) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    if (quantity <= 0) return { error: 'Quantity must be greater than zero' };

    // Fetch current stock and metadata
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity, price, cost_price, mfg_date, expiry_date, batch_number')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

    if (fetchError || !product) {
        return { error: 'Product not found' };
    }

    interface ProductUpdates {
        stock_quantity: number;
        price?: number;
        cost_price?: number;
        mfg_date?: string | null;
        expiry_date?: string | null;
        batch_number?: string | null;
    }

    const updates: ProductUpdates = {
        stock_quantity: (Number(product.stock_quantity) || 0) + quantity
    };

    if (newPrice !== undefined && !isNaN(newPrice)) updates.price = newPrice;
    if (newCostPrice !== undefined && !isNaN(newCostPrice)) updates.cost_price = newCostPrice;
    if (newMfgDate !== undefined) updates.mfg_date = newMfgDate || null;
    if (newExpiryDate !== undefined) updates.expiry_date = newExpiryDate || null;
    if (newBatchNumber !== undefined) updates.batch_number = newBatchNumber || null;

    const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (updateError) return { error: updateError.message };

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true };
}
