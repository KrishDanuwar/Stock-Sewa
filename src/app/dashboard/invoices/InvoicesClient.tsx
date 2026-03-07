'use client';

import { useState } from 'react';
import { Receipt, DownloadCloud, AlertTriangle } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/utils/invoiceGenerator';
import { getAllInvoicesForExport, exportAndClearInvoices } from '@/lib/actions/invoices';
import { toast } from 'sonner';

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
    discount_amount?: number;
    customers: { name: string; pan_number?: string; tax_type?: string } | null;
    customer_name_manual?: string;
    customer_pan_manual?: string;
    invoice_items?: InvoiceItem[];
};

type Organization = { name: string; pan_vat: string | null; pan_vat_type?: 'pan' | 'vat'; address: string | null; phone: string | null; } | null;

export default function InvoicesClient({ invoices, organization }: { invoices: Invoice[]; organization: Organization; }) {
    const [isExporting, setIsExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [confirmText, setConfirmText] = useState('');

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
            raw_subtotal: Number(inv.subtotal) + Number(inv.discount_amount || 0),
            discount_amount: Number(inv.discount_amount || 0),
            subtotal: Number(inv.subtotal),
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

    const handleExportAndClear = async () => {
        if (!startDate || !endDate) return toast.error("Please select both a start and end date.");
        if (new Date(startDate) > new Date(endDate)) return toast.error("Start date cannot be after end date.");
        if (confirmText !== 'CONFIRM') return toast.error("Please type CONFIRM to proceed.");

        setIsExporting(true);
        try {
            // 1. Fetch deep records
            toast.loading("Gathering deep records for export...", { id: 'export' });
            const exportData = await getAllInvoicesForExport(startDate, endDate);
            if (!exportData || exportData.length === 0) {
                toast.error("No invoices found to export.", { id: 'export' });
                setIsExporting(false);
                return;
            }

            // 2. Generate CSV
            toast.loading("Generating CSV file...", { id: 'export' });

            const csvRows = [];
            // Header
            csvRows.push(['Invoice Number', 'Date (B.S.)', 'Date (A.D.)', 'Type', 'Customer Name', 'Subtotal', 'Tax', 'Total', 'Paid', 'Due', 'Status', 'Product Details']);

            exportData.forEach((inv: any) => {
                const due = Number(inv.total_amount) - Number(inv.amount_paid || 0);
                const itemsStr = inv.invoice_items?.map((item: any) => `${item.product_name} (Qty: ${item.quantity} @ Rs.${item.unit_price})`).join(' | ') || '';

                csvRows.push([
                    inv.invoice_number,
                    inv.date_bs,
                    inv.date_ad,
                    inv.invoice_type,
                    inv.customers?.name || inv.customer_name_manual || 'Walk-in',
                    inv.subtotal,
                    inv.tax_amount || 0,
                    inv.total_amount,
                    inv.amount_paid || 0,
                    due,
                    inv.payment_status || 'paid',
                    `"${itemsStr}"` // Quote strings containing commas/pipes
                ].join(','));
            });

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // 3. Trigger Download
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `StockSewa_Bills_Export_${startDate}_to_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Wait a moment for download to start before deleting
            await new Promise(r => setTimeout(r, 2000));

            // 4. Delete Records Database-side
            toast.loading(`File downloaded! Now clearing database from ${startDate} to ${endDate}...`, { id: 'export' });

            const clearRes = await exportAndClearInvoices(startDate, endDate);

            if (clearRes.success) {
                toast.success(clearRes.message, { id: 'export' });
                setShowExportModal(false);
                setStartDate('');
                setEndDate('');
                setConfirmText('');
            } else {
                toast.error(clearRes.error, { id: 'export' });
            }

        } catch (error) {
            console.error(error);
            toast.error("Process failed. Check console.", { id: 'export' });
        } finally {
            setIsExporting(false);
        }
    };

    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);
    const totalDue = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.amount_paid || 0)), 0);

    return (
        <div className="animate-fade-in-up">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                        <h1 className="page-title">Bills</h1>
                        <p className="page-subtitle">
                            Bills — {invoices.length} total | Collection: Rs. {totalCollected.toLocaleString()} | Due: Rs. {totalDue.toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="glass-button"
                        style={{ color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', fontWeight: 600 }}
                    >
                        <DownloadCloud size={16} /> Download & Clear Bills
                    </button>
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

            {/* Export & Clear Modal */}
            {showExportModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: 420, padding: 24, paddingBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <AlertTriangle size={18} color="var(--brand-danger)" />
                            </div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Export & Wipe History</h2>
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: 20 }}>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                This action downloads a CSV of the selected period, then <strong>permanently deletes</strong> those records from the cloud.
                                <br /><span style={{ color: 'var(--brand-danger)', fontWeight: 500, display: 'inline-block', marginTop: 4 }}>Warning: The downloaded CSV will be your ONLY backup.</span>
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="glass-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                                <input
                                    type="date"
                                    className="glass-input"
                                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    max={endDate || undefined}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="glass-label" style={{ fontSize: '0.75rem' }}>End Date</label>
                                <input
                                    type="date"
                                    className="glass-input"
                                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || undefined}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="glass-label" style={{ fontSize: '0.75rem' }}>Type <strong style={{ color: 'var(--brand-danger)' }}>CONFIRM</strong> to Proceed</label>
                            <input
                                className="glass-input"
                                placeholder="CONFIRM"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '0.875rem', letterSpacing: '1px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                className="glass-button"
                                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                                onClick={() => { setShowExportModal(false); setStartDate(''); setEndDate(''); setConfirmText(''); }}
                                disabled={isExporting}
                            >
                                Cancel
                            </button>
                            <button
                                className="glass-button"
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    padding: '10px',
                                    background: confirmText === 'CONFIRM' && startDate && endDate ? 'var(--brand-danger)' : 'rgba(239, 68, 68, 0.05)',
                                    color: confirmText === 'CONFIRM' && startDate && endDate ? 'white' : 'var(--text-muted)',
                                    border: confirmText === 'CONFIRM' && startDate && endDate ? 'none' : '1px solid var(--glass-border)',
                                    transition: 'all 0.2s ease',
                                    fontWeight: 500
                                }}
                                disabled={confirmText !== 'CONFIRM' || !startDate || !endDate || isExporting}
                                onClick={handleExportAndClear}
                            >
                                {isExporting ? 'Processing...' : 'Download & Wipe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
