'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { recordPayment } from '@/lib/actions/payments';
import { generateInvoicePDF } from '@/utils/pdf-gen';
import {
    ArrowLeft,
    Printer,
    Download,
    CreditCard,
    Building2,
    Phone,
    MapPin,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';

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
            router.refresh();
            setShowPaymentForm(false);
            setPaymentAmount('');
        } catch (err: any) {
            setError(err.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                    <Link href="/invoices" className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-surface-200 transition-all text-surface-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Invoice Detail</h1>
                        <p className="text-surface-500 text-sm">Managing invoice #{invoice.invoice_number}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {invoice.status !== 'paid' && (
                        <button
                            onClick={() => setShowPaymentForm(!showPaymentForm)}
                            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-primary-700 transition-all flex items-center gap-2"
                        >
                            <CreditCard size={18} />
                            Record Payment
                        </button>
                    )}
                    <button
                        onClick={() => generateInvoicePDF(invoice)}
                        className="bg-white border border-surface-200 text-surface-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-50 transition-all flex items-center gap-2"
                    >
                        <Download size={18} />
                        PDF
                    </button>
                    <button onClick={() => window.print()} className="p-2.5 bg-white border border-surface-200 text-surface-500 rounded-xl hover:text-surface-900 transition-all">
                        <Printer size={20} />
                    </button>
                </div>
            </div>

            {/* Payment Quick Entry */}
            {showPaymentForm && (
                <div className="card p-6 bg-primary-50 border-primary-100 no-print animate-slide-up">
                    <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider mb-4">Record New Payment</h3>
                    {error && (
                        <div className="p-4 bg-white border border-red-100 rounded-xl text-sm text-red-600 mb-4 flex items-center gap-2 shadow-sm">
                            <XCircle size={16} />
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 w-full text-left">
                            <label className="block text-xs font-bold text-primary-700 uppercase mb-1.5 ml-1">
                                Amount to Pay (Remaining: {formatCurrency(invoice.remaining_amount)})
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold">Rs.</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={invoice.remaining_amount}
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="input-field pl-12 bg-white border-primary-200 focus:border-primary-500 text-lg font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="flex-1 md:flex-none bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                            <button onClick={() => setShowPaymentForm(false)} className="px-6 py-3 text-sm font-bold text-surface-500 hover:text-surface-900 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Invoice Card */}
            <div className="card shadow-2xl overflow-hidden border-none ring-1 ring-surface-200 text-left">
                <div className="h-2 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700" />
                <div className="p-8 md:p-12">
                    {/* Brand & Meta */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl">
                                    SS
                                </div>
                                <div className="text-left">
                                    <h2 className="text-2xl font-black text-surface-900 tracking-tighter">STOCKSEWA</h2>
                                    <div className="flex items-center gap-2 text-[10px] text-primary-600 font-bold tracking-[0.2em] uppercase">
                                        <span className="w-1 h-1 bg-primary-600 rounded-full" />
                                        Inventory Master
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1 text-sm text-surface-500 text-left">
                                <div className="flex items-center gap-2"><Building2 size={14} /> StockSewa Cloud Inventory</div>
                                <div className="flex items-center gap-2"><MapPin size={14} /> Global Enterprise SaaS</div>
                            </div>
                        </div>

                        <div className="text-left md:text-right space-y-2">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-surface-100 text-surface-900 text-[10px] font-black tracking-widest uppercase">
                                Invoice: {invoice.invoice_number}
                            </div>
                            <h3 className="text-4xl font-black text-surface-900">{formatCurrency(invoice.total_amount)}</h3>
                            <div className="flex items-center md:justify-end gap-2 text-sm">
                                <Clock size={14} className="text-surface-400" />
                                <span className="text-surface-500">{new Date(invoice.created_at).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                    invoice.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-surface-100">
                        <div className="text-left">
                            <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-4">Customer Details</h4>
                            <div className="space-y-1.5">
                                <p className="text-xl font-bold text-surface-900">{invoice.customers?.name || 'Walk-in'}</p>
                                <div className="space-y-1 text-sm text-surface-500">
                                    {invoice.customers?.phone && <div className="flex items-center gap-2"><Phone size={14} /> {invoice.customers.phone}</div>}
                                    {invoice.customers?.address && <div className="flex items-center gap-2"><MapPin size={14} /> {invoice.customers.address}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-surface-900">
                                        <th className="py-4 text-xs font-black text-surface-900 uppercase tracking-widest">Description</th>
                                        <th className="py-4 text-center text-xs font-black text-surface-900 uppercase tracking-widest">Qty</th>
                                        <th className="py-4 text-right text-xs font-black text-surface-900 uppercase tracking-widest">Price</th>
                                        <th className="py-4 text-right text-xs font-black text-surface-900 uppercase tracking-widest">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 text-left">
                                    {invoice.items?.map((item: any) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-5">
                                                <div className="font-bold text-surface-900">{item.products?.name}</div>
                                                <div className="text-[10px] text-surface-400 font-mono mt-0.5">{item.products?.barcode}</div>
                                            </td>
                                            <td className="py-5 text-center text-surface-700 font-medium">{item.quantity}</td>
                                            <td className="py-5 text-right text-surface-700 font-medium">{formatCurrency(item.price)}</td>
                                            <td className="py-5 text-right font-black text-surface-900">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary & Sign */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                        <div className="flex-1 w-full text-left">
                            <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-4">Payment Log</h4>
                            <div className="space-y-2">
                                {invoice.payments?.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between py-2.5 px-4 bg-surface-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-xs text-surface-500">{new Date(p.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className="text-xs font-bold text-surface-900">+{formatCurrency(p.amount)}</span>
                                    </div>
                                ))}
                                {(!invoice.payments || invoice.payments.length === 0) && (
                                    <p className="text-xs text-surface-400 italic">No payments recorded yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="w-full md:w-80 space-y-3 bg-surface-900 p-8 rounded-3xl text-white shadow-xl text-left">
                            <div className="flex justify-between items-center text-surface-400 text-[10px] font-black uppercase tracking-tighter">
                                <span>Grand Total</span>
                                <span className="text-white">{formatCurrency(invoice.total_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-green-400 text-[10px] font-black uppercase tracking-tighter">
                                <span>Total Paid</span>
                                <span>{formatCurrency(invoice.paid_amount)}</span>
                            </div>
                            <div className="h-px bg-surface-800 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-primary-400 text-xs font-black uppercase tracking-widest">Balance Due</span>
                                <span className={`text-2xl font-black ${Number(invoice.remaining_amount) > 0 ? 'text-white' : 'text-green-400'}`}>
                                    {formatCurrency(invoice.remaining_amount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-surface-100 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-surface-400 uppercase tracking-widest">
                            <CheckCircle2 size={12} className="text-primary-500" />
                            Generated Securely via StockSewa SaaS
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
