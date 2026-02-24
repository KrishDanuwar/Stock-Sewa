'use client';

import { useState } from 'react';
import { createCustomer, updateCustomer, settleCustomerCredit } from '@/lib/actions/customers';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import { Wallet, Plus } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    total_credit?: number;
    created_at: string;
}

interface CustomersClientProps {
    initialCustomers: Customer[];
}

function formatCurrency(amount: number) {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
    const [customers] = useState<Customer[]>(initialCustomers);
    const [modalOpen, setModalOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
    const [settleAmount, setSettleAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            let result: any;
            if (editCustomer) {
                result = await updateCustomer(editCustomer.id, formData);
            } else {
                result = await createCustomer(formData);
            }

            if (result?.error) {
                setError(result.error);
                return;
            }

            setModalOpen(false);
            setEditCustomer(null);
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleSettleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settleCustomer) return;

        const amount = parseFloat(settleAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await settleCustomerCredit(settleCustomer.id, amount) as any;
            if (result?.error) {
                setError(result.error);
                return;
            }
            setSettleModalOpen(false);
            setSettleCustomer(null);
            setSettleAmount('');
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Failed to settle credit');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (customer: Customer) => {
        setEditCustomer(customer);
        setModalOpen(true);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-surface-primary tracking-tight">Customer Relations</h1>
                    <p className="text-surface-muted text-sm font-medium">Manage your client base and outstanding credits</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:w-80">
                        <SearchBar placeholder="Search by name, phone, or address..." />
                    </div>
                    <button onClick={() => { setEditCustomer(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 whitespace-nowrap active:scale-95 px-6">
                        <Plus size={18} />
                        Add Customer
                    </button>
                </div>
            </div>

            {customers.length === 0 ? (
                <div className="card p-16 text-center border-dashed border-brand-border bg-transparent">
                    <div className="w-20 h-20 bg-brand-card rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl border border-brand-border">
                        👥
                    </div>
                    <h3 className="text-xl font-bold text-surface-primary mb-2">No Customers Yet</h3>
                    <p className="text-sm text-surface-muted mb-8 max-w-sm mx-auto">Start building your client base by registering your first customer.</p>
                    <button onClick={() => setModalOpen(true)} className="btn-primary px-8">Add Customer</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {customers.map((customer) => (
                        <div key={customer.id} className="card p-8 animate-fade-in group hover:border-brand-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-poppins font-black text-surface-primary truncate group-hover:text-brand-primary transition-colors">{customer.name}</h3>
                                    <div className="mt-4 space-y-2">
                                        {customer.phone && (
                                            <p className="text-xs text-surface-muted flex items-center gap-3">
                                                <span className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] ring-1 ring-gray-100 shadow-sm">📞</span>
                                                <span className="font-bold tracking-wider">{customer.phone}</span>
                                            </p>
                                        )}
                                        {customer.address && (
                                            <p className="text-xs text-surface-muted flex items-center gap-3 truncate">
                                                <span className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] ring-1 ring-gray-100 shadow-sm">📍</span>
                                                <span className="font-bold italic opacity-80">{customer.address}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEdit(customer)}
                                    className="text-[10px] px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-surface-muted hover:text-brand-primary hover:border-brand-primary transition-all font-black uppercase tracking-[0.2em] active:scale-90 shadow-sm"
                                >
                                    Edit
                                </button>
                            </div>
                            {customer.total_credit !== undefined && customer.total_credit > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-black text-surface-muted uppercase tracking-[0.3em] opacity-70">Balance Owed</span>
                                        <span className="text-base font-black text-status-danger">{formatCurrency(customer.total_credit)}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSettleCustomer(customer);
                                            setSettleAmount((customer.total_credit || 0).toString());
                                            setSettleModalOpen(true);
                                        }}
                                        className="w-full py-4 rounded-[1.25rem] bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-brand-primary/20 border-none"
                                    >
                                        <Wallet size={16} strokeWidth={2.5} />
                                        Clear Credit
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Settlement Modal */}
            <Modal
                isOpen={settleModalOpen}
                onClose={() => { setSettleModalOpen(false); setSettleCustomer(null); setError(''); }}
                title="Settle Outstanding Credit"
            >
                <form onSubmit={handleSettleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-sm text-status-danger font-bold flex items-center gap-3">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner">
                        <p className="text-[10px] text-surface-muted uppercase font-black tracking-[0.3em] mb-3 text-center opacity-70">Debtor Profile</p>
                        <p className="font-poppins font-black text-surface-primary text-center text-xl">{settleCustomer?.name}</p>
                        <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between text-[11px] font-black text-surface-muted uppercase tracking-[0.2em]">
                            <span>Outstanding</span>
                            <span className="text-status-danger text-base">{settleCustomer && formatCurrency(settleCustomer.total_credit || 0)}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-3">Settlement Received (Rs.)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted font-bold">Rs.</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={settleAmount}
                                onChange={(e) => setSettleAmount(e.target.value)}
                                className="input-field pl-12 font-black text-xl text-brand-primary"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-surface-muted mt-4 font-medium italic text-center">Credited amounts will be applied to the earliest invoices.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border mt-8">
                        <button type="button" onClick={() => setSettleModalOpen(false)} className="btn-secondary px-6">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary px-8 active:scale-95">
                            {loading ? 'Processing...' : 'Verify Settlement'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditCustomer(null); setError(''); }}
                title={editCustomer ? 'Edit Customer' : 'Add Customer'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-sm text-status-danger font-bold flex items-center gap-3">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Legal Name *</label>
                        <input name="name" defaultValue={editCustomer?.name} required className="input-field py-3" placeholder="e.g. Shyam Bihari" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Primary Contact</label>
                        <input name="phone" defaultValue={editCustomer?.phone} className="input-field" placeholder="Mobile number" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Registered Address</label>
                        <textarea name="address" defaultValue={editCustomer?.address} rows={2} className="input-field" placeholder="Locality and City" />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border mt-8">
                        <button type="button" onClick={() => { setModalOpen(false); setEditCustomer(null); }} className="btn-secondary px-6">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary px-8 active:scale-95">
                            {loading ? 'Saving...' : editCustomer ? 'Update Client' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
