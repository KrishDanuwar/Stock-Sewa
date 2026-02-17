'use client';

import { useState } from 'react';
import { createCustomer, updateCustomer } from '@/lib/actions/customers';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            if (editCustomer) {
                await updateCustomer(editCustomer.id, formData);
            } else {
                await createCustomer(formData);
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
                                <div className="mt-3 pt-3 border-t border-surface-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-surface-500">Credit Balance</span>
                                        <span className="text-sm font-semibold text-red-600">{formatCurrency(customer.total_credit)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

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
