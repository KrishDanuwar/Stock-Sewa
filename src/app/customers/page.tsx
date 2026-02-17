import { getCustomers } from '@/lib/actions/customers';
import { supabase } from '@/lib/supabase';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { search?: string };
}

export default async function CustomersPage({ searchParams }: Props) {
    let customers: any[] = [];
    try {
        customers = await getCustomers(searchParams.search);

        // Augment with credit info
        for (const customer of customers) {
            const { data: invoices } = await supabase
                .from('invoices')
                .select('remaining_amount')
                .eq('customer_id', customer.id)
                .in('status', ['unpaid', 'partial']);

            customer.total_credit = (invoices || []).reduce(
                (sum: number, inv: any) => sum + Number(inv.remaining_amount),
                0
            );
        }
    } catch (e) {
        // Supabase not configured
    }

    return <CustomersClient initialCustomers={customers} />;
}
