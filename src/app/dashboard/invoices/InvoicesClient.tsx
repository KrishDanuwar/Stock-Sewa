'use client';

import { FileText } from 'lucide-react';

type Invoice = {
    id: string; invoice_number: string; invoice_type: string;
    subtotal: number; tax_amount: number; total_amount: number;
    payment_method: string; payment_status?: string;
    amount_paid?: number;
    date_bs: string; date_ad: string;
    customers: { name: string } | null;
};

export default function InvoicesClient({ invoices }: { invoices: Invoice[] }) {
    const typeBadge = (type: string) => {
        if (type === 'vat') return <span className="badge badge-success">VAT</span>;
        if (type === 'pan') return <span className="badge badge-info">PAN</span>;
        return <span className="badge badge-warning">Normal</span>;
    };

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger'
        };
        return <span className={`badge ${colors[status] ?? 'badge-info'}`}>{status.toUpperCase()}</span>;
    };

    const totalRevenue = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
    const totalCollected = invoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0);
    const totalDue = totalRevenue - totalCollected;

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Invoices</h1>
                    <p className="page-subtitle">
                        बीजक — {invoices.length} total | Collection: रु {totalCollected.toLocaleString()} | Due: रु {totalDue.toLocaleString()}
                    </p>
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
                                <th>Invoice #</th><th>Customer</th><th>Type</th><th>Status</th><th>Paid</th><th>Due</th><th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => {
                                const due = Number(inv.total_amount) - Number(inv.amount_paid || 0);
                                return (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{inv.invoice_number}</td>
                                        <td>{inv.customers?.name ?? <span style={{ color: 'var(--text-muted)' }}>Walk-in</span>}</td>
                                        <td>{typeBadge(inv.invoice_type)}</td>
                                        <td>{statusBadge(inv.payment_status || 'paid')}</td>
                                        <td style={{ color: 'var(--brand-success)', fontWeight: 600 }}>रु {Number(inv.amount_paid || 0).toLocaleString()}</td>
                                        <td style={{ color: due > 0 ? 'var(--brand-danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                                            {due > 0 ? `रु ${due.toLocaleString()}` : '—'}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>रु {Number(inv.total_amount).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
