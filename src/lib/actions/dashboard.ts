'use server';

import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
    // Total products count
    const { count: productCount, error: pcErr } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (pcErr) throw new Error(pcErr.message);

    // Stock value (sum of price * stock_quantity)
    const { data: products, error: pvErr } = await supabase
        .from('products')
        .select('price, stock_quantity');

    if (pvErr) throw new Error(pvErr.message);

    const stockValue = products.reduce(
        (sum: number, p: { price: number; stock_quantity: number }) =>
            sum + Number(p.price) * p.stock_quantity,
        0
    );

    // Unpaid invoices total
    const { data: unpaidInvoices, error: uiErr } = await supabase
        .from('invoices')
        .select('remaining_amount')
        .in('status', ['unpaid', 'partial']);

    if (uiErr) throw new Error(uiErr.message);

    const unpaidTotal = unpaidInvoices.reduce(
        (sum: number, inv: { remaining_amount: number }) =>
            sum + Number(inv.remaining_amount),
        0
    );

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayInvoices, error: tiErr } = await supabase
        .from('invoices')
        .select('total_amount')
        .gte('created_at', today.toISOString());

    if (tiErr) throw new Error(tiErr.message);

    const todayRevenue = todayInvoices.reduce(
        (sum: number, inv: { total_amount: number }) =>
            sum + Number(inv.total_amount),
        0
    );

    return {
        totalProducts: productCount || 0,
        stockValue,
        unpaidTotal,
        todayRevenue,
    };
}
