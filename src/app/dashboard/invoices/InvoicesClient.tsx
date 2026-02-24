'use client';

import { FileText, Download } from 'lucide-react';

type Invoice = {
    id: string; invoice_number: string; invoice_type: string;
    subtotal: number; tax_amount: number; total_amount: number;
    payment_method: string; date_bs: string; date_ad: string;
    customers: { name: string } | null;
};

export default function InvoicesClient({ invoices }: { invoices: Invoice[] }) {
    const typeBadge = (type: string) => {
        if (type === 'vat') return <span className="badge badge-success">VAT</span>;
        if (type === 'pan') return <span className="badge badge-info">PAN</span>;
        return <span className="badge badge-warning">Normal</span>;
    };

    const paymentBadge = (method: string) => {
        const colors: Record<string, string> = {
            cash: 'badge-success', esewa: 'badge-info', khalti: 'badge-info',
            credit: 'badge-danger', bank_transfer: 'badge-warning', ime_pay: 'badge-info',
        };
        return <span className={`badge ${colors[method] ?? 'badge-warning'}`}>{method.replace('_', ' ')}</span>;
    };

    const totalRevenue = invoices.reduce((s, i) => s + Number(i.total_amount), 0);

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Invoices</h1>
                    <p className="page-subtitle">बीजक — {invoices.length} total | Revenue: NPR {totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>No invoices yet. Start selling from the POS!</p>
                    </div>
                ) : (
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th><th>Customer</th><th>Type</th><th>Payment</th>
                                <th>Date (B.S.)</th><th style={{ textAlign: 'right' }}>Subtotal</th>
                                <th style={{ textAlign: 'right' }}>VAT</th><th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{inv.invoice_number}</td>
                                    <td>{inv.customers?.name ?? <span style={{ color: 'var(--text-muted)' }}>Walk-in</span>}</td>
                                    <td>{typeBadge(inv.invoice_type)}</td>
                                    <td>{paymentBadge(inv.payment_method)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{inv.date_bs}</td>
                                    <td style={{ textAlign: 'right' }}>NPR {Number(inv.subtotal).toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', color: Number(inv.tax_amount) > 0 ? 'var(--brand-warning)' : 'var(--text-muted)' }}>
                                        {Number(inv.tax_amount) > 0 ? `NPR ${Number(inv.tax_amount).toFixed(2)}` : '—'}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>NPR {Number(inv.total_amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
