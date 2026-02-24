'use client';

import { useState } from 'react';
import { addCustomer, deleteCustomer } from '@/lib/actions/customers';
import { toast } from 'sonner';
import { Plus, Trash2, Users, X, Phone, Mail } from 'lucide-react';

type Customer = { id: string; name: string; phone: string | null; email: string | null; pan_number: string | null; address: string | null; };

export default function CustomersClient({ customers }: { customers: Customer[] }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">ग्राहक व्यवस्थापन — {customers.length} records</p>
                </div>
                <button onClick={() => setShowModal(true)} className="glass-button glass-button-primary">
                    <Plus size={16} /> Add Customer
                </button>
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
                                <th>Name</th><th>Phone</th><th>Email</th><th>PAN Number</th><th>Address</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                                    <td>
                                        {c.phone ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Phone size={13} />{c.phone}</span> : '—'}
                                    </td>
                                    <td>
                                        {c.email ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Mail size={13} />{c.email}</span> : '—'}
                                    </td>
                                    <td>{c.pan_number ? <span className="badge badge-info">{c.pan_number}</span> : '—'}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{c.address || '—'}</td>
                                    <td>
                                        <button onClick={() => handleDelete(c.id, c.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-danger)', padding: 6, borderRadius: 6 }}>
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: 28, position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 20 }}>Add Customer — ग्राहक थप्नुहोस्</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input name="name" required className="glass-input" placeholder="Full name *" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input name="phone" className="glass-input" placeholder="Phone (9xxxxxxxxx)" />
                                <input name="email" type="email" className="glass-input" placeholder="Email" />
                            </div>
                            <input name="pan_number" className="glass-input" placeholder="PAN Number (for VAT/PAN invoices)" />
                            <input name="address" className="glass-input" placeholder="Address" />
                            <button type="submit" disabled={loading} className="glass-button glass-button-primary" style={{ justifyContent: 'center', marginTop: 8 }}>
                                {loading ? 'Adding...' : 'Add Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
