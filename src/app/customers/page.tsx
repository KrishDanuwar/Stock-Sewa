import { getCustomers } from '@/lib/actions/customers';
import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { search?: string };
}

export default async function CustomersPage({ searchParams }: Props) {
    const ctx = await getOrgContext();
    const supabase = createClient();

    let customers: any[] = [];

    try {
        customers = await getCustomers(searchParams.search);

        // Augment with credit info using the server-side client
        for (const customer of customers) {
            const { data: invoices } = await supabase
                .from('invoices')
                .select('remaining_amount')
                .eq('customer_id', customer.id)
                .eq('organization_id', ctx.organizationId)
                .in('status', ['unpaid', 'partial']);

            customer.total_credit = (invoices || []).reduce(
                (sum: number, inv: any) => sum + Number(inv.remaining_amount),
                0
            );
        }
    } catch (e) {
        console.error('Error fetching customers:', e);
    }

    return <CustomersClient initialCustomers={customers} />;
}
