'use client';

import { useState } from 'react';
import { addProduct, deleteProduct, restockProduct, adjustStock } from '@/lib/actions/products';
import { toast } from 'sonner';
import { Printer, Trash2, Package, X, Search, Plus, RefreshCw, SlidersHorizontal } from 'lucide-react';
import BarcodeLabel from '@/components/BarcodeLabel';

type Product = {
    id: string; name: string; barcode: string | null;
    price: number; cost_price: number; stock_quantity: number;
    unit: string; category: string | null; created_at: string;
    mfg_date?: string | null; expiry_date?: string | null; batch_number?: string | null;
};

export default function ProductsClient({ products }: { products: Product[] }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [printProduct, setPrintProduct] = useState<Product | null>(null);
    const [restockItem, setRestockItem] = useState<Product | null>(null);
    const [restockQty, setRestockQty] = useState('');
    const [restockPrice, setRestockPrice] = useState('');
    const [restockCostPrice, setRestockCostPrice] = useState('');
    const [restockMfg, setRestockMfg] = useState('');
    const [restockExpiry, setRestockExpiry] = useState('');
    const [restockBatch, setRestockBatch] = useState('');
    const [restocking, setRestocking] = useState(false);
    const [includeMfg, setIncludeMfg] = useState(false);

    // Adjust stock state
    const [adjustItem, setAdjustItem] = useState<Product | null>(null);
    const [adjustQty, setAdjustQty] = useState('');
    const [adjustNotes, setAdjustNotes] = useState('');
    const [adjusting, setAdjusting] = useState(false);

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
            setIncludeMfg(false);
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
        if (isNaN(qty) || qty <= 0) return toast.error('Enter a valid positive quantity');
        if (parseFloat(restockPrice) < 0) return toast.error('Price cannot be negative');

        setRestocking(true);
        const result = await restockProduct(
            restockItem.id,
            qty,
            parseFloat(restockPrice),
            parseFloat(restockCostPrice),
            restockMfg,
            restockExpiry,
            restockBatch
        );
        if (result?.success) {
            toast.success(`Restocked ${qty} ${restockItem.unit} of ${restockItem.name}`);
            setRestockItem(null);
            setRestockQty('');
            setRestockPrice('');
            setRestockCostPrice('');
            setRestockMfg('');
            setRestockExpiry('');
            setRestockBatch('');
        } else {
            toast.error(result?.error || 'Failed to restock');
        }
        setRestocking(false);
    }

    async function handleAdjust(e: React.FormEvent) {
        e.preventDefault();
        if (!adjustItem) return;
        const qty = parseInt(adjustQty);
        if (isNaN(qty) || qty === 0) return toast.error('Enter a non-zero quantity (+/-)');

        setAdjusting(true);
        const result = await adjustStock(adjustItem.id, qty, adjustNotes);
        if (result?.success) {
            toast.success(`Stock adjusted by ${qty > 0 ? '+' : ''}${qty} for ${adjustItem.name}`);
            setAdjustItem(null);
            setAdjustQty('');
            setAdjustNotes('');
        } else {
            toast.error(result?.error || 'Failed to adjust stock');
        }
        setAdjusting(false);
    }

    const handlePrint = (product: Product) => {
        setPrintProduct(product);
        setTimeout(() => {
            window.print();
            setPrintProduct(null);
        }, 2000);
    };

    const stockBadge = (qty: number) => {
        if (qty <= 0) return <span className="badge badge-danger">Out of Stock</span>;
        if (qty <= 5) return <span className="badge badge-warning">Low: {qty}</span>;
        return <span className="badge badge-success">{qty}</span>;
    };

    const expiryBadge = (date?: string | null) => {
        if (!date) return null;
        const expiry = new Date(date);
        const now = new Date();
        const diff = expiry.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days <= 0) return <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Expired</span>;
        if (days <= 30) return <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Expires in {days}d</span>;
        return <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{date}</span>;
    };

    return (
        <div className="animate-fade-in-up">
            {/* Print Portal Item */}
            {printProduct && (
                <BarcodeLabel
                    name={printProduct.name}
                    price={printProduct.price}
                    barcode={printProduct.barcode || ''}
                    mfg={printProduct.mfg_date || ''}
                    batchNumber={printProduct.batch_number || ''}
                />
            )}

            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">{products.length} items</p>
                </div>
                <button onClick={() => setShowModal(true)} className="glass-button glass-button-primary">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
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
                                <th>Cost Price</th>
                                <th>MRP</th>
                                <th>Stock</th>
                                <th>Expiry Status</th>
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
                                    <td style={{ fontWeight: 600 }}>Rs. {Number(p.cost_price).toLocaleString()}</td>
                                    <td style={{ fontWeight: 600 }}>Rs. {Number(p.price).toLocaleString()}</td>
                                    <td>{stockBadge(p.stock_quantity)}</td>
                                    <td>{expiryBadge(p.expiry_date)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.unit}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                        <div>M: {p.mfg_date || '—'}</div>
                                        <div>B: {p.batch_number || '—'}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => {
                                                setRestockItem(p);
                                                setRestockQty('');
                                                setRestockPrice(p.price.toString());
                                                setRestockCostPrice(p.cost_price.toString());
                                                setRestockMfg(p.mfg_date || '');
                                                setRestockExpiry(p.expiry_date || '');
                                                setRestockBatch(p.batch_number || '');
                                            }} className="action-button action-success" title="Restock Product">
                                                <RefreshCw size={15} />
                                            </button>
                                            <button onClick={() => {
                                                setAdjustItem(p);
                                                setAdjustQty('');
                                                setAdjustNotes('');
                                            }} className="action-button action-warning" title="Adjust Stock">
                                                <SlidersHorizontal size={15} />
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
                    <div className="glass-card glass-modal-card animate-fade-in-up" style={{ width: '100%', maxWidth: 520, padding: 28, position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Add New Product</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input name="name" required className="glass-input" autoComplete="off" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Cost Price रु *</label>
                                    <input name="cost_price" type="number" min="0" step="0.01" required className="glass-input" placeholder="0.00" onKeyDown={e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">MRP रु *</label>
                                    <input name="price" type="number" min="0" step="0.01" required className="glass-input" placeholder="0.00" onKeyDown={e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Initial Stock *</label>
                                    <input name="stock_quantity" type="number" min="0" required className="glass-input" placeholder="Qty" onKeyDown={e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Unit</label>
                                    <input name="unit" className="glass-input" placeholder="pcs, ltr, kg..." defaultValue="pcs" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input name="category" className="glass-input" autoComplete="off" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} className="form-label">
                                        <input type="checkbox" checked={includeMfg} onChange={e => setIncludeMfg(e.target.checked)} />
                                        Include MFG Date
                                    </label>
                                    <input name="mfg_date" disabled={!includeMfg} className="glass-input" placeholder="2024/01/01" style={{ opacity: includeMfg ? 1 : 0.5 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date</label>
                                    <input name="expiry_date" type="date" className="glass-input" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Batch Number</label>
                                <input name="batch_number" className="glass-input" placeholder="e.g. BN-998" />
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
                    <div className="glass-card glass-modal-card animate-fade-in-up" style={{ width: '100%', maxWidth: 400, padding: 28, position: 'relative' }}>
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
                                    min="1"
                                    autoFocus
                                    placeholder="Enter positive quantity to add"
                                    value={restockQty}
                                    onChange={e => setRestockQty(e.target.value)}
                                    onKeyDown={e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Update Cost Price रु</label>
                                    <input
                                        className="glass-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={restockCostPrice}
                                        onChange={e => setRestockCostPrice(e.target.value)}
                                        onKeyDown={e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Update MRP रु</label>
                                    <input
                                        className="glass-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={restockPrice}
                                        onChange={e => setRestockPrice(e.target.value)}
                                        onKeyDown={e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Update Batch Number</label>
                                    <input
                                        className="glass-input"
                                        placeholder="BN-001"
                                        value={restockBatch}
                                        onChange={e => setRestockBatch(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Update MFG Date</label>
                                    <input
                                        className="glass-input"
                                        placeholder="2024/01/01"
                                        value={restockMfg}
                                        onChange={e => setRestockMfg(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Update Expiry Date</label>
                                <input
                                    className="glass-input"
                                    type="date"
                                    value={restockExpiry}
                                    onChange={e => setRestockExpiry(e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={restocking} className="glass-button glass-button-primary" style={{ justifyContent: 'center', marginTop: 10, padding: 14 }}>
                                {restocking ? 'Restocking...' : 'Add to Stock & Update Prices'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
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
                .action-warning:hover {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: rgba(245, 158, 11, 0.4);
                    color: #fbbf24;
                }
                @media print {
                    .print-only { display: block !important; }
                }
                .print-only { display: none; }
            `}</style>

            {/* Adjust Stock Modal */}
            {adjustItem && (
                <div className="glass-modal">
                    <div className="glass-card glass-modal-card animate-fade-in-up" style={{ width: '100%', maxWidth: 400, padding: 28, position: 'relative' }}>
                        <button onClick={() => setAdjustItem(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Adjust Stock</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                            Manually adjust stock for <strong>{adjustItem.name}</strong><br />
                            Current stock: <strong>{adjustItem.stock_quantity} {adjustItem.unit}</strong>
                        </p>

                        <form onSubmit={handleAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Quantity (+/-)</label>
                                <input
                                    className="glass-input"
                                    type="number"
                                    autoFocus
                                    placeholder="e.g. -5 for damage, +10 for found"
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Reason / Notes</label>
                                <input
                                    className="glass-input"
                                    type="text"
                                    placeholder="e.g. Damaged, Counting correction, Theft"
                                    value={adjustNotes}
                                    onChange={e => setAdjustNotes(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="glass-button-primary" disabled={adjusting} style={{ marginTop: 8 }}>
                                {adjusting ? 'Adjusting...' : 'Apply Adjustment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}
