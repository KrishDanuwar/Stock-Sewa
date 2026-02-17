import { getInvoices } from '@/lib/actions/invoices';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { search?: string; status?: string };
}

function formatCurrency(amount: number) {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default async function InvoicesPage({ searchParams }: Props) {
    let invoices: any[] = [];
    try {
        invoices = await getInvoices(searchParams.search, searchParams.status);
    } catch (e) {
        // Supabase not configured
    }

    const statuses = ['all', 'paid', 'partial', 'unpaid'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="page-header mb-0">Invoices</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial sm:w-56">
                        <SearchBar placeholder="Search invoice #..." />
                    </div>
                    <Link href="/invoices/new" className="btn-primary whitespace-nowrap">+ New Invoice</Link>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
                {statuses.map((s) => (
                    <Link
                        key={s}
                        href={`/invoices?status=${s}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${(searchParams.status || 'all') === s
                                ? 'bg-primary-600 text-white'
                                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                            }`}
                    >
                        {s}
                    </Link>
                ))}
            </div>

            {invoices.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">🧾</p>
                    <p className="text-lg font-medium text-surface-700 mb-1">No invoices found</p>
                    <p className="text-sm text-surface-500 mb-4">Create your first invoice to start billing</p>
                    <Link href="/invoices/new" className="btn-primary">+ New Invoice</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Invoice #</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Total</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Paid</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Remaining</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {invoices.map((inv: any) => (
                                <tr key={inv.id} className="hover:bg-surface-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <Link href={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                            {inv.invoice_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-surface-700">{inv.customers?.name || '—'}</td>
                                    <td className="px-6 py-3 text-sm font-medium text-surface-900">{formatCurrency(inv.total_amount)}</td>
                                    <td className="px-6 py-3 text-sm text-emerald-600 font-medium">{formatCurrency(inv.paid_amount)}</td>
                                    <td className="px-6 py-3 text-sm text-red-600 font-medium">{formatCurrency(inv.remaining_amount)}</td>
                                    <td className="px-6 py-3">
                                        <span className={`badge-${inv.status}`}>{inv.status}</span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-surface-500">
                                        {new Date(inv.created_at).toLocaleDateString()}
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
