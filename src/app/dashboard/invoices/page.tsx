import { getInvoices } from '@/lib/actions/invoices';
import { getOrganization } from '@/lib/actions/organizations';
import InvoicesClient from './InvoicesClient';

export default async function InvoicesPage() {
    const [invoices, organization] = await Promise.all([
        getInvoices(),
        getOrganization()
    ]);
    return <InvoicesClient invoices={invoices} organization={organization} />;
}
