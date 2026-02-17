import { getInvoice } from '@/lib/actions/invoices';
import { notFound } from 'next/navigation';
import InvoiceDetailClient from './InvoiceDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
    params: { id: string };
}

export default async function InvoiceDetailPage({ params }: Props) {
    let invoice: any;
    try {
        invoice = await getInvoice(params.id);
    } catch (e) {
        notFound();
    }

    if (!invoice) notFound();

    return <InvoiceDetailClient invoice={invoice} />;
}
