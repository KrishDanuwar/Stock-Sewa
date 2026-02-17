'use client';

import { useState, useEffect } from 'react';
import { addStockIn } from '@/lib/actions/stock';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';

interface StockClientProps {
    initialMovements: any[];
}

function formatCurrency(amount: number) {
    return `Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function StockClient({ initialMovements }: StockClientProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const { data } = await supabase.from('products').select('id, name').order('name');
                setProducts(data || []);
            } catch (e) {
                // ignore
            }
        };
        loadProducts();
    }, []);

    const handleStockIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            await addStockIn(formData);
            setModalOpen(false);
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Failed to add stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="page-header mb-0">Stock Movements</h1>
                <button onClick={() => setModalOpen(true)} className="btn-primary">+ Stock In</button>
            </div>

            {initialMovements.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="text-lg font-medium text-surface-700 mb-1">No stock movements</p>
                    <p className="text-sm text-surface-500">Stock movements will appear here when products are added or invoices are created</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Product</th>
                                <th className="text-center px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Type</th>
                                <th className="text-center px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Quantity</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {initialMovements.map((mv: any) => (
                                <tr key={mv.id} className="hover:bg-surface-50 transition-colors">
                                    <td className="px-6 py-3 text-sm text-surface-600">
                                        {new Date(mv.created_at).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-medium text-surface-900">{mv.products?.name || '—'}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mv.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {mv.type === 'IN' ? '↑ IN' : '↓ OUT'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-center font-medium text-surface-900">{mv.quantity}</td>
                                    <td className="px-6 py-3 text-sm text-surface-500">{mv.reference || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stock In Modal */}
            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setError(''); }} title="Add Stock In">
                <form onSubmit={handleStockIn} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Product *</label>
                        <select name="product_id" required className="input-field">
                            <option value="">Select a product...</option>
                            {products.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Quantity *</label>
                        <input name="quantity" type="number" min={1} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Reference</label>
                        <input name="reference" className="input-field" placeholder="e.g. Purchase order #123" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Adding...' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
