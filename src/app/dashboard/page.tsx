import { getOrgContext } from '@/lib/org-context';
import { createAdminClient } from '@/lib/supabase/server';
import { Package, Users, FileText, TrendingUp } from 'lucide-react';
import { getTodayBs } from '@/utils/date-utils';

export default async function DashboardPage() {
    const { organizationId, organizationName } = await getOrgContext();
    const supabase = await createAdminClient();
    const today = getTodayBs();

    // Fetch key stats
    const [{ count: productCount }, { count: customerCount }, { count: invoiceCount }] =
        await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
            supabase.from('customers').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
            supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
        ]);

    // Recent invoices
    const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, invoice_type, total_amount, date_bs')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(5);

    // Today's revenue calculation
    const todayAd = new Date().toISOString().split('T')[0];
    const { data: todayInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('organization_id', organizationId)
        .eq('date_ad', todayAd);

    const dailyRevenue = todayInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

    // Low stock alerts
    const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, name, stock_quantity, unit')
        .eq('organization_id', organizationId)
        .lte('stock_quantity', 5)
        .order('stock_quantity', { ascending: true });

    // Expiring products (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0];

    const { data: expiringSoon } = await supabase
        .from('products')
        .select('id, name, expiry_date, unit')
        .eq('organization_id', organizationId)
        .lte('expiry_date', thirtyDaysFromNowStr)
        .gte('expiry_date', todayAd)
        .order('expiry_date', { ascending: true });

    const stats = [
        { label: 'Total Products', value: productCount ?? 0, icon: Package, color: 'var(--brand-primary)' },
        { label: 'Customers', value: customerCount ?? 0, icon: Users, color: 'var(--brand-secondary)' },
        { label: 'Bills', value: invoiceCount ?? 0, icon: FileText, color: 'var(--brand-accent)' },
        { label: 'Today\'s Revenue', value: `Rs. ${dailyRevenue.toLocaleString()}`, icon: TrendingUp, color: 'var(--brand-success)' },
    ];

    const invoiceTypeBadge = (type: string) => {
        if (type === 'vat') return <span className="badge badge-success">VAT</span>;
        if (type === 'pan') return <span className="badge badge-info">PAN</span>;
        return <span className="badge badge-warning">Normal</span>;
    };

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {(await getOrgContext()).logoUrl && (
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'white', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--glass-border)', padding: 4 }}>
                        <img src={(await getOrgContext()).logoUrl!} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                )}
                <div>
                    <h1 className="page-title">{organizationName}</h1>
                    <p className="page-subtitle">
                        Today: {today.formattedEn}
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid-stats">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {label}
                                </div>
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                    </div>
                ))}
            </div>



            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 24, marginTop: 24 }}>
                {/* Recent Invoices */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                        Recent Bills
                    </h2>
                    {recentInvoices && recentInvoices.length > 0 ? (
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Bill #</th>
                                    <th>Type</th>
                                    <th>Date (B.S.)</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentInvoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 500 }}>{inv.invoice_number}</td>
                                        <td>{invoiceTypeBadge(inv.invoice_type)}</td>
                                        <td>{inv.date_bs}</td>
                                        <td style={{ textAlign: 'right' }}>Rs. {Number(inv.total_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                            <p>No bills yet. Start selling from the POS!</p>
                        </div>
                    )}
                </div>

                {/* Alerts Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Low Stock Alerts */}
                    <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                            Low Stock Alerts
                        </h2>
                        {lowStockProducts && lowStockProducts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {lowStockProducts.map(p => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ef4444' }}>{p.stock_quantity} {p.unit}</div>
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Remaining</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <Package size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.8125rem' }}>All products are well stocked!</p>
                            </div>
                        )}
                    </div>

                    {/* Expiring Soon Alerts */}
                    <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                            Expiring Soon
                        </h2>
                        {expiringSoon && expiringSoon.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {expiringSoon.map(p => {
                                    const days = p.expiry_date ? Math.ceil((new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                                    return (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b' }}>{days} days</div>
                                                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{p.expiry_date}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <TrendingUp size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.8125rem' }}>No items expiring soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
