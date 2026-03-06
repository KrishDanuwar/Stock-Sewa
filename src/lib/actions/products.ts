'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { revalidatePath } from 'next/cache';

import { ProductSchema } from '@/lib/security/schemas';
import { rateLimit } from '@/lib/security/rate-limit';
import { trackSecurityEvent } from '@/lib/security/audit-log';

export async function importProductsBatch(products: any[]) {
    try {
        const { organizationId, userId, plan } = await getOrgContext();

        // Feature Gate
        if (!plan.features.canImportCSV) {
            throw new Error('CSV Import is a premium feature. Please upgrade your plan.');
        }

        // Rate Limit (Slightly higher for batch)
        const { success } = await rateLimit(5, 60000);
        if (!success) throw new Error('Rate limit exceeded. Please try again later.');

        const supabase = await createAdminClient();

        // Validate each product
        const validatedProducts = products.map(p => {
            const validated = ProductSchema.parse({
                ...p,
                organization_id: organizationId
            });
            return {
                ...validated,
                organization_id: organizationId,
                created_at: new Date().toISOString()
            };
        });

        // Batch insert in chunks of 50 to avoid payload limits
        const chunkSize = 50;
        for (let i = 0; i < validatedProducts.length; i += chunkSize) {
            const chunk = validatedProducts.slice(i, i + chunkSize);
            const { error } = await supabase.from('products').insert(chunk);
            if (error) throw error;
        }

        await trackSecurityEvent('bulk_import_products', { count: validatedProducts.length });

        revalidatePath('/dashboard/products');
        return { success: true, count: validatedProducts.length };
    } catch (err: any) {
        console.error('Import error:', err);
        if (err.name === 'ZodError') {
            return { error: `Validation error in one or more items: ${err.errors[0].message}` };
        }
        return { error: err.message || 'Failed to import products' };
    }
}

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
        stock_quantity: Number(p.stock_quantity) || 0,
        unit: p.unit || 'pcs',
        category: p.category || '',
        cost_price: Number(p.cost_price) || 0,
        barcode: p.barcode || '',
        mfg_date: p.mfg_date || '',
        expiry_date: p.expiry_date || '',
        batch_number: p.batch_number || '',
        created_at: p.created_at
    }));
}

export async function addProduct(formData: FormData) {
    try {
        await rateLimit(10, 60000); // 10 products per minute
        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();

        const rawData = {
            name: formData.get('name') as string,
            price: parseFloat(formData.get('price') as string),
            cost_price: parseFloat(formData.get('cost_price') as string) || 0,
            stock_quantity: parseInt(formData.get('stock_quantity') as string),
            unit: formData.get('unit') as string,
            category: formData.get('category') as string,
            mfg_date: formData.get('mfg_date') as string,
            expiry_date: formData.get('expiry_date') as string,
            batch_number: formData.get('batch_number') as string,
            barcode: formData.get('barcode') as string || undefined,
        };

        const validatedData = ProductSchema.parse(rawData);

        // Auto-generate barcode if empty
        if (!validatedData.barcode) {
            const timestamp = Date.now().toString().slice(-8);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            validatedData.barcode = `${timestamp}${random}`;
        }

        const { error } = await supabase.from('products').insert({
            organization_id: organizationId,
            ...validatedData,
            mfg_date: validatedData.mfg_date || null,
            expiry_date: validatedData.expiry_date || null,
            batch_number: validatedData.batch_number || null
        });

        if (error) return { error: error.message };

        revalidatePath('/dashboard/products');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: err.errors[0].message };
        }
        return { error: err.message || 'An unexpected error occurred' };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        await rateLimit(20, 60000);
        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();

        const rawData = {
            name: formData.get('name') as string,
            price: parseFloat(formData.get('price') as string),
            cost_price: parseFloat(formData.get('cost_price') as string) || 0,
            stock_quantity: parseInt(formData.get('stock_quantity') as string),
            unit: formData.get('unit') as string,
            category: formData.get('category') as string,
            mfg_date: formData.get('mfg_date') as string,
            expiry_date: formData.get('expiry_date') as string,
            batch_number: formData.get('batch_number') as string,
            barcode: formData.get('barcode') as string || undefined,
        };

        const validatedData = ProductSchema.parse(rawData);

        const { error } = await supabase
            .from('products')
            .update({
                ...validatedData,
                mfg_date: validatedData.mfg_date || null,
                expiry_date: validatedData.expiry_date || null,
                batch_number: validatedData.batch_number || null
            })
            .eq('id', id)
            .eq('organization_id', organizationId);

        if (error) return { error: error.message };

        revalidatePath('/dashboard/products');
        return { success: true };
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return { error: err.errors[0].message };
        }
        return { error: err.message || 'An unexpected error occurred' };
    }
}

export async function deleteProduct(id: string) {
    try {
        await rateLimit(5, 60000);
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
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred' };
    }
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

export async function adjustStock(id: string, quantity: number, notes: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    if (quantity === 0) return { error: 'Quantity cannot be zero' };

    // Verify product exists and belongs to org
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

    if (fetchError || !product) {
        return { error: 'Product not found' };
    }

    const newQty = (Number(product.stock_quantity) || 0) + quantity;
    if (newQty < 0) return { error: 'Adjustment would result in negative stock' };

    // Update stock quantity
    const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newQty })
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (updateError) return { error: updateError.message };

    // Log the stock movement as 'adjustment'
    await supabase.from('stock_movements').insert({
        organization_id: organizationId,
        product_id: id,
        movement_type: 'adjustment',
        quantity: quantity,
        notes: notes || `Manual adjustment: ${quantity > 0 ? '+' : ''}${quantity}`,
    });

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true };
}
