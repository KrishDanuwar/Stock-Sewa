import { getInvoices } from '@/lib/actions/invoices';
import InvoicesClient from './InvoicesClient';

export default async function InvoicesPage() {
    const invoices = await getInvoices();
    return <InvoicesClient invoices={invoices} />;
}
