import { getOrgContext } from '@/lib/org-context';
import { createClient } from '@/lib/supabase/server';
import { Package, Users, FileText, TrendingUp } from 'lucide-react';
import { getTodayBs } from '@/utils/date-utils';

export default async function DashboardPage() {
    const { organizationId, organizationName } = await getOrgContext();
    const supabase = await createClient();
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

    const stats = [
        { label: 'Total Products', labelNp: 'उत्पादन', value: productCount ?? 0, icon: Package, color: 'var(--brand-primary)' },
        { label: 'Customers', labelNp: 'ग्राहक', value: customerCount ?? 0, icon: Users, color: 'var(--brand-secondary)' },
        { label: 'Invoices', labelNp: 'बीजक', value: invoiceCount ?? 0, icon: FileText, color: 'var(--brand-accent)' },
        { label: 'Revenue', labelNp: 'आम्दानी', value: 'NPR —', icon: TrendingUp, color: 'var(--brand-success)' },
    ];

    const invoiceTypeBadge = (type: string) => {
        if (type === 'vat') return <span className="badge badge-success">VAT</span>;
        if (type === 'pan') return <span className="badge badge-info">PAN</span>;
        return <span className="badge badge-warning">Normal</span>;
    };

    return (
        <div className="animate-fade-in-up">
            <div className="page-header">
                <h1 className="page-title">{organizationName}</h1>
                <p className="page-subtitle">
                    Today: {today.formattedEn} &nbsp;|&nbsp; <span style={{ fontFamily: 'serif' }}>{today.formatted}</span>
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid-stats">
                {stats.map(({ label, labelNp, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{labelNp}</div>
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Recent Invoices */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Recent Invoices — हालका बीजक</h2>
                {recentInvoices && recentInvoices.length > 0 ? (
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
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
                                    <td style={{ textAlign: 'right' }}>NPR {Number(inv.total_amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                        <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p>No invoices yet. Start selling from the POS!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
