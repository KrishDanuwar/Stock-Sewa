import { getOrgContext } from '@/lib/org-context';
import { createClient } from '@/lib/supabase/server';
import { BarChart2 } from 'lucide-react';

export default async function ReportsPage() {
    const { organizationId } = await getOrgContext();
    const supabase = await createClient();

    const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_type, total_amount, tax_amount, date_ad')
        .eq('organization_id', organizationId);

    const totalRevenue = invoices?.reduce((s, i) => s + Number(i.total_amount), 0) ?? 0;
    const totalTax = invoices?.reduce((s, i) => s + Number(i.tax_amount), 0) ?? 0;
    const vatInvoices = invoices?.filter(i => i.invoice_type === 'vat').length ?? 0;
    const panInvoices = invoices?.filter(i => i.invoice_type === 'pan').length ?? 0;
    const normalInvoices = invoices?.filter(i => i.invoice_type === 'normal').length ?? 0;

    const stats = [
        { label: 'Total Revenue', value: `NPR ${totalRevenue.toLocaleString()}`, sub: 'कुल आम्दानी' },
        { label: 'Total VAT Collected', value: `NPR ${totalTax.toFixed(2)}`, sub: 'कुल भ्याट' },
        { label: 'VAT Invoices', value: vatInvoices, sub: 'भ्याट बीजक' },
        { label: 'PAN Invoices', value: panInvoices, sub: 'प्यान बीजक' },
        { label: 'Normal Invoices', value: normalInvoices, sub: 'साधारण बीजक' },
        { label: 'Total Invoices', value: invoices?.length ?? 0, sub: 'जम्मा बीजक' },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">रिपोर्ट — Business Overview</p>
            </div>

            <div className="grid-stats">
                {stats.map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 12 }}>{s.sub}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <BarChart2 size={48} style={{ margin: '0 auto 16px', color: 'var(--brand-primary)', opacity: 0.6 }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Detailed Charts Coming Soon</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Monthly sales trends, top products, and IRD-ready export features are in development.
                </p>
            </div>
        </div>
    );
}
