'use client';

import { useState } from 'react';
import { addProduct, deleteProduct } from '@/lib/actions/products';
import { toast } from 'sonner';
import { Plus, Trash2, Package, X, Search } from 'lucide-react';

type Product = {
    id: string; name: string; barcode: string | null;
    price: number; cost_price: number; stock_quantity: number;
    unit: string; category: string | null; created_at: string;
};

export default function ProductsClient({ products }: { products: Product[] }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category ?? '').toLowerCase().includes(search.toLowerCase())
    );

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const result = await addProduct(fd);
        if (result?.error) toast.error(result.error);
        else { toast.success('Product added!'); setShowModal(false); }
        setLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"?`)) return;
        const result = await deleteProduct(id);
        if (result?.error) toast.error(result.error);
        else toast.success('Product deleted');
    }

    const stockBadge = (qty: number) => {
        if (qty <= 0) return <span className="badge badge-danger">Out of Stock</span>;
        if (qty <= 5) return <span className="badge badge-warning">Low: {qty}</span>;
        return <span className="badge badge-success">{qty}</span>;
    };

    return (
        <div className="animate-fade-in-up">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">उत्पादन व्यवस्थापन — {products.length} items</p>
                </div>
                <button onClick={() => setShowModal(true)} className="glass-button glass-button-primary">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    className="glass-input"
                    style={{ paddingLeft: 38 }}
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                        <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>No products found. Add your first product!</p>
                    </div>
                ) : (
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Cost</th>
                                <th>Stock</th>
                                <th>Unit</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                        {p.barcode && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.barcode}</div>}
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)' }}>{p.category || '—'}</span></td>
                                    <td style={{ fontWeight: 600 }}>NPR {Number(p.price).toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>NPR {Number(p.cost_price).toLocaleString()}</td>
                                    <td>{stockBadge(p.stock_quantity)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.unit}</td>
                                    <td>
                                        <button onClick={() => handleDelete(p.id, p.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-danger)', padding: 6, borderRadius: 6, transition: 'background 0.2s' }}>
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Product Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 480, padding: 28, position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 20 }}>Add New Product</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input name="name" required className="glass-input" placeholder="Product name *" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input name="price" type="number" min="0" step="0.01" required className="glass-input" placeholder="Selling Price (NPR) *" />
                                <input name="cost_price" type="number" min="0" step="0.01" className="glass-input" placeholder="Cost Price (NPR)" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input name="stock_quantity" type="number" min="0" required className="glass-input" placeholder="Stock Qty *" />
                                <input name="unit" className="glass-input" placeholder="Unit (pcs, kg, ltr...)" defaultValue="pcs" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input name="category" className="glass-input" placeholder="Category" />
                                <input name="barcode" className="glass-input" placeholder="Barcode (optional)" />
                            </div>
                            <button type="submit" disabled={loading} className="glass-button glass-button-primary" style={{ justifyContent: 'center', marginTop: 8 }}>
                                {loading ? 'Adding...' : 'Add Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
