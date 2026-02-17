import StatCard from '@/components/StatCard';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { getRecentInvoices } from '@/lib/actions/invoices';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default async function DashboardPage() {
    let stats = { totalProducts: 0, stockValue: 0, unpaidTotal: 0, todayRevenue: 0 };
    let recentInvoices: any[] = [];

    try {
        stats = await getDashboardStats();
    } catch (e) {
        // Supabase not configured yet
    }

    try {
        recentInvoices = await getRecentInvoices(5);
    } catch (e) {
        // Supabase not configured yet
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-header mb-1">Dashboard</h1>
                    <p className="text-surface-500 text-sm">Welcome back. Here&#39;s your business overview.</p>
                </div>
                <Link href="/invoices/new" className="btn-primary hidden sm:flex items-center gap-2">
                    <span>+</span> New Invoice
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon="📦"
                    color="blue"
                />
                <StatCard
                    title="Stock Value"
                    value={formatCurrency(stats.stockValue)}
                    icon="💰"
                    color="green"
                />
                <StatCard
                    title="Unpaid Amount"
                    value={formatCurrency(stats.unpaidTotal)}
                    icon="⚠️"
                    color="amber"
                />
                <StatCard
                    title="Today&#39;s Revenue"
                    value={formatCurrency(stats.todayRevenue)}
                    icon="📈"
                    color="blue"
                />
            </div>

            {/* Recent Invoices */}
            <div className="card">
                <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-surface-900">Recent Invoices</h2>
                    <Link href="/invoices" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View All →
                    </Link>
                </div>
                {recentInvoices.length === 0 ? (
                    <div className="px-6 py-12 text-center text-surface-400">
                        <p className="text-lg mb-1">No invoices yet</p>
                        <p className="text-sm">Create your first invoice to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-100">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Invoice #</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {recentInvoices.map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <Link href={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-surface-700">{inv.customers?.name || '—'}</td>
                                        <td className="px-6 py-3 text-sm font-medium text-surface-900">{formatCurrency(inv.total_amount)}</td>
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
        </div>
    );
}
