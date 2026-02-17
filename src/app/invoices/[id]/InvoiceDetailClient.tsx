'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { recordPayment } from '@/lib/actions/payments';

interface InvoiceDetailClientProps {
    invoice: any;
}

function formatCurrency(amount: number) {
    return `Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
    const router = useRouter();
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (amount > Number(invoice.remaining_amount)) {
            setError('Amount cannot exceed remaining balance');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await recordPayment(invoice.id, amount);
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 no-print">
                <div className="flex items-center gap-3">
                    <Link href="/invoices" className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="page-header mb-0">Invoice {invoice.invoice_number}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {invoice.status !== 'paid' && (
                        <button
                            onClick={() => setShowPaymentForm(!showPaymentForm)}
                            className="btn-success"
                        >
                            💳 Record Payment
                        </button>
                    )}
                    <button onClick={() => window.print()} className="btn-primary">
                        🖨️ Print
                    </button>
                </div>
            </div>

            {/* Payment Form */}
            {showPaymentForm && (
                <div className="card p-5 mb-6 no-print animate-fade-in">
                    <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-3">Record Payment</h3>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">{error}</div>
                    )}
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-surface-700 mb-1">
                                Amount (Remaining: {formatCurrency(invoice.remaining_amount)})
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={invoice.remaining_amount}
                                step="0.01"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="input-field"
                                placeholder="Enter payment amount"
                            />
                        </div>
                        <button onClick={handlePayment} disabled={loading} className="btn-success">
                            {loading ? 'Saving...' : 'Submit Payment'}
                        </button>
                        <button onClick={() => setShowPaymentForm(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Printable Invoice */}
            <div className="card print-invoice">
                <div className="p-8">
                    {/* Company Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-primary-600">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    MS
                                </div>
                                <h2 className="text-2xl font-bold text-surface-900">MeroStock</h2>
                            </div>
                            <p className="text-sm text-surface-500">Inventory & Billing System</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-surface-900">INVOICE</h3>
                            <p className="text-sm text-surface-600 font-mono mt-1">{invoice.invoice_number}</p>
                            <p className="text-sm text-surface-500 mt-1">
                                {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8">
                        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Bill To</h4>
                        <p className="text-lg font-semibold text-surface-900">{invoice.customers?.name || '—'}</p>
                        {invoice.customers?.phone && (
                            <p className="text-sm text-surface-600">📞 {invoice.customers.phone}</p>
                        )}
                        {invoice.customers?.address && (
                            <p className="text-sm text-surface-600">📍 {invoice.customers.address}</p>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-surface-200">
                                    <th className="text-left py-3 text-xs font-semibold text-surface-500 uppercase">#</th>
                                    <th className="text-left py-3 text-xs font-semibold text-surface-500 uppercase">Product</th>
                                    <th className="text-center py-3 text-xs font-semibold text-surface-500 uppercase">Qty</th>
                                    <th className="text-right py-3 text-xs font-semibold text-surface-500 uppercase">Price</th>
                                    <th className="text-right py-3 text-xs font-semibold text-surface-500 uppercase">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {invoice.items?.map((item: any, idx: number) => (
                                    <tr key={item.id}>
                                        <td className="py-3 text-sm text-surface-500">{idx + 1}</td>
                                        <td className="py-3">
                                            <p className="text-sm font-medium text-surface-900">{item.products?.name}</p>
                                            {item.products?.barcode && (
                                                <p className="text-xs text-surface-400 font-mono">{item.products.barcode}</p>
                                            )}
                                        </td>
                                        <td className="py-3 text-sm text-center text-surface-700">{item.quantity}</td>
                                        <td className="py-3 text-sm text-right text-surface-700">{formatCurrency(item.price)}</td>
                                        <td className="py-3 text-sm text-right font-medium text-surface-900">{formatCurrency(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-surface-600">Total Amount</span>
                                <span className="font-bold text-lg text-surface-900">{formatCurrency(invoice.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-surface-600">Paid Amount</span>
                                <span className="font-medium text-emerald-600">{formatCurrency(invoice.paid_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-surface-200">
                                <span className="text-surface-600 font-medium">Remaining</span>
                                <span className={`font-bold text-lg ${Number(invoice.remaining_amount) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(invoice.remaining_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-1">
                                <span className="text-surface-600">Status</span>
                                <span className={`badge-${invoice.status}`}>{invoice.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-surface-200">
                            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Payment History</h4>
                            <div className="space-y-2">
                                {invoice.payments.map((payment: any) => (
                                    <div key={payment.id} className="flex items-center justify-between py-2 px-3 bg-surface-50 rounded-lg">
                                        <span className="text-sm text-surface-600">
                                            {new Date(payment.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <span className="text-sm font-medium text-emerald-600">+ {formatCurrency(payment.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-surface-200 text-center">
                        <p className="text-xs text-surface-400">Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
