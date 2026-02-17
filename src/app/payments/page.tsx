import { getPayments } from '@/lib/actions/payments';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
    return `Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default async function PaymentsPage() {
    let payments: any[] = [];
    try {
        payments = await getPayments();
    } catch (e) {
        // Supabase not configured
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="page-header">Payments</h1>

            {payments.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">💳</p>
                    <p className="text-lg font-medium text-surface-700 mb-1">No payments recorded</p>
                    <p className="text-sm text-surface-500">Payments will appear here when you record them on invoices</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Invoice</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Customer</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {payments.map((payment: any) => (
                                <tr key={payment.id} className="hover:bg-surface-50 transition-colors">
                                    <td className="px-6 py-3 text-sm text-surface-600">
                                        {new Date(payment.created_at).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Link
                                            href={`/invoices/${payment.invoice_id}`}
                                            className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm"
                                        >
                                            {payment.invoices?.invoice_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-surface-700">
                                        {payment.invoices?.customers?.name || '—'}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span className="text-sm font-semibold text-emerald-600">+ {formatCurrency(payment.amount)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
