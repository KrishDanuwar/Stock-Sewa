'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getProducts(search?: string) {
    let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getProduct(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock_quantity = parseInt(formData.get('stock_quantity') as string);
    const barcode = formData.get('barcode') as string;

    const { error } = await supabase.from('products').insert({
        name,
        description,
        price,
        stock_quantity,
        barcode: barcode || null,
    });

    if (error) throw new Error(error.message);
    revalidatePath('/products');
    return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock_quantity = parseInt(formData.get('stock_quantity') as string);
    const barcode = formData.get('barcode') as string;

    const { error } = await supabase
        .from('products')
        .update({
            name,
            description,
            price,
            stock_quantity,
            barcode: barcode || null,
        })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/products');
    return { success: true };
}

export async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/products');
    return { success: true };
}
