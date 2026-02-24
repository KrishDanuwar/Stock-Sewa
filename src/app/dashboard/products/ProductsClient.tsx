'use client';

import { useState } from 'react';
import { addProduct, deleteProduct, restockProduct } from '@/lib/actions/products';
import { toast } from 'sonner';
import { Printer, Trash2, Package, X, Search, Plus, RefreshCw } from 'lucide-react';
import BarcodeLabel from '@/components/BarcodeLabel';

type Product = {
    id: string; name: string; barcode: string | null;
    price: number; cost_price: number; stock_quantity: number;
    unit: string; category: string | null; created_at: string;
    mfg_date?: string | null; batch_number?: string | null;
};

export default function ProductsClient({ products }: { products: Product[] }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [printProduct, setPrintProduct] = useState<Product | null>(null);
    const [restockItem, setRestockItem] = useState<Product | null>(null);
    const [restockQty, setRestockQty] = useState('');
    const [restocking, setRestocking] = useState(false);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode ?? '').toLowerCase().includes(search.toLowerCase())
    );

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const result = await addProduct(fd);
        if (result?.error) toast.error(result.error);
        else {
            toast.success('Product added!');
            setShowModal(false);
        }
        setLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"?`)) return;
        const result = await deleteProduct(id);
        if (result?.error) toast.error(result.error);
        else toast.success('Product deleted');
    }

    async function handleRestock(e: React.FormEvent) {
        e.preventDefault();
        if (!restockItem) return;
        const qty = parseInt(restockQty);
        if (isNaN(qty) || qty <= 0) return toast.error('Enter valid quantity');

        setRestocking(true);
        const result = await restockProduct(restockItem.id, qty);
        if (result?.success) {
            toast.success(`Restocked ${qty} ${restockItem.unit} of ${restockItem.name}`);
            setRestockItem(null);
            setRestockQty('');
        } else {
            toast.error(result?.error || 'Failed to restock');
        }
        setRestocking(false);
    }

    const handlePrint = (product: Product) => {
        setPrintProduct(product);
        setTimeout(() => {
            window.print();
            setPrintProduct(null);
        }, 300);
    };

    const stockBadge = (qty: number) => {
        if (qty <= 0) return <span className="badge badge-danger">Out of Stock</span>;
        if (qty <= 5) return <span className="badge badge-warning">Low: {qty}</span>;
        return <span className="badge badge-success">{qty}</span>;
    };

    return (
        <div className="animate-fade-in-up">
            {/* Print Container (Hidden usually) */}
            {printProduct && (
                <div className="print-only">
                    <BarcodeLabel
                        name={printProduct.name}
                        price={printProduct.price}
                        barcode={printProduct.barcode || ''}
                        mfg={printProduct.mfg_date || 'N/A'}
                        batch={printProduct.batch_number || 'N/A'}
                    />
                </div>
            )}

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
                    placeholder="Search by name, category or barcode..."
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
                                <th>Name & Barcode</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Unit</th>
                                <th>MFG / Batch</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            {p.barcode || 'NO BARCODE'}
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)' }}>{p.category || '—'}</span></td>
                                    <td style={{ fontWeight: 600 }}>रु {Number(p.price).toLocaleString()}</td>
                                    <td>{stockBadge(p.stock_quantity)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.unit}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                        <div>M: {p.mfg_date || '—'}</div>
                                        <div>B: {p.batch_number || '—'}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => { setRestockItem(p); setRestockQty(''); }} className="action-button action-success" title="Restock Product">
                                                <RefreshCw size={15} />
                                            </button>
                                            <button onClick={() => handlePrint(p)} className="action-button action-info" title="Print Barcode Label">
                                                <Printer size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id, p.name)} className="action-button action-danger" title="Delete Product">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Product Modal */}
            {showModal && (
                <div className="glass-modal">
                    <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 520, padding: 28, position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Add New Product</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input name="name" required className="glass-input" placeholder="e.g. Berger Silk 10L" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Selling Price रु *</label>
                                    <input name="price" type="number" min="0" step="0.01" required className="glass-input" placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cost Price रु</label>
                                    <input name="cost_price" type="number" min="0" step="0.01" className="glass-input" placeholder="0.00" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Initial Stock *</label>
                                    <input name="stock_quantity" type="number" min="0" required className="glass-input" placeholder="Qty" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit</label>
                                    <input name="unit" className="glass-input" placeholder="pcs, ltr, kg..." defaultValue="pcs" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input name="category" className="glass-input" placeholder="e.g. Paint" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Barcode (Auto-gen if blank)</label>
                                    <input name="barcode" className="glass-input" placeholder="Scan or leave blank" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">MFG Date</label>
                                    <input name="mfg_date" className="glass-input" placeholder="2024/01/01" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Batch Number</label>
                                    <input name="batch_number" className="glass-input" placeholder="e.g. BN-998" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="glass-button glass-button-primary" style={{ justifyContent: 'center', marginTop: 10, padding: 14 }}>
                                {loading ? 'Saving Product...' : 'Add Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {restockItem && (
                <div className="glass-modal">
                    <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 400, padding: 28, position: 'relative' }}>
                        <button onClick={() => setRestockItem(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Restock Product</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                            Add more stock for <strong>{restockItem.name}</strong>
                        </p>

                        <form onSubmit={handleRestock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Current Stock: {restockItem.stock_quantity} {restockItem.unit}</label>
                                <input
                                    className="glass-input"
                                    type="number"
                                    autoFocus
                                    placeholder="Enter quantity to add"
                                    value={restockQty}
                                    onChange={e => setRestockQty(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={restocking} className="glass-button glass-button-primary" style={{ justifyContent: 'center', marginTop: 10, padding: 14 }}>
                                {restocking ? 'Restocking...' : 'Add to Stock'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .glass-modal {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    padding: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .form-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .action-button {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    cursor: pointer;
                    padding: 7px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-info:hover {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.4);
                    color: #60a5fa;
                }
                .action-success:hover {
                    background: rgba(16, 185, 129, 0.2);
                    border-color: rgba(16, 185, 129, 0.4);
                    color: #34d399;
                }
                .action-danger:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.4);
                    color: #f87171;
                }
                @media print {
                    .print-only { display: block !important; }
                    body > *:not(.print-only) { display: none !important; }
                }
                .print-only { display: none; }
            `}</style>
        </div>
    );
}
