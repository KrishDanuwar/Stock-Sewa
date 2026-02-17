'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';

export async function getDashboardStats() {
    const ctx = await getOrgContext();
    if (!ctx) return null;

    const supabase = createClient();
    try {
        // 1. Total Products
        const { count: totalProducts, error: prodErr } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', ctx.organizationId);

        if (prodErr) throw new Error(prodErr.message);

        // 2. Total Stock Value
        const { data: products, error: valErr } = await supabase
            .from('products')
            .select('price, stock_quantity')
            .eq('organization_id', ctx.organizationId);

        if (valErr) throw new Error(valErr.message);

        const stockValue = (products || []).reduce(
            (sum, p) => sum + Number(p.price) * p.stock_quantity,
            0
        );

        // 3. Total Unpaid Amount (Credit)
        const { data: unpaidInvoices, error: invErr } = await supabase
            .from('invoices')
            .select('remaining_amount')
            .eq('organization_id', ctx.organizationId)
            .in('status', ['unpaid', 'partial']);

        if (invErr) throw new Error(invErr.message);

        const totalUnpaid = (unpaidInvoices || []).reduce(
            (sum, inv) => sum + Number(inv.remaining_amount),
            0
        );

        // 4. Today's Revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: todayPayments, error: payErr } = await supabase
            .from('payments')
            .select('amount')
            .eq('organization_id', ctx.organizationId)
            .gte('created_at', today.toISOString());

        if (payErr) throw new Error(payErr.message);

        const todayRevenue = (todayPayments || []).reduce(
            (sum, p) => sum + Number(p.amount),
            0
        );

        return {
            totalProducts: totalProducts || 0,
            stockValue,
            totalUnpaid,
            todayRevenue,
            organizationName: ctx.organizationName,
            subscriptionStatus: ctx.subscriptionStatus,
        };
    } catch (err: any) {
        console.error('Dashboard Stats Error:', err);
        return null;
    }
}
