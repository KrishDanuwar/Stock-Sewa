import { getOrgContext } from '@/lib/org-context';
import { createClient } from '@/lib/supabase/server';
import { BarChart2 } from 'lucide-react';

export default async function ReportsPage() {
    const { organizationId, language } = await getOrgContext();
    const supabase = await createClient();

    // Fetch all invoices with items for deep reporting
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            id, 
            invoice_type, 
            total_amount, 
            tax_amount, 
            subtotal,
            date_ad,
            invoice_items (
                product_id,
                product_name,
                quantity,
                unit_price
            )
        `)
        .eq('organization_id', organizationId);

    // Financial calculations
    const totalRevenue = invoices?.reduce((s, i) => s + Number(i.total_amount), 0) ?? 0;
    const totalTax = invoices?.reduce((s, i) => s + Number(i.tax_amount), 0) ?? 0;
    const totalSubtotal = invoices?.reduce((s, i) => s + Number(i.subtotal || 0), 0) ?? 0;

    const vatInvoices = invoices?.filter(i => i.invoice_type === 'vat') ?? [];
    const panInvoices = invoices?.filter(i => i.invoice_type === 'pan') ?? [];
    const normalInvoices = invoices?.filter(i => i.invoice_type === 'normal') ?? [];

    // Aggregating Top Selling Products
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    invoices?.forEach(inv => {
        inv.invoice_items?.forEach((item: any) => {
            if (!productSales[item.product_name]) {
                productSales[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
            }
            productSales[item.product_name].quantity += item.quantity;
            productSales[item.product_name].revenue += item.quantity * Number(item.unit_price);
        });
    });

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const stats = [
        { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, sub: 'कुल आम्दानी', color: 'var(--brand-success)' },
        { label: 'VAT Collected', value: `Rs. ${totalTax.toLocaleString()}`, sub: 'संकलित भ्याट', color: 'var(--brand-primary)' },
        { label: 'Net Subtotal', value: `Rs. ${totalSubtotal.toLocaleString()}`, sub: 'कुल उप-योग', color: 'var(--brand-secondary)' },
        { label: 'Total Sales', value: invoices?.length ?? 0, sub: 'जम्मा बिक्री', color: 'var(--brand-accent)' },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{language === 'np' ? 'रिपोर्ट र विश्लेषण' : 'Reports & Analytics'}</h1>
                    <p className="page-subtitle">
                        {language === 'np' ? 'व्यावसायिक अन्तर्दृष्टि' : 'Business Intelligence Insights'}
                    </p>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                {stats.map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {language === 'np' ? s.sub : s.label}
                        </div>
                        {language === 'np' && (
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                        )}
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                {/* Top Selling Products */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                        {language === 'np' ? 'सर्वाधिक बिक्री हुने वस्तुहरू — Top Selling Products' : 'Top Selling Products'}
                    </h2>
                    {topProducts.length > 0 ? (
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>{language === 'np' ? 'उत्पादन' : 'Product Name'}</th>
                                    <th style={{ textAlign: 'center' }}>{language === 'np' ? 'बिक्री' : 'Qty Sold'}</th>
                                    <th style={{ textAlign: 'right' }}>{language === 'np' ? 'आम्दानी' : 'Revenue'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((p, idx) => (
                                    <tr key={p.name}>
                                        <td style={{ fontWeight: 500 }}>
                                            <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>#{idx + 1}</span>
                                            {p.name}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>Rs. {p.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <p>{language === 'np' ? 'उत्पादनहरू श्रेणीबद्ध गर्न कुनै बिक्री डाटा उपलब्ध छैन।' : 'No sales data available to rank products.'}</p>
                        </div>
                    )}
                </div>

                {/* Invoice Type Breakdown */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                        {language === 'np' ? 'बीजक विवरण — Invoice Breakdown' : 'Invoice Breakdown'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="breakdown-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{language === 'np' ? 'भ्याट बीजक' : 'VAT Invoices'}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--brand-success)' }}>{vatInvoices.length}</span>
                            </div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(vatInvoices.length / (invoices?.length || 1)) * 100}%`, backgroundColor: 'var(--brand-success)' }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{language === 'np' ? 'प्यान बीजक' : 'PAN Invoices'}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--brand-primary)' }}>{panInvoices.length}</span>
                            </div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(panInvoices.length / (invoices?.length || 1)) * 100}%`, backgroundColor: 'var(--brand-primary)' }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{language === 'np' ? 'साधारण रसिद' : 'Normal Receipts'}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--brand-secondary)' }}>{normalInvoices.length}</span>
                            </div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(normalInvoices.length / (invoices?.length || 1)) * 100}%`, backgroundColor: 'var(--brand-secondary)' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginTop: 24 }}>
                <BarChart2 size={40} style={{ margin: '0 auto 16px', color: 'var(--brand-primary)', opacity: 0.6 }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Advanced Visual Analytics</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 600, margin: '0 auto' }}>
                    We are building interactive line charts and monthly trend reports to help you track growth over time. Stay tuned!
                </p>
            </div>
        </div>
    );
}
