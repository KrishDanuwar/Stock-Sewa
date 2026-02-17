import { getCustomers } from '@/lib/actions/customers';
import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { search?: string };
}

export default async function CustomersPage({ searchParams }: Props) {
    try {
        const ctx = getOrgContext();
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
    } catch (criticalError: any) {
        console.error('CRITICAL CUSTOMERS PAGE ERROR:', criticalError);
        return (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl m-6">
                <h2 className="text-xl font-bold text-red-800 mb-2">Service Unavailable</h2>
                <p className="text-red-600 mb-4">An error occurred while loading the customers page.</p>
                <div className="text-xs text-red-400 font-mono bg-white p-4 rounded border">
                    {criticalError.message || 'Unknown error during RSC render'}
                </div>
            </div>
        );
    }
}
