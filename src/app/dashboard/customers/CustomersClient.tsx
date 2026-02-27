'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Users, X, Phone, Mail, CreditCard, Wallet, AlertCircle, History, Landmark } from 'lucide-react';
import { addCustomer, deleteCustomer, clearCustomerCredit } from '@/lib/actions/customers';
import Link from 'next/link';

type Customer = { id: string; name: string; phone: string | null; email: string | null; pan_number: string | null; address: string | null; tax_type?: 'pan' | 'vat'; credit_balance: number; credit_limit: number; };

export default function CustomersClient({ customers }: { customers: Customer[] }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const result = await addCustomer(new FormData(e.currentTarget));
        if (result?.error) toast.error(result.error);
        else { toast.success('Customer added!'); setShowModal(false); }
        setLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"?`)) return;
        const result = await deleteCustomer(id);
        if (result?.error) toast.error(result.error);
        else toast.success('Customer deleted');
    }

    async function handlePayment(e: React.FormEvent) {
        e.preventDefault();
        if (!showPaymentModal) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');

        setLoading(true);
        const result = await clearCustomerCredit(showPaymentModal.id, amount, paymentMethod);
        if (result.success) {
            toast.success('Payment recorded and credit updated');
            setShowPaymentModal(null);
            setPaymentAmount('');
        } else {
            toast.error(result.error || 'Payment failed');
        }
        setLoading(false);
    }

    const totalCredit = customers.reduce((sum, c) => sum + (c.credit_balance || 0), 0);

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Customer Ledger</h1>
                    <p className="page-subtitle">Track accounts and outstanding credit</p>
                </div>
                <button onClick={() => setShowModal(true)} className="glass-button glass-button-primary shadow-[0_0_20px_rgba(79,142,247,0.2)]">
                    <Plus size={16} /> New Customer
                </button>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div className="glass-card flex items-center gap-4" style={{ padding: '24px' }}>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Total Clients</div>
                        <div className="text-2xl font-black text-primary">{customers.length}</div>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4" style={{ padding: '24px', borderLeft: '4px solid var(--brand-danger)' }}>
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Outstanding Debt</div>
                        <div className="text-2xl font-black text-red-500">Rs. {totalCredit.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {customers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>No customers yet. Add your first customer!</p>
                    </div>
                ) : (
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Customer Details</th>
                                <th style={{ width: '20%' }}>Tax Information</th>
                                <th style={{ width: '15%' }}>Contact</th>
                                <th style={{ width: '15%' }}>Credit Balance</th>
                                <th style={{ width: '15%' }}>Credit Limit</th>
                                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</span>
                                            <span style={{ fontSize: '0.6875rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Landmark size={10} /> {c.address || 'Local Shop'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <span className={`badge ${c.tax_type === 'vat' ? 'badge-success' : 'badge-info'} text-[9px] w-fit`}>
                                                {c.tax_type?.toUpperCase() || 'PAN'}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold tracking-tighter">{c.pan_number || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {c.phone && <span className="text-[10px] font-bold text-muted flex items-center gap-1.5"><Phone size={10} /> {c.phone}</span>}
                                            {c.email && <span className="text-[10px] font-bold text-muted flex items-center gap-1.5"><Mail size={10} /> {c.email}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black ${c.credit_balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                Rs. {c.credit_balance.toLocaleString()}
                                            </span>
                                            {c.credit_balance > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setShowPaymentModal(c);
                                                        setPaymentAmount(c.credit_balance.toString());
                                                    }}
                                                    className="text-[9px] font-black text-blue-500 hover:underline flex items-center gap-1 mt-0.5 uppercase tracking-tighter"
                                                >
                                                    <CreditCard size={10} /> Record Payment
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-xs font-bold text-muted">
                                            {c.credit_limit > 0 ? `Rs. ${c.credit_limit.toLocaleString()}` : <span className="opacity-30 italic">No Limit</span>}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/invoices?customer=${c.id}`} className="glass-button h-8 w-8 !p-0" title="Sale History">
                                                <History size={14} />
                                            </Link>
                                            <button onClick={() => handleDelete(c.id, c.name)} className="glass-button h-8 w-8 !p-0" style={{ color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="glass-modal">
                    <div className="glass-card glass-modal-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: 28, position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 20 }}>Add Customer</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input name="name" required className="glass-input" placeholder="Full name *" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input name="phone" className="glass-input" placeholder="Phone (9xxxxxxxxx)" />
                                <input name="email" type="email" className="glass-input" placeholder="Email" />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tax Registration Type</label>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                                        <input type="radio" name="tax_type" value="pan" defaultChecked /> PAN Registered
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                                        <input type="radio" name="tax_type" value="vat" /> VAT Registered
                                    </label>
                                </div>
                            </div>

                            <input name="pan_number" className="glass-input" placeholder="PAN/VAT Number *" required />
                            <div className="form-group">
                                <label className="glass-label">Credit Limit (0 for Unlimited)</label>
                                <input name="credit_limit" type="number" step="0.01" className="glass-input" placeholder="Rs. 0.00" />
                            </div>
                            <input name="address" className="glass-input" placeholder="Address" />
                            <button type="submit" disabled={loading} className="glass-button glass-button-primary shadow-[0_4px_15px_rgba(79,142,247,0.3)]" style={{ justifyContent: 'center', marginTop: 8, height: 46 }}>
                                {loading ? 'Creating Account...' : 'Register Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Credit Clearance Modal */}
            {showPaymentModal && (
                <div className="glass-modal">
                    <div className="glass-card glass-modal-card animate-scale-in" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 mx-auto mb-6">
                            <Wallet size={32} />
                        </div>
                        <h2 className="text-xl font-black text-center mb-1">Clear Debt</h2>
                        <p className="text-xs text-muted text-center mb-8 uppercase tracking-widest font-bold">
                            Payment for {showPaymentModal.name}
                        </p>

                        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="glass-label mb-2 block">Amount to Pay (Rs.)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="glass-input text-xl font-black !pl-12 h-14"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        autoFocus
                                    />
                                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                </div>
                                <p className="text-[10px] text-muted mt-2 font-bold px-2">
                                    Remaining Balance: <span className="text-primary">Rs. {(showPaymentModal.credit_balance - (parseFloat(paymentAmount) || 0)).toFixed(2)}</span>
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="glass-label mb-3 block">Payment Channel</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {['cash', 'khalti', 'esewa', 'bank'].map(method => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`glass-button text-[10px] font-black uppercase tracking-widest h-10 ${paymentMethod === method ? 'glass-button-primary' : ''}`}
                                            disabled={loading}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button
                                    type="button"
                                    className="glass-button flex-1 h-12"
                                    onClick={() => setShowPaymentModal(null)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="glass-button glass-button-primary flex-1 h-12 shadow-[0_8px_20px_rgba(16,185,129,0.2)] bg-emerald-600 border-emerald-500"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Finalize Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
