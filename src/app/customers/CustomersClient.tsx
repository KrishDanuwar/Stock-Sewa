'use client';

import { useState } from 'react';
import { createCustomer, updateCustomer, settleCustomerCredit } from '@/lib/actions/customers';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import { Wallet } from 'lucide-react';

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
    const [settleAmount, setSettleAmount] = useState<string>('0');
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
        if (!settleCustomer || parseFloat(settleAmount) <= 0) return;
        setLoading(true);
        setError('');

        try {
            const amount = parseFloat(settleAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount');
                setLoading(false);
                return;
            }
            const result = await settleCustomerCredit(settleCustomer.id, amount) as any;
            if (result?.error) {
                setError(result.error);
                return;
            }
            setSettleModalOpen(false);
            setSettleCustomer(null);
            setSettleAmount('0');
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h1 className="page-header mb-0">Customers</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial sm:w-64">
                        <SearchBar placeholder="Search by name or phone..." />
                    </div>
                    <button onClick={() => { setEditCustomer(null); setModalOpen(true); }} className="btn-primary whitespace-nowrap">
                        + Add Customer
                    </button>
                </div>
            </div>

            {customers.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-lg font-medium text-surface-700 mb-1">No customers found</p>
                    <p className="text-sm text-surface-500 mb-4">Add your first customer to get started</p>
                    <button onClick={() => setModalOpen(true)} className="btn-primary">+ Add Customer</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {customers.map((customer) => (
                        <div key={customer.id} className="card p-5 animate-fade-in">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-surface-900 truncate">{customer.name}</h3>
                                    {customer.phone && (
                                        <p className="text-sm text-surface-500 mt-1 flex items-center gap-1">📞 {customer.phone}</p>
                                    )}
                                    {customer.address && (
                                        <p className="text-sm text-surface-500 mt-0.5 flex items-center gap-1 truncate">📍 {customer.address}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => openEdit(customer)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors font-medium flex-shrink-0"
                                >
                                    Edit
                                </button>
                            </div>
                            {customer.total_credit !== undefined && customer.total_credit > 0 && (
                                <div className="mt-4 pt-4 border-t border-surface-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Outstanding Credit</span>
                                        <span className="text-sm font-black text-red-600">{formatCurrency(customer.total_credit)}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSettleCustomer(customer);
                                            setSettleAmount((customer.total_credit || 0).toString());
                                            setSettleModalOpen(true);
                                        }}
                                        className="w-full py-2 rounded-xl bg-surface-900 text-white text-xs font-bold hover:bg-surface-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Wallet size={14} />
                                        Settle Credit
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
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                    )}
                    <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                        <p className="text-xs text-surface-500 uppercase font-bold tracking-widest mb-1">Customer</p>
                        <p className="font-bold text-surface-900">{settleCustomer?.name}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-surface-500 font-medium">Current Balance:</span>
                            <span className="text-sm font-black text-red-600">{settleCustomer && formatCurrency(settleCustomer.total_credit || 0)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Settlement Amount (Rs.)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={settleAmount}
                            onChange={(e) => setSettleAmount(e.target.value)}
                            className="input-field font-bold text-lg"
                            required
                        />
                        <p className="text-[10px] text-surface-400 mt-2 font-medium">This amount will be applied to the oldest outstanding invoices first.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setSettleModalOpen(false)} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Processing...' : 'Confirm Settlement'}
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
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
                        <input name="name" defaultValue={editCustomer?.name} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Phone</label>
                        <input name="phone" defaultValue={editCustomer?.phone} className="input-field" placeholder="Optional" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Address</label>
                        <textarea name="address" defaultValue={editCustomer?.address} rows={2} className="input-field" placeholder="Optional" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setModalOpen(false); setEditCustomer(null); }} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : editCustomer ? 'Update' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
