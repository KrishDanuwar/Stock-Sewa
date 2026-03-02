'use server';

import { getOrgContext } from '@/lib/org-context';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==================== SUPPLIERS ====================

export async function getSuppliers() {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
}

export async function addSupplier(formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    if (!name || !name.trim()) return { error: 'Supplier name is required' };

    const { error } = await supabase.from('suppliers').insert({
        organization_id: organizationId,
        name: name.trim(),
        phone: (formData.get('phone') as string) || null,
        email: (formData.get('email') as string) || null,
        address: (formData.get('address') as string) || null,
        pan_number: (formData.get('pan_number') as string) || null,
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

export async function updateSupplier(id: string, formData: FormData) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const name = formData.get('name') as string;
    if (!name || !name.trim()) return { error: 'Supplier name is required' };

    const { error } = await supabase
        .from('suppliers')
        .update({
            name: name.trim(),
            phone: (formData.get('phone') as string) || null,
            email: (formData.get('email') as string) || null,
            address: (formData.get('address') as string) || null,
            pan_number: (formData.get('pan_number') as string) || null,
        })
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

export async function deleteSupplier(id: string) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

// ==================== PURCHASES ====================

export interface PurchaseItemPayload {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
}

export interface CreatePurchasePayload {
    supplier_id: string;
    purchase_date: string;
    notes?: string;
    items: PurchaseItemPayload[];
}

export async function createPurchase(payload: CreatePurchasePayload) {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    if (!payload.items.length) return { error: 'At least one item is required' };

    const totalAmount = payload.items.reduce((sum, item) => sum + item.quantity * item.cost_price, 0);

    // 1. Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
            organization_id: organizationId,
            supplier_id: payload.supplier_id || null,
            purchase_date: payload.purchase_date,
            total_amount: totalAmount,
            notes: payload.notes || null,
        })
        .select('id')
        .single();

    if (purchaseError || !purchase) return { error: purchaseError?.message || 'Failed to create purchase' };

    // 2. Insert purchase items
    const { error: itemsError } = await supabase.from('purchase_items').insert(
        payload.items.map((item) => ({
            purchase_id: purchase.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            cost_price: item.cost_price,
        }))
    );

    if (itemsError) return { error: itemsError.message };

    // 3. Auto-restock: increase stock for each product
    for (const item of payload.items) {
        if (!item.product_id) continue;

        const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .eq('organization_id', organizationId)
            .single();

        if (product) {
            await supabase
                .from('products')
                .update({
                    stock_quantity: (Number(product.stock_quantity) || 0) + item.quantity,
                    cost_price: item.cost_price,
                })
                .eq('id', item.product_id)
                .eq('organization_id', organizationId);
        }
    }

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/products');
    return { success: true };
}

export async function getPurchases() {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('purchases')
        .select(`
            id,
            purchase_date,
            total_amount,
            notes,
            created_at,
            suppliers ( id, name ),
            purchase_items (
                id,
                product_name,
                quantity,
                unit_price,
                cost_price
            )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
}
