import StatCard from '@/components/StatCard';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { getRecentInvoices } from '@/lib/actions/invoices';
import { getProducts } from '@/lib/actions/products';
import Link from 'next/link';
import {
    Package,
    CreditCard,
    DollarSign,
    AlertTriangle,
    ArrowRight,
    TrendingUp,
    Clock,
    Plus,
    CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const stats = await getDashboardStats();
    const recentInvoices = await getRecentInvoices(5);
    const products = await getProducts();

    // Custom logic for low stock alerts (SaaS feature)
    const lowStockProducts = products.filter(p => p.stock_quantity <= 5).slice(0, 5);

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-surface-900 mb-2">Dashboard Unavailable</h2>
                <p className="text-surface-500 max-w-md mx-auto mb-6">
                    We couldn't load your dashboard data. This might be because your organization setup is incomplete or there's a database error.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        Retry Loading
                    </button>
                    <Link href="/billing" className="btn-secondary">
                        Check Status
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-surface-500 mt-1">
                        Welcome back, {stats.organizationName} is performing well today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/invoices/new" className="btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        Quick Invoice
                    </Link>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={<Package size={24} />}
                    color="blue"
                />
                <StatCard
                    title="Stock Value"
                    value={`Rs. ${stats.stockValue.toLocaleString('en-IN')}`}
                    icon={<TrendingUp size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Unpaid Credit"
                    value={`Rs. ${stats.totalUnpaid.toLocaleString('en-IN')}`}
                    icon={<CreditCard size={24} />}
                    color="red"
                />
                <StatCard
                    title="Today's Revenue"
                    value={`Rs. ${stats.todayRevenue.toLocaleString('en-IN')}`}
                    icon={<DollarSign size={24} />}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                            <Clock size={20} className="text-primary-500" />
                            Recent Invoices
                        </h2>
                        <Link href="/invoices" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-50 border-b border-surface-200">
                                        <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Invoice #</th>
                                        <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-surface-50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-surface-900 text-sm">
                                                <Link href={`/invoices/${invoice.id}`} className="hover:text-primary-600 transition-colors">
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-surface-600">
                                                {invoice.customers?.name || 'Walk-in'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-surface-900 font-bold text-right">
                                                Rs. {Number(invoice.total_amount).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentInvoices.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-surface-400 italic">
                                                No transactions recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts (SaaS Enhancement) */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500" />
                        Stock Alerts
                    </h2>
                    <div className="card p-5 space-y-4">
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100 group hover:shadow-sm transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-surface-900">{p.name}</span>
                                        <span className="text-[10px] text-surface-500 uppercase tracking-tight">{p.barcode}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-red-600">{p.stock_quantity} left</span>
                                        <Link href="/products" className="text-[10px] text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Restock
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="text-sm text-surface-500 italic">All stock levels are healthy.</p>
                            </div>
                        )
                        }
                    </div>

                    {/* Activity Feed placeholder */}
                    <div className="card p-5 bg-primary-900 text-white relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Plus size={120} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Premium Feature</h3>
                        <p className="text-primary-100 text-xs leading-relaxed relative z-10 opacity-80">
                            Upgrade to **Pro** to unlock multi-user support, custom PDF branding, and advanced inventory forecasting.
                        </p>
                        <Link href="/billing" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white relative z-10 hover:gap-3 transition-all">
                            Learn more <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
