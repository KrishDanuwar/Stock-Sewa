'use client';

import { Receipt } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/utils/invoiceGenerator';

type InvoiceItem = {
    product_name?: string;
    products?: { name: string };
    quantity: number;
    unit_price: number;
};

type Invoice = {
    id: string;
    invoice_number: string;
    invoice_type: string;
    created_at: string;
    date_bs: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    vat_amount?: number;
    payment_method: string;
    payment_status?: string;
    amount_paid?: number;
    customers: { name: string; pan_number?: string; tax_type?: string } | null;
    customer_name_manual?: string;
    customer_pan_manual?: string;
    invoice_items?: InvoiceItem[];
};

type Organization = { name: string; pan_vat: string | null; address: string | null; phone: string | null; } | null;

export default function InvoicesClient({ invoices, organization }: { invoices: Invoice[]; organization: Organization; }) {
    const statusBadge = (status: string) => {
        const styles = {
            paid: { bg: 'rgba(16,185,129,0.15)', color: 'var(--brand-success)' },
            unpaid: { bg: 'rgba(239,68,68,0.15)', color: 'var(--brand-danger)' },
            partial: { bg: 'rgba(245,158,11,0.15)', color: 'var(--brand-warning)' }
        }[status] || { bg: 'var(--glass-bg)', color: 'var(--text-muted)' };

        return (
            <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                backgroundColor: styles.bg, color: styles.color, textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    const handlePrint = (inv: Invoice) => {
        const invData = {
            organization: organization || { name: 'Stock Sewa', pan_vat: null, address: null, phone: null },
            invoice_number: inv.invoice_number,
            invoice_type: inv.invoice_type as 'normal' | 'pan' | 'vat',
            date_ad: new Date(inv.created_at).toISOString().split('T')[0],
            date_bs: inv.date_bs || '',
            customer_name: inv.customers?.name || inv.customer_name_manual,
            customer_pan: inv.customers?.pan_number || inv.customer_pan_manual || undefined,
            customer_tax_type: inv.customers?.tax_type as 'pan' | 'vat' | undefined,
            subtotal: inv.total_amount - (inv.vat_amount || 0),
            tax_amount: inv.vat_amount || 0,
            total_amount: inv.total_amount,
            amount_paid: Number(inv.amount_paid || 0),
            due_amount: Number(inv.total_amount) - Number(inv.amount_paid || 0),
            payment_mode: (inv.payment_method || 'Cash').charAt(0).toUpperCase() + (inv.payment_method || 'Cash').slice(1),
            items: inv.invoice_items?.map((item) => ({
                product_name: item.product_name || item.products?.name || 'Unknown',
                quantity: item.quantity,
                unit_price: item.unit_price
            })) || []
        };
        generateInvoicePDF(invData);
    };

    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);
    const totalDue = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.amount_paid || 0)), 0);

    return (
        <div className="animate-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bills</h1>
                    <p className="page-subtitle">
                        Bills — {invoices.length} total | Collection: Rs. {totalCollected.toLocaleString()} | Due: Rs. {totalDue.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Bill #</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => {
                            const due = Number(inv.total_amount) - Number(inv.amount_paid || 0);
                            return (
                                <tr key={inv.id}>
                                    <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 500 }}>{inv.customers?.name || 'Walk-in'}</span>
                                            {inv.customers?.pan_number && <span style={{ fontSize: '0.6875rem', opacity: 0.6 }}>PAN: {inv.customers.pan_number}</span>}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>{inv.invoice_type.toUpperCase()}</span></td>
                                    <td>{statusBadge(inv.payment_status || 'paid')}</td>
                                    <td style={{ color: 'var(--brand-success)', fontWeight: 600 }}>Rs. {Number(inv.amount_paid || 0).toLocaleString()}</td>
                                    <td style={{ color: due > 0 ? 'var(--brand-danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                                        {due > 0 ? `Rs. ${due.toLocaleString()}` : '—'}
                                    </td>
                                    <td style={{ fontWeight: 700 }}>Rs. {Number(inv.total_amount).toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => handlePrint(inv)}
                                            className="glass-button"
                                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                        >
                                            <Receipt size={14} /> Print
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
