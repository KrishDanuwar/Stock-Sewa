import { getOrgContext } from '@/lib/org-context';
import { createAdminClient } from '@/lib/supabase/server';
import { BarChart2 } from 'lucide-react';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    // Fetch all invoices with items for deep reporting
    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            id, 
            invoice_number,
            invoice_type, 
            total_amount, 
            tax_amount, 
            subtotal,
            discount_amount,
            date_ad,
            date_bs,
            payment_method,
            payment_status,
            customers ( name ),
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
    interface ReportInvoiceItem {
        product_name: string;
        quantity: number;
        unit_price: number;
    }

    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    invoices?.forEach(inv => {
        (inv.invoice_items as unknown as ReportInvoiceItem[] || []).forEach((item) => {
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

    // Build invoice rows for CSV export
    const invoiceRows = (invoices || []).map(i => {
        const custRaw = (i as any).customers;
        const custName = Array.isArray(custRaw) ? custRaw[0]?.name : custRaw?.name;
        return {
            invoice_number: (i as any).invoice_number || '',
            date_bs: (i as any).date_bs || '',
            date_ad: (i as any).date_ad || '',
            invoice_type: i.invoice_type,
            subtotal: Number(i.subtotal) || 0,
            tax_amount: Number(i.tax_amount) || 0,
            total_amount: Number(i.total_amount) || 0,
            discount_amount: Number((i as any).discount_amount) || 0,
            payment_method: (i as any).payment_method || 'cash',
            payment_status: (i as any).payment_status || 'paid',
            customer_name: custName || 'Walk-in',
        };
    });

    const stats = [
        { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: 'var(--brand-success)' },
        { label: 'VAT Collected', value: `Rs. ${totalTax.toLocaleString()}`, color: 'var(--brand-primary)' },
        { label: 'Net Subtotal', value: `Rs. ${totalSubtotal.toLocaleString()}`, color: 'var(--brand-secondary)' },
        { label: 'Total Sales', value: invoices?.length ?? 0, color: 'var(--brand-accent)' },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">
                        Business Intelligence Insights
                    </p>
                </div>
                <ReportsClient
                    topProducts={topProducts}
                    invoiceRows={invoiceRows}
                    totalRevenue={totalRevenue}
                    totalTax={totalTax}
                    totalSubtotal={totalSubtotal}
                    totalSales={invoices?.length ?? 0}
                />
            </div>

            {/* Financial Overview */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                {stats.map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                {/* Top Selling Products */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                        Top Selling Products
                    </h2>
                    {topProducts.length > 0 ? (
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th style={{ textAlign: 'center' }}>Qty Sold</th>
                                    <th style={{ textAlign: 'right' }}>Revenue</th>
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
                            <p>No sales data available to rank products.</p>
                        </div>
                    )}
                </div>

                {/* Invoice Type Breakdown */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                        Bill Breakdown
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="breakdown-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>VAT Bills</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--brand-success)' }}>{vatInvoices.length}</span>
                            </div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(vatInvoices.length / (invoices?.length || 1)) * 100}%`, backgroundColor: 'var(--brand-success)' }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>PAN Bills</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--brand-primary)' }}>{panInvoices.length}</span>
                            </div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(panInvoices.length / (invoices?.length || 1)) * 100}%`, backgroundColor: 'var(--brand-primary)' }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Normal Bills</span>
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
